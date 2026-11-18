# Kharcha — Implementation Plan (v1, iOS first)

Status: built (phases 0–6) · 2026-11-18 — see §11
Goal: a minimal, offline expense tracker. Logging an expense must take 1 tap + 1 sentence, or less.

---

## 1. Product scope (v1)

| Tab | What it does |
|---|---|
| **Add** (main) | Voice first (direction B). **Listens automatically** when the app opens — no tap needed. Live transcript on screen. "Type instead" opens a keypad sheet with category chips + note. "Just added" list below. |
| **History** | Recent + all transactions, grouped by day, with day totals. Swipe to delete, tap to edit. Search by note. |
| **Insights** | Month switcher. Total for the month. Spend by category (bar list). Last 6 months trend. |
| Settings (sheet, not a tab) | Manage categories (name + emoji icon). Shortcut / Back Tap setup guide. CSV export. |

Auto-filled fields on every transaction: `id`, `created_at` (now), `updated_at`, `source` (`manual` / `voice` / `shortcut`), `raw_text` (voice transcript, for checking AI accuracy).

**Out of scope for v1** (stated defaults — change if needed): budgets, multiple currencies, income tracking, multiple accounts, cloud sync, Android build, receipts/photos, recurring expenses.

---

## 2. Tech stack (versions checked on npm, 2026-11-18)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 58** (`expo@58.0.x`, RN 0.88) with a **dev build** (`npx expo run:ios`), not Expo Go | Voice, on-device AI and App Intents need native code. Expo config plugins keep the native folder reproducible. Android stays one build away. |
| Navigation | `expo-router` 58 (bottom tabs + modal sheets) | File-based routes, deep link `kharcha://record` for free. |
| Storage | **SQLite** via `expo-sqlite` 58 + **Drizzle ORM** (`drizzle-orm@0.45`) with `useLiveQuery` | Insights need `GROUP BY month, category` — SQL does this natively. Live queries refresh lists after writes. Realm is deprecated by MongoDB; MMKV has no queries. |
| Small settings | `expo-sqlite/kv-store` (same DB) | One storage engine only. |
| Speech → text | `expo-speech-recognition` 58 with `requiresOnDeviceRecognition: true`, `interimResults: true`, `continuous: true`, `addsPunctuation: true`, locale `en-IN`, `contextualStrings` = category names + known merchants | On-device, offline, **live partial text while the user speaks**. `contextualStrings` tells the recogniser to expect words like "Swiggy", "Blinkit", "Rapido" — fewer mis-heard merchant names. |
| Transaction extraction | **AI only:** `@react-native-ai/apple` 0.13 (Apple **Foundation Models**, iOS 26+) with structured output. No rule parser. | Accuracy over speed. Guided generation forces valid JSON and limits category to the user's own list. No model download. |
| AI unavailable | No fallback parser. If Apple Intelligence is off or the model is not ready, the app opens the confirm card with the transcript as the note, and the user picks amount + category. | Keeps one code path; target device (iPhone 15 Pro+, iOS 26+) supports the model. |
| Animations / haptics | `react-native-reanimated` 4, `expo-haptics` | Keypad and save feedback. |
| Icons | `lucide-react-native` for UI icons **and** category icons (user picks from a curated set of ~60 line icons + a tint colour) | One calm icon style across the app, as in the mockups. Emoji is the simpler alternative — see open question 8. |
| Lists | `@shopify/flash-list` | History can grow to thousands of rows. |
| Export | `expo-file-system` + `expo-sharing` (CSV) | Backup without a server. |

**Coding rules:** the generic parts of the team React Native rules apply (feature folders, strict TypeScript, `.styles.ts` files, FlashList, no `any`). The Innovapptive-specific parts (Realm gateways, Redux store helpers, `seed.json` i18n, alias barrels) do **not** apply to this personal app. State: local `useState` + Drizzle live queries; no Redux (not needed at this size).

---

## 3. Data model

```sql
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,          -- uuid
  name        TEXT NOT NULL UNIQUE,
  icon        TEXT NOT NULL,             -- lucide icon name, e.g. "utensils"
  tint        TEXT NOT NULL,             -- one of ~8 preset colours
  keywords    TEXT NOT NULL DEFAULT '',  -- comma list sent to the AI as hints: "swiggy,zomato,restaurant"
  description TEXT NOT NULL DEFAULT '',  -- one line for the AI: "restaurants, food delivery, snacks"
  sort_order  INTEGER NOT NULL,
  archived    INTEGER NOT NULL DEFAULT 0, -- soft delete keeps old transactions valid
  created_at  INTEGER NOT NULL
);

CREATE TABLE transactions (
  id           TEXT PRIMARY KEY,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0), -- ₹500.50 → 50050, no float errors
  category_id  TEXT NOT NULL REFERENCES categories(id),
  note         TEXT NOT NULL DEFAULT '',
  source       TEXT NOT NULL,            -- 'manual' | 'voice' | 'shortcut'
  raw_text     TEXT,                     -- transcript / typed line
  occurred_at  INTEGER NOT NULL,         -- epoch ms; = created_at unless user edits date
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_tx_occurred ON transactions(occurred_at DESC);
CREATE INDEX idx_tx_category ON transactions(category_id, occurred_at);
```

- Month grouping uses **local time** (`strftime('%Y-%m', occurred_at/1000, 'unixepoch', 'localtime')`), so an expense at 00:30 IST on the 1st lands in the right month.
- Seed categories on first launch: Food, Groceries, Travel, Shopping, Bills, Fun, Health, Other — each with starter keywords (swiggy, zomato, blinkit, zepto, uber, ola, rapido, amazon, flipkart, myntra, netflix, airtel, jio, …).
- Migrations: Drizzle Kit migrations bundled in the app, run on start.
- Backup: iCloud device backup already includes the app's Documents folder (where the DB lives). Plus manual CSV export in Settings.

---

## 4. Voice → transaction pipeline (AI only, accuracy first)

```
 App opens / comes to foreground on Add tab (or via shortcut)
           │  no tap needed
           ▼
 Auto-listen: expo-speech-recognition (on-device, en-IN, live partials,
              contextualStrings = categories + known merchants)
           │  end of speech = 1.2 s with no new words (own timer)
           │  no speech at all for 8 s → stop, show "Tap to talk"
           ▼ transcript: "spent 500 on swiggy"
 Apple Foundation Models  (temperature 0, guided generation)
   schema: { amount_inr: number,
             category: enum(<user's active categories>),
             note: string,            // short, title case: "Swiggy"
             is_expense: boolean,     // false for noise / unrelated speech
             unsure_fields: ("amount"|"category")[] }
   prompt context:
     • each category with its description + keywords
     • 20 most recent (note → category) pairs from the user's own history
     • 10 fixed few-shot examples (Indian amounts: "5k", "1.5 lakh", "five hundred")
           │
           ├─ is_expense && unsure_fields empty && amount > 0
           │      → AUTO-SAVE → haptic → "Saved ₹500 · Food · Swiggy  [Undo]" (4 s)
           │      → keep listening for the next expense (8 s idle → stop)
           │
           └─ otherwise → confirm card: "₹500 · Food · Swiggy"  [Save]  (tap any part to edit)
```

- **Why AI only:** the model sees the whole sentence plus the user's own history, so it handles phrasing that rules miss ("paid the maid 2k", "uber back home 240"). Latency target: < 1.5 s from end of speech to save on iPhone 15 Pro.
- **Accuracy levers**, in order: (1) `contextualStrings` so speech-to-text spells merchants right, (2) category descriptions + keywords in the prompt, (3) user history as examples, (4) enum-constrained category, (5) `unsure_fields` so the model can ask instead of guess.
- **Learning:** every saved or edited expense updates the history used in the prompt (the 20 most recent distinct notes; the newest category for a note wins). In v1, corrections are not weighted more than other entries.
- **Model check:** a prompt-eval script runs ~60 Indian expense phrases through the model on device and reports accuracy per field. Run it after every prompt change. Target: ≥ 95 % amount, ≥ 90 % category.
- **AI unavailable** (Apple Intelligence off, model downloading): show the confirm card with the transcript as the note. Show a one-time hint to turn on Apple Intelligence.
- The typed "Type instead" path uses the keypad sheet and does not call the model.

### Auto-listen rules

| Situation | Behaviour |
|---|---|
| App launched by shortcut / Back Tap | Opens on Add tab and listens at once (`kharcha://record?src=shortcut`) |
| App opened from home screen or brought to foreground | Add tab listens at once |
| User switches to History / Insights, or app goes to background | Stop listening immediately |
| No speech for 8 s | Stop; show "Tap to talk" (saves battery, removes mic indicator) |
| After an auto-save | Keep listening 8 s for another expense, then stop |
| Mic or speech permission not given yet | First launch shows one screen explaining why, then the system prompts |

iOS shows the orange mic indicator while listening — this is expected and tells the user the app is listening. The UI also shows a clear "Listening" state with a Pause button.

---

## 5. iOS shortcut (Back Tap / Action Button / Siri)

What the app **can** do and what the **user** must do:

1. **App Intent "Log Expense"** (Swift, added to the main app target by a small local Expo config plugin) registered through `AppShortcutsProvider`. It appears in the Shortcuts app with no user setup, and works with Siri ("Log expense in Kharcha") and the Action Button.
2. The intent opens the app on the **Add tab**, already listening (no tap). Hand-off to React Native goes through the `kharcha://record?src=shortcut` deep link (exact mechanism verified in Phase 4 spike — `OpenURLIntent` result vs `openAppWhenRun` + launch flag).
3. **Fallback with zero native code:** the user creates a Shortcut with one "Open URL → `kharcha://record`" action.
4. **Back Tap cannot be set by any app.** The user sets it once: Settings → Accessibility → Touch → Back Tap → Double Tap → *Log Expense*. The app shows a 3-step guide screen with a button that opens Settings.

Permissions in `app.json`: `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`.

---

## 6. Folder structure

```
kharcha/
  app/                       # expo-router routes (thin)
    (tabs)/index.tsx         # Add
    (tabs)/history.tsx
    (tabs)/insights.tsx
    confirm.tsx              # confirm card sheet (only when AI is unsure)
    settings/…               # categories, shortcut guide, export
  src/
    features/
      add/      components/ hooks/ utils/
      voice/    hooks/use-voice-capture.hook.ts
      extract/  ai-extractor.ts  prompt.ts  schema.ts  eval/phrases.json  eval/run-eval.ts
      history/  …
      insights/ …
      categories/ …
    db/        schema.ts  client.ts  migrations/  seed.ts  queries/*.ts
    shared/    styles/tokens.ts  utils/money.ts  utils/date.ts  components/
  plugins/     with-app-intents.js  ios/LogExpenseIntent.swift
  docs/        PLAN.md
```

---

## 7. Phases

Each phase ends with something you can run on the iPhone.

| # | Phase | Done when (verify) |
|---|---|---|
| 0 | **Setup** — Expo 58 app, TypeScript strict, ESLint, expo-router tabs, dev build on simulator + your iPhone | App opens on device with 3 empty tabs |
| 1 | **Data layer** — Drizzle schema, migrations, seed categories, money/date utils | Unit tests pass for insert, month grouping across IST midnight, paise formatting |
| 2 | **Add tab** — keypad, category chips (sorted by use + time of day), note, save, undo toast, haptics | A manual expense saves in ≤ 3 taps; appears in DB |
| 3 | **History + Insights** — FlashList grouped by day, edit/delete; month totals, category bars, 6-month trend | 1,000 seeded rows scroll at 60 fps; totals match SQL check |
| 4 | **Voice** — auto-listen on open, live text, end-of-speech timer, Foundation Models extraction, auto-save + undo, confirm card, prompt-eval script | Eval on device: ≥ 95 % amount, ≥ 90 % category over 60 phrases; open app → say "spent 500 on swiggy" → saved as ₹500 · Food · Swiggy with zero taps |
| 5 | **Shortcut** — App Intent plugin, deep link, Back Tap guide screen | Double back tap → app opens listening → expense saved |
| 6 | **Polish + ship** — categories CRUD, CSV export, empty states, dark mode, app icon, TestFlight | TestFlight build installed from the TestFlight app |
| 7 | *(later)* Android build, llama.rn fallback for non-Apple-Intelligence phones, widgets | — |

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Apple Intelligence off or model not downloaded | Confirm card with transcript; one-time hint to turn it on |
| Wrong auto-save (model too sure) | `unsure_fields` + `is_expense` gate; 4 s Undo; edit from History; eval script before each prompt change |
| Auto-listen picks up background talk | `is_expense` = false → nothing saved; 8 s idle stop; listening only on the Add tab while the app is in front |
| Indian accents / merchant names in speech-to-text | `en-IN` + `contextualStrings` with category names and known merchants |
| App Intent → React Native hand-off is fiddly in Expo | URL-scheme Shortcut fallback works with zero native code |
| Data loss (no server) | iCloud device backup + CSV export; later optional iCloud Drive file sync |

---

## 9. Decisions (2026-11-18)

| Question | Answer | Effect on plan |
|---|---|---|
| Test device | iPhone 15 Pro or newer, iOS 26+ | iOS deployment target 26.0. Apple Foundation Models is always expected. |
| Voice language | English (Indian) only | Locale `en-IN`. |
| Add screen | **B · Voice first** | Main tab = listening state + "Type instead" (keypad sheet from direction A) + "Just added" list. |
| Voice save | Auto-save when confident | Model returns no `unsure_fields` → save at once + 4 s Undo. Otherwise → confirm card. |
| Parsing | **AI only, accuracy over speed** (updated) | Rule parser removed. Foundation Models extracts every entry, with user history as context. |
| Start of listening | **Automatic, no tap** (updated) | Add tab listens on every open / foreground / shortcut launch. Stops on tab change, background, or 8 s silence. |

## 9a. Open questions (defaults used until answered)

1. Paid Apple Developer account? Needed for TestFlight. *Default: assume yes by Phase 6.*
2. Log expenses for past dates in v1? *Default: yes, as an optional date chip on the confirm card / keypad sheet.*
3. App name "Kharcha"? *Default: keep.*
4. Category icons: curated line icons + tint, or free emoji? *Default: line icons + tint.*

---

## 10. UI design

Design canvas (private link): https://claude.ai/artifact/6ATJsuVmwLZnQai2eFX3Hh

- **A · Keypad first** (interactive): keypad open on launch, smart category chips, mic + Save. Fastest for exact amounts.
- **B · Voice first** (chosen): listens as soon as the app opens; live transcript; keypad is secondary. After a save it shows Undo and keeps listening.
- **C · Smart line**: one chat-style input; typed or spoken text is parsed live into "₹100 · Travel · Metro card".
- Shared: voice confirm sheet, History (grouped by day), Insights (month total, category bars, 6-month trend).
- Visual language: warm off-white ground, one green accent, Inter for text, Space Grotesk for amounts, line icons, 44 px+ touch targets.

---

## 11. Build status (2026-11-18)

All six phases are built. "Verified" means tested on the iPhone 17 Pro simulator (iOS 26.4) or by unit tests; real-device items are listed separately.

| Phase | Result | How it was verified |
|---|---|---|
| 0 Setup | Done | Dev build runs; typecheck, lint, expo-doctor pass |
| 1 Data layer | Done | Unit tests on the real repository code (better-sqlite3, TZ=Asia/Kolkata): IST-midnight day/month split, paise, migrations, search, category rules |
| 2 Add tab | Done | Simulator: keypad sheet save, category chips, date choice, Undo toast removes the row |
| 3 History + Insights | Done | Simulator with 1,000 seeded rows: smooth scroll, paging, day totals; Insights totals equal a direct SQL check |
| 4 Voice + AI | Done | Unit tests for timing, decision and fallback rules, and for the real AI SDK path (`generateText` + `Output.object` + the exact schema) against a mock model; simulator: auto-save, confirm card and "not an expense" paths through the DEV sentence field; **prompt accuracy on Apple's on-device model (Mac): amount 57/57, category 56/57, expense-or-not 60/60, median 1.7 s**. If the model is unavailable, the Add tab says why and every expense goes to the confirm card |
| 5 Shortcut | Done | App Intent "Log Expense" + 3 Siri phrases present in the built app's App Intents metadata; `kharcha://record?src=shortcut` opens the Add tab and the saved row has source "shortcut" |
| 6 Polish | Done | Settings, category add/edit/remove, CSV export (1,012 rows, share sheet), dark mode, app icon |

**Not verifiable here (needs your iPhone):** real speech recognition and auto-listen with the microphone; the real Foundation Models call from the app (the simulator cannot run it); Back Tap / Action Button / Siri triggering the intent; signing and TestFlight (needs your Apple Developer account).

### Changes from the original plan

| Plan said | Built | Why |
|---|---|---|
| Drizzle ORM + `useLiveQuery` | Plain SQL repositories over a small adapter; a data-version counter refreshes screens | Fewer dependencies; the same code runs in unit tests on better-sqlite3 |
| lucide icons | SF Symbols (`expo-symbols`) for UI and categories | Native, no extra dependency, matches iOS |
| Undo toast at the bottom | Toast at the top | The iOS 26 tab bar area does not pass touches to views above it, so a bottom Undo button could not be tapped |
| Swipe to delete in History | Tap a row → edit sheet with Delete | Simpler; one edit path |
| Schema field order free | `note, amount, amountUnsure, category, categoryUnsure, isExpense` | With `isExpense` first, the model rejected short sentences like "blinkit 650" (amount accuracy 74 % → 100 %) |
| Date picker | Date chip with the last 7 days | No extra native dependency; older dates can be added later |

### Development-only helpers (never active on a real iPhone or in a release build)

- `src/features/voice/simulator-voice.ts` — voice input off in the simulator (CoreAudio deadlock without Mac microphone access).
- `src/features/extract/simulator-stand-in.ts` — answers the eval sentences when Apple's model cannot run in the simulator.
- `src/features/add/dev-sentence-input.component.tsx` — DEV field that sends a typed sentence through the voice path (`__DEV__` only).

## Sources

- [Callstack — on-device Apple LLM in React Native](https://callstack.com/blog/on-device-apple-llm-support-comes-to-react-native)
- [callstackincubator/ai (`@react-native-ai/apple`)](https://github.com/callstackincubator/ai)
- [jamsch/expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- [Expo SDK 58 changelog](https://expo.dev/changelog/sdk-58.md)
- [Apple WWDC25 — SpeechAnalyzer](https://developer.apple.com/videos/play/wwdc2025/277/)

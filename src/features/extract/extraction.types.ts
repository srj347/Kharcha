// What the on-device model returns for one sentence.
export interface ModelExtraction {
  isExpense: boolean;
  amountRupees: number;
  category: string;
  note: string;
  amountUnsure: boolean;
  categoryUnsure: boolean;
}

export interface CategoryHint {
  id: string;
  name: string;
  description: string;
  keywords: string;
}

export interface NoteExample {
  note: string;
  categoryName: string;
}

export interface ExpenseDraft {
  amountPaise: number | null;
  categoryId: string | null;
  note: string;
  rawText: string;
}

export enum ExtractionDecision {
  // Every field is clear: save at once and offer Undo.
  AutoSave = 'auto-save',
  // Something is missing or unsure: show the confirm card.
  Confirm = 'confirm',
  // The sentence is not an expense (background talk, noise).
  Ignore = 'ignore',
}

export interface ExtractionOutcome {
  decision: ExtractionDecision;
  draft: ExpenseDraft;
}

// The model call, injected so the decision logic can be unit-tested.
export type ExtractFn = (sentence: string, categories: CategoryHint[], examples: NoteExample[]) => Promise<ModelExtraction>;

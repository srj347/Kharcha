import AppIntents
import Foundation

// "Log Expense": opens Kharcha on the Add tab, which starts listening at once.
// Shows up in the Shortcuts app with no setup, so it can be assigned to
// Back Tap (Settings › Accessibility › Touch › Back Tap) or the Action Button.
@available(iOS 18.0, *)
struct LogExpenseIntent: AppIntent {
  static let title: LocalizedStringResource = "Log Expense"
  static let description = IntentDescription("Opens Kharcha ready to hear an expense, like “spent 500 on Swiggy”.")

  @MainActor
  func perform() async throws -> some IntentResult & OpensIntent {
    guard let url = URL(string: "kharcha://record?src=shortcut") else {
      return .result()
    }
    return .result(opensIntent: OpenURLIntent(url))
  }
}

@available(iOS 18.0, *)
struct KharchaShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: LogExpenseIntent(),
      phrases: [
        "Log expense in \(.applicationName)",
        "Add expense in \(.applicationName)",
        "Log an expense with \(.applicationName)",
      ],
      shortTitle: "Log Expense",
      systemImageName: "indianrupeesign.circle"
    )
  }
}

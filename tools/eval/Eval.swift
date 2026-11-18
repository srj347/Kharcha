// Prompt accuracy check against Apple's on-device Foundation Model, run on a
// Mac (macOS 26+ with Apple Intelligence). Uses the same instructions text the
// app builds (tools/eval/instructions.txt, made by build-instructions.js) and
// the same output shape, with the category limited to the category names.
//
// Run: tools/eval/run-eval.sh
import Foundation
import FoundationModels

@Generable
struct Record {
    @Guide(description: "merchant, person or item in 1 to 4 words, Title Case")
    var note: String
    @Guide(description: "amount spent in Indian rupees, 0 when not said")
    var amountRupees: Double
    @Guide(description: "true when no amount was said clearly")
    var amountUnsure: Bool
    @Guide(description: "one category name from the list", .anyOf(["Food", "Groceries", "Travel", "Shopping", "Bills", "Fun", "Health", "Other"]))
    var category: String
    @Guide(description: "true when no category clearly fits")
    var categoryUnsure: Bool
    @Guide(description: "false only when the sentence is not about spending money")
    var isExpense: Bool
}

struct Phrase: Decodable {
    let sentence: String
    let amount: Double?
    let category: [String]?
    let expense: Bool?
}

let folder = URL(fileURLWithPath: CommandLine.arguments[1])
let instructions = try String(contentsOf: folder.appendingPathComponent("instructions.txt"), encoding: .utf8)
let phrases = try JSONDecoder().decode([Phrase].self, from: Data(contentsOf: folder.appendingPathComponent("phrases.json")))

var amountRight = 0, amountTotal = 0, categoryRight = 0, categoryTotal = 0, decisionRight = 0
var latencies: [Double] = []

for phrase in phrases {
    let session = LanguageModelSession(instructions: instructions)
    let started = Date()
    do {
        let response = try await session.respond(
            to: "Sentence: \"\(phrase.sentence)\"\nRecord:",
            generating: Record.self,
            options: GenerationOptions(samplingMode: .greedy)
        )
        latencies.append(Date().timeIntervalSince(started))
        let r = response.content
        var notes: [String] = []

        if phrase.expense == false {
            if !r.isExpense { decisionRight += 1 } else { notes.append("should not be an expense") }
        } else {
            if let expected = phrase.amount {
                amountTotal += 1
                if abs(r.amountRupees - expected) < 0.01 && !r.amountUnsure { amountRight += 1 } else { notes.append("amount \(r.amountRupees) unsure=\(r.amountUnsure) want \(expected)") }
            } else {
                amountTotal += 1
                if r.amountUnsure || r.amountRupees == 0 { amountRight += 1 } else { notes.append("invented amount \(r.amountRupees)") }
            }
            if let allowed = phrase.category {
                categoryTotal += 1
                if allowed.contains(r.category) { categoryRight += 1 } else { notes.append("category \(r.category) want \(allowed)") }
            }
            if r.isExpense { decisionRight += 1 } else { notes.append("marked not an expense") }
        }
        let mark = notes.isEmpty ? "ok  " : "MISS"
        print("\(mark) \(phrase.sentence) -> ₹\(r.amountRupees) \(r.category) \"\(r.note)\" \(notes.joined(separator: "; "))")
    } catch {
        print("ERR  \(phrase.sentence): \(error)")
    }
}

func percent(_ a: Int, _ b: Int) -> String { b == 0 ? "-" : String(format: "%.0f%%", Double(a) / Double(b) * 100) }
let sorted = latencies.sorted()
let median = sorted.isEmpty ? 0 : sorted[sorted.count / 2]
print("")
print("amount:   \(amountRight)/\(amountTotal) \(percent(amountRight, amountTotal))")
print("category: \(categoryRight)/\(categoryTotal) \(percent(categoryRight, categoryTotal))")
print("expense?: \(decisionRight)/\(phrases.count) \(percent(decisionRight, phrases.count))")
print(String(format: "median latency: %.2f s", median))

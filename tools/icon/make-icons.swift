// Draws the Kharcha app icon and splash image with AppKit.
// Run: swift tools/icon/make-icons.swift assets/images
import AppKit

let outDir = URL(fileURLWithPath: CommandLine.arguments[1])
let green = NSColor(red: 0x1E / 255, green: 0x6B / 255, blue: 0x52 / 255, alpha: 1)
let cream = NSColor(red: 0xF7 / 255, green: 0xF7 / 255, blue: 0xF4 / 255, alpha: 1)

func render(size: Int, background: NSColor?, glyphColor: NSColor, glyphScale: CGFloat, file: String) {
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  let rect = NSRect(x: 0, y: 0, width: size, height: size)
  if let background {
    background.setFill()
    rect.fill()
  } else {
    NSColor.clear.setFill()
    rect.fill(using: .copy)
  }
  let font = NSFont.systemFont(ofSize: CGFloat(size) * glyphScale, weight: .semibold)
  let text = NSAttributedString(string: "₹", attributes: [.font: font, .foregroundColor: glyphColor])
  let bounds = text.boundingRect(with: rect.size, options: [.usesLineFragmentOrigin, .usesFontLeading])
  let origin = NSPoint(x: (CGFloat(size) - bounds.width) / 2, y: (CGFloat(size) - bounds.height) / 2 - CGFloat(size) * 0.02)
  text.draw(at: origin)
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .png, properties: [:])!
  try! data.write(to: outDir.appendingPathComponent(file))
  print("wrote", file)
}

// App icon: full-bleed square (iOS applies the mask). make-icons.sh then
// removes the alpha channel, which the App Store does not accept.
render(size: 1024, background: green, glyphColor: cream, glyphScale: 0.62, file: "icon.png")
// Splash: green glyph on transparent, shown on the cream splash background.
render(size: 512, background: nil, glyphColor: green, glyphScale: 0.7, file: "splash-icon.png")

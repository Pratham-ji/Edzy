#!/usr/bin/env swift
import AppKit
import CoreGraphics
import CoreText
import Foundation
import ImageIO

/// Deterministic generator for Edzy's 1024x1024 native app & splash PNG assets.
/// Outputs:
///   - assets/splash-icon.png    (1024x1024 transparent RGBA: squircle monogram + EDZY + Education Made Easy)
///   - assets/icon.png           (1024x1024 solid #4F46E5 RGB: centered white EDZY monogram inside 65% safe circle)
///   - assets/adaptive-icon.png  (1024x1024 transparent RGBA: centered white EDZY monogram inside 60% safe zone)

let size: CGFloat = 1024
let pixelDim = 1024

func makeRGBA(r: CGFloat, g: CGFloat, b: CGFloat, a: CGFloat = 1.0) -> CGColor {
    CGColor(
        colorSpace: CGColorSpaceCreateDeviceRGB(),
        components: [r / 255.0, g / 255.0, b / 255.0, a]
    )!
}

func makeContext(opaque: Bool) -> CGContext {
    let alphaInfo: CGImageAlphaInfo = opaque ? .noneSkipLast : .premultipliedLast
    let ctx = CGContext(
        data: nil,
        width: pixelDim,
        height: pixelDim,
        bitsPerComponent: 8,
        bytesPerRow: pixelDim * 4,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: alphaInfo.rawValue
    )!
    ctx.setAllowsAntialiasing(true)
    ctx.setShouldAntialias(true)
    ctx.interpolationQuality = .high
    return ctx
}

func savePNG(_ ctx: CGContext, to path: String) throws {
    guard let cgImage = ctx.makeImage() else {
        throw NSError(domain: "EdzyAssetGen", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed CGImage render for \(path)"])
    }
    let url = URL(fileURLWithPath: path) as CFURL
    guard let dest = CGImageDestinationCreateWithURL(url, "public.png" as CFString, 1, nil) else {
        throw NSError(domain: "EdzyAssetGen", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed PNG destination for \(path)"])
    }
    CGImageDestinationAddImage(dest, cgImage, nil)
    if !CGImageDestinationFinalize(dest) {
        throw NSError(domain: "EdzyAssetGen", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed writing PNG to \(path)"])
    }
}

/// Draws the Edzy geometric "E + Z" squircle monogram inside `rect` in top-down (UI-kit style) coordinates.
func drawEdzyMonogram(
    ctx: CGContext,
    rect: CGRect,
    drawSquircleCard: Bool,
    squircleTopColor: CGColor,
    squircleBottomColor: CGColor,
    squircleStrokeColor: CGColor
) {
    // Flip into top-down 0..84 design space mapped to `rect`
    ctx.saveGState()
    ctx.translateBy(x: rect.minX, y: rect.maxY)
    ctx.scaleBy(x: rect.width / 84.0, y: -rect.height / 84.0)

    if drawSquircleCard {
        let squirclePath = CGPath(roundedRect: CGRect(x: 2, y: 2, width: 80, height: 80), cornerWidth: 23, cornerHeight: 23, transform: nil)
        ctx.saveGState()
        ctx.addPath(squirclePath)
        ctx.clip()
        let grad = CGGradient(
            colorsSpace: CGColorSpaceCreateDeviceRGB(),
            colors: [squircleTopColor, squircleBottomColor] as CFArray,
            locations: [0.0, 1.0]
        )!
        ctx.drawLinearGradient(grad, start: CGPoint(x: 2, y: 2), end: CGPoint(x: 82, y: 82), options: [])
        ctx.restoreGState()

        ctx.addPath(squirclePath)
        ctx.setStrokeColor(squircleStrokeColor)
        ctx.setLineWidth(1.8)
        ctx.strokePath()
    }

    // "E" left bars + vertical spine in crisp white
    ctx.setFillColor(makeRGBA(r: 255, g: 255, b: 255, a: 1.0))
    let eTop = CGPath(roundedRect: CGRect(x: 20, y: 23, width: 26, height: 6.5), cornerWidth: 3.25, cornerHeight: 3.25, transform: nil)
    let eMid = CGPath(roundedRect: CGRect(x: 20, y: 38.5, width: 19, height: 6.0), cornerWidth: 3.0, cornerHeight: 3.0, transform: nil)
    let eBot = CGPath(roundedRect: CGRect(x: 20, y: 54, width: 26, height: 6.5), cornerWidth: 3.25, cornerHeight: 3.25, transform: nil)
    let eSpine = CGPath(roundedRect: CGRect(x: 20, y: 23, width: 7.0, height: 37.5), cornerWidth: 3.5, cornerHeight: 3.5, transform: nil)
    for p in [eTop, eMid, eBot, eSpine] {
        ctx.addPath(p)
    }
    ctx.fillPath()

    // "Z" diagonal crossing ribbon
    ctx.setFillColor(makeRGBA(r: 165, g: 180, b: 252, a: 0.96)) // Crisp #A5B4FC contrast
    ctx.beginPath()
    ctx.move(to: CGPoint(x: 52.5, y: 24.5))
    ctx.addLine(to: CGPoint(x: 64.5, y: 24.5))
    ctx.addLine(to: CGPoint(x: 45.0, y: 60.0))
    ctx.addLine(to: CGPoint(x: 33.0, y: 60.0))
    ctx.closePath()
    ctx.fillPath()

    // "Z" top and bottom bars
    let zTop = CGPath(roundedRect: CGRect(x: 45, y: 23, width: 19.5, height: 6.5), cornerWidth: 3.25, cornerHeight: 3.25, transform: nil)
    let zBot = CGPath(roundedRect: CGRect(x: 36, y: 54, width: 28.5, height: 6.5), cornerWidth: 3.25, cornerHeight: 3.25, transform: nil)
    ctx.addPath(zTop)
    ctx.addPath(zBot)
    ctx.fillPath()

    // Spark dot at top-right apex
    ctx.setFillColor(makeRGBA(r: 253, g: 224, b: 71, a: 1.0)) // #FDE047
    ctx.fillEllipse(in: CGRect(x: 61.5, y: 17.5, width: 5.5, height: 5.5))

    ctx.restoreGState()
}

func drawCenteredText(
    ctx: CGContext,
    text: String,
    centerX: CGFloat,
    baselineYBottomUp: CGFloat,
    fontSize: CGFloat,
    weight: NSFont.Weight,
    color: CGColor,
    letterSpacing: CGFloat = 0
) {
    let baseFont = NSFont.systemFont(ofSize: fontSize, weight: weight)
    let descriptor = baseFont.fontDescriptor.withDesign(.rounded) ?? baseFont.fontDescriptor
    let font = NSFont(descriptor: descriptor, size: fontSize) ?? baseFont

    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: NSColor(cgColor: color) ?? NSColor.white,
        .kern: letterSpacing,
    ]
    let attrString = NSAttributedString(string: text, attributes: attrs)
    let line = CTLineCreateWithAttributedString(attrString)
    let bounds = CTLineGetBoundsWithOptions(line, .useOpticalBounds)

    ctx.saveGState()
    ctx.textMatrix = .identity
    ctx.textPosition = CGPoint(x: centerX - bounds.width / 2.0, y: baselineYBottomUp)
    CTLineDraw(line, ctx)
    ctx.restoreGState()
}

let scriptDir = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
let appRoot = scriptDir.deletingLastPathComponent()
let assetsDir = appRoot.appendingPathComponent("assets")
try FileManager.default.createDirectory(at: assetsDir, withIntermediateDirectories: true)

// 1. assets/splash-icon.png (1024x1024 transparent RGBA, safe inside central 640x640 zone)
do {
    let ctx = makeContext(opaque: false)
    ctx.clear(CGRect(x: 0, y: 0, width: size, height: size))

    // In bottom-up CoreGraphics coords: center = 512
    // Place monogram in upper-middle: y=474..754 (centered around 614)
    drawEdzyMonogram(
        ctx: ctx,
        rect: CGRect(x: (size - 270) / 2.0, y: 470, width: 270, height: 270),
        drawSquircleCard: true,
        squircleTopColor: makeRGBA(r: 99, g: 102, b: 241, a: 0.42),
        squircleBottomColor: makeRGBA(r: 79, g: 70, b: 229, a: 0.68),
        squircleStrokeColor: makeRGBA(r: 255, g: 255, b: 255, a: 0.44)
    )

    // "EDZY" wordmark right below monogram
    drawCenteredText(
        ctx: ctx,
        text: "EDZY",
        centerX: size / 2.0,
        baselineYBottomUp: 344,
        fontSize: 106,
        weight: .heavy,
        color: makeRGBA(r: 255, g: 255, b: 255, a: 1.0),
        letterSpacing: 8
    )

    // "Education Made Easy" subtitle cleanly centered inside circular mask safe zone
    drawCenteredText(
        ctx: ctx,
        text: "Education Made Easy",
        centerX: size / 2.0,
        baselineYBottomUp: 282,
        fontSize: 36,
        weight: .semibold,
        color: makeRGBA(r: 224, g: 231, b: 255, a: 0.92),
        letterSpacing: 0.8
    )

    try savePNG(ctx, to: assetsDir.appendingPathComponent("splash-icon.png").path)
}

// 2. assets/icon.png (1024x1024 solid #4F46E5 background, opaque RGB, monogram inside 65% safe circle)
do {
    let ctx = makeContext(opaque: true)
    ctx.setFillColor(makeRGBA(r: 79, g: 70, b: 229, a: 1.0)) // Exact #4F46E5
    ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))

    // Subtle Royal Indigo radial sheen for depth while keeping crisp solid edges
    let radial = CGGradient(
        colorsSpace: CGColorSpaceCreateDeviceRGB(),
        colors: [
            makeRGBA(r: 99, g: 102, b: 241, a: 0.45),
            makeRGBA(r: 67, g: 56, b: 202, a: 0.0),
        ] as CFArray,
        locations: [0.0, 1.0]
    )!
    ctx.drawRadialGradient(
        radial,
        startCenter: CGPoint(x: 512, y: 580),
        startRadius: 0,
        endCenter: CGPoint(x: 512, y: 512),
        endRadius: 680,
        options: .drawsAfterEndLocation
    )

    // Crisp centered monogram inside 65% safe zone (600x600 out of 1024)
    let iconSize: CGFloat = 600
    drawEdzyMonogram(
        ctx: ctx,
        rect: CGRect(x: (size - iconSize) / 2.0, y: (size - iconSize) / 2.0, width: iconSize, height: iconSize),
        drawSquircleCard: true,
        squircleTopColor: makeRGBA(r: 255, g: 255, b: 255, a: 0.16),
        squircleBottomColor: makeRGBA(r: 49, g: 46, b: 129, a: 0.34),
        squircleStrokeColor: makeRGBA(r: 255, g: 255, b: 255, a: 0.36)
    )

    try savePNG(ctx, to: assetsDir.appendingPathComponent("icon.png").path)
}

// 3. assets/adaptive-icon.png (1024x1024 transparent RGBA, monogram strictly inside 60% Android adaptive safe zone)
do {
    let ctx = makeContext(opaque: false)
    ctx.clear(CGRect(x: 0, y: 0, width: size, height: size))

    let safeSize: CGFloat = 560
    drawEdzyMonogram(
        ctx: ctx,
        rect: CGRect(x: (size - safeSize) / 2.0, y: (size - safeSize) / 2.0, width: safeSize, height: safeSize),
        drawSquircleCard: true,
        squircleTopColor: makeRGBA(r: 255, g: 255, b: 255, a: 0.16),
        squircleBottomColor: makeRGBA(r: 49, g: 46, b: 129, a: 0.32),
        squircleStrokeColor: makeRGBA(r: 255, g: 255, b: 255, a: 0.38)
    )

    try savePNG(ctx, to: assetsDir.appendingPathComponent("adaptive-icon.png").path)
}

print("Generated crisp 1024x1024 Edzy brand assets in \(assetsDir.path)")

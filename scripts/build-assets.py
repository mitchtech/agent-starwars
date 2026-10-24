"""Derive preview artifacts from the committed clips; never change source audio. The droids are simple drawn shapes."""

import sys
import tempfile
import wave
from array import array
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageSequence

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
PREVIEWS = ROOT / "assets" / "previews"
FONTS = ROOT / "site" / "fonts"
# --check renders elsewhere and compares pixels: PNG bytes vary with each platform's zlib.
CHECK = "--check" in sys.argv[1:]
OUT = Path(tempfile.mkdtemp()) if CHECK else PREVIEWS
OUT.mkdir(parents=True, exist_ok=True)
SPACE = (5, 7, 13)
PANEL = (12, 19, 34)
INK = (230, 238, 252)
MUTED = (154, 170, 198)
HOLO = (79, 195, 247)
HOLO_HI = (168, 230, 255)
HOLO_LO = (29, 74, 114)
ASTRO = (47, 111, 214)
PLATE = (232, 237, 245)
GOLD = (217, 165, 32)
GOLD_LO = (122, 86, 12)
DANGER = (255, 74, 61)
HEADLINE_CLIPS = [
    ("r2-hello", "R2-D2 says hello"),
    ("c3po-thank-the-maker", "Oh, thank the Maker."),
    ("c3po-doomed", "We're doomed."),
    ("c3po-excuse-me", "Excuse me."),
    ("c3po-technical", "Don't get technical with me."),
    ("r2-win", "R2-D2 cheers"),
]
DISPLAY = "orbitron-latin-700-normal.woff2"
BODY = "source-sans-3-latin-400-normal.woff2"
BOLD = "source-sans-3-latin-700-normal.woff2"


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size, layout_engine=ImageFont.Layout.BASIC)


def peaks(clip, columns):
    with wave.open(str(AUDIO / f"{clip}.wav")) as audio:
        samples = array("h", audio.readframes(audio.getnframes()))
    if sys.byteorder == "big":
        samples.byteswap()
    step = max(1, len(samples) // columns)
    values = [max((abs(value) for value in samples[i * step:(i + 1) * step]), default=0) / 32768 for i in range(columns)]
    top = max(values) or 1
    return [value / top for value in values]


def space(width, height):
    """Deep space with a deterministic starfield so --check stays reproducible."""
    canvas = Image.new("RGBA", (width, height), SPACE + (255,))
    draw = ImageDraw.Draw(canvas)
    seed = 7
    for _ in range(width * height // 900):
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        x, y = seed % width, (seed >> 11) % height
        tone = 90 + (seed >> 5) % 140
        draw.point((x, y), fill=(tone, tone, min(255, tone + 20), 255))
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((width * 0.55, -height * 0.6, width * 1.3, height * 0.5), fill=HOLO + (40,))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(min(width, height) // 6)))
    return canvas


def frame(draw, box, radius=12):
    left, top, right, bottom = box
    draw.rounded_rectangle((left - 3, top - 3, right + 3, bottom + 3), radius=radius + 3, fill=HOLO_LO)
    draw.rounded_rectangle((left - 2, top - 2, right + 2, bottom + 2), radius=radius + 2, outline=HOLO, width=2)


def r2(canvas, box):
    """R2-D2 as the site draws him: a dome, a blue band, a body with two panels, and two legs (120-unit grid)."""
    left, top, right, bottom = box
    s = min(right - left, bottom - top) / 120
    ox, oy = left + (right - left - 120 * s) / 2, top + (bottom - top - 120 * s) / 2
    p = lambda x, y: (ox + x * s, oy + y * s)
    box_of = lambda x0, y0, x1, y1: (*p(x0, y0), *p(x1, y1))
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.rectangle(box_of(24, 62, 34, 106), fill=(207, 215, 228))
    draw.rectangle(box_of(86, 62, 96, 106), fill=(207, 215, 228))
    draw.rectangle(box_of(20, 104, 38, 110), fill=(154, 167, 187))
    draw.rectangle(box_of(82, 104, 100, 110), fill=(154, 167, 187))
    draw.rounded_rectangle(box_of(34, 58, 86, 102), radius=4 * s, fill=PLATE)
    draw.rectangle(box_of(42, 64, 52, 84), fill=ASTRO)
    draw.rectangle(box_of(68, 64, 78, 84), fill=ASTRO)
    draw.rectangle(box_of(56, 64, 64, 72), fill=(154, 167, 187))
    draw.pieslice(box_of(30, 20, 90, 80), 180, 360, fill=PLATE)
    draw.rectangle(box_of(30, 50, 90, 58), fill=ASTRO)
    draw.ellipse(box_of(54, 28, 66, 40), fill=(10, 15, 26))
    draw.ellipse(box_of(56, 30, 60, 34), fill=(111, 184, 255))
    draw.rectangle(box_of(40, 38, 48, 44), fill=ASTRO)
    draw.rectangle(box_of(72, 38, 80, 44), fill=ASTRO)
    draw.ellipse(box_of(73.5, 25.5, 78.5, 30.5), fill=DANGER)


def c3po(canvas, box):
    """C-3PO as the site draws him: a rounded golden head with two round eyes and a mouth grille (120-unit grid)."""
    left, top, right, bottom = box
    s = min(right - left, bottom - top) / 120
    ox, oy = left + (right - left - 120 * s) / 2, top + (bottom - top - 120 * s) / 2
    p = lambda x, y: (ox + x * s, oy + y * s)
    box_of = lambda x0, y0, x1, y1: (*p(x0, y0), *p(x1, y1))
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.pieslice(box_of(26, 94, 94, 122), 180, 360, fill=(200, 150, 30))
    draw.rectangle(box_of(52, 92, 68, 106), fill=(154, 143, 128))
    draw.rounded_rectangle(box_of(34, 18, 86, 92), radius=26 * s, fill=GOLD)
    draw.line((*p(40, 40), *p(80, 40)), fill=GOLD_LO, width=max(1, round(3 * s)))
    draw.line((*p(34, 52), *p(86, 52)), fill=(176, 125, 18), width=max(1, round(2 * s)))
    for cx in (48, 72):
        draw.ellipse(box_of(cx - 7, 51, cx + 7, 65), fill=(255, 242, 176), outline=GOLD_LO, width=max(1, round(2 * s)))
    draw.rounded_rectangle(box_of(50, 76, 70, 82), radius=2 * s, fill=GOLD_LO)


def scope(size, clip, reveal=1.0, color=HOLO):
    """A hologram panel with scan lines and the clip's waveform swept in up to `reveal`."""
    width, height = size
    canvas = Image.new("RGBA", size, (4, 8, 18, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    for y in range(0, height, 5):
        draw.line((0, y, width, y), fill=HOLO + (16,))
    middle = height // 2
    columns = max(2, (width - 12) // 3)
    values = peaks(clip, columns)
    shown = int(columns * reveal)
    trace = Image.new("RGBA", size, (0, 0, 0, 0))
    lines = ImageDraw.Draw(trace)
    for index in range(columns):
        x = 6 + index * (width - 12) / columns
        if index < shown:
            amplitude = max(1, values[index] * height * 0.4)
            lines.line((x, middle - amplitude, x, middle + amplitude), fill=color + (255,), width=2)
        else:
            lines.line((x, middle, x + 3, middle), fill=color + (90,), width=1)
    canvas.alpha_composite(trace.filter(ImageFilter.GaussianBlur(4)))
    canvas.alpha_composite(trace)
    return canvas


def headline(canvas, xy, size, limit, words=("THANK THE", "MAKER.")):
    draw = ImageDraw.Draw(canvas, "RGBA")
    x, y = xy
    first, second = words
    # Shrink to fit beside the droids rather than running under them.
    while max(draw.textlength(first, font=font(DISPLAY, size)), draw.textlength(second, font=font(DISPLAY, size))) > limit:
        size -= 2
    display = font(DISPLAY, size)
    draw.text((x, y), first, font=display, fill=INK)
    below = y + round(size * 1.08)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((x, below), second, font=display, fill=HOLO + (170,))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(12)))
    draw.text((x, below), second, font=display, fill=HOLO)
    return below + size


def eyebrow(canvas, xy, size):
    draw = ImageDraw.Draw(canvas, "RGBA")
    x, y = xy
    draw.line((x, y + size // 2, x + 30, y + size // 2), fill=HOLO, width=2)
    label = font(BOLD, size)
    for character in "AGENT STAR WARS":
        draw.text((x + 44, y), character, font=label, fill=HOLO)
        x += draw.textlength(character, font=label) + 5


def droid_pair(canvas, box):
    """R2-D2 and C-3PO side by side in one hologram frame."""
    left, top, right, bottom = box
    draw = ImageDraw.Draw(canvas, "RGBA")
    frame(draw, box)
    inner = Image.new("RGBA", (right - left, bottom - top), PANEL + (255,))
    shade = ImageDraw.Draw(inner, "RGBA")
    for y in range(0, inner.height, 5):
        shade.line((0, y, inner.width, y), fill=HOLO + (12,))
    halo = Image.new("RGBA", inner.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse((inner.width * 0.1, inner.height * 0.55, inner.width * 0.9, inner.height * 1.15), fill=HOLO + (60,))
    inner.alpha_composite(halo.filter(ImageFilter.GaussianBlur(inner.height // 8)))
    half = inner.width // 2
    pad = inner.height // 10
    r2(inner, (pad, pad, half + pad // 2, inner.height - pad // 2))
    c3po(inner, (half - pad // 2, pad // 2, inner.width - pad, inner.height - pad // 2))
    canvas.alpha_composite(inner, (left, top))


# Waveform previews: a sweep that reveals each clip, then holds.
label_font = font(BOLD, 19)
for clip, line in HEADLINE_CLIPS:
    color = GOLD if clip.startswith("c3po-") else HOLO
    frames = []
    steps = 14
    base = space(288, 200)
    frame(ImageDraw.Draw(base), (14, 14, 274, 156))
    for step in range(steps + 1):
        canvas = base.copy()
        canvas.alpha_composite(scope((260, 142), clip, reveal=step / steps, color=color), (14, 14))
        draw = ImageDraw.Draw(canvas)
        width = draw.textlength(line.upper(), font=label_font)
        draw.text(((288 - width) / 2, 168), line.upper(), font=label_font, fill=HOLO_HI if step == steps else MUTED)
        frames.append(canvas.convert("RGB"))
    durations = [70] * steps + [1600]
    frames[0].save(OUT / f"{clip}.gif", save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=2)

# Fonts are the site's self-hosted OFL faces, so the cards match the page on every OS.
card = space(1200, 630)
draw = ImageDraw.Draw(card, "RGBA")
eyebrow(card, (88, 92), 22)
headline(card, (84, 140), 96, 540)
draw.text((90, 368), "R2-D2 and C-3PO sound cues", font=font(BODY, 34), fill=INK)
draw.text((90, 412), "for Claude Code, Codex, and Gemini CLI.", font=font(BODY, 34), fill=INK)
draw.text((90, 500), "\"We're doomed.\" when an approval is destructive.", font=font(BODY, 26), fill=MUTED)
droid_pair(card, (690, 120, 1120, 470))
draw.text((690, 500), "DUO MODE: BEEPS + PROTOCOL", font=font(BOLD, 24), fill=GOLD)
card.convert("RGB").save(OUT / "social.png")

banner = space(1280, 440)
draw = ImageDraw.Draw(banner, "RGBA")
eyebrow(banner, (92, 76), 22)
headline(banner, (88, 118), 100, 620)
draw.text((94, 346), "R2-D2 and C-3PO sound cues for coding agents.", font=font(BODY, 30), fill=MUTED)
droid_pair(banner, (790, 60, 1190, 380))
banner.convert("RGB").save(OUT / "banner.png")

touch = space(180, 180)
draw = ImageDraw.Draw(touch, "RGBA")
draw.rounded_rectangle((6, 6, 173, 173), radius=28, fill=PANEL + (255,), outline=HOLO, width=4)
r2(touch, (16, 14, 164, 168))
touch.convert("RGB").save(OUT / "touch-icon.png")

# The plugin listing icon: both droids on the hologram panel, square, opaque.
icon = space(512, 512)
draw = ImageDraw.Draw(icon, "RGBA")
draw.rounded_rectangle((16, 16, 495, 495), radius=72, fill=PANEL + (255,), outline=HOLO, width=10)
droid_pair(icon, (44, 70, 468, 442))
icon.convert("RGB").save(OUT / "icon.png")


def frames_of(path):
    with Image.open(path) as image:
        return [(item.convert("RGBA"), item.info.get("duration")) for item in ImageSequence.Iterator(image)]


if CHECK:
    stale = []
    for built in sorted(OUT.iterdir()):
        committed = PREVIEWS / built.name
        if not committed.exists():
            stale.append(built.name)
            continue
        expected, actual = frames_of(committed), frames_of(built)
        if len(expected) != len(actual) or any(a[1] != b[1] or ImageChops.difference(a[0], b[0]).getbbox(alpha_only=False) for a, b in zip(expected, actual)):
            stale.append(built.name)
    if stale:
        sys.exit(f"Preview assets are stale; run python3 scripts/build-assets.py: {', '.join(stale)}")
    print("Preview assets match the current clips and fonts")
else:
    print(f"Built preview assets in {OUT}")

# The Bird That Fixed the Bullet Train: vertical explainer short

A 64-second 1080×1920 science explainer in the "nature meets engineering" format: black stage, HUD specimen panels,
big count-up numbers, before/after data bars, captions two or three words at a time with the keyword in bold yellow,
an energetic narrator and an electronic score.

**Story:** Japan's bullet trains caused tunnel booms. Engineer Eiji Nakatsu, a birdwatcher, borrowed the kingfisher's
long, narrow beak for the 500 Series nose: 30 % less air pressure, 15 % less electricity, 10 % faster.
Every claim is sourced in [`FACTS.md`](FACTS.md).

| File | What it does |
| --- | --- |
| `captions.json`, `lines.json` | script (`*word*` = keyword) and spoken text (numbers spelled out) |
| `voice/` | narration, Kokoro TTS voice `am_michael` (Apache 2.0) |
| `build_timeline.py` | timeline from voice lengths → `timeline.json` / `timeline.js` |
| `scene.html` | the film, drawn in canvas: kingfisher, trains, tunnel cutaway, streamlines, HUD |
| `render.js` | Playwright → frames → ffmpeg |
| `mix.py` | electronic score, sound design, voice ducking |
| `fonts/` | Playfair Display, Archivo Black, JetBrains Mono (SIL OFL) |

```bash
python3 build_timeline.py
node render.js video /tmp/kf_noaudio.mp4 4
python3 mix.py
ffmpeg -i /tmp/kf_noaudio.mp4 -i out/mix.wav -c:v libx264 -crf 22 -maxrate 6M -bufsize 12M -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest -movflags +faststart kingfisher-bullet-train.mp4
```

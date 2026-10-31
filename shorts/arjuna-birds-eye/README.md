# Arjuna and the Bird's Eye: vertical short

A 73-second, 1080×1920 (9:16) storybook short in the temple-puppet style of the reference clip:
figures on rods, gold outlines, warm vignette, word-by-word captions with highlighted keywords, English narration,
and a curtain call at the end.

**The story** (Mahabharata): Guru Drona tests the young princes with a wooden bird on a tree. Each one sees the tree,
the sky, his brothers. Arjuna sees only the bird, then only its eye, and his arrow finds its mark.
**The lesson:** the world will always show you a hundred things; see only your goal.

The signature moment: as Arjuna focuses, the world goes dark around the bird, then around its eye alone.

**Output:** [`arjuna-birds-eye.mp4`](arjuna-birds-eye.mp4) · subtitles [`arjuna-birds-eye.srt`](arjuna-birds-eye.srt)

| File | What it does |
| --- | --- |
| `captions.json`, `lines.json` | the script: on-screen captions (`*word*` = highlighted) and the spoken lines |
| `voice/` | narration, Kokoro TTS voice `bm_george` (Apache 2.0) |
| `build_timeline.py` | builds `timeline.json` / `timeline.js` from the voice lengths; picture, captions and sound all read it |
| `scene.html` | canvas scene engine (shared with the Ganesha short) plus this film's characters and scenes |
| `render.js` | Playwright → JPEG frames → ffmpeg |
| `mix.py` | procedural score (tanpura, flute, bells, drums), foley (bow creak, twang, arrow, impact) and voice ducking |

## Rebuild

```bash
python3 build_timeline.py
node render.js video /tmp/arjuna_noaudio.mp4 4
python3 mix.py                                   # → out/mix.wav (numpy, scipy, soundfile, soxr)
ffmpeg -i /tmp/arjuna_noaudio.mp4 -i out/mix.wav -c:v libx264 -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest -movflags +faststart arjuna-birds-eye.mp4
```

## Narration

| Time | Line |
| --- | --- |
| 0:00.6 | Long ago, in a forest school, Guru Drona taught the young princes. |
| 0:05.8 | One morning, he set them a test. |
| 0:08.9 | High on a tree, he placed a small wooden bird. |
| 0:12.8 | “Aim for its eye,” he said. |
| 0:15.4 | “But first, tell me… what do you see?” |
| 0:18.7 | The eldest prince raised his bow. |
| 0:21.7 | “I see the tree, the branches, the leaves… and my brothers.” |
| 0:26.2 | “Step aside.” |
| 0:28.3 | The next saw the sky, the bird, and his teacher. |
| 0:31.9 | “Step aside.” |
| 0:33.9 | One by one, they all stepped aside. |
| 0:37.4 | Then came Arjuna. |
| 0:39.8 | “What do you see?” |
| 0:41.5 | “I see only the bird.” |
| 0:44.2 | “Look closer.” |
| 0:46.4 | “Only its eye.” |
| 0:48.4 | “Then shoot.” |
| 0:52.1 | The arrow found its mark. |
| 0:54.8 | Arjuna became the greatest archer of his age. |
| 0:59.5 | The world will always show you a hundred things. |
| 1:03.1 | See only your goal, |
| 1:05.3 | and you will hit it. |
| 1:08.3 | Follow for more stories. |

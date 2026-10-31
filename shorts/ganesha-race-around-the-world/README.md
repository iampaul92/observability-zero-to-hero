# Ganesha and the Race Around the World — vertical short

A 79-second, 1080×1920 (9:16) storybook short for YouTube Shorts / Reels / TikTok.
Its style is modeled on mythology-explainer shorts: shadow-puppet figures on rods,
a temple interior with an arched night window, warm vignette lighting, floating
dust, and word-by-word captions with highlighted keywords. It ends on a curtain
call with a follow card.

**Output:** [`ganesha-race-around-the-world.mp4`](ganesha-race-around-the-world.mp4)

Everything is generated from code: no stock footage, images or samples.

| File | What it does |
| --- | --- |
| `scene.html` | Canvas scene engine: characters, backgrounds, camera moves, captions, grain |
| `render.js` | Drives `scene.html` in headless Chromium (Playwright) → JPEG frames → ffmpeg |
| `music.py` | Procedural score: tanpura drone in D, pads, bansuri-style flute, bells, whooshes, drums |
| `fonts/` | Cinzel / Cinzel Decorative (SIL Open Font License) |

## Rebuild

```bash
python3 music.py /tmp/music.wav                       # needs numpy + scipy
node render.js video /tmp/video_noaudio.mp4 3         # needs playwright + ffmpeg
ffmpeg -i /tmp/video_noaudio.mp4 -i /tmp/music.wav -c:v copy -c:a aac -b:a 192k \
       -shortest -movflags +faststart ganesha-race-around-the-world.mp4

# quick stills for checking a few timestamps (seconds):
node render.js preview 5 20 48 70
```

## Narration script (for an optional voiceover)

The captions are timed to this script, so a voiceover recorded to these marks
will line up. Pace: calm, warm storyteller, ~2.5 words/sec.

| Time | Line |
| --- | --- |
| 0:00 | Long ago, on Mount Kailash, |
| 0:03 | a golden fruit fell from the heavens. |
| 0:06 | The fruit of all wisdom. |
| 0:09 | But it could not be shared. |
| 0:11 | And Shiva had two sons. |
| 0:14 | Kartikeya, the swift, and Ganesha, the wise. |
| 0:17 | "Whoever circles the whole world three times first, wins the fruit." |
| 0:25 | Kartikeya leapt onto his peacock and was gone in a flash. |
| 0:31 | Ganesha looked at his little mouse. And smiled. |
| 0:37 | Over oceans. Over mountains. Across every land. |
| 0:44 | Ganesha simply walked around his parents. |
| 0:47 | Once. Twice. Three times. |
| 0:54 | "You are my whole world." |
| 0:57 | And the fruit was his. |
| 1:00 | When Kartikeya returned, the race was already won. |
| 1:05 | That is why they say, the world is not out there. |
| 1:10 | It is the ones who made you. |
| 1:15 | Follow for more stories. |

To add a voiceover: record or generate the VO, then mix it over the music with ducking:

```bash
ffmpeg -i ganesha-race-around-the-world.mp4 -i vo.wav -filter_complex \
  "[1:a]asplit[v1][v2];[0:a]volume=0.5[m];[m][v1]sidechaincompress=threshold=0.05:ratio=6[d];[d][v2]amix=inputs=2:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k with-vo.mp4
```

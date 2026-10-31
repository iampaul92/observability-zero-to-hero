#!/bin/sh
# One-command rebuild of "The Tea Merchant's Road". Needs the Lemo-Opuscar library (core tools + voice + music tiers).
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
cd "$LIB"
[ -f "$HERE/voice/dur.json" ] || .venv/bin/python core/tts/tts.py "$HERE/lines.json" "$HERE/voice"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
.venv/bin/python core/render/srt.py "$HERE/cues.json" "$HERE/tea-merchants-road.srt"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/tea-merchants-road.mp4" 24 0

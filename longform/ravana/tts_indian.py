"""Indian-English narration with Kokoro (offline).

Kokoro has no Indian-English voice, so this reads English with an Indian (Hindi) voice and rewrites the
English pronunciation into Indian-English sounds before synthesis: retroflex t/d, a v/w blend, a tapped r,
pure o and e vowels, and dental th.

Usage (run with the Lemo-Opuscar .venv python):
  python tts_indian.py lines.json out_dir [--voice hm_omega] [--style indian|plain]
lines.json = [{"id", "text", "speed"?}]. Writes <id>.wav (24 kHz) and dur.json, like core/tts/tts.py.
"""
import json, os, re, sys, argparse
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

LIB = os.environ.get('LIB', '/root/lemo-opuscar')

def indianize(ph):
    ph = ph.replace('əʊ', 'oː').replace('eɪ', 'eː')            # pure vowels: "go" → goː, "day" → deː
    ph = ph.replace('θ', '\u0001').replace('ð', '\u0002')       # hold "th" aside
    ph = re.sub(r't(?!ʃ)', 'ʈ', ph)                             # retroflex t (keep "ch")
    ph = re.sub(r'd(?!ʒ)', 'ɖ', ph)                             # retroflex d (keep "j")
    ph = ph.replace('\u0001', 't').replace('\u0002', 'd')      # "th" becomes a soft, plain t / d
    ph = ph.replace('w', 'ʋ').replace('v', 'ʋ')                 # v/w blend
    ph = ph.replace('ɹ', 'ɾ')                                   # tapped r
    ph = ph.replace('æ', 'ɛ').replace('ɒ', 'ɔ')
    return ph

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('lines'); ap.add_argument('out')
    ap.add_argument('--voice', default='hm_omega'); ap.add_argument('--style', default='indian')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    k = Kokoro(os.path.join(LIB, 'core/tts/kokoro-v1.0.onnx'), os.path.join(LIB, 'core/tts/voices-v1.0.bin'))
    tok = Tokenizer(); durs = {}
    for L in json.load(open(a.lines)):
        ph = tok.phonemize(L['text'], 'en-gb')
        if a.style == 'indian': ph = indianize(ph)
        y, sr = k.create(ph, voice=L.get('voice', a.voice), speed=L.get('speed', .92), is_phonemes=True)
        # trim silence at both ends
        idx = np.where(np.abs(y) > .01)[0]
        if len(idx): y = y[max(0, idx[0] - int(.03 * sr)): idx[-1] + int(.08 * sr)]
        sf.write(os.path.join(a.out, L['id'] + '.wav'), y, sr); durs[L['id']] = round(len(y) / sr, 3)
        print(L['id'], durs[L['id']], ph[:70])
    json.dump(durs, open(os.path.join(a.out, 'dur.json'), 'w'), indent=1)

if __name__ == '__main__':
    main()

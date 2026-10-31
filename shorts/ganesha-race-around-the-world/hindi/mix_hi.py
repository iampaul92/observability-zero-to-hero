"""Hindi version: lay the Hindi narration over the score, ducking the music under the voice.
Usage: python3 hindi/mix_hi.py music.wav out_mix.wav   (needs numpy, scipy, soundfile, soxr)
"""
import sys, os, json
import numpy as np, soundfile as sf, soxr
from scipy.ndimage import uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
music, SR = sf.read(sys.argv[1], dtype='float32')
place = json.load(open(os.path.join(HERE, 'voice_place.json')))
vox = np.zeros_like(music)


def compress(x, thr=.3, ratio=3.0, win=.01):
    env = uniform_filter1d(np.abs(x), int(win * SR)) + 1e-9
    g = np.where(env > thr, (thr + (env - thr) / ratio) / env, 1.0)
    return x * g


for k, t0 in place.items():
    y, sr = sf.read(os.path.join(HERE, 'voice', k + '.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR)
    y = compress(y / (np.abs(y).max() + 1e-9) * .85)
    s = int(t0 * SR); e = min(len(vox), s + len(y))
    vox[s:e] += y[:e - s, None] * .9

# duck the music ~9 dB under speech, with a smooth envelope
lvl = uniform_filter1d(np.abs(vox).mean(1), int(.3 * SR))
duck = 10 ** (-9 * np.minimum(1, lvl / (lvl.max() * .12 + 1e-9)) / 20)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vr = rms(vox[np.abs(vox).mean(1) > 1e-3]); mr = rms(music)
m = music * (vr * 10 ** (-9 / 20) / mr)            # music ~9 dB below the voice before ducking
mix = vox + m * duck[:, None]
mix *= .89 / np.abs(mix).max()
sf.write(sys.argv[2], mix, SR, subtype='PCM_24')
print('ok', mix.shape, SR)

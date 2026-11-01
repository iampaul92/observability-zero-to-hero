"""The Bird That Fixed the Bullet Train: electronic score + sound design + narration → out/mix.wav.
Cues come from timeline.json. Usage: python3 mix.py (numpy, scipy, soundfile, soxr)"""
import os, json
import numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
SR = 44100; DUR = TL['dur']; N = int(DUR * SR); V = TL['voice']; SCN = TL['scenes']; CAPS = TL['caps']
rng = np.random.default_rng(8)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vox = np.zeros((N, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def add(buf, x, t0, g=1., pan=0.):
    i = int(t0 * SR)
    if i < 0 or i >= N: return
    x = x[:N - i]; buf[i:i + len(x), 0] += x * g * np.sqrt((1 - pan) / 2); buf[i:i + len(x), 1] += x * g * np.sqrt((1 + pan) / 2)
def wordT(i, w):
    txt = CAPS[i].replace('*', ''); k = txt.find(w); return V[i][0] + (V[i][1] - V[i][0]) * max(0, k) / len(txt) * .95
# instruments
def pad(notes, d, bright=.3):
    t = tt(d); s = sum(np.sin(2 * np.pi * hz(m + dt) * t) + bright * np.sin(4 * np.pi * hz(m + dt) * t) for m in notes for dt in (-.08, .08))
    e = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5); return s * e * .02
def pluck(m, d=.4, v=1.):
    t = tt(d); s = (np.sin(2 * np.pi * hz(m) * t) + .5 * np.sin(4 * np.pi * hz(m) * t) * np.exp(-t * 18)) * np.exp(-t * 9); return s * .12 * v
def sub(d=1.2, f=45, v=1.):
    t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) * np.minimum(1, t / .01) * .5 * v
def hit(v=1.):   # cinematic impact: sub drop + noise burst
    t = tt(2.0); f = 30 + 90 * np.exp(-t * 12)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * .8 + bp(rng.normal(size=len(t)), 100, 3000) * np.exp(-t * 14) * .4) * v
def tick(v=1.): t = tt(.06); return bp(rng.normal(size=len(t)), 3000, 9000) * np.exp(-t * 90) * .15 * v
def blip(f=1800, v=1.): t = tt(.12); return np.sin(2 * np.pi * f * t) * np.exp(-t * 35) * .1 * v
def riser(d=1.5):
    n = int(d * SR); x = rng.normal(size=n); out = np.zeros(n)
    for b in range(24): a, z = b * n // 24, (b + 1) * n // 24; fc = 300 + 5000 * (b / 24) ** 2; out[a:z] = bp(x[a:z], fc * .7, fc * 1.3)
    return out * np.linspace(0, 1, n) ** 2 * .3
def whoosh(d=1.2, lo=200, hi=3000):
    n = int(d * SR); x = rng.normal(size=n); out = np.zeros(n)
    for b in range(24): a, z = b * n // 24, (b + 1) * n // 24; p = b / 24; fc = lo + (hi - lo) * np.sin(np.pi * p); out[a:z] = bp(x[a:z], fc * .7, fc * 1.3)
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2 * .4
def splash(): t = tt(.6); return bp(rng.normal(size=len(t)), 1500, 7000) * np.exp(-t * 14) * .25 + np.sin(2 * np.pi * 900 * t * (1 - t)) * np.exp(-t * 20) * .1
def chirp(): t = tt(.18); f = 4200 + 1500 * np.sin(np.pi * t / .18); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .18) * .06

# score: pads per section, a 16th-note arp pulse that drops out for the reveal, sub on scene changes
sections = [('train', (38, 45, 50, 53)), ('tunnel', (38, 45, 50, 53)), ('houses', (36, 43, 48, 51)), ('engineer', (41, 48, 52, 57)), ('bird', (43, 50, 55, 59)),
            ('dive', (43, 50, 55, 59)), ('beak', (41, 48, 53, 57)), ('test', (38, 45, 50, 55)), ('result', (43, 50, 55, 62)), ('stats', (43, 50, 55, 62)), ('finale', (38, 45, 50, 57))]
for k, ch in sections: a, b = SCN[k]; add(music, pad(ch, b - a + 1.2), a - .3, 1., 0)
bpm = 112; st = 60 / bpm / 4
arp = [62, 69, 74, 69, 65, 69, 74, 77]
t = SCN['train'][0] + .3; i = 0
quiet = [(SCN['bird'][0] - .1, SCN['dive'][0] + .5), (SCN['finale'][0], DUR)]
while t < DUR - 1:
    if not any(a <= t < b for a, b in quiet):
        root = -12 if t < SCN['engineer'][0] else (-7 if t < SCN['test'][0] else 0)
        add(music, pluck(arp[i % 8] + root, .3, .9 if i % 4 == 0 else .55), t, 1, (-.3, .3)[i % 2])
        if i % 4 == 0: add(music, tick(.7), t, 1, .5)
        if i % 16 == 0: add(music, sub(.6, hz(26 + root) if False else 44), t, .7)
    t += st; i += 1
for k in SCN: add(music, blip(1400), SCN[k][0] + .2, 1, -.4); add(music, blip(2100), SCN[k][0] + .35, 1, -.4)   # HUD types in
for k in ['tunnel', 'engineer', 'bird', 'beak', 'result']: add(music, sub(1.6, 41), SCN[k][0], .8)
# hits on the reveals and numbers
add(music, riser(1.4), SCN['bird'][0] - 1.4, 1); add(music, hit(.8), SCN['bird'][0] + .05, 1)
add(music, riser(1.0), V[14][0] - 1.0, 1); add(music, hit(.7), wordT(14, '500'), 1)
for li, w in [(15, '15'), (16, '30'), (17, '15'), (18, '10')]:
    w0 = wordT(li, w) - .05; add(music, hit(.45), w0, 1)
    for k in range(10): add(music, tick(.8), w0 + k * .06, 1, .2)
add(music, pad((50, 57, 62, 66, 69), 5), SCN['finale'][0] + .2, 1.2)
add(music, pluck(74, 2.5, 1.2), wordT(20, 'look'), 1); add(music, pluck(81, 2.5, .8), wordT(20, 'look') + .12, 1)
# sound design
add(sfx, whoosh(1.6, 200, 2500), .3, 1.1, -.3)
b = wordT(2, 'boom'); add(sfx, whoosh(1.2, 150, 1200), b - 1.0, .9); add(sfx, hit(1.6), b, 1); add(sfx, hit(.9), wordT(3, 'exploding'), 1)
for k in range(3): add(sfx, hit(.35), SCN['houses'][0] + .2 + k * .7, 1, -.5)
for i in range(3): add(sfx, chirp(), SCN['engineer'][0] + 5.0 + i * .25, 1, .6)
for i in range(4): add(sfx, chirp(), SCN['bird'][0] + .3 + i * .22, 1, .4)
entry = wordT(9, 'splash') - .5; add(sfx, whoosh(.6, 800, 4000), entry - .6, .7); add(sfx, splash(), entry, 1)
add(sfx, whoosh(1.4, 300, 3000), SCN['result'][0], .9, .3)
# voice
for i, (a, _) in enumerate(V):
    y, sr = sf.read(os.path.join(HERE, 'voice', 'c%02d.wav' % i), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR); y = y / (np.abs(y).max() + 1e-9) * .85
    env = uniform_filter1d(np.abs(y), int(.01 * SR)) + 1e-9; y = y * np.where(env > .3, (.3 + (env - .3) / 3) / env, 1)
    add(vox, y, a, .9)
ir_t = tt(1.8); ir = lp(rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3.5)[:, None], 5000)
music = music * .85 + np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1) * .03
lvl = uniform_filter1d(np.abs(vox).mean(1), int(.25 * SR)); duck = 10 ** (-7 * np.minimum(1, lvl / (lvl.max() * .12 + 1e-9)) / 20)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12); vr = rms(vox[np.abs(vox).mean(1) > 1e-3])
music *= vr * 10 ** (-10 / 20) / rms(music); sfx *= vr * 10 ** (-8 / 20) / rms(sfx[np.abs(sfx).mean(1) > 1e-4])
mix = vox + music * duck[:, None] + sfx
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.4) / np.tanh(1.4) * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24'); print('mix ok', DUR)

"""The Tea Merchant's Road: original score + foley + voice → out/mix.wav

Score: shakuhachi (synthesized: slide-ins, meri drops, breath), shamisen and koto (core/audio/pluck.py),
odaiko and shime-daiko (synthesized), hyoshigi clappers, a small bell. Miyako-bushi on D (D Eb G A Bb).
Foley and ambience are driven by events.json (exported from the page), so every sound sits on its frame.
Run from the library root: .venv/bin/python <project>/mix.py
"""
import os, sys, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.getcwd()
sys.path.insert(0, LIB)
from core.audio import pluck as P
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, compress, limit, t_

ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; EV = ev['ev']
N = int(DUR * SR)
rng = np.random.default_rng(23)
E = lambda typ: [e for e in EV if e['type'] == typ]
def st(): return np.zeros((N, 2), np.float32)
music, amb, fol, vox = st(), st(), st(), st()
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
SIL = next(e for e in EV if e['type'] == 'silence'); SIL0, SIL1 = SIL['t'], SIL['t'] + SIL['dur'] - .2   # silence until the voice resumes

# ———————————— instruments ————————————
def shaku(m, d, vel=.8, meri=False, slide=True):
    n = int((d + .35) * SR); t = np.arange(n) / SR
    semis = np.zeros(n)
    if slide: semis += -1.0 * np.exp(-t / .07)                     # slide up into the note
    if meri: semis += -1.0 * np.clip((t - d + .45) / .3, 0, 1)        # meri: the pitch sinks at the phrase end
    vib = .18 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - .5) / .6, 0, 1)
    f = hz(m) * 2 ** ((semis + vib) / 12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.clip(t / .12, 0, 1) * np.clip((d + .3 - t) / .3, 0, 1) ** 1.5 * (1 + .12 * np.sin(2 * np.pi * .7 * t))
    tone = np.sin(ph) + .32 * np.sin(2 * ph + .4) + .1 * np.sin(3 * ph + 1.1)
    breath = bp(rng.standard_normal(n), 900, 4200) * .22 + bp(rng.standard_normal(n), hz(m) * .9, hz(m) * 2.2) * .35
    muraiki = bp(rng.standard_normal(n), 600, 3000) * np.exp(-t / .06) * .9          # the breath burst on the attack
    return ((tone * .7 + breath) * env * vel * .16 + muraiki * vel * .1).astype(np.float32)

def phrase(t0, notes, vel=.8, pan=-.15):
    t = t0
    for i, (m, d) in enumerate(notes):
        add(music, shaku(m, d, vel, meri=(i == len(notes) - 1)), t, 1.0, pan); t += d

def taiko(v=1., f0=120, f1=55, tau=.45):
    t = t_(1.8); f = f1 + (f0 - f1) * np.exp(-t / .045); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t / tau) + .3 * np.sin(1.6 * ph) * np.exp(-t / .2) + bp(noise(1.8), 90, 900) * np.exp(-t / .02) * .6
    return (lp(y, 3000) / 1.6 * v).astype(np.float32)
def shime(v=1.):
    t = t_(.3); y = np.sin(2 * np.pi * 420 * t) * np.exp(-t / .05) + bp(noise(.3), 1500, 6000) * np.exp(-t / .008) * .8
    return (y * .25 * v).astype(np.float32)
def hyoshigi(v=1.):
    t = t_(.5); y = sum(a * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / tau) for f, a, tau in [(1180, 1, .05), (2460, .7, .035), (3870, .45, .022), (760, .35, .07)])
    y = y + 1.4 * bp(noise(.5) * np.exp(-t / .002), 1500, 9000); d = int(.003 * SR); y[d:] += .35 * y[:-d]
    return (y / np.abs(y).max() * .5 * v).astype(np.float32)
def bell(m=81, d=5., v=1.):
    t = t_(d); y = sum(a * np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) for r, a, tau in [(1, 1, 2.2), (2.76, .45, 1.1), (5.4, .2, .5), (8.9, .08, .25), (.5, .3, 3)])
    return (y * .16 * v * np.clip(t / .003, 0, 1)).astype(np.float32)
def chime(v=1.):
    t = t_(2.5); y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(2360, 1, .9), (5150, .5, .5), (7980, .25, .3)])
    return (y * .05 * v).astype(np.float32)

# ———————————— score (cue map in TREATMENT.md §6) ————————————
D4, Eb4, G4, A4, Bb4, D5, Eb5, G5, A5 = 62, 63, 67, 69, 70, 74, 75, 79, 81
# opening: shakuhachi alone; the motif
MOTIF = [(D5, 2.0), (Bb4, .7), (A4, 1.4), (G4, .6), (A4, 2.0)]
phrase(1.0, MOTIF, .75)
phrase(6.6, [(G4, .8), (A4, .8), (Bb4, 1.1), (A4, 2.2)], .65)
add(music, P.pluck('shamisen', 'D3', 3.5, vel=.7), 2.65, .9, .2)        # one sawari note as the first seal stamps
# the road: shamisen ostinato at 72 bpm, thinner on the pass, doubled with shime-daiko at the festival
beat = 60 / 72
def ostinato(a, b, pat, vel=.55, every=1):
    k = 0; t = a
    while t < b - .05:
        if k % every == 0: add(music, P.pluck('shamisen', pat[(k // every) % len(pat)], beat * .9, vel=vel * (1.1 if k % 4 == 0 else 1)), t, .8, .25)
        t += beat; k += 1
ostinato(12.6, 19.6, ['D3', 'A3', 'D4', 'A3'])
ostinato(20.4, 27.5, ['D3', 'G3', 'A3', 'G3'], .5, every=2)
fest_t = 28.0; t = fest_t; k = 0
while t < 34.15:
    add(music, P.pluck('shamisen', ['D3', 'A3', 'D4', 'Eb4', 'D4', 'A3', 'Bb3', 'A3'][k % 8], beat * .45, vel=.55), t, .8, .25)
    if k % 2: add(music, shime(.9), t, 1, -.3)
    t += beat / 2; k += 1
phrase(14.2, [(A4, 1.2), (Bb4, .6), (A4, 1.6)], .5); phrase(21.8, [(G4, 1.4), (A4, .8), (G4, 1.8)], .5); phrase(29.0, [(D5, .6), (Eb5, .6), (D5, 1.4)], .5)
for e in E('slide'): add(music, hyoshigi(.8), e['t'] + e['dur'], 1, 0)             # a clap as each print lands
# the city: everything stops on the cut; one low note rings, a slow heartbeat under the offer
add(music, P.pluck('shamisen', 'D2', 4.0, vel=.6), 34.2, .8, 0)
t = 35.0; gap = 1.1
while t < 39.6: add(music, taiko(.35 + .3 * (t - 35) / 4.6), t, .9, 0); t += gap; gap = max(.75, gap * .93)
# the turn: three koto notes as rain, snow and lanterns print onto the bowl, a glissando into dusk
for e, p in zip(sorted(E('block'), key=lambda e: e['t']), ['D5', 'A5', 'D6']): add(music, P.pluck('koto', p, 3.0, vel=.75), e['t'], 1.0, .1)
z = E('zoom')[0]
for i, p in enumerate(['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5', 'Eb5', 'G5', 'A5', 'Bb5', 'D6']): add(music, P.pluck('koto', p, 1.2, vel=.5 + i * .03), z['t'] + i * z['dur'] / 11, .7, -.2 + i * .04)
# home at dusk: the motif returns and resolves on D
phrase(47.9, [(D5, 1.6), (Bb4, .6), (A4, 1.0), (G4, .8), (D4 + 12, 3.0)], .7)
phrase(53.2, [(A4, 1.2), (G4, 1.0), (D4 + 12, 3.4)], .6)
add(music, P.pluck('koto', 'D4', 4, vel=.5), 51.4, .7, .2)
# curtain: clappers accelerate, then the bell as the seal is left alone
w = next(e for e in EV if e['type'] == 'wash' and e['t'] > 50)
t = w['t']; gap = .5
while gap > .07: add(music, hyoshigi(.55), t, 1, 0); t += gap; gap *= .8
b = E('bell')[0]['t']; add(music, bell(74, 6, 1.2), b, 1, 0); add(music, bell(81, 5, .6), b + .02, 1, .1)

# ———————————— foley ————————————
def rub(d=.34, v=1.):   # baren: band-passed noise with a slow circular modulation
    t = t_(d); y = bp(noise(d), 300, 2400) * (.6 + .4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d)
    return (y * .1 * v).astype(np.float32)
def seal(v=1.):
    t = t_(.4); y = np.sin(2 * np.pi * (60 + 80 * np.exp(-t / .02)) * t) * np.exp(-t / .06) * .5 + hp(noise(.4), 2500) * np.exp(-((t - .12) / .03) ** 2) * .08
    return (y * .5 * v).astype(np.float32)
def paper(d, v=1., lo=500, hi=3500, up=False):
    t = t_(d); y = bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2
    if up: y = y * np.clip(t / d, 0, 1) ** 2
    return (y * .08 * v).astype(np.float32)
def pour(d, v=1.):
    t = t_(d); y = bp(noise(d), 500, 2600) * (.6 + .4 * np.sin(2 * np.pi * 13 * t + np.sin(2 * np.pi * 3 * t))) * np.clip(t / .08, 0, 1) * np.clip((d - t) / .2, 0, 1)
    return (y * .09 * v).astype(np.float32)
def clink(v=1.):
    t = t_(.6); y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(3150, 1, .12), (5230, .6, .08), (7410, .3, .05)])
    return (y * .06 * v).astype(np.float32)
def sandal(v=1.):
    t = t_(.15); y = bp(noise(.15), 300, 2200) * np.exp(-t / .015) + np.sin(2 * np.pi * 180 * t) * np.exp(-t / .02) * .3
    return (y * .2 * v).astype(np.float32)
for e in EV:
    ty, t0 = e['type'], e['t']
    if SIL0 <= t0 < SIL1: continue
    if ty == 'rub': add(fol, rub(), t0, 1, (e.get('g', 0) - 1.5) * .3)
    elif ty == 'cart': add(fol, paper(.3, .6, 1500, 6000), t0, 1, .3)
    elif ty == 'seal': add(fol, seal(), t0, 1, 0)
    elif ty == 'cloth': add(fol, paper(.5, .5, 300, 1800), t0, 1, 0)
    elif ty == 'step': add(fol, sandal(), t0, 1, .3)
    elif ty == 'slide': add(fol, paper(e['dur'], 1.2, 200, 2500), t0, 1, 0)
    elif ty == 'pour': add(fol, pour(e['dur']), t0, 1, -.1)
    elif ty == 'coins':
        for i in range(8): add(fol, clink(.7 + .3 * rng.random()), t0 + i * e['dur'] / 8 + rng.random() * .04, 1, rng.random() - .5)
    elif ty == 'wash': add(fol, paper(e['dur'] + .4, 1.0, 400, 5000), t0, 1, 0)
    elif ty == 'zoom': add(fol, paper(e['dur'] + .2, 1.6, 200, 4000, up=True), t0, 1, 0)

# ———————————— ambience beds (J-cut into the rain, L-cut out of the festival) ————————————
def bed(a, b, y, fi=.8, fo=.8):
    n = int((b - a) * SR); y = y[:n]; t = np.arange(len(y)) / SR
    env = np.clip(t / fi, 0, 1) * np.clip(((b - a) - t) / fo, 0, 1); return (y * env).astype(np.float32)
def birds(d):
    y = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 1.2)):
        s = rng.random() * (d - .5); n = int(.12 * SR); t = np.arange(n) / SR; f = 3200 + 1600 * np.sin(np.pi * t / .12) + rng.random() * 800
        y[int(s * SR):int(s * SR) + n] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .12) * .03
    return y
def rainbed(d): y = hp(noise(d), 1500) * .025 + lp(noise(d), 500) * .03; return y
def windbed(d): t = t_(d); return bp(noise(d), 250, 900) * (.5 + .5 * np.sin(2 * np.pi * .13 * t)) * .05
def crowd(d): t = t_(d); return bp(noise(d), 200, 1400) * (.7 + .3 * np.sin(2 * np.pi * 2.1 * t) * np.sin(2 * np.pi * .3 * t)) * .05
def insects(d): t = t_(d); return bp(noise(d), 4200, 5600) * (np.sin(2 * np.pi * 22 * t) > .3) * .012
for a, b, y in [(0, 11.6, lp(brown(11.6), 600) * .25 + birds(11.6)), (11.0, 19.9, rainbed(8.9)), (19.5, 27.7, windbed(8.2)),
                (27.4, 34.9, crowd(7.5)), (34.2, 39.8, lp(noise(5.6), 300) * .008), (46.8, 57.2, insects(10.4))]:
    add(amb, bed(a, b, y), a, 1, 0)
for t0 in [48.2, 50.9, 53.6, 55.4]: add(amb, chime(), t0, 1, .5)
add(amb, bed(28.0, 34.0, np.concatenate([taiko(.15, 90, 45, .3), np.zeros(int(6 * SR), np.float32)])[:int(6 * SR)]), 28.4, 1, .6)   # a distant festival drum

# ———————————— voice ————————————
lines = {l['id']: l for l in json.load(open(os.path.join(HERE, 'lines.json')))}
for e in E('voice'):
    y, sr = sf.read(os.path.join(HERE, 'voice', e['id'] + '.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR); y = compress(y / (np.abs(y).max() + 1e-9) * .8, .25, 3.0)
    add(vox, y.astype(np.float32), e['t'], 1.0, 0)

# ———————————— mix: duck music ~8 dB and ambience ~4 dB under the voice; cut everything in the silence ————————————
v = np.abs(vox).mean(1); w = int(.25 * SR)
venv = np.convolve(v, np.ones(w) / w, 'same'); venv = np.minimum(1, venv / (venv.max() * .15 + 1e-9))
duck_m = 10 ** (-8 * venv / 20); duck_a = 10 ** (-4 * venv / 20)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vr = rms(vox[np.abs(vox).mean(1) > 1e-3])
mr = rms(music[np.abs(music).mean(1) > 1e-4]); music *= (vr * 10 ** (-10 / 20)) / mr      # voice ~10 dB over music
mix = vox + music * duck_m[:, None] + amb * duck_a[:, None] * 1.0 + fol * 1.2
s0, s1 = int(SIL0 * SR), int(SIL1 * SR); mix[s0:s1] = 0        # ma: absolute silence, reverb tails cut too
f = int(.03 * SR); mix[s0 - f:s0] *= np.linspace(1, 0, f)[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
print('mix ok', mix.shape, 'peak', float(np.abs(mix).max()))

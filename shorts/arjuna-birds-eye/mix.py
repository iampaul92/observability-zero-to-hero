"""Arjuna and the Bird's Eye: procedural score (tanpura drone in D, pads, bansuri-style flute, bells, drums)
+ foley + English narration with ducking → out/mix.wav. Cues come from timeline.json.
Usage: python3 mix.py   (needs numpy, scipy, soundfile, soxr)
"""
import os, json, wave
import numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
SR = 44100; DUR = TL['dur']; N = int(SR * DUR)
rng = np.random.default_rng(5)
music = np.zeros((N, 2)); fol = np.zeros((N, 2)); vox = np.zeros((N, 2))
V = TL['voice']; SCN = TL['scenes']; REL, IMP = TL['release'], TL['impact']
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def add(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]; l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i:i + len(sig), 0] += sig * gain * l; buf[i:i + len(sig), 1] += sig * gain * r
def env_ar(n, a, r):
    e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def tanpura(f, dur=3.4):
    t = np.arange(int(dur * SR)) / SR; s = np.zeros_like(t)
    for k in range(1, 16): s += (1 / k ** .9) * (1 + .6 * np.sin(2 * np.pi * (.4 + k * .07) * t)) * np.sin(2 * np.pi * f * k * t * (1 + .0007 * k)) * np.exp(-t * (.6 + .12 * k))
    return s * env_ar(len(t), .01, .3) * .08
def pad(notes, dur):
    t = np.arange(int(dur * SR)) / SR; s = np.zeros_like(t)
    for m in notes:
        for det in (-.12, 0, .11): f = hz(m + det); s += np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)
    return s * env_ar(len(t), 1.6, 1.8) * .018
def bell(f, dur=4.0):
    t = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 1.2), (2.01, .5, 2), (2.76, .35, 2.6), (5.4, .18, 4), (8.93, .08, 6)))
    return s * env_ar(len(t), .002, .05) * .16
def flute(f, dur):
    t = np.arange(int(dur * SR)) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .25) * 3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR; s = np.sin(ph) + .22 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    br = sosfilt(butter(2, [f * .8, f * 3], 'bandpass', fs=SR, output='sos'), rng.normal(size=len(t))) * .25
    return (s + br) * env_ar(len(t), .09, min(.25, dur * .4)) * .11
def thump(dur=.5, f0=110, f1=48):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t * 18); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * .5
def tick(dur=.15):
    t = np.arange(int(dur * SR)) / SR; return sosfilt(butter(2, [2500, 7000], 'bandpass', fs=SR, output='sos'), rng.normal(size=len(t))) * np.exp(-t * 40) * .12
def whoosh(dur=1.0, up=True, lo=300, span=5000):
    n = int(dur * SR); x = rng.normal(size=n); out = np.zeros(n)
    for b in range(32):
        a, z = b * n // 32, (b + 1) * n // 32; p = b / 32; fc = lo + span * (p if up else 1 - p)
        out[a:z] = sosfilt(butter(2, [fc * .6, fc * 1.4], 'bandpass', fs=SR, output='sos'), x[a:z])
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2 * .35
def twang():   # bowstring release
    t = np.arange(int(.6 * SR)) / SR; f = 110 * (1 + .08 * np.exp(-t * 30))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) + .5 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 9) * .4
def creak(dur=.9):   # bow being drawn
    n = int(dur * SR); t = np.arange(n) / SR; x = sosfilt(butter(2, [300, 1400], 'bandpass', fs=SR, output='sos'), rng.normal(size=n))
    return x * (.5 + .5 * np.sin(2 * np.pi * 23 * t)) * np.clip(t / dur, 0, 1) * .12
def impact():
    t = np.arange(int(.5 * SR)) / SR
    return (sosfilt(butter(2, [800, 4000], 'bandpass', fs=SR, output='sos'), rng.normal(size=len(t))) * np.exp(-t * 60) * .6 + np.sin(2 * np.pi * 320 * t) * np.exp(-t * 25) * .5)
def birds(d):
    y = np.zeros(int(d * SR))
    for _ in range(int(d * 1.3)):
        s = rng.random() * (d - .5); n = int(.12 * SR); t = np.arange(n) / SR; f = 3200 + 1600 * np.sin(np.pi * t / .12) + rng.random() * 800
        y[int(s * SR):int(s * SR) + n] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .12) * .03
    return y

# drone (it stops for the held breath before the shot)
SILENCE = (V[15][1] + .1, REL - .05)
t = 0.0
while t < DUR - 2:
    for j, m in enumerate((45, 50, 50, 38)):
        if not (SILENCE[0] - 2.5 < t + j * .9 < SILENCE[1]): add(music, tanpura(hz(m)), t + j * .9, 1.0, -.3 if j % 2 else .3)
    t += 3.6
# pads by scene
for key, ch in [('s1', (50, 57, 62, 65)), ('s2', (48, 55, 60, 64)), ('s3', (46, 53, 58, 62)), ('s4', (46, 53, 58, 62)), ('s5', (45, 52, 57, 60)),
                ('s6', (50, 57, 62, 65)), ('s8', (50, 57, 62, 66)), ('s9', (48, 55, 62, 64)), ('s10', (50, 57, 62, 66))]:
    a, b = SCN[key]; add(music, pad(ch, b - a + 1.5), a)
# flute phrases (D kafi)
D = 62
def phrase(t0, notes, g=1.0):
    tt = t0
    for m, d in notes: add(music, flute(hz(m), d + .12), tt, g, .15); tt += d
phrase(1.0, [(D + 7, 1.0), (D + 5, .5), (D + 3, .5), (D + 2, 1.2), (D, 1.6)])
phrase(SCN['s2'][0] + .4, [(D + 3, .6), (D + 5, .6), (D + 7, .8), (D + 10, .6), (D + 9, 1.8)])
phrase(SCN['s6'][0] + .2, [(D + 7, .6), (D + 9, .6), (D + 12, 1.6)], .9)
phrase(SCN['s8'][0] + 1.2, [(D + 12, .8), (D + 10, .5), (D + 9, .5), (D + 7, 1.0), (D + 9, 2.0)])
phrase(SCN['s9'][0] + .3, [(D + 9, 1.0), (D + 7, .6), (D + 5, .6), (D + 3, 1.0)], .8)
phrase(V[21][0] + .9, [(D + 2, .7), (D + 5, .7), (D + 9, .9), (D + 14, 2.4)])
# test scenes: a soft pulse that grows tense as Arjuna draws
for a, b, bpm, g in [(SCN['s3'][0], SCN['s5'][1], 84, .45), (V[11][0], SILENCE[0] - .2, 96, .7)]:
    beat = 60 / bpm; tt = a; k = 0
    while tt < b: add(music, thump(), tt, g * (1 if k % 4 == 0 else .6)); add(music, tick(), tt + beat / 2, g, .4); tt += beat; k += 1
# story hits
add(music, bell(hz(74)), V[1][0] + 1.0, .7)                       # the test
for i, m in enumerate((74, 78, 81)): add(music, bell(hz(m)), V[2][0] + 1.6 + i * .12, .5, (-.4, 0, .4)[i])  # the bird
add(music, bell(hz(86), 3), V[4][0] + 1.2, .6)                    # what do you see?
for i in (7, 9): add(music, thump(.8, 80, 40), V[i][0], .8)       # step aside
add(music, bell(hz(69)), V[11][0], .8, -.3)                        # Arjuna
add(music, bell(hz(81), 5), V[13][0] + .8, .6)                     # only the bird
add(music, bell(hz(86), 5), V[15][0] + .6, .8)                     # only its eye
add(music, bell(hz(62), 6), IMP, 1.2); add(music, bell(hz(74), 6), IMP + .03, .8)
for i, m in enumerate((86, 90, 93, 98, 102)): add(music, bell(hz(m), 2), IMP + .08 + i * .07, .4, np.sin(i))
add(music, bell(hz(74)), V[20][0] + .5, .7)                        # see only your goal
add(music, bell(hz(62), 6), V[21][0] + .85, 1.0); add(music, bell(hz(74), 6), V[21][0] + .87, .6)
add(music, whoosh(1.8, up=False), SCN['s10'][0] + .2, .6)
add(music, bell(hz(62), 5), V[22][0], .7)
# foley
add(fol, birds(SCN['s5'][1]), 0, 1.0)
for a in [V[5][0] + .3, V[8][0] + .3, V[11][0] + 1.3]: add(fol, creak(), a, 1.0)
add(fol, twang(), REL - .25, 1.2); add(fol, whoosh(IMP - REL + .25, True, 600, 3000), REL - .2, 1.0)
add(fol, impact(), IMP, 1.4)
add(fol, whoosh(.5, True, 800, 3000), V[21][0] + .3, .7); add(fol, impact(), V[21][0] + .8, .8)
# voice
for i, (a, b) in enumerate(V):
    y, sr = sf.read(os.path.join(HERE, 'voice', 'c%02d.wav' % i), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR); y = y / (np.abs(y).max() + 1e-9) * .85
    env = uniform_filter1d(np.abs(y), int(.01 * SR)) + 1e-9; y = y * np.where(env > .3, (.3 + (env - .3) / 3) / env, 1)
    add(vox, y, a, .9)
# reverb on the music
ir_t = np.arange(int(2.4 * SR)) / SR
ir = sosfilt(butter(1, 4000, 'low', fs=SR, output='sos'), rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 2.6)[:, None], axis=0)
music = music * .8 + np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1) * .035
s0, s1 = int(SILENCE[0] * SR), int(SILENCE[1] * SR)
music[s0:s1] *= np.linspace(1, 0, s1 - s0)[:, None] ** 3      # the music falls away before the shot
# balance and ducking
lvl = uniform_filter1d(np.abs(vox).mean(1), int(.3 * SR)); duck = 10 ** (-8 * np.minimum(1, lvl / (lvl.max() * .12 + 1e-9)) / 20)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vr = rms(vox[np.abs(vox).mean(1) > 1e-3]); music *= vr * 10 ** (-9 / 20) / rms(music)
mix = vox + music * duck[:, None] + fol * .9
fi, fo = int(.6 * SR), int(2.0 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.3) / np.tanh(1.3) * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
print('mix ok', DUR, 'silence', SILENCE)

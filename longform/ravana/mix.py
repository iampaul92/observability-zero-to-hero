"""Ravana: score (tanpura drone, pads, bansuri-style flute, bells, drums), foley and the Indian-English narration
with ducking → out/mix.wav. Every cue comes from timeline.json. Usage: python3 mix.py (numpy, scipy, soundfile, soxr)."""
import os, json
import numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
SR = 44100; DUR = TL['dur']; N = int(SR * DUR)
rng = np.random.default_rng(11)
music = np.zeros((N, 2)); fol = np.zeros((N, 2)); vox = np.zeros((N, 2))
V = TL['voice']; SC = TL['scenes']
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


def scenes(key): return [s for s in SC if s['key'] == key]
def first(key): return scenes(key)[0]
vt = lambda s, k: V[min(s['first'] + k, len(V) - 1)][0]
def drum_run(a, b, bpm, g):
    beat = 60 / bpm; t = a; k = 0
    while t < b:
        add(music, thump(), t, g * (1 if k % 4 == 0 else .6)); add(music, tick(), t + beat / 2, g, .4); t += beat; k += 1

duel = first('duel'); SILENCE = (vt(duel, 2) - 2.2, vt(duel, 2) - .55)   # breath before Rama's arrow
# drone, with a gap for the silence
t = 0.0
while t < DUR - 3:
    for j, m in enumerate((45, 50, 50, 38)):
        tt = t + j * .9
        if not (SILENCE[0] - 2.5 < tt < SILENCE[1]): add(music, tanpura(hz(m)), tt, 1.0, -.3 if j % 2 else .3)
    t += 3.6
# pads: a chord per scene, darker as the story turns
CH = {'hook': (38, 45, 50, 53), 'hook2': (38, 45, 50, 53), 'birth': (50, 57, 62, 65), 'kubera': (48, 55, 60, 64), 'brothers': (46, 53, 58, 62), 'penance': (38, 45, 50, 53),
      'brahma': (50, 57, 62, 66), 'kumbha': (46, 53, 58, 62), 'lanka': (43, 50, 55, 58), 'pushpaka': (48, 55, 62, 64), 'kailash': (38, 45, 50, 57), 'scholar': (46, 53, 58, 62),
      'forest': (50, 57, 62, 66), 'surpanakha': (45, 52, 57, 60), 'court': (38, 45, 50, 53), 'maricha': (45, 52, 57, 60), 'deer': (50, 57, 62, 64), 'abduct': (38, 44, 50, 53),
      'jatayu': (41, 48, 53, 56), 'ashoka': (45, 52, 57, 62), 'warn': (38, 45, 50, 53), 'hanuman': (43, 50, 55, 59), 'bridge': (43, 50, 55, 58), 'kumbha2': (38, 45, 50, 53),
      'war': (38, 45, 50, 53), 'duel': (38, 45, 50, 53), 'lesson': (45, 52, 57, 60), 'lesson2': (50, 57, 62, 65), 'lesson3': (50, 57, 62, 66), 'outro': (50, 57, 62, 66)}
for s in SC:
    if s['key'] in CH: add(music, pad(CH[s['key']], s['b'] - s['a'] + 1.5), s['a'] - .3)
    else: add(music, bell(hz(62), 4), s['a'] + .15, .9); add(music, bell(hz(74), 4), s['a'] + .2, .5)   # chapter card
# flute phrases (D kafi)
D = 62
def phrase(t0, notes, g=1.0):
    tt = t0
    for m, d in notes: add(music, flute(hz(m), d + .12), tt, g, .15); tt += d
phrase(first('hook')['a'] + .6, [(D + 7, 1.2), (D + 5, .6), (D + 3, .6), (D + 2, 1.4), (D, 2.0)], .9)
phrase(first('birth')['a'] + .4, [(D + 3, .6), (D + 5, .6), (D + 7, .8), (D + 10, .6), (D + 9, 1.8)])
phrase(first('kailash')['a'] + 9, [(D + 12, .8), (D + 10, .5), (D + 9, .5), (D + 7, 1.0), (D + 9, 2.2)])
phrase(first('forest')['a'] + .4, [(D + 7, .6), (D + 9, .6), (D + 12, 1.6), (D + 9, 1.2)])
phrase(first('ashoka')['a'] + .5, [(D + 9, 1.0), (D + 7, .6), (D + 5, .6), (D + 3, 1.6)], .9)
phrase(first('lesson2')['a'] + .5, [(D + 2, .8), (D + 5, .8), (D + 9, 1.0), (D + 7, 1.6)], .9)
phrase(first('lesson3')['a'] + 6, [(D + 2, .7), (D + 5, .7), (D + 9, .9), (D + 14, 2.6)])
# pulse and drums
for key, bpm, g in [('deer', 100, .45), ('abduct', 112, .6), ('jatayu', 112, .6), ('hanuman', 104, .5), ('bridge', 96, .45), ('war', 120, .8)]:
    for s in scenes(key): drum_run(s['a'] + .3, s['b'] - .2, bpm, g)
d0 = first('duel'); drum_run(d0['a'] + .2, SILENCE[0], 132, .8)
# story hits
add(music, hit := bell(hz(86), 3), first('hook')['a'] + 1.6, .5)
b = first('brahma'); add(music, bell(hz(74), 5), b['a'] + .6, .9); add(music, bell(hz(81), 5), b['a'] + .65, .6)
k = first('kailash'); add(music, thump(1.2, 80, 34), vt(k, 1), 1.4); add(music, bell(hz(62), 6), vt(k, 4), 1.0)
for key, kk in [('maricha', 2), ('warn', 1)]: add(music, thump(.9, 90, 40), vt(first(key), kk), 1.0)
add(fol, whoosh(1.6, True, 300, 3000), vt(first('abduct'), 1) + .5, 1.0)
j = first('jatayu'); add(fol, impact(), vt(j, 1) + .8, 1.0)
add(fol, twang(), SILENCE[1] + .05, 1.4); add(fol, whoosh(.9, True, 600, 3000), SILENCE[1] + .1, 1.0); add(fol, impact(), vt(duel, 2) + .2, 1.6)
add(music, bell(hz(62), 6), vt(duel, 2) + .25, 1.3); add(music, bell(hz(74), 6), vt(duel, 2) + .3, .8)
l2 = first('lesson2'); add(music, bell(hz(86), 4), vt(l2, 7) + .8, .8)
o = first('outro'); add(music, bell(hz(62), 6), o['a'] + .3, 1.0); add(music, bell(hz(74), 6), o['a'] + .35, .6)
add(fol, birds(30), first('birth')['a'], .8); add(fol, birds(20), first('forest')['a'], .8)
# voice
for i, (a, _) in enumerate(V):
    y, sr = sf.read(os.path.join(HERE, 'voice', 'v%03d.wav' % i), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR); y = y / (np.abs(y).max() + 1e-9) * .85
    env = uniform_filter1d(np.abs(y), int(.01 * SR)) + 1e-9; y = y * np.where(env > .3, (.3 + (env - .3) / 3) / env, 1)
    add(vox, y, a, .9)
ir_t = np.arange(int(2.4 * SR)) / SR
ir = sosfilt(butter(1, 4000, 'low', fs=SR, output='sos'), rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 2.6)[:, None], axis=0)
music = music * .8 + np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1) * .035
s0, s1 = int(SILENCE[0] * SR), int(SILENCE[1] * SR); music[s0:s1] *= np.linspace(1, 0, s1 - s0)[:, None] ** 3
lvl = uniform_filter1d(np.abs(vox).mean(1), int(.3 * SR)); duck = 10 ** (-8 * np.minimum(1, lvl / (lvl.max() * .12 + 1e-9)) / 20)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vr = rms(vox[np.abs(vox).mean(1) > 1e-3]); music *= vr * 10 ** (-10 / 20) / rms(music)
mix = vox + music * duck[:, None] + fol * .9
fi, fo = int(.8 * SR), int(3.0 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.3) / np.tanh(1.3) * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
print('mix ok', DUR, 'silence', SILENCE)

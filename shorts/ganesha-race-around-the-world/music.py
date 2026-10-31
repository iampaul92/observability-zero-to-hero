"""Procedural score for the short: tanpura drone, pads, bansuri-ish flute, bells and hits.
Usage: python3 music.py out.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 79.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
mix = np.zeros((N, 2))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    mix[i:i + len(sig), 0] += sig * gain * l
    mix[i:i + len(sig), 1] += sig * gain * r


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def tanpura(f, dur=3.4):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k in range(1, 16):
        amp = (1 / k ** 0.9) * (1 + 0.6 * np.sin(2 * np.pi * (0.4 + k * 0.07) * t))  # jawari shimmer
        s += amp * np.sin(2 * np.pi * f * k * t * (1 + 0.0007 * k)) * np.exp(-t * (0.6 + 0.12 * k))
    return s * env_ar(len(t), 0.01, 0.3) * 0.08


def pad(notes, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for m in notes:
        for det in (-0.12, 0, 0.11):
            f = hz(m + det)
            s += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    s *= env_ar(len(t), 1.6, 1.8) * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * t))
    return s * 0.018


def bell(f, dur=4.0):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for ratio, amp, dec in ((1, 1, 1.2), (2.01, 0.5, 2), (2.76, 0.35, 2.6), (5.4, 0.18, 4), (8.93, 0.08, 6)):
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return s * env_ar(len(t), 0.002, 0.05) * 0.16


def flute(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.25) * 3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    s = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = sosfilt(butter(2, [f * 0.8, f * 3], 'bandpass', fs=SR, output='sos'), rng.normal(size=len(t))) * 0.25
    return (s + breath) * env_ar(len(t), 0.09, min(0.25, dur * 0.4)) * 0.11


def thump(dur=0.5, f0=110, f1=48):
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 0.5


def tick(dur=0.15):
    t = np.arange(int(dur * SR)) / SR
    s = sosfilt(butter(2, [2500, 7000], 'bandpass', fs=SR, output='sos'), rng.normal(size=len(t)))
    return s * np.exp(-t * 40) * 0.12


def whoosh(dur=1.6, up=True):
    n = int(dur * SR)
    noise = rng.normal(size=n)
    out = np.zeros(n)
    blocks = 32
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        p = b / blocks
        fc = 300 + (5000 if up else 2000) * (p if up else 1 - p)
        out[a:z] = sosfilt(butter(2, [fc * 0.6, fc * 1.4], 'bandpass', fs=SR, output='sos'), noise[a:z])
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.35


def shimmer(t0, base=86, n=7, step=0.07, gain=0.6):
    scale = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15]
    for i in range(n):
        add(bell(hz(base + scale[i % len(scale)] - 12 * (i >= len(scale))), 3), t0 + i * step, gain, pan=np.sin(i))


# --- drone: Pa Sa Sa Sa(low) cycle, D tonic ---
t = 0.0
while t < DUR - 2:
    for j, m in enumerate((45, 50, 50, 38)):
        add(tanpura(hz(m)), t + j * 0.9, 1.0, pan=(-0.3 if j % 2 else 0.3))
    t += 3.6

# --- pads per scene (D dorian-ish colours) ---
PADS = [(0, 9.3, (50, 57, 62, 65)), (9, 17.8, (46, 53, 58, 62)), (17.5, 25.3, (48, 55, 60, 64)),
        (25, 31.3, (50, 57, 62, 69)), (31, 37.3, (53, 57, 60, 65)), (37, 44.3, (50, 57, 62, 64)),
        (44, 54.3, (46, 53, 58, 62)), (54, 60.8, (48, 55, 62, 64)), (60.5, 65.3, (45, 52, 57, 60)),
        (65, 74.3, (50, 57, 62, 66)), (74, 79, (50, 57, 62, 66))]
for a, b, ch in PADS:
    add(pad(ch, b - a + 1.5), a, 1.0)

# --- flute phrases (D Kafi: D E F G A B C) ---
D = 62
PHR = [
    (1.0, [(D + 7, 1.0), (D + 5, 0.5), (D + 3, 0.5), (D + 2, 1.2), (D, 1.6)]),
    (5.0, [(D + 3, 0.6), (D + 5, 0.6), (D + 7, 0.8), (D + 10, 0.6), (D + 9, 1.8)]),
    (9.6, [(D + 9, 0.8), (D + 7, 0.6), (D + 5, 1.6)]),
    (14.0, [(D + 7, 0.5), (D + 9, 0.5), (D + 12, 1.2)]),
    (15.9, [(D + 5, 0.5), (D + 3, 0.5), (D + 2, 1.3)]),
    (31.4, [(D + 12, 0.4), (D + 10, 0.4), (D + 9, 0.4), (D + 7, 1.2)]),
    (34.6, [(D + 14, 0.25), (D + 12, 0.25), (D + 14, 1.2)]),
    (54.4, [(D + 2, 0.8), (D + 5, 0.8), (D + 7, 0.8), (D + 9, 1.4)]),
    (65.4, [(D + 9, 1.0), (D + 7, 0.6), (D + 5, 0.6), (D + 3, 1.2)]),
    (69.0, [(D + 2, 0.7), (D + 3, 0.7), (D + 5, 0.9), (D + 2, 2.6)]),
]
for t0, notes in PHR:
    tt = t0
    for m, d in notes:
        add(flute(hz(m), d + 0.12), tt, 1.0, pan=0.15)
        tt += d

# --- rhythmic drive: launch + travel ---
for t0, t1, bpm in ((25.0, 28.0, 100), (37.0, 44.0, 132)):
    beat = 60 / bpm
    k = 0
    tt = t0
    while tt < t1:
        add(thump(), tt, 0.9 if k % 4 == 0 else 0.55)
        add(tick(), tt + beat / 2, 1.0, pan=0.4)
        tt += beat
        k += 1

# --- story hits ---
shimmer(3.0, base=86, n=8)                 # the fruit falls
add(bell(hz(74)), 6.2, 0.9)                # fruit of all wisdom
add(bell(hz(69)), 14.0, 0.6, pan=-0.5)     # Kartikeya
add(bell(hz(66)), 15.8, 0.6, pan=0.5)      # Ganesha
for i, m in enumerate((62, 66, 69)):       # three laps motif in the decree
    add(bell(hz(m + 12)), 20.5 + i * 0.67, 0.7)
add(bell(hz(74)), 22.5, 0.8)
add(whoosh(1.4), 27.6, 1.2)                # peacock launch
add(thump(0.9, 90, 35), 28.0, 1.3)
shimmer(28.0, base=81, n=6, step=0.05)
add(bell(hz(86), 2), 34.5, 0.7, pan=0.3)   # smile
add(whoosh(1.0), 38.6, 0.6); add(whoosh(1.0), 40.6, 0.6)
for i, m in enumerate((74, 78, 81)):       # Once / Twice / Three times
    add(bell(hz(m)), 47.5 + i * 2.0, 1.0, pan=(-0.4, 0, 0.4)[i])
    add(bell(hz(m - 12)), 47.5 + i * 2.0, 0.6)
shimmer(57.4, base=86, n=9, step=0.06)     # the fruit was his
add(thump(1.2, 70, 30), 60.7, 0.8)
add(bell(hz(62)), 67.5, 0.7); add(bell(hz(57)), 70.5, 0.7)
shimmer(71.2, base=74, n=6, step=0.11, gain=0.5)
add(whoosh(1.8, up=False), 74.1, 0.7)      # curtain
add(bell(hz(62), 5), 75.6, 0.8); add(bell(hz(74), 5), 75.6, 0.5)

# --- reverb, master ---
ir_t = np.arange(int(2.6 * SR)) / SR
ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 2.6)[:, None]
ir = sosfilt(butter(1, 4000, 'low', fs=SR, output='sos'), ir, axis=0)
wet = np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
out = mix * 0.75 + wet * 0.035
fade = np.ones(N); fi, fo = int(0.8 * SR), int(2.5 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= fade[:, None]
out = np.tanh(out / np.max(np.abs(out)) * 1.6) / np.tanh(1.6) * 0.89

import wave
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')

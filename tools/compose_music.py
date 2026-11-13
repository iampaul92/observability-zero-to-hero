"""Original background music for the channel, rendered with real instrument samples.
Composes MIDI in Indian raga scales, then renders it with FluidSynth + FluidR3_GM soundfont.

Usage: python3 compose.py <mood> <seconds> <out.wav>
moods: gentle (Krishna, bansuri + sitar), playful (Birbal, sitar + pizzicato + tabla),
       dramatic (Ravana/Kansa/Tripura, strings + taiko + shehnai), devotional (sitar aalap + drone)
"""
import sys, subprocess, random, os
from midiutil import MIDIFile

SF2 = os.environ.get("SF2", "/home/claude/sf/FluidR3_GM.sf2")
SA = 62  # D

# GM programs (0-indexed)
SITAR, SHANAI, FLUTE, PANFLUTE, SHAKU, STRINGS, SLOWSTR, CHOIR, PAD, PIZZ, TIMP, TAIKO, HARP = 104, 111, 73, 75, 77, 48, 49, 52, 89, 45, 47, 116, 46

RAGAS = {
    "bhupali": [0, 2, 4, 7, 9],          # S R G P D  (bright, devotional)
    "yaman":   [0, 2, 4, 6, 7, 9, 11],   # S R G M# P D N (romantic, Krishna)
    "khamaj":  [0, 2, 4, 5, 7, 9, 10],   # S R G M P D n (playful)
    "bhairavi":[0, 1, 3, 5, 7, 8, 10],   # S r g M P d n (dramatic, serious)
}

def note(raga, deg):
    sc = RAGAS[raga]; o, i = divmod(deg, len(sc)); return SA + 12*o + sc[i]

def phrase_bank(raga):
    n = len(RAGAS[raga])
    # scale-degree phrases (deg, beats); composed shapes that resolve to Sa / Pa
    P = [
        [(0, 1), (1, .5), (2, .5), (3 if n > 5 else 2, 1), (2, 1)],
        [(4 if n == 5 else 4, 1.5), (3, .5), (2, 1), (1, .5), (0, 1.5)],
        [(2, .5), (3, .5), (4, 1), (5 if n > 5 else 4, 1), (4, .5), (3, .5), (2, 1)],
        [(n, 2), (n-1, 1), (n-2, 1), (0 + n - 3, 1), (n-2, 1)],
        [(1, .5), (2, .5), (1, .5), (0, .5), (-1, 1), (0, 2)],
        [(3, 1), (2, .5), (3, .5), (4, 2), (2, 1)],
    ]
    return P

def compose(mood, seconds, path_mid, seed=7):
    rnd = random.Random(seed)
    cfg = dict(
        gentle=dict(raga="yaman", bpm=76, lead=SHAKU, lead_vol=78, drone=STRINGS, pluck=SITAR, perc="soft", hits=False),
        playful=dict(raga="khamaj", bpm=112, lead=SITAR, lead_vol=86, drone=PAD, pluck=PIZZ, perc="tabla", hits=False),
        dramatic=dict(raga="bhairavi", bpm=84, lead=SHANAI, lead_vol=70, drone=SLOWSTR, pluck=HARP, perc="taiko", hits=True),
        devotional=dict(raga="bhupali", bpm=66, lead=SITAR, lead_vol=84, drone=CHOIR, pluck=SITAR, perc=None, hits=False),
    )[mood]
    bpm = cfg["bpm"]; beats = seconds * bpm / 60.0
    m = MIDIFile(6, deinterleave=False); m.addTempo(0, 0, bpm)
    chans = dict(lead=0, drone=1, pluck=2, bass=3, hits=4)
    m.addProgramChange(0, chans["lead"], 0, cfg["lead"])
    m.addProgramChange(1, chans["drone"], 0, cfg["drone"])
    m.addProgramChange(2, chans["pluck"], 0, cfg["pluck"])
    m.addProgramChange(3, chans["bass"], 0, 32)   # acoustic bass
    m.addProgramChange(4, chans["hits"], 0, TIMP)
    for c, v in [(0, 92), (1, 70), (2, 80), (3, 70), (4, 90)]:
        m.addControllerEvent(c, c, 0, 91, 70)   # reverb
        m.addControllerEvent(c, c, 0, 7, v)     # channel volume
    raga = cfg["raga"]
    # drone: Sa + Pa held, re-struck every 8 beats, with a soft swell
    t = 0
    while t < beats:
        for p in (SA-12, SA-5, SA):
            m.addNote(1, chans["drone"], p, t, 8.2, 52)
        t += 8
    # tanpura-like pluck pattern: Pa Sa' Sa' Sa (every 2 beats per note) on sitar/harp/pizz
    t = 0; pat = [SA-5, SA, SA, SA-12]
    step = 1.0 if mood != "playful" else 0.5
    i = 0
    while t < beats:
        m.addNote(2, chans["pluck"], pat[i % 4], t, step*1.6, 46 if mood != "playful" else 58)
        t += step; i += 1
    # bass on Sa/Pa every bar
    t = 0
    while t < beats:
        m.addNote(3, chans["bass"], SA-24, t, 1.8, 60); m.addNote(3, chans["bass"], SA-17, t+2, 1.8, 54); t += 4
    # lead melody: phrases arranged A A B A with rests; starts after 2 bars
    bank = phrase_bank(raga); order = [0, 1, 0, 2, 3, 1, 4, 5]
    t = 8 if mood != "playful" else 4; k = 0
    while t < beats - 4:
        ph = bank[order[k % len(order)]]
        octv = 7 if (k // 4) % 2 == 0 else 7 + (2 if mood == "playful" else 0)
        for deg, dur in ph:
            if t >= beats - 2: break
            vel = cfg["lead_vol"] + rnd.randint(-6, 6)
            m.addNote(0, chans["lead"], note(raga, deg + (0 if mood == "devotional" else 0)) + (12 if mood in ("gentle", "playful") else 0), t, dur*0.95, vel)
            if mood == "gentle" and rnd.random() < 0.25:   # small grace note (meend feel)
                m.addNote(0, chans["lead"], note(raga, deg+1) + 12, max(0, t-0.12), 0.12, vel-20)
            t += dur
        t += 2 if mood != "playful" else 1     # breathe between phrases
        k += 1
    # percussion (GM drums on channel 9)
    t = 0
    if cfg["perc"] == "tabla":
        # keherwa-ish 8-beat theka on bongos/congas
        theka = [(61, 0, 90), (60, .5, 70), (63, 1, 80), (60, 1.5, 60), (61, 2, 90), (64, 2.5, 70), (63, 3, 80), (60, 3.5, 60)]
        while t < beats:
            for p, off, v in theka: m.addNote(5, 9, p, t+off, 0.25, v)
            t += 4
    elif cfg["perc"] == "soft":
        while t < beats:
            m.addNote(5, 9, 81, t, 0.5, 40)            # open triangle (temple-bell shimmer)
            m.addNote(5, 9, 64, t+2, 0.5, 45)          # low conga
            t += 8
    elif cfg["perc"] == "taiko":
        while t < beats:
            m.addNote(5, 9, 41, t, 0.5, 95); m.addNote(5, 9, 41, t+1.5, 0.5, 70); m.addNote(5, 9, 43, t+2, 0.5, 85)
            t += 4
    if cfg["hits"]:
        t = 0
        while t < beats:
            m.addNote(4, chans["hits"], SA-24, t, 2, 100); t += 16
    with open(path_mid, "wb") as fh: m.writeFile(fh)

def render(mood, seconds, out_wav, seed=7):
    mid = out_wav.replace(".wav", ".mid")
    compose(mood, seconds + 3, mid, seed)
    subprocess.run(["fluidsynth", "-ni", "-g", "0.9", "-R", "1", "-C", "1", "-F", out_wav, "-r", "44100", SF2, mid],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    render(sys.argv[1], float(sys.argv[2]), sys.argv[3])

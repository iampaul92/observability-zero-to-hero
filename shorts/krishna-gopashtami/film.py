"""The day Krishna became a cowherd (Gopashtami) — flat illustrated Short (George narration).
Usage: python3 film.py preview | python3 film.py <scene_index ...>"""
import json, math, random, subprocess, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import soundfile as sf
from art import *   # W, H, S, C, hexa, canvas, down, P, B, palace_bg, vignette, emperor, coin, person, paste_center, paste_top

FPS, GAP, LEAD, TAIL = 30, 0.35, 0.25, 1.2
lines = json.load(open("lines.json"))
durs = {l["id"]: sf.info(f"voice/{l['id']}.wav").duration for l in lines}
# group consecutive lines into scenes
SCENES = []
for l in lines:
    if SCENES and SCENES[-1]["scene"] == l["scene"]: SCENES[-1]["lines"].append(l)
    else: SCENES.append(dict(scene=l["scene"], lines=[l]))
t0 = 0.0
for k, sc in enumerate(SCENES):
    t = LEAD if k == 0 else 0.0; sc["caps"] = []
    for l in sc["lines"]:
        sc["caps"].append((t, t + durs[l["id"]], l["text"])); t += durs[l["id"]] + GAP
    sc["dur"] = t + (TAIL if k == len(SCENES)-1 else 0); sc["start"] = t0; t0 += sc["dur"]
TOTAL = t0

FONT = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
def ease(x): x = max(0, min(1, x)); return x*x*(3-2*x)
def ease_out(x): x = max(0, min(1, x)); return 1-(1-x)**3


from krishna_kit import krishna, balarama, elder, cow, meadow

K = krishna(0.72); K_FLUTE = krishna(0.72, flute=True); K_UP = krishna(0.72, arms_up=True)
K_BIG_FLUTE = krishna(1.15, flute=True, eyes_closed=True)
BAL = balarama(0.8); NANDA = elder(0.85); PRIEST = elder(0.85, robe="#f39c12", priest=True, beard=False)
MEADOW = meadow(); SUNSET = meadow(sunset=0.85)
GROUND = 1560

def stamp(f, text, k, col=(200, 30, 40), y=640):
    if k <= 0: return
    s = 1 + 1.2*(1-ease_out(k))
    lay = Image.new("RGBA", (960, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    fn = ImageFont.truetype(FONT, 116)
    d.rounded_rectangle([20, 20, 940, 240], radius=30, outline=col + (255,), width=14)
    w = d.textlength(text, font=fn); d.text((480-w/2, 52), text, font=fn, fill=col + (255,))
    lay = lay.rotate(-8, resample=Image.BICUBIC, expand=True)
    lay = lay.resize((int(lay.width*s), int(lay.height*s)), Image.LANCZOS)
    a = lay.getchannel("A").point(lambda p: int(p*min(1, k*2))); lay.putalpha(a)
    paste_center(f, lay, 540, y)

def bubble(f, text, x, y, k):
    if k <= 0: return
    d = ImageDraw.Draw(f); fn = ImageFont.truetype(FONT, 56); w = d.textlength(text, font=fn)
    s = ease_out(k); bw, bh = (w + 70)*s, 120*s
    d.rounded_rectangle([x-bw/2, y-bh/2, x+bw/2, y+bh/2], radius=40, fill=(255, 255, 255), outline=(40, 30, 30), width=5)
    d.polygon([(x-30, y+bh/2-4), (x-60, y+bh/2+50*s), (x+10, y+bh/2-4)], fill=(255, 255, 255))
    if k > 0.6: d.text((x-w/2, y-36), text, font=fn, fill=(200, 40, 40))

def notes(f, t, x, y, n=5):
    d = ImageDraw.Draw(f); fn = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 70)
    for i in range(n):
        k = ((t*0.6 + i/n) % 1)
        nx = x + 260*k*(1 if i % 2 else 0.6) + 30*math.sin(k*9 + i); ny = y - 420*k
        d.text((nx, ny), "♪" if i % 2 else "♫", font=fn, fill=(250, 250, 255, int(255*(1-k))), stroke_width=4, stroke_fill=(60, 60, 120))

def herd(f, t, rows=5, walk=False, base_y=1000):
    rnd = random.Random(11)
    for r in range(rows):
        sc = 0.32 + r*0.13; y = base_y + r*95
        n = 7 - r
        for i in range(n):
            x = (i + 0.5) * W/n + rnd.uniform(-40, 40) + (t*40*(1+r*0.3) if walk else 0)
            x = (x % (W+300)) - 150
            c = cow(sc, phase=(t*8 + i) if walk else 0, facing=1 if (i + r) % 2 else -1)
            paste_top(f, c, x, y - c.height)

def sc_hook(t, d):
    f = MEADOW.copy(); herd(f, t, rows=5, walk=False, base_y=980)
    paste_top(f, K_FLUTE, 540, GROUND - K_FLUTE.height + 4*math.sin(t*3))
    stamp(f, "9 LAKH COWS", (t-0.9)/0.5, (40, 120, 60), y=640)
    return f

def sc_calves(t, d):
    f = MEADOW.copy()
    for i, x in enumerate((180, 400)):
        c = cow(0.95, phase=math.sin(t*3+i)*0.3, calf=True, facing=1)
        paste_top(f, c, x, GROUND - c.height + 6*abs(math.sin(t*4+i)))
    paste_top(f, K, 330, GROUND - K.height)
    shake = 8*math.sin(t*10) if t > SC["caps"][0][0] + 3.0 else 0
    nd = NANDA.rotate(shake*0.6, resample=Image.BICUBIC, expand=False)
    paste_top(f, nd, 800, GROUND - nd.height)
    big = cow(0.75, facing=-1); paste_top(f, big, 980, 1180 - big.height)
    return f

def sc_beg(t, d):
    f = MEADOW.copy()
    j = abs(math.sin(t*7))*30
    paste_top(f, K_UP, 430, GROUND - K_UP.height - j)
    paste_top(f, NANDA, 790, GROUND - NANDA.height)
    bubble(f, "PLEASE, BABA!", 470, 760, (t-SC["caps"][0][0]-1.8)/0.4)
    return f

def moon_strip(f, k, hi):
    d = ImageDraw.Draw(f); y = 640; r = 40
    for i in range(8):
        x = 120 + i*120
        a = min(1, max(0, (k*10 - i)))
        if a <= 0: continue
        col = (255, 245, 200)
        d.ellipse([x-r, y-r, x+r, y+r], fill=(40, 40, 70))
        frac = (i+1)/15
        d.pieslice([x-r, y-r, x+r, y+r], -90, 90, fill=col)
        cover = r*(1-2*frac*2) if frac < 0.5 else 0
        d.ellipse([x-abs(cover), y-r, x+abs(cover), y+r], fill=(40, 40, 70) if frac < 0.25 else col)
        if i == 7 and hi > 0:
            d.ellipse([x-r-14, y-r-14, x+r+14, y+r+14], outline=(255, 210, 60), width=int(8*hi))
    if hi > 0.5:
        fn = ImageFont.truetype(FONT, 50); d.text((790, 700), "8th", font=fn, fill=(255, 220, 80), stroke_width=6, stroke_fill=(40, 20, 10))

def sc_priest(t, d):
    f = MEADOW.copy()
    paste_top(f, PRIEST, 560, GROUND - PRIEST.height)
    paste_top(f, NANDA, 200, GROUND - NANDA.height)
    paste_top(f, K, 900, GROUND - K.height + 2*math.sin(t*4))
    moon_strip(f, t/3.0, ease((t - SC["caps"][0][1] + 3.0)/0.8))
    return f

def sc_lead(t, d):
    f = MEADOW.copy()
    herd(f, t, rows=3, walk=True, base_y=1240)
    bob = abs(math.sin(t*6))*14
    paste_top(f, BAL, 720, GROUND - BAL.height - bob)
    paste_top(f, K_FLUTE, 380, GROUND - K_FLUTE.height - abs(math.sin(t*6+1))*14)
    return f

def sc_flute(t, d):
    f = MEADOW.copy()
    for i, (x, y, fc) in enumerate([(120, 1180, 1), (950, 1200, -1), (200, 1500, 1), (900, 1520, -1)]):
        c = cow(0.85, facing=fc, head_turn=min(1, t/1.2))
        paste_top(f, c, x, y - c.height)
    paste_top(f, K_BIG_FLUTE, 540, 1720 - K_BIG_FLUTE.height + 4*math.sin(t*2))
    notes(f, t, 700, 700)
    return f

def sc_lesson(t, d):
    f = SUNSET.copy()
    c = cow(1.0, calf=True, facing=-1); paste_top(f, c, 760, GROUND - c.height)
    paste_top(f, K, 400, GROUND - K.height)
    k = ease_out((t-0.8)/0.6)
    if k > 0:
        dr = ImageDraw.Draw(f); fn = ImageFont.truetype(FONT, 96); txt = "GOPASHTAMI"; w = dr.textlength(txt, font=fn)
        dr.text((540-w/2, 640 + (1-k)*40), txt, font=fn, fill=(255, 230, 120, int(255*k)), stroke_width=10, stroke_fill=(110, 40, 20, int(255*k)))
    return f

def sc_outro(t, d):
    f = MEADOW.copy()
    paste_top(f, K_UP if int(t*2) % 2 else K, 540, GROUND - K.height - 10*abs(math.sin(t*5)))
    dr = ImageDraw.Draw(f); k = ease_out((t-0.2)/0.5)
    if k > 0:
        y = 1600 + (1-k)*40
        dr.rounded_rectangle([170, y, 910, y+120], radius=60, fill=(196, 40, 45, int(240*k)))
        fn = ImageFont.truetype(FONT, 58); txt = "FOLLOW FOR MORE"; w = dr.textlength(txt, font=fn)
        dr.text((540-w/2, y+24), txt, font=fn, fill=(255, 255, 255, int(255*k)))
    return f

FN = dict(hook=sc_hook, calves=sc_calves, beg=sc_beg, priest=sc_priest, lead=sc_lead, flute=sc_flute, lesson=sc_lesson, outro=sc_outro)

# ---------------- captions ----------------
KEY = {"nine", "lakh", "cows.", "krishna", "calves.", "baba,", "herd", "eighth", "kartik.", "balarama", "vrindavan", "flute,", "cow", "gopashtami.", "small", "bigger"}
def chunks(text):
    words = text.split(); out, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or w[-1] in ".,?!": out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def caption(f, words, pop):
    d = ImageDraw.Draw(f); line = " ".join(words).upper(); size = 84
    fnt = ImageFont.truetype(FONT, size); w = d.textlength(line, font=fnt)
    while w > 960: size -= 4; fnt = ImageFont.truetype(FONT, size); w = d.textlength(line, font=fnt)
    s = 1 + 0.12*(1-ease_out(pop)); fnt = ImageFont.truetype(FONT, int(size*s)); w = d.textlength(line, font=fnt)
    x = 540 - w/2; y = 300 - fnt.size*0.6
    for wd in words:
        tok = wd.upper() + " "; col = (255, 217, 60) if wd.lower() in KEY else (255, 255, 255)
        d.text((x, y), tok, font=fnt, fill=col, stroke_width=10, stroke_fill=(25, 10, 30)); x += d.textlength(tok, font=fnt)
def schedule(sc):
    out = []
    for (a, b, text) in sc["caps"]:
        cs = chunks(text); tot = sum(len(" ".join(c)) for c in cs); t = a
        for c in cs:
            L = len(" ".join(c))/tot*(b-a); out.append((t, t+L, c)); t += L
    return out

SC = None
def render(idx, times=None):
    global SC
    SC = SCENES[idx]; fn = FN[SC["scene"]]; d = SC["dur"]; sch = schedule(SC)
    def frame(k):
        t = k/FPS; f = fn(t, d)
        z = 1.0 + 0.04*(t/d) + 0.06*(1-ease_out(t/0.35))
        big = f.resize((int(W*z), int(H*z)), Image.BILINEAR); ox, oy = (big.width-W)//2, (big.height-H)//2
        f = big.crop((ox, oy, ox+W, oy+H))
        cur = None
        for (a, b, c) in sch:
            if a <= t < b + 0.25: cur = (a, c)
        if cur: caption(f, cur[1], (t-cur[0])/0.18)
        return f.convert("RGB")
    if times is not None: return [frame(int(tt*FPS)) for tt in times]
    n = int(round(d*FPS)); tmp = f"scene_{idx}.tmp.mp4"
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
    for k in range(n): p.stdin.write(frame(k).tobytes())
    p.stdin.close()
    if p.wait() == 0: os.replace(tmp, f"scene_{idx}.mp4")
    print("scene", idx, SC["scene"], n)

if __name__ == "__main__":
    if sys.argv[1] == "preview":
        picks = [(0, 2.5), (1, 5.0), (2, 4.0), (3, 6.5), (4, 3.0), (5, 2.0), (6, 3.0), (7, 1.0)]
        ims = [render(i, [t])[0].resize((270, 480)) for i, t in picks]
        sheet = Image.new("RGB", (270*4, 480*2))
        for k, im in enumerate(ims): sheet.paste(im, ((k % 4)*270, (k//4)*480))
        sheet.save("preview.jpg", quality=88)
        print([(s["scene"], round(s["dur"], 1)) for s in SCENES], round(TOTAL, 1))
    else:
        for i in map(int, sys.argv[1:]): render(i)

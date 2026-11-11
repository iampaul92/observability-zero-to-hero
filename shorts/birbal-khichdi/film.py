"""Birbal's Khichdi — flat illustrated Short (George narration).
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
# split the cooking scene: arrival (first line) vs. the pot reveal
cook = next(s for s in SCENES if s["scene"] == "cook")
i = SCENES.index(cook)
SCENES[i:i+1] = [dict(scene="cook_arrive", lines=cook["lines"][:1]), dict(scene="cook_pot", lines=cook["lines"][1:])]
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

# ---------------- characters ----------------
def birbal_sprite(wink=False):
    w, h = 520, 760; im, d = canvas(w, h); cx = 260
    d.polygon(P((cx-75, 330), (cx+75, 330), (cx+190, 760), (cx-190, 760)), fill=hexa("#f3e6c8"))
    d.polygon(P((cx-75, 330), (cx-20, 330), (cx+30, 760), (cx-40, 760)), fill=hexa("#e2d0a8"))
    d.polygon(P((cx-150, 560), (cx+150, 560), (cx+160, 598), (cx-160, 598)), fill=hexa("#1f6b4f"))
    d.rectangle(B(cx-28, 270, cx+28, 335), fill=hexa(C["skin2"]))
    d.ellipse(B(cx-78, 150, cx+78, 320), fill=hexa(C["skin"]))
    d.ellipse(B(cx-92, 215, cx-66, 262), fill=hexa(C["skin2"])); d.ellipse(B(cx+66, 215, cx+92, 262), fill=hexa(C["skin2"]))
    for sx in (-1, 1):
        ex = cx + sx*32
        if wink and sx == 1:
            d.arc(B(ex-15, 222, ex+15, 244), 200, 340, fill=hexa(C["ink"]), width=5*S)
        else:
            d.ellipse(B(ex-14, 220, ex+14, 240), fill=hexa(C["white"])); d.ellipse(B(ex-7, 222, ex+7, 238), fill=hexa(C["ink"]))
        d.line(P((ex-18, 204), (ex+18, 200 if sx > 0 else 208)), fill=hexa(C["ink"]), width=6*S)
    d.line(P((cx, 232), (cx-6, 266), (cx+6, 270)), fill=hexa(C["skin2"]), width=4*S)
    # curly moustache + big grin
    for sx in (-1, 1):
        d.arc(B(cx+sx*8-30, 270, cx+sx*8+30, 300), 200 if sx < 0 else -20, 340 if sx < 0 else 160, fill=hexa(C["ink"]), width=8*S)
    d.chord(B(cx-30, 288, cx+30, 316), 0, 180, fill=hexa("#7a2a22"))
    # tall orange turban
    d.ellipse(B(cx-88, 100, cx+88, 215), fill=hexa("#e07a1f"))
    d.polygon(P((cx-88, 160), (cx+88, 160), (cx+80, 205), (cx-80, 205)), fill=hexa("#e07a1f"))
    for k in range(3): d.arc(B(cx-86, 110+k*26, cx+86, 190+k*26), 200, 340, fill=hexa("#b85a10"), width=5*S)
    d.polygon(P((cx-20, 110), (cx-4, 40), (cx+14, 110)), fill=hexa("#e07a1f"))
    d.ellipse(B(cx-14, 120, cx+14, 148), fill=hexa(C["gold"]))
    return down(im)

def washer_sprite(sad=False, happy=False):
    w, h = 380, 640; im, d = canvas(w, h); cx = 190
    d.polygon(P((cx-60, 260), (cx+60, 260), (cx+120, 640), (cx-120, 640)), fill=hexa("#d7d0c2"))
    d.rectangle(B(cx-60, 430, cx+60, 470), fill=hexa("#5a7a9a"))
    d.ellipse(B(cx-60, 120, cx+60, 260), fill=hexa(C["skin2"]))
    d.chord(B(cx-62, 112, cx+62, 210), 180, 360, fill=hexa("#2a1a12"))
    for sx in (-1, 1):
        ex = cx + sx*24; d.ellipse(B(ex-6, 180, ex+6, 194), fill=hexa(C["ink"]))
    if sad: d.arc(B(cx-22, 222, cx+22, 250), 200, 340, fill=hexa(C["ink"]), width=5*S)
    else: d.arc(B(cx-24, 205, cx+24, 240), 20, 160, fill=hexa(C["ink"]), width=5*S)
    if happy:
        for sx in (-1, 1): d.line(P((cx+sx*60, 290), (cx+sx*130, 170)), fill=hexa(C["skin2"]), width=26*S)
    return down(im)

AKBAR = emperor(1.0); AKBAR_S = emperor(0.75)
BIRBAL = birbal_sprite(); BIRBAL_W = birbal_sprite(wink=True); BIRBAL_S = birbal_sprite().resize((400, 585), Image.LANCZOS)
WASH, WASH_SAD, WASH_HAPPY = washer_sprite(), washer_sprite(sad=True), washer_sprite(happy=True)
COIN = coin(26)
BG = vignette(palace_bg())

def garden_bg():
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):
        k = y/H; d.line([(0, y), (W, y)], fill=(int(140+100*k), int(200+30*k), int(235-40*k)))
    d.rectangle([0, 1480, W, H], fill=(86, 140, 70))
    for x in range(-50, W+100, 160): d.ellipse([x-120, 1400, x+120, 1560], fill=(70, 125, 60))
    return vignette(im.convert("RGBA"), 120)
GARDEN = garden_bg()

def night_bg(dawn):
    top = tuple(int(a+(b-a)*dawn) for a, b in zip((10, 14, 40), (250, 150, 110)))
    bot = tuple(int(a+(b-a)*dawn) for a, b in zip((28, 40, 80), (255, 210, 150)))
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    for y in range(1150):
        k = y/1150; d.line([(0, y), (W, y)], fill=tuple(int(a+(b-a)*k) for a, b in zip(top, bot)))
    rnd = random.Random(4)
    for _ in range(80):
        x, y, r = rnd.uniform(0, W), rnd.uniform(0, 900), rnd.uniform(1, 3)
        a = int(255*(1-dawn)); d.ellipse([x-r, y-r, x+r, y+r], fill=(255, 250, 230) if a > 128 else top)
    # distant palace on the far shore, with ONE lit window
    d.rectangle([640, 880, 1000, 1150], fill=(20, 18, 40)); d.ellipse([740, 760, 900, 920], fill=(20, 18, 40))
    d.polygon([(815, 700), (820, 640), (825, 700)], fill=(20, 18, 40))
    for x in (660, 975): d.rectangle([x-12, 820, x+12, 1150], fill=(20, 18, 40)); d.ellipse([x-22, 790, x+22, 830], fill=(20, 18, 40))
    # lake
    for y in range(1150, H):
        k = (y-1150)/(H-1150); d.line([(0, y), (W, y)], fill=(int(30+60*dawn-10*k), int(60+60*dawn-20*k), int(110+40*dawn-30*k)))
    return im.convert("RGBA")

def stamp(f, text, k, col=(200, 30, 40), y=640):
    if k <= 0: return
    s = 1 + 1.2*(1-ease_out(k))
    lay = Image.new("RGBA", (900, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    fn = ImageFont.truetype(FONT, 120)
    d.rounded_rectangle([20, 20, 880, 240], radius=30, outline=col + (255,), width=14)
    w = d.textlength(text, font=fn); d.text((450-w/2, 50), text, font=fn, fill=col + (255,))
    lay = lay.rotate(-10, resample=Image.BICUBIC, expand=True)
    lay = lay.resize((int(lay.width*s), int(lay.height*s)), Image.LANCZOS)
    a = lay.getchannel("A").point(lambda p: int(p*min(1, k*2))); lay.putalpha(a)
    paste_center(f, lay, 540, y)

rng = random.Random(9)
RAIN = [(rng.uniform(60, 1020), rng.uniform(-2, 0), rng.uniform(500, 800), rng.choice([0, 1])) for _ in range(60)]
def coin_rain(f, t, floor):
    for (x, t0, v, small) in RAIN:
        tt = t + t0
        if tt < 0: continue
        y = min(floor, -60 + v*tt)
        sq = abs(math.cos(tt*4 + x))
        c = COIN.resize((max(3, int(COIN.width*max(0.2, sq))), COIN.height))
        paste_center(f, c, x, y)

def flame(d, x, y, t, scale=1.0):
    for i, (col, sc) in enumerate([((255, 120, 30), 1.0), ((255, 200, 60), 0.6)]):
        fl = 1 + 0.15*math.sin(t*18 + i*2)
        hgt = 70*scale*sc*fl; wid = 34*scale*sc
        d.polygon([(x-wid, y), (x-wid*0.5, y-hgt*0.5), (x, y-hgt), (x+wid*0.5, y-hgt*0.55), (x+wid, y)], fill=col)
    for k in (-1, 1): d.line([(x-50*scale, y+6), (x+50*scale, y-4*k)], fill=(110, 70, 40), width=int(12*scale))

# ---------------- scenes ----------------
def sc_bet(t, d):
    f = BG.copy()
    paste_center(f, AKBAR, 540, 1050 + 6*math.sin(t*1.8))
    # pile of gold growing
    k = ease((t-1.5)/3)
    for i in range(int(18*k)):
        paste_center(f, COIN, 230 + (i % 6)*120 + (i//6)*20, 1700 - (i//6)*30)
    if t > 4.5: stamp(f, "1000 GOLD", (t-4.5)/0.5, (230, 170, 30))
    return f

def sc_lake(t, d):
    dawn = ease((t - (d-2.8))/2.4)
    f = night_bg(dawn); dr = ImageDraw.Draw(f)
    # lamp in the far window, pulsing glow
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    r = 28 + 6*math.sin(t*5); gd.ellipse([820-r, 960-r, 820+r, 960+r], fill=(255, 210, 120, int(200*(1-dawn*0.7))))
    f.alpha_composite(g.filter(ImageFilter.GaussianBlur(12))); dr.rectangle([810, 945, 830, 975], fill=(255, 230, 150))
    # shivering man up to his chest in water
    jit = 6*math.sin(t*45) if dawn < 0.9 else 0
    x, y = 400 + jit, 1280
    dr.ellipse([x-85, y-40, x+85, y+120], fill=(150, 105, 70))          # shoulders
    dr.ellipse([x-60, y-190, x+60, y-50], fill=(170, 120, 80))          # head
    dr.chord([x-62, y-198, x+62, y-110], 180, 360, fill=(40, 26, 18))
    for sx in (-1, 1): dr.ellipse([x+sx*24-7, y-140, x+sx*24+7, y-126], fill=(20, 12, 8))
    # chattering teeth
    dr.rectangle([x-22, y-100, x+22, y-86 + (4 if int(t*20) % 2 else 0)], fill=(250, 250, 250), outline=(60, 30, 20), width=3)
    # breath puffs
    for i in range(3):
        k = ((t*0.8 + i/3) % 1)
        rr = 14 + 30*k; dr.ellipse([x+70+80*k-rr, y-130-40*k-rr, x+70+80*k+rr, y-130-40*k+rr], fill=(230, 235, 255, int(160*(1-k))))
    # water line + ripples on top of him
    dr.rectangle([0, 1300, W, H], fill=(int(30+60*dawn), int(60+60*dawn), int(110+40*dawn)))
    for i in range(4):
        rr = 60 + ((t*60 + i*45) % 180)
        dr.ellipse([x-rr, 1300-rr*0.12, x+rr, 1300+rr*0.12], outline=(180, 210, 240, int(200*(1-(rr-60)/180))), width=4)
    # "BRRR" wobble
    fn = ImageFont.truetype(FONT, 72); wob = 4*math.sin(t*30)
    dr.text((560 + wob, 1050), "BRRR...", font=fn, fill=(220, 235, 255), stroke_width=6, stroke_fill=(20, 30, 60))
    return f

def sc_court(t, d):
    f = BG.copy()
    l3 = SC["caps"][0][1]
    point = t > l3
    paste_center(f, AKBAR_S, 330, 1150 + (8*math.sin(t*10) if point else 0))
    paste_top(f, WASH_SAD if point else WASH, 800, 1500 - WASH.height)
    if not point:   # he points at the far lamp: little glow in the right arch
        g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        r = 30 + 6*math.sin(t*5); gd.ellipse([920-r, 900-r, 920+r, 900+r], fill=(255, 210, 120, 200))
        f.alpha_composite(g.filter(ImageFilter.GaussianBlur(10)))
    else:
        stamp(f, "NO REWARD!", (t-l3-1.2)/0.4)
    return f

def tree(dr, x, top):
    dr.rectangle([x-40, top, x+40, 1500], fill=(110, 72, 45))
    dr.polygon([(x+30, top+120), (x+360, top+40), (x+360, top+70), (x+30, top+170)], fill=(110, 72, 45))
    for cx, cy, r in [(x, top-60, 240), (x+200, top-20, 170), (x-180, top+10, 160)]:
        dr.ellipse([cx-r, cy-r*0.7, cx+r, cy+r*0.7], fill=(70, 130, 70))

def pot(dr, x, y):
    dr.line([(x, y-260), (x, y-60)], fill=(220, 200, 160), width=6)
    dr.ellipse([x-90, y-70, x+90, y+70], fill=(60, 50, 50)); dr.rectangle([x-70, y-80, x+70, y-55], fill=(80, 70, 70))
    dr.ellipse([x-70, y-92, x+70, y-68], fill=(200, 170, 90))

def sc_cook_arrive(t, d):
    f = GARDEN.copy(); dr = ImageDraw.Draw(f)
    tree(dr, 330, 380); pot(dr, 580, 700)
    flame(dr, 580, 1470, t, 1.0)
    paste_top(f, BIRBAL_S, 230, 1530 - BIRBAL_S.height)
    k = ease_out(t/2.2); paste_top(f, AKBAR_S, 1250 - 350*k, 1560 - AKBAR_S.height)
    return f

def sc_cook_pot(t, d):
    f = GARDEN.copy(); dr = ImageDraw.Draw(f)
    tree(dr, 330, 380); pot(dr, 580, 700)
    flame(dr, 580, 1470, t, 1.0)
    # dotted distance arrow between pot and fire
    k = ease((t-0.6)/1.5)
    for y in range(780, int(780 + (1400-780)*k), 34): dr.ellipse([640-5, y-5, 640+5, y+5], fill=(255, 255, 255))
    if k >= 1:
        fn = ImageFont.truetype(FONT, 110); dr.text((660, 950), "?!", font=fn, fill=(200, 40, 40), stroke_width=8, stroke_fill=(255, 255, 255))
    l7 = SC["caps"][-1][0]
    laughing = t > l7 and t < l7 + 2.4
    paste_top(f, BIRBAL_W if t > SC["caps"][-1][1] - 2.0 else BIRBAL_S, 230, 1530 - BIRBAL_S.height)
    paste_top(f, AKBAR_S, 900, 1560 - AKBAR_S.height + (10*abs(math.sin(t*12)) if laughing else 0))
    return f

def sc_pay(t, d):
    f = BG.copy()
    paste_center(f, AKBAR_S, 330, 1150 + 10*abs(math.sin(t*11)))
    paste_top(f, WASH_HAPPY, 800, 1500 - WASH.height - 30*abs(math.sin(t*6)))
    coin_rain(f, t, 1500)
    return f

def sc_outro(t, d):
    f = BG.copy()
    paste_center(f, BIRBAL_W if 0.6 < t < 1.6 else BIRBAL, 540, 1080)
    dr = ImageDraw.Draw(f); k = ease_out((t-0.2)/0.5)
    if k > 0:
        y = 1525 + (1-k)*40
        dr.rounded_rectangle([170, y, 910, y+120], radius=60, fill=(196, 40, 45, int(240*k)))
        fn = ImageFont.truetype(FONT, 58); txt = "FOLLOW FOR MORE"; w = dr.textlength(txt, font=fn)
        dr.text((540-w/2, y+24), txt, font=fn, fill=(255, 255, 255, int(255*k)))
    return f

FN = dict(bet=sc_bet, lake=sc_lake, court=sc_court, cook_arrive=sc_cook_arrive, cook_pot=sc_cook_pot, pay=sc_pay, outro=sc_outro)

# ---------------- captions ----------------
KEY = {"akbar", "birbal", "birbal!", "thousand", "gold", "lamp,", "lamp", "khichdi.", "khichdi", "warm.", "reward", "tree,", "fire", "coin.", "jahanpanah?"}
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
        picks = [(0, 6.0), (1, 3.0), (1, SCENES[1]["dur"]-0.5), (2, 9.0), (3, 3.0), (4, 4.0), (5, 2.0), (6, 1.0)]
        ims = [render(i, [t])[0].resize((270, 480)) for i, t in picks]
        sheet = Image.new("RGB", (270*4, 480*2))
        for k, im in enumerate(ims): sheet.paste(im, ((k % 4)*270, (k//4)*480))
        sheet.save("preview.jpg", quality=88)
        print([(s["scene"], round(s["dur"], 1)) for s in SCENES], round(TOTAL, 1))
    else:
        for i in map(int, sys.argv[1:]): render(i)

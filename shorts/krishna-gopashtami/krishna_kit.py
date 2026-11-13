"""Krishna-story character kit, flat illustrated style (matches art.py).
Every sprite is drawn at 2x and downscaled. Frontal figures are 520x760 at scale 1.0."""
import math, random
from PIL import Image, ImageDraw, ImageFilter
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from art import W, H, S, C, hexa, canvas, down, P, B, vignette

BLUE, BLUE2 = "#3f74c4", "#2f5a9e"
YELLOW, YELLOW2 = "#f5c033", "#d99a12"

def _scale(im, s):
    return im if s == 1.0 else im.resize((max(1, int(im.width*s)), max(1, int(im.height*s))), Image.LANCZOS)

def _face(d, cx, cy, skin, skin2, r=78, smile=True, closed=False, child=False):
    d.ellipse(B(cx-r, cy-r*1.05, cx+r, cy+r*1.05), fill=hexa(skin))
    d.ellipse(B(cx-r-14, cy-10, cx-r+12, cy+36), fill=hexa(skin2)); d.ellipse(B(cx+r-12, cy-10, cx+r+14, cy+36), fill=hexa(skin2))
    ey = cy - 4
    for sx in (-1, 1):
        ex = cx + sx*r*0.42
        if closed:
            d.arc(B(ex-16, ey-6, ex+16, ey+16), 200, 340, fill=hexa(C["ink"]), width=5*S)
        else:
            ew = 18 if child else 15
            d.ellipse(B(ex-ew, ey-12, ex+ew, ey+14), fill=hexa(C["white"]))
            d.ellipse(B(ex-9, ey-9, ex+9, ey+11), fill=hexa(C["ink"]))
            d.ellipse(B(ex-4, ey-6, ex+1, ey-1), fill=hexa(C["white"]))
        d.line(P((ex-16, ey-26), (ex+16, ey-28)), fill=hexa(C["ink"]), width=5*S)
    d.line(P((cx, ey+4), (cx-5, ey+30), (cx+5, ey+33)), fill=hexa(skin2), width=4*S)
    if smile: d.arc(B(cx-26, cy+22, cx+26, cy+56), 20, 160, fill=hexa("#7a2a22"), width=6*S)
    else: d.line(P((cx-16, cy+44), (cx+16, cy+44)), fill=hexa("#7a2a22"), width=5*S)

def krishna(scale=1.0, flute=False, arms_up=False, eyes_closed=False):
    """Child Krishna: blue skin, peacock feather, yellow dhoti, flute optional."""
    w, h = 520, 760; im, d = canvas(w, h); cx = 260
    # body
    d.polygon(P((cx-70, 360), (cx+70, 360), (cx+95, 520), (cx-95, 520)), fill=hexa(BLUE))
    d.polygon(P((cx-115, 500), (cx+115, 500), (cx+140, 700), (cx-140, 700)), fill=hexa(YELLOW))
    d.polygon(P((cx-20, 500), (cx+20, 500), (cx+30, 700), (cx-30, 700)), fill=hexa(YELLOW2))
    d.rectangle(B(cx-115, 492, cx+115, 520), fill=hexa("#c0392b"))
    for sx in (-1, 1):  # legs + anklets
        d.rectangle(B(cx+sx*55-22, 690, cx+sx*55+22, 750), fill=hexa(BLUE))
        d.rectangle(B(cx+sx*55-24, 728, cx+sx*55+24, 738), fill=hexa(C["gold"]))
    # necklace (vaijayanti mala)
    for i in range(13):
        t = i/12; x = cx-60+120*t; y = 380+60*math.sin(t*math.pi)
        d.ellipse(B(x-9, y-9, x+9, y+9), fill=hexa(["#e74c3c", "#f1c40f", "#ffffff"][i % 3]))
    # arms
    if flute:
        d.line(P((cx-62, 380), (cx-110, 420), (cx-40, 330)), fill=hexa(BLUE), width=34*S, joint="curve")
        d.line(P((cx+62, 380), (cx+120, 400), (cx+150, 335)), fill=hexa(BLUE), width=34*S, joint="curve")
        d.line(P((cx-120, 330), (cx+220, 330)), fill=hexa("#8b5a2b"), width=18*S)
        for k in range(4): d.ellipse(B(cx+20+k*40-5, 325, cx+20+k*40+5, 335), fill=hexa(C["ink"]))
        d.rectangle(B(cx+90, 334, cx+130, 362), fill=hexa("#c0392b"))
    elif arms_up:
        for sx in (-1, 1): d.line(P((cx+sx*62, 380), (cx+sx*140, 300), (cx+sx*170, 200)), fill=hexa(BLUE), width=34*S, joint="curve")
    else:
        for sx in (-1, 1): d.line(P((cx+sx*62, 380), (cx+sx*110, 450), (cx+sx*120, 520)), fill=hexa(BLUE), width=34*S, joint="curve")
    # head
    d.rectangle(B(cx-26, 320, cx+26, 370), fill=hexa(BLUE2))
    _face(d, cx, 250, BLUE, BLUE2, r=88, closed=eyes_closed, child=True)
    # hair + crown
    d.chord(B(cx-96, 150, cx+96, 290), 180, 360, fill=hexa("#1a1430"))
    for sx in (-1, 1): d.ellipse(B(cx+sx*90-24, 200, cx+sx*90+24, 300), fill=hexa("#1a1430"))
    d.rectangle(B(cx-86, 168, cx+86, 196), fill=hexa(C["gold"]))
    for k in range(-2, 3): d.ellipse(B(cx+k*34-7, 175, cx+k*34+7, 189), fill=hexa("#e74c3c"))
    # peacock feather
    fx, fy = cx+40, 110
    d.line(P((cx+20, 175), (fx, fy+30)), fill=hexa("#2e7d32"), width=5*S)
    d.ellipse(B(fx-38, fy-62, fx+38, fy+40), fill=hexa("#2e7d32"))
    d.ellipse(B(fx-26, fy-42, fx+26, fy+26), fill=hexa("#1e88e5"))
    d.ellipse(B(fx-16, fy-28, fx+16, fy+12), fill=hexa("#ffd54f"))
    d.ellipse(B(fx-9, fy-18, fx+9, fy+2), fill=hexa("#0d47a1"))
    return _scale(down(im), scale)

def balarama(scale=1.0):
    w, h = 520, 760; im, d = canvas(w, h); cx = 260; skin, skin2 = "#f0c9a0", "#d9a77a"
    d.polygon(P((cx-75, 330), (cx+75, 330), (cx+100, 500), (cx-100, 500)), fill=hexa(skin))
    d.polygon(P((cx-120, 490), (cx+120, 490), (cx+145, 720), (cx-145, 720)), fill=hexa("#1e3a8a"))
    d.rectangle(B(cx-120, 482, cx+120, 508), fill=hexa(C["gold"]))
    for sx in (-1, 1):
        d.rectangle(B(cx+sx*58-24, 710, cx+sx*58+24, 760), fill=hexa(skin))
        d.line(P((cx+sx*68, 350), (cx+sx*120, 430), (cx+sx*130, 510)), fill=hexa(skin), width=36*S, joint="curve")
    d.line(P((cx+150, 300), (cx+120, 700)), fill=hexa("#8b5a2b"), width=14*S)        # staff
    d.rectangle(B(cx-26, 290, cx+26, 345), fill=hexa(skin2))
    _face(d, cx, 220, skin, skin2, r=86)
    d.chord(B(cx-94, 120, cx+94, 260), 180, 360, fill=hexa("#2a1a12"))
    d.rectangle(B(cx-84, 138, cx+84, 164), fill=hexa(C["gold"]))
    return _scale(down(im), scale)

def elder(scale=1.0, turban="#e07a1f", robe="#f3e6c8", beard=True, priest=False):
    """Nanda (turban, white beard) or the priest (bald, tilak, saffron)."""
    w, h = 520, 760; im, d = canvas(w, h); cx = 260; skin, skin2 = C["skin"], C["skin2"]
    d.polygon(P((cx-80, 330), (cx+80, 330), (cx+180, 760), (cx-180, 760)), fill=hexa(robe))
    if priest:
        d.line(P((cx-60, 340), (cx+60, 560)), fill=hexa(C["white"]), width=6*S)    # sacred thread
        d.rounded_rectangle(B(cx-150, 430, cx+150, 520), radius=20*S, fill=hexa("#f6e7c8"), outline=hexa("#b98a4a"), width=4*S)  # scroll
        for k in range(3): d.line(P((cx-120, 455+k*20), (cx+120, 455+k*20)), fill=hexa("#9a7a5a"), width=3*S)
    else:
        d.rectangle(B(cx-150, 540, cx+150, 575), fill=hexa("#1f6b4f"))
    d.rectangle(B(cx-28, 280, cx+28, 340), fill=hexa(skin2))
    _face(d, cx, 210, skin, skin2, r=80, smile=True)
    if beard:
        d.polygon(P((cx-74, 230), (cx+74, 230), (cx+56, 330), (cx, 360), (cx-56, 330)), fill=hexa("#eeeeee"))
        d.arc(B(cx-26, 236, cx+26, 266), 20, 160, fill=hexa("#7a2a22"), width=6*S)
        for sx in (-1, 1): d.arc(B(cx+sx*12-34, 218, cx+sx*12+34, 250), 200 if sx < 0 else -20, 340 if sx < 0 else 160, fill=hexa("#dddddd"), width=9*S)
    if priest:
        d.ellipse(B(cx-6, 112, cx+6, 130), fill=hexa(C["ink"]))                       # shikha
        for k in (-1, 0, 1): d.line(P((cx-30, 150+k*10), (cx+30, 150+k*10)), fill=hexa(C["white"]), width=4*S)  # tilak
        d.ellipse(B(cx-7, 165, cx+7, 179), fill=hexa("#c0392b"))
    else:
        d.ellipse(B(cx-90, 90, cx+90, 200), fill=hexa(turban))
        d.polygon(P((cx-90, 150), (cx+90, 150), (cx+82, 196), (cx-82, 196)), fill=hexa(turban))
        for k in range(3): d.arc(B(cx-88, 100+k*24, cx+88, 176+k*24), 200, 340, fill=hexa("#b85a10"), width=5*S)
    return _scale(down(im), scale)

def cow(scale=1.0, phase=0.0, calf=False, color=None, facing=1, head_turn=0.0):
    """Side-view cow. phase drives the leg swing. facing=+1 faces right."""
    w, h = 340, 250; im, d = canvas(w, h)
    body = color or ("#c98b5a" if calf else "#f2ebe0"); dark = "#6b4a3a"
    spot = "#d9cbb8" if not calf else "#a86f45"
    for i, lx in enumerate((95, 125, 215, 245)):
        sw = 14*math.sin(phase + (0 if i in (0, 3) else math.pi))
        d.line(P((lx, 150), (lx+sw, 225)), fill=hexa(body), width=20*S)
        d.ellipse(B(lx+sw-11, 218, lx+sw+11, 236), fill=hexa(dark))
    d.ellipse(B(60, 70, 280, 175), fill=hexa(body))
    d.ellipse(B(110, 85, 170, 130), fill=hexa(spot)); d.ellipse(B(200, 110, 245, 150), fill=hexa(spot))
    if not calf: d.ellipse(B(225, 55, 270, 95), fill=hexa(body))              # hump
    d.line(P((65, 100), (40, 160)), fill=hexa(body), width=8*S); d.ellipse(B(30, 150, 50, 175), fill=hexa(dark))  # tail
    hx, hy = 290 + 10*head_turn, 95
    d.polygon(P((255, 90), (hx, hy-20), (hx+28, hy+40), (hx-6, hy+56), (250, 140)), fill=hexa(body))
    d.ellipse(B(hx-4, hy+28, hx+34, hy+62), fill=hexa("#e8b4a0"))
    d.ellipse(B(hx-2, hy-4, hx+12, hy+10), fill=hexa(C["ink"]))
    if not calf:
        d.line(P((hx-10, hy-18), (hx-30, hy-50), (hx-18, hy-60)), fill=hexa("#e8dcc0"), width=8*S, joint="curve")
        d.line(P((hx+8, hy-18), (hx+20, hy-52), (hx+34, hy-58)), fill=hexa("#e8dcc0"), width=8*S, joint="curve")
    d.ellipse(B(hx-36, hy-10, hx-8, hy+8), fill=hexa(body))  # ear
    # bell
    d.line(P((250, 140), (265, 160)), fill=hexa("#c0392b"), width=6*S); d.ellipse(B(258, 155, 278, 178), fill=hexa(C["gold"]))
    out = down(im)
    if facing < 0: out = out.transpose(Image.FLIP_LEFT_RIGHT)
    return _scale(out, scale*(0.62 if calf else 1.0))

def meadow(sky_top="#8fd3f4", sky_bot="#fbe9c8", sunset=0.0):
    """Vrindavan meadow: sky, hills, Yamuna, kadamba trees, grass. Returns RGBA 1x."""
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    st = [int(a + (b-a)*sunset) for a, b in zip(hexa(sky_top)[:3], (255, 140, 90))]
    sb = [int(a + (b-a)*sunset) for a, b in zip(hexa(sky_bot)[:3], (255, 210, 150))]
    for y in range(1000):
        k = y/1000; d.line([(0, y), (W, y)], fill=tuple(int(st[i]+(sb[i]-st[i])*k) for i in range(3)))
    if sunset > 0: d.ellipse([700, 760, 900, 960], fill=(255, 190, 90))
    for cx, r, col in [(150, 380, (150, 190, 120)), (700, 460, (130, 175, 110)), (1100, 360, (150, 190, 120))]:
        d.ellipse([cx-r, 900-r*0.35, cx+r, 900+r*0.35], fill=col)
    d.rectangle([0, 930, W, H], fill=(118, 170, 80))
    d.polygon([(0, 1010), (W, 960), (W, 1040), (0, 1090)], fill=(90, 150, 200))               # Yamuna
    for x in range(0, W, 90): d.line([(x, 1030 - x*0.05), (x+40, 1030 - x*0.05)], fill=(170, 210, 240), width=4)
    d.rectangle([0, 1080, W, H], fill=(126, 182, 86))
    rnd = random.Random(2)
    for _ in range(140):
        x, y = rnd.uniform(0, W), rnd.uniform(1100, H)
        d.line([(x, y), (x+rnd.uniform(-6, 6), y-rnd.uniform(10, 22))], fill=(96, 150, 66), width=3)
    for x, s in [(80, 1.0), (1000, 0.9)]:
        d.rectangle([x-16*s, 1080-360*s, x+16*s, 1100], fill=(110, 72, 45))
        for cx, cy, r in [(0, -380, 140), (-90, -320, 100), (90, -320, 100)]:
            d.ellipse([x+cx*s-r*s, 1080+cy*s-r*0.8*s, x+cx*s+r*s, 1080+cy*s+r*0.8*s], fill=(60, 130, 70))
        for k in range(6):
            fx, fy = x + rnd.uniform(-180, 180)*s, 1080 + rnd.uniform(-460, -280)*s
            d.ellipse([fx-9, fy-9, fx+9, fy+9], fill=(255, 200, 60))   # kadamba blossoms
    return vignette(im.convert("RGBA"), 110)

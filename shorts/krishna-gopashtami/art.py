"""Flat Mughal-style illustration helpers. Everything is drawn at 2x and downscaled for anti-aliasing."""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
S = 2  # supersample

C = dict(
    night="#1b1035", plum="#3a1d4f", maroon="#6e1f2b", teal="#0f4c5c",
    sand="#e9c98b", cream="#f6e7c8", gold="#f2b632", gold2="#c98b12", gold3="#ffd966",
    skin="#c58a5c", skin2="#a86f45", green="#1f6b4f", green2="#145039",
    red="#b3282d", white="#fbf6ec", ink="#2a1a12", blue="#2d4f8a", grey="#8d7f72",
)

def hexa(c, a=255):
    c = c.lstrip("#")
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4)) + (a,)

def canvas(w=W, h=H, bg=(0, 0, 0, 0)):
    im = Image.new("RGBA", (w*S, h*S), bg)
    return im, ImageDraw.Draw(im)

def down(im):
    return im.resize((im.width//S, im.height//S), Image.LANCZOS)

def P(*pts):  # scale points
    return [(x*S, y*S) for x, y in pts]

def B(x0, y0, x1, y1):
    return [x0*S, y0*S, x1*S, y1*S]

def vgrad(w, h, top, bot):
    g = Image.new("RGBA", (w, h))
    t, b = hexa(top), hexa(bot)
    d = ImageDraw.Draw(g)
    for y in range(h):
        k = y/(h-1)
        d.line([(0, y), (w, y)], fill=tuple(int(t[i]+(b[i]-t[i])*k) for i in range(4)))
    return g

def arch_path(cx, base_y, w, h, n=60):
    """Mughal pointed (ogee-ish) arch outline, returns points (unscaled)."""
    pts = [(cx-w/2, base_y), (cx-w/2, base_y-h*0.62)]
    r = w/2
    top = base_y-h
    for i in range(n+1):
        t = i/n
        a = math.pi*(1-t*0.5)
        x = cx + r*math.cos(a)
        y = base_y-h*0.62 - (h*0.38)*math.sin(t*math.pi/2)**0.8
        pts.append((x, y))
    pts.append((cx, top))
    for i in range(n, -1, -1):
        t = i/n
        a = math.pi*(t*0.5)
        x = cx + r*math.cos(a)
        y = base_y-h*0.62 - (h*0.38)*math.sin(t*math.pi/2)**0.8
        pts.append((x, y))
    pts.append((cx+w/2, base_y))
    return pts

def palace_bg(top="#2a1446", bot="#7a2b3a"):
    """Background: dusk sky, palace wall with arches, floor pattern."""
    im = vgrad(W*S, H*S, top, bot)
    d = ImageDraw.Draw(im)
    rnd = random.Random(3)
    for _ in range(70):
        x, y = rnd.uniform(0, W), rnd.uniform(0, 700)
        r = rnd.uniform(1, 2.6)
        d.ellipse(B(x-r, y-r, x+r, y+r), fill=hexa(C["cream"], rnd.randint(90, 200)))
    # domes on the skyline
    for cx, r, col in [(180, 120, "#4a2560"), (900, 140, "#4a2560"), (540, 210, "#56306d")]:
        d.ellipse(B(cx-r, 560-r*1.1, cx+r, 560+r*0.9), fill=hexa(col))
        d.polygon(P((cx-6, 560-r*1.1+6), (cx, 560-r*1.1-60), (cx+6, 560-r*1.1+6)), fill=hexa(C["gold2"]))
    # wall
    d.rectangle(B(0, 560, W, 1500), fill=hexa(C["sand"]))
    d.rectangle(B(0, 560, W, 600), fill=hexa("#d9b06a"))
    for i in range(12):
        x = i*95
        d.polygon(P((x, 560), (x+47, 520), (x+95, 560)), fill=hexa("#d9b06a"))
    # three arches
    for cx, aw, ah in [(160, 220, 560), (540, 380, 760), (920, 220, 560)]:
        outer = arch_path(cx, 1500, aw+56, ah+40)
        d.polygon(P(*outer), fill=hexa(C["maroon"]))
        inner = arch_path(cx, 1500, aw, ah)
        d.polygon(P(*inner), fill=hexa("#3b1430"))
    # floor
    d.rectangle(B(0, 1500, W, H), fill=hexa("#8c3b2e"))
    for row in range(8):
        y0 = 1500 + row*55
        for col in range(-1, 13):
            x0 = col*95 + (47 if row % 2 else 0)
            d.polygon(P((x0, y0+27), (x0+47, y0), (x0+95, y0+27), (x0+47, y0+55)),
                      outline=hexa("#a8503a"), width=3*S)
    d.rectangle(B(0, 1500, W, 1512), fill=hexa(C["gold2"]))
    return down(im)

def vignette(im, strength=170):
    w, h = im.size
    dark = Image.new("RGBA", im.size, (10, 4, 20, 255))
    out = im.copy()
    mask = Image.new("L", im.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([-w*0.25, -h*0.12, w*1.25, h*1.12], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(160))
    mask = Image.eval(mask, lambda p: int((255-p)*strength/255))
    out.paste(dark, (0, 0), mask)
    return out

# ---------- sprites (returned at 1x, RGBA, with anchor info) ----------

def coin(r=26):
    im, d = canvas(r*2+4, r*2+4)
    c = r+2
    d.ellipse(B(c-r, c-r, c+r, c+r), fill=hexa(C["gold2"]))
    d.ellipse(B(c-r+3, c-r+2, c+r-3, c+r-5), fill=hexa(C["gold"]))
    d.ellipse(B(c-r*0.6, c-r*0.6, c+r*0.6, c+r*0.6), outline=hexa(C["gold2"]), width=3*S)
    d.ellipse(B(c-r*0.55, c-r*0.75, c-r*0.1, c-r*0.35), fill=hexa(C["gold3"]))
    return down(im)

def sack(color, w=150, h=170, label=None):
    im, d = canvas(w+20, h+20)
    ox, oy = 10, 10
    d.polygon(P((ox+w*0.3, oy+h*0.18), (ox+w*0.7, oy+h*0.18), (ox+w*0.62, oy+h*0.05),
                (ox+w*0.75, oy), (ox+w*0.25, oy), (ox+w*0.38, oy+h*0.05)), fill=hexa(color))
    d.ellipse(B(ox, oy+h*0.18, ox+w, oy+h), fill=hexa(color))
    d.rectangle(B(ox+w*0.3, oy+h*0.15, ox+w*0.7, oy+h*0.23), fill=hexa(C["gold2"]))
    d.ellipse(B(ox+w*0.12, oy+h*0.3, ox+w*0.35, oy+h*0.55), fill=(255, 255, 255, 50))
    if label:
        f = ImageFont.truetype("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", 26*S)
        tw = d.textlength(label, font=f)
        d.text(((ox+w/2)*S - tw/2, (oy+h*0.58)*S), label, font=f, fill=hexa(C["white"]))
    return down(im)

def emperor(scale=1.0, seated=False):
    """Stylised frontal Mughal emperor with halo. Canvas 520x760."""
    w, h = 520, 760
    im, d = canvas(w, h)
    cx = 260
    # halo
    d.ellipse(B(cx-150, 20, cx+150, 320), fill=hexa(C["gold"]))
    d.ellipse(B(cx-132, 38, cx+132, 302), fill=hexa(C["gold3"]))
    for i in range(24):
        a = i/24*2*math.pi
        d.line(P((cx+135*math.cos(a), 170+135*math.sin(a)), (cx+150*math.cos(a), 170+150*math.sin(a))), fill=hexa(C["gold2"]), width=4*S)
    # robe (jama)
    d.polygon(P((cx-70, 330), (cx+70, 330), (cx+200, 760), (cx-200, 760)), fill=hexa(C["green"]))
    d.polygon(P((cx-70, 330), (cx-20, 330), (cx+40, 760), (cx-40, 760)), fill=hexa(C["green2"]))
    d.polygon(P((cx-75, 330), (cx+75, 330), (cx+120, 420), (cx-120, 420)), fill=hexa(C["green"]))
    # sash
    d.polygon(P((cx-150, 560), (cx+150, 560), (cx+160, 600), (cx-160, 600)), fill=hexa(C["red"]))
    d.polygon(P((cx+20, 600), (cx+60, 600), (cx+70, 720), (cx+30, 720)), fill=hexa(C["red"]))
    # pearls
    for i in range(15):
        t = i/14
        x = cx-62+124*t
        y = 345+70*math.sin(t*math.pi)
        d.ellipse(B(x-8, y-8, x+8, y+8), fill=hexa(C["white"]))
    d.ellipse(B(cx-16, 405, cx+16, 445), fill=hexa(C["red"]))
    # neck & face
    d.rectangle(B(cx-28, 270, cx+28, 335), fill=hexa(C["skin2"]))
    d.ellipse(B(cx-78, 150, cx+78, 320), fill=hexa(C["skin"]))
    # ears
    d.ellipse(B(cx-92, 215, cx-66, 262), fill=hexa(C["skin2"]))
    d.ellipse(B(cx+66, 215, cx+92, 262), fill=hexa(C["skin2"]))
    d.ellipse(B(cx-90, 250, cx-80, 262), fill=hexa(C["gold"]))
    # eyes / brows
    for sx in (-1, 1):
        ex = cx + sx*32
        d.ellipse(B(ex-15, 222, ex+15, 240), fill=hexa(C["white"]))
        d.ellipse(B(ex-7, 223, ex+7, 239), fill=hexa(C["ink"]))
        d.line(P((ex-20, 208), (ex+18*sx if sx > 0 else ex+20, 203 if sx > 0 else 203)), fill=hexa(C["ink"]), width=6*S)
    # nose
    d.line(P((cx, 232), (cx-6, 268), (cx+6, 272)), fill=hexa(C["skin2"]), width=4*S)
    # moustache (Jahangir)
    d.polygon(P((cx-4, 282), (cx-46, 296), (cx-58, 286), (cx-40, 300), (cx-4, 292)), fill=hexa(C["ink"]))
    d.polygon(P((cx+4, 282), (cx+46, 296), (cx+58, 286), (cx+40, 300), (cx+4, 292)), fill=hexa(C["ink"]))
    d.line(P((cx-14, 303), (cx+14, 303)), fill=hexa("#7a3b2a"), width=4*S)
    # turban
    d.ellipse(B(cx-92, 92, cx+92, 222), fill=hexa(C["white"]))
    d.polygon(P((cx-92, 160), (cx+92, 160), (cx+84, 205), (cx-84, 205)), fill=hexa(C["white"]))
    for k in range(4):
        y = 120+k*24
        d.arc(B(cx-90, y-30, cx+90, y+40), 200, 340, fill=hexa("#d9cdb6"), width=5*S)
    d.rectangle(B(cx-92, 190, cx+92, 206), fill=hexa(C["gold"]))
    # turban jewel + plume
    d.polygon(P((cx+20, 150), (cx+40, 60), (cx+70, 20), (cx+52, 80), (cx+34, 152)), fill=hexa(C["white"]))
    d.ellipse(B(cx+8, 138, cx+44, 174), fill=hexa(C["red"]))
    d.ellipse(B(cx+16, 146, cx+36, 166), fill=hexa("#e34b4f"))
    out = down(im)
    if scale != 1.0:
        out = out.resize((int(out.width*scale), int(out.height*scale)), Image.LANCZOS)
    return out

def englishman():
    """Sir Thomas Roe style: tall hat, ruff collar, doublet. Canvas 420x760."""
    w, h = 420, 760
    im, d = canvas(w, h)
    cx = 210
    d.polygon(P((cx-110, 360), (cx+110, 360), (cx+150, 760), (cx-150, 760)), fill=hexa("#232a3f"))
    for i in range(6):
        y = 400+i*55
        d.ellipse(B(cx-7, y-7, cx+7, y+7), fill=hexa(C["gold"]))
    d.polygon(P((cx-110, 360), (cx-160, 600), (cx-120, 610), (cx-80, 420)), fill=hexa("#1a2033"))
    d.rectangle(B(cx-24, 260, cx+24, 330), fill=hexa("#d9a88a"))
    # ruff
    for i in range(14):
        a = math.pi + i/13*math.pi
        x = cx + 95*math.cos(a)*-1
        d.ellipse(B(cx-110+i*16-14, 320, cx-110+i*16+30, 372), fill=hexa(C["white"]), outline=hexa("#cfc6b6"), width=2*S)
    d.ellipse(B(cx-66, 140, cx+66, 300), fill=hexa("#e8bfa0"))
    for sx in (-1, 1):
        ex = cx+sx*26
        d.ellipse(B(ex-7, 205, ex+7, 219), fill=hexa(C["ink"]))
        d.line(P((ex-14, 192), (ex+14, 190)), fill=hexa("#5a3a22"), width=5*S)
    d.line(P((cx, 212), (cx-5, 245), (cx+5, 248)), fill=hexa("#c99a7c"), width=4*S)
    # beard and moustache
    d.polygon(P((cx-36, 262), (cx+36, 262), (cx+10, 312), (cx, 322), (cx-10, 312)), fill=hexa("#6b4423"))
    d.line(P((cx-34, 256), (cx, 250), (cx+34, 256)), fill=hexa("#6b4423"), width=7*S)
    # hair
    d.chord(B(cx-70, 132, cx+70, 250), 180, 360, fill=hexa("#6b4423"))
    # hat
    d.ellipse(B(cx-120, 140, cx+120, 180), fill=hexa("#15151f"))
    d.polygon(P((cx-66, 162), (cx+66, 162), (cx+56, 40), (cx-56, 40)), fill=hexa("#15151f"))
    d.ellipse(B(cx-56, 28, cx+56, 52), fill=hexa("#15151f"))
    d.rectangle(B(cx-64, 138, cx+64, 156), fill=hexa(C["gold2"]))
    return down(im)

def person(col, skin, h=300, turban=True, seed=0):
    w = int(h*0.55)
    im, d = canvas(w, h)
    cx = w/2
    d.polygon(P((cx-w*0.32, h*0.36), (cx+w*0.32, h*0.36), (cx+w*0.45, h), (cx-w*0.45, h)), fill=hexa(col))
    r = h*0.13
    d.ellipse(B(cx-r, h*0.1, cx+r, h*0.1+2.2*r), fill=hexa(skin))
    if turban:
        d.chord(B(cx-r*1.15, h*0.04, cx+r*1.15, h*0.26), 180, 360, fill=hexa(C["cream"]))
        d.rectangle(B(cx-r*1.15, h*0.14, cx+r*1.15, h*0.18), fill=hexa(C["cream"]))
    else:
        d.chord(B(cx-r*1.1, h*0.06, cx+r*1.1, h*0.3), 180, 360, fill=hexa("#e07a2e"))
    # raised arm
    d.line(P((cx+w*0.25, h*0.45), (cx+w*0.45, h*0.18)), fill=hexa(col), width=int(h*0.07*S))
    d.ellipse(B(cx+w*0.4, h*0.12, cx+w*0.52, h*0.22), fill=hexa(skin))
    return down(im)

def scale_parts(beam_len=760):
    """Returns (post, beam, pan) sprites for the giant golden balance."""
    # post: standing frame
    pw, ph = 900, 1100
    post, d = canvas(pw, ph)
    cx = pw/2
    d.rectangle(B(cx-22, 120, cx+22, 1060), fill=hexa(C["gold2"]))
    d.rectangle(B(cx-12, 120, cx+12, 1060), fill=hexa(C["gold"]))
    d.polygon(P((cx-200, 1100), (cx+200, 1100), (cx+150, 1040), (cx-150, 1040)), fill=hexa(C["gold2"]))
    d.rectangle(B(cx-150, 1030, cx+150, 1046), fill=hexa(C["gold3"]))
    d.ellipse(B(cx-46, 70, cx+46, 162), fill=hexa(C["gold"]))
    d.ellipse(B(cx-26, 90, cx+26, 142), fill=hexa(C["red"]))
    d.polygon(P((cx-14, 74), (cx, 20), (cx+14, 74)), fill=hexa(C["gold2"]))
    post = down(post)
    # beam: centred pivot
    bw, bh = beam_len+80, 80
    beam, d = canvas(bw, bh)
    d.rounded_rectangle(B(40, 26, bw-40, 54), radius=14*S, fill=hexa(C["gold2"]))
    d.rounded_rectangle(B(40, 28, bw-40, 44), radius=8*S, fill=hexa(C["gold"]))
    for x in (40, bw-40):
        d.ellipse(B(x-26, 14, x+26, 66), fill=hexa(C["gold2"]))
        d.ellipse(B(x-14, 26, x+14, 54), fill=hexa(C["gold3"]))
    d.ellipse(B(bw/2-30, 10, bw/2+30, 70), fill=hexa(C["gold"]))
    beam = down(beam)
    # pan with chains (hangs from top centre)
    aw, ah = 340, 420
    pan, d = canvas(aw, ah)
    c = aw/2
    for x in (40, aw-40):
        for k in range(16):
            y = 6 + k*20
            xx = c + (x-c)*(k/16)
            d.ellipse(B(xx-6, y, xx+6, y+18), outline=hexa(C["gold2"]), width=3*S)
    d.chord(B(10, 300, aw-10, 420), 0, 180, fill=hexa(C["gold2"]))
    d.ellipse(B(10, 330, aw-10, 372), fill=hexa(C["gold"]))
    d.ellipse(B(c-10, 0, c+10, 20), fill=hexa(C["gold"]))
    pan = down(pan)
    return post, beam, pan

def paste_center(base, sprite, cx, cy, alpha=1.0):
    if alpha < 1.0:
        sprite = sprite.copy()
        a = sprite.getchannel("A").point(lambda p: int(p*alpha))
        sprite.putalpha(a)
    base.alpha_composite(sprite, (int(round(cx - sprite.width/2)), int(round(cy - sprite.height/2))))

def paste_top(base, sprite, cx, top):
    base.alpha_composite(sprite, (int(round(cx - sprite.width/2)), int(round(top))))

def draw_balance(base, parts, cx, base_y, angle_deg, left_load=None, right_load=None):
    """Draw balance with beam rotated by angle (positive = left side down)."""
    post, beam, pan = parts
    paste_top(base, post, cx, base_y - post.height)
    pivot_y = base_y - post.height + 116
    half = (beam.width-80)/2
    a = math.radians(angle_deg)
    rb = beam.rotate(angle_deg, resample=Image.BICUBIC, expand=True)
    paste_center(base, rb, cx, pivot_y)
    ends = [(cx - half*math.cos(a), pivot_y + half*math.sin(a)), (cx + half*math.cos(a), pivot_y - half*math.sin(a))]
    for (ex, ey), load in zip(ends, (left_load, right_load)):
        paste_top(base, pan, ex, ey - 8)
        if load is not None:
            load(base, ex, ey - 8 + 350)   # pan surface y
    return ends

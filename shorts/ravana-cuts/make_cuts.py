"""Cut vertical 9:16 Shorts from the Ravana long video.

Each Short = one or more line ranges from longform/ravana/ravana.mp4 (timings from timeline.json),
reframed: blurred full-bleed background, the 16:9 picture (minus its burnt-in captions) in the middle,
a hook title on top and larger captions underneath, then a short end card pointing to the full story.

Usage: python3 make_cuts.py [name ...]
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RAV = os.path.join(HERE, '../../longform/ravana')
SRC = os.path.join(RAV, 'ravana.mp4')
T = json.load(open(os.path.join(RAV, 'timeline.json')))
CAPS, VOICE = T['caps'], T['voice']
FB = os.path.join(RAV, 'fonts/Cinzel-Bold.woff')
FD = os.path.join(RAV, 'fonts/CinzelDecorative-Bold.woff')
W, H = 1080, 1920
VID_Y = 560          # top of the 16:9 picture
END = 2.6            # end-card seconds

CUTS = {
    'ravana-kailash': dict(
        title=['RAVANA TRIED TO LIFT', "SHIVA'S *MOUNTAIN*"],
        ranges=[(39, 46)]),
    'ravana-boon': dict(
        title=['HE ASKED FOR PROTECTION', 'AND FORGOT *ONE THING*'],
        ranges=[(24, 29), (94, 96)]),
    'ravana-golden-deer': dict(
        title=['THE GOLDEN DEER', 'WAS A *TRAP*'],
        ranges=[(61, 68)]),
}

GOLD, WHITE, INK = (240, 190, 90), (250, 244, 230), (12, 8, 20)

def font(path, size): return ImageFont.truetype(path, size)

def rich_words(text):
    """'a *b c* d' -> [(word, highlighted)]"""
    out, hl = [], False
    for tok in re.split(r'(\*)', text):
        if tok == '*': hl = not hl; continue
        for w in tok.split():
            if out and all(c in ',.;:!?’\'”"…' for c in w):
                out[-1] = (out[-1][0] + w, out[-1][1])
            else:
                out.append((w, hl))
    return out

def draw_rich(d, lines, f, y, gap, stroke=8):
    for ln in lines:
        words = rich_words(ln)
        w = d.textlength(' '.join(x for x, _ in words), font=f)
        x = W/2 - w/2
        for word, hl in words:
            d.text((x, y), word, font=f, fill=GOLD if hl else WHITE, stroke_width=stroke, stroke_fill=INK)
            x += d.textlength(word + ' ', font=f)
        y += f.size + gap
    return y

def wrap(text, f, maxw, d):
    words = text.split(); lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t.replace('*', ''), font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    # carry an open highlight across line breaks
    fixed, open_ = [], False
    for ln in lines:
        s = ('*' if open_ else '') + ln
        if ln.count('*') % 2: open_ = not open_
        if open_: s += '*'
        fixed.append(s)
    return fixed

def title_png(path, title):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    size = 70
    while size > 40 and max(d.textlength(t.replace('*', ''), font=font(FD, size)) for t in title) > 940: size -= 2
    f = font(FD, size)
    d.rounded_rectangle([60, 250, W-60, 250 + 2*(size+22) + 40], radius=28, fill=(20, 10, 28, 170))
    draw_rich(d, title, f, 270, 22, stroke=4)
    im.save(path)

def caption_png(path, text):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = font(FB, 60)
    lines = wrap(text, f, 960, d)
    draw_rich(d, lines, f, VID_Y + 720 + 70, 16)
    im.save(path)

def endcard_png(path):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, H], fill=(8, 4, 16, 195))
    y = draw_rich(d, ['WATCH THE', '*FULL STORY*'], font(FD, 84), 720, 24, stroke=5)
    draw_rich(d, ['The Fall of Ravana'], font(FB, 58), y + 40, 10, stroke=5)
    draw_rich(d, ['link in the description'], font(FB, 46), y + 150, 10, stroke=5)
    im.save(path)

def build(name, cfg):
    out_dir = os.path.join(HERE, name); os.makedirs(out_dir, exist_ok=True)
    tmp = f'/tmp/cut_{name}'; os.makedirs(tmp, exist_ok=True)
    segs, caps, t_out = [], [], 0.0
    for (a, b) in cfg['ranges']:
        s0 = VOICE[a][0] - 0.45; s1 = VOICE[b][1] + 0.7
        segs.append((s0, s1))
        for i in range(a, b+1):
            caps.append((t_out + VOICE[i][0] - s0, t_out + VOICE[i][1] - s0 + 0.15, CAPS[i]))
        t_out += s1 - s0
    body = t_out; total = body + END
    title_png(f'{tmp}/title.png', cfg['title'])
    endcard_png(f'{tmp}/end.png')
    for k, (_, _, txt) in enumerate(caps): caption_png(f'{tmp}/cap{k}.png', txt)

    inputs = []
    for (s0, s1) in segs: inputs += ['-ss', f'{s0:.3f}', '-t', f'{s1-s0:.3f}', '-i', SRC]
    n = len(segs)
    pngs = ['title.png', 'end.png'] + [f'cap{k}.png' for k in range(len(caps))]
    for p in pngs: inputs += ['-i', f'{tmp}/{p}']
    fc = []
    # join source segments (short crossfade when there are two)
    if n == 1:
        fc.append('[0:v]setpts=PTS-STARTPTS[sv];[0:a]asetpts=PTS-STARTPTS[sa]')
    else:
        d0 = segs[0][1] - segs[0][0]
        fc.append(f'[0:v][1:v]xfade=transition=fade:duration=0.4:offset={d0-0.4:.3f}[sv];[0:a][1:a]acrossfade=d=0.4[sa]')
        body -= 0.4; total -= 0.4
        caps = [(a if a < d0 else a-0.4, b if b < d0 else b-0.4, t) for a, b, t in caps]
    fc.append(f'[sv]tpad=stop_mode=clone:stop_duration={END},fps=30,split[v1][v2]')
    fc.append(f'[v1]scale=-2:{H},crop={W}:{H},boxblur=30:2,eq=brightness=-0.22:saturation=1.1[bg]')
    fc.append(f'[v2]crop=1320:880:300:0,scale={W}:720[fg]')
    fc.append(f'[bg][fg]overlay=0:{VID_Y}[b0]')
    base = n
    fc.append(f'[b0][{base}:v]overlay=0:0:enable=\'lt(t,{body:.3f})\'[b1]')
    last = 'b1'
    for k, (a, b, _) in enumerate(caps):
        fc.append(f'[{last}][{base+2+k}:v]overlay=0:0:enable=\'between(t,{a:.3f},{min(b, body):.3f})\'[c{k}]'); last = f'c{k}'
    fc.append(f'[{last}][{base+1}:v]overlay=0:0:enable=\'gte(t,{body:.3f})\',format=yuv420p[vout]')
    fc.append(f'[sa]apad=pad_dur={END},afade=t=out:st={body-0.3:.3f}:d={END+0.3},afade=t=in:d=0.2,loudnorm=I=-14:TP=-1.5[aout]')
    out = os.path.join(out_dir, f'{name}.mp4'); tmp_out = out + '.tmp.mp4'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error'] + inputs + ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]',
           '-t', f'{total:.3f}', '-r', '30', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '192k',
           '-ar', '48000', '-movflags', '+faststart', '-f', 'mp4', tmp_out]
    subprocess.run(cmd, check=True); os.replace(tmp_out, out)
    # subtitles
    def ts(x): return f'{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d},{int(round((x-int(x))*1000))%1000:03d}'
    with open(os.path.join(out_dir, f'{name}.srt'), 'w') as fh:
        for k, (a, b, txt) in enumerate(caps):
            fh.write(f'{k+1}\n{ts(a)} --> {ts(min(b, body))}\n{txt.replace("*", "")}\n\n')
    print(name, round(total, 2), 's')

if __name__ == '__main__':
    for nm in (sys.argv[1:] or CUTS):
        build(nm, CUTS[nm])

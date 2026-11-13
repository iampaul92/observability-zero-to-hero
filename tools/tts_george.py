"""Channel narrator: Kokoro British male voice "George" (bm_george), with Indian-name pronunciation fixes.

Usage:
    python3 tts_george.py lines.json out_dir [--speed 1.0]
lines.json: [{"id": "l01", "text": "..."}, ...]  ->  out_dir/<id>.wav + out_dir/dur.json

Model files: set KOKORO_DIR (default /home/claude/models) containing kokoro.onnx and voices.bin
(from github.com/thewh1teagle/kokoro-onnx releases, model-files-v1.0).

To add a name: run  python3 -c "from kokoro_onnx.tokenizer import Tokenizer; print(Tokenizer().phonemize('Name','en-gb'))"
and add {what it says: what it should say} to FIX.
"""
import json, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

VOICE, LANG = "bm_george", "en-gb"
FIX = {
    "ˈɛkɐlˌavɪə": "eːkˈʌləvjə",        # Ekalavya
    "dɹˈəʊnə": "dɹˈəʊnɑː",              # Drona
    "ɹavˈɑːnə": "ɹˈɑːvənə",             # Ravana
    "ɡˈeɪnʃə": "ɡəˈneɪʃə",              # Ganesha
    "kˈɑːtaɪkjə": "kˌɑːtɪkˈeɪjə",       # Kartikeya
    "kˈaɪlaʃ": "kaɪlˈɑːʃ",              # Kailash
    "ˈɑːdʒuːnə": "ˈɑːdʒʊnə",            # Arjuna
    "mˌahɐbhɐɹˈɑːtə": "məhˌɑːbˈɑːɹətə",  # Mahabharata
    "ɹˌameɪˈɑːnə": "ɹɑːmˈɑːjənə",       # Ramayana
    "mˈaɹɪtʃə": "məɹˈiːtʃə",            # Maricha
    "hˈanjuːmən": "hˈʌnʊmɑːn",          # Hanuman
    "lakʃmˈɑːnə": "lˈʌkʃmənə",          # Lakshmana
    "vˌɪbhɪʃˈɑːnə": "vɪbˈiːʃənə",       # Vibhishana
    "kˈʌmbhɐkˌɑːnə": "kˌʊmbəkˈɑːɹnə",   # Kumbhakarna
    "pɑːvˈɑːti": "pˈɑːɹvəti",           # Parvati
    "ɡjˈʊəɹuː": "ɡˈʊɹuː",               # Guru
    "ˈakbɑː": "ˈʌkbəɹ",                  # Akbar
    "bˈɜːbəl": "bˈiːɹbəl",              # Birbal
    "dʒˈahɐnpˌanə": "dʒəhˌɑːnpənˈɑː",   # Jahanpanah
    "kˈɪtʃdi": "kˈɪtʃdiː",               # khichdi
    "nˈandə": "nˈʌndə",                  # Nanda
    "jaʃˈəʊdə": "jəʃˈəʊdɑː",             # Yashoda
    "bˌalɐɹˈɑːmə": "bˈʌləɹɑːmə",         # Balarama
    "vɹˈɪndɐvˌan": "vɹɪndˈɑːvən",        # Vrindavan
    "ɡˌɒpɐʃtˈɑːmi": "ɡˌəʊpɑːʃtˈʌmiː",    # Gopashtami
    "lˈak": "lˈɑːk",                     # lakh
}

def main():
    src, out = sys.argv[1], sys.argv[2]
    speed = float(sys.argv[sys.argv.index("--speed")+1]) if "--speed" in sys.argv else 1.0
    kd = os.environ.get("KOKORO_DIR", "/home/claude/models")
    k = Kokoro(os.path.join(kd, "kokoro.onnx"), os.path.join(kd, "voices.bin"))
    tok = Tokenizer(); os.makedirs(out, exist_ok=True); durs = {}
    for line in json.load(open(src)):
        ph = tok.phonemize(line.get("say", line["text"]), LANG)
        for a, b in FIX.items(): ph = ph.replace(a, b)
        a, sr = k.create(ph, voice=VOICE, speed=speed, is_phonemes=True)
        nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0]-600): nz[-1]+1200]
        sf.write(os.path.join(out, line["id"] + ".wav"), a, sr); durs[line["id"]] = round(len(a)/sr, 3)
        print(line["id"], durs[line["id"]])
    json.dump(durs, open(os.path.join(out, "dur.json"), "w"), indent=1)

if __name__ == "__main__":
    main()

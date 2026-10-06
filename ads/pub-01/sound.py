"""Bande son de la pub 01 (synthèse, aucun échantillon externe).

Les instants reprennent la timeline de index.html (objet T).
Usage : python3 sound.py out.wav [--sans-voix] [--variante-dm]
"""
import os
import sys
import wave

import numpy as np

SR = 48000
DUR = 30.0
rng = np.random.default_rng(3)

T = dict(
    notifs=[0.0, 0.32, 0.62, 0.9, 1.16, 1.4, 1.62, 1.82],
    impact1=2.45, s2=2.7, s3=6.35, s4=8.4, s5=16.3, s6=21.1, s7=24.6,
    tapChoose=10.3, tapDay=11.2, tapSlot=11.7, tapGo=12.25, done=12.6,
    apptDrop=17.0, pills=[18.5, 18.95, 20.1], priceSlam=22.6,
)

N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)


def t_axis(d):
    return np.arange(int(SR * d)) / SR


def env(d, a=0.005, rel=None, curve=4.0):
    t = t_axis(d)
    e = np.minimum(1, t / max(a, 1e-4))
    rel = d if rel is None else rel
    return e * np.exp(-curve * t / rel)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * (1 - max(0, pan))
    R[i : i + len(sig)] += sig * gain * (1 + min(0, pan))


def lp_fast(x, cutoff):
    # filtre passe-bas d'ordre 1 vectorisé par FFT (réponse équivalente)
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    H = 1 / (1 + 1j * f / cutoff)
    return np.fft.irfft(np.fft.rfft(x) * H, n)


def hp_fast(x, cutoff):
    return x - lp_fast(x, cutoff)


def bp_fast(x, lo, hi):
    return lp_fast(hp_fast(x, lo), hi)


def noise(d):
    return rng.standard_normal(int(SR * d))


def sine(freq, d, phase=0.0):
    t = t_axis(d)
    if callable(freq):
        ph = 2 * np.pi * np.cumsum(freq(t)) / SR
    else:
        ph = 2 * np.pi * freq * t
    return np.sin(ph + phase)


# ---------- effets ----------
def vibration(d=0.2):
    t = t_axis(d)
    buzz = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.5 + np.sin(2 * np.pi * 86 * t)
    buzz = lp_fast(buzz, 900)
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 34 * t)
    return buzz * am * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03)


def pop(f=1180, d=0.14):
    s = sine(lambda t: f * (1 + 0.5 * np.exp(-t * 60)), d) * env(d, 0.002, 0.06)
    return s + 0.3 * sine(f * 2, d) * env(d, 0.001, 0.03)


def impact(d=1.6, big=1.0):
    sub = sine(lambda t: 38 + 110 * np.exp(-t * 9), d) * env(d, 0.002, 0.7, 3)
    crack = hp_fast(noise(0.4), 1200) * env(0.4, 0.001, 0.08)
    body = lp_fast(noise(d), 300) * env(d, 0.002, 0.5) * 2.5
    out = sub * 1.2 * big + np.pad(crack * 0.5, (0, len(sub) - len(crack))) + body * 0.4
    return out


def whoosh(d=0.6, up=True, lo=300, hi=6000):
    n = noise(d)
    t = t_axis(d)
    p = t / d
    # bande glissante approximée par fondu entre deux bandes
    a = bp_fast(n, lo, lo * 3)
    b = bp_fast(n, hi / 3, hi)
    mix = p if up else 1 - p
    shape = np.sin(np.pi * np.clip(p, 0, 1)) ** 1.5
    return (a * (1 - mix) + b * mix) * shape * 1.6


def riser(d):
    t = t_axis(d)
    n = bp_fast(noise(d), 600, 5000) * (t / d) ** 2.2 * 0.9
    tone = sine(lambda x: 220 + 660 * (x / d) ** 2, d) * (t / d) ** 3 * 0.12
    return n + tone


def click(d=0.05):
    return hp_fast(noise(d), 2500) * env(d, 0.0005, 0.012) * 0.9 + sine(2400, d) * env(d, 0.0005, 0.01) * 0.3


def tick():
    return sine(3200, 0.03) * env(0.03, 0.0005, 0.008) * 0.6 + hp_fast(noise(0.03), 4000) * env(0.03, 0.0005, 0.005) * 0.5


def bell(f, d=1.4):
    t = t_axis(d)
    s = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 3)
         + 0.25 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6))
    return s * env(d, 0.003, 0.6, 3)


def shimmer(d=1.6):
    out = np.zeros(int(SR * d))
    for k, f in enumerate([1318.5, 1567.98, 1975.53, 2349.32, 2637.0]):
        b = bell(f, d - k * 0.07) * 0.22
        i = int(k * 0.07 * SR)
        out[i : i + len(b)] += b
    return out


def scratch(d=0.35):
    t = t_axis(d)
    s = sine(lambda x: 900 * np.exp(-x * 9) + 120, d)
    return (s * 0.5 + bp_fast(noise(d), 800, 3000) * 0.6) * env(d, 0.002, 0.15)


# ---------- musique (à partir de la révélation) ----------
BPM = 112
beat = 60 / BPM
m0 = T["s3"] + 0.45  # premier temps sur le logo


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


chords = [  # Fmaj9, Am7, Dm9, Bbmaj7 (2 mesures chacun)
    [53, 57, 60, 64, 67], [57, 60, 64, 67, 72], [50, 57, 60, 64, 65], [46, 53, 57, 62, 65],
]
bass = [41, 45, 38, 46]


def pad(freqs, d):
    t = t_axis(d)
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * t) + 0.3 * np.sin(2 * np.pi * 2 * ff * t)
    s /= len(freqs) * 2
    e = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    return lp_fast(s, 2200) * e


def kick():
    d = 0.35
    return sine(lambda t: 45 + 120 * np.exp(-t * 28), d) * env(d, 0.001, 0.25, 3) * 1.1


def hat(open_=False):
    d = 0.12 if open_ else 0.04
    return hp_fast(noise(d), 7000) * env(d, 0.0005, d * 0.5) * 0.35


def clap():
    d = 0.18
    return bp_fast(noise(d), 900, 4000) * env(d, 0.001, 0.07) * 0.6


music_L = np.zeros(N)
music_R = np.zeros(N)


def madd(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    music_L[i : i + len(sig)] += sig * g * (1 - max(0, pan))
    music_R[i : i + len(sig)] += sig * g * (1 + min(0, pan))


bar = beat * 4
nbars = int((DUR - m0) / bar) + 1
for b in range(nbars):
    t0 = m0 + b * bar
    ci = (b // 2) % 4
    madd(pad([note(m) for m in chords[ci]], bar + 0.4), t0, 0.32)
    # basse : noires pointées
    for k, off in enumerate([0, 1.5, 2.5, 3]):
        bd = beat * 0.9
        bs = sine(note(bass[ci] - 12 + (12 if k == 2 else 0)), bd) * env(bd, 0.005, 0.35, 2.5)
        madd(lp_fast(bs, 500), t0 + off * beat, 0.55)
    for q in range(4):
        tq = t0 + q * beat
        madd(kick(), tq, 0.8)
        madd(hat(), tq + beat / 2, 0.8, 0.3)
        madd(hat(), tq + beat * 0.25, 0.35, -0.3)
        if q in (1, 3):
            madd(clap(), tq, 0.7)
    # arpège léger
    for k in range(8):
        m = chords[ci][(k * 2) % 5] + 12
        d = beat * 0.45
        madd(sine(note(m), d) * env(d, 0.003, 0.18) * 0.5, t0 + k * beat / 2, 0.22, 0.4 if k % 2 else -0.4)

# ducking : la musique se creuse pendant le « drop » du prix et se coupe à la toute fin
t_all = np.arange(N) / SR
duck = np.ones(N)
dip = (t_all > T["s6"]) & (t_all < T["priceSlam"])
duck[dip] = 0.25
duck = lp_fast(duck, 6)
fade_in = np.clip((t_all - m0 + 0.2) / 0.3, 0, 1)
fade_out = np.clip((DUR - t_all) / 1.2, 0, 1)
music_L *= duck * fade_in * fade_out
music_R *= duck * fade_in * fade_out
# filtre « sous l'eau » pendant la scène prix avant l'impact
seg = slice(int(T["s6"] * SR), int(T["priceSlam"] * SR))
music_L[seg] = lp_fast(music_L[seg], 500)
music_R[seg] = lp_fast(music_R[seg], 500)

# ---------- scène 1 : tension ----------
drone = sine(55, 2.6) * 0.25 + sine(82.4, 2.6) * 0.12
drone *= np.minimum(1, t_axis(2.6) / 0.05) * np.minimum(1, (2.6 - t_axis(2.6)) / 0.1)
add(drone, 0.0, 0.9)
add(riser(2.4), 0.05, 0.55)
for k, n in enumerate(T["notifs"]):
    add(vibration(0.2), n, 0.55, -0.2 if k % 2 else 0.2)
    add(pop(1180 + (k % 3) * 120), n + 0.01, 0.35, 0.3 if k % 2 else -0.3)
add(impact(1.8), T["impact1"], 1.0)
add(whoosh(0.35, up=False, lo=200, hi=4000), T["impact1"] - 0.3, 0.6)

# ---------- scène 2 ----------
add(sine(41, 2.8) * env(2.8, 0.02, 2.0, 2) * 0.5, T["s2"], 0.8)
for k, at in enumerate([T["s2"] + 1.35, T["s2"] + 1.5, T["s2"] + 2.45, T["s2"] + 2.6]):
    add(lp_fast(noise(0.08), 1800) * env(0.08, 0.001, 0.03), at, 0.5)
# compteur 49 → 99 : ticks qui accélèrent puis ralentissent
vals = 50
for k in range(vals):
    p = k / vals
    tt = T["s2"] + 1.4 + 1.2 * (1 - (1 - p) ** (1 / 3))  # inverse de easeOutCubic
    add(tick(), tt, 0.35)
add(impact(0.8, 0.6), T["s2"] + 2.6, 0.5)
add(scratch(), T["s2"] + 3.05, 0.7)

# ---------- scène 3 : révélation ----------
add(whoosh(0.7, up=True), T["s3"] - 0.4, 0.8)
add(shimmer(2.0), T["s3"] + 0.45, 0.9)
add(bell(698.46, 2.0) * 0.4 + bell(880, 2.0) * 0.3, T["s3"] + 0.45, 0.6)
add(whoosh(0.4, up=True, lo=2000, hi=9000), T["s3"] + 0.9, 0.25)  # reflet chromé

# ---------- scène 4 ----------
add(whoosh(0.6, up=False), T["s4"] - 0.15, 0.6)
for at in (T["tapChoose"], T["tapDay"], T["tapSlot"], T["tapGo"]):
    add(click(), at, 0.8)
add(whoosh(0.3, up=True, lo=800, hi=5000), T["tapChoose"] + 0.15, 0.3)
add(bell(1046.5, 1.2) * 0.5, T["done"] + 0.3, 0.6)
add(bell(1567.98, 1.4) * 0.5, T["done"] + 0.45, 0.6)

# ---------- scène 5 ----------
add(whoosh(0.6, up=True), T["s5"] - 0.25, 0.55)
add(sine(lambda t: 90 * np.exp(-t * 8) + 50, 0.3) * env(0.3, 0.001, 0.15) * 0.8, T["apptDrop"] + 0.2, 0.7)
add(pop(1400, 0.2), T["apptDrop"] + 0.2, 0.4)
for k, at in enumerate(T["pills"]):
    add(bell([1318.5, 1567.98, 2093.0][k], 0.9) * 0.45, at + 0.05, 0.5, [-0.3, 0, 0.3][k])
    add(pop(900 + k * 200, 0.12), at, 0.3)

# ---------- scène 6 ----------
add(whoosh(0.5, up=False, lo=150, hi=3000), T["s6"] - 0.2, 0.6)
for k in range(14):
    p = k / 14
    add(tick(), T["s6"] + 0.35 + (T["priceSlam"] - T["s6"] - 0.35) * (1 - (1 - p) ** (1 / 3)), 0.3)
add(impact(1.4, 0.9), T["priceSlam"], 0.9)
add(shimmer(1.6), T["priceSlam"] + 0.05, 0.5)

# ---------- scène 7 ----------
add(whoosh(0.6, up=True), T["s7"] - 0.25, 0.55)
add(click(), T["s7"] + 2.25, 0.8)
add(bell(698.46, 2.5) * 0.35 + bell(1046.5, 2.5) * 0.25 + bell(1318.5, 2.5) * 0.2, DUR - 2.6, 0.6)

# ---------- mixage ----------
sfx = np.stack([L, R])
mus = np.stack([music_L, music_R]) * 0.55


# petite réverbération (peignes) sur l'ensemble pour lier les sons
def reverb(x, mix=0.16):
    out = np.zeros_like(x)
    for dly, g in [(0.029, 0.5), (0.037, 0.45), (0.043, 0.4), (0.051, 0.35), (0.067, 0.3), (0.083, 0.25)]:
        d = int(dly * SR)
        y = np.zeros_like(x)
        y[:, d:] = x[:, :-d] * g
        y2 = np.zeros_like(x)
        y2[:, 2 * d:] = x[:, : -2 * d] * g * g
        out += y + y2
    return x + lp_fast_stereo(out, 5000) * mix


def lp_fast_stereo(x, c):
    return np.stack([lp_fast(x[0], c), lp_fast(x[1], c)])


bed = reverb(sfx + mus)
bed = np.tanh(bed / np.max(np.abs(bed)) * 1.4) / np.tanh(1.4)

# ---------- voix off (phrases générées avec Higgsfield, voix « Céline ») ----------
VO_AT = [0.15, 2.75, 6.6, 8.65, 10.4, 12.6, 16.5, 21.3, 24.95, 27.4]
voice = np.zeros(N)
if "--sans-voix" not in sys.argv:
    here = os.path.dirname(os.path.abspath(__file__))
    lines = [(at, f"vo-{k}.wav") for k, at in enumerate(VO_AT)]
    if "--variante-dm" in sys.argv:
        # Carte de fin « Écris-moi « page » en message » à la place de « Sept jours gratuits ».
        lines[9] = (27.15, "vo-9-dm.wav")
    for at, name in lines:
        with wave.open(os.path.join(here, "vo", name)) as w:
            assert w.getframerate() == SR and w.getnchannels() == 1
            v = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
        v = hp_fast(v, 110)
        v = v + 0.35 * bp_fast(v, 2500, 7000)  # présence
        v = v / (np.sqrt(np.mean(v**2)) + 1e-9) * 0.16  # niveau homogène entre les phrases
        i = int(at * SR)
        voice[i : i + len(v)] += v[: N - i]
    # la musique et les effets s'effacent sous la voix
    level = lp_fast(np.abs(voice), 6)
    duck = 1 - 0.55 * np.clip(level / 0.05, 0, 1)
    bed = bed * duck

mix = bed * 0.8 + np.stack([voice, voice])
mix = np.tanh(mix * 1.1) / np.tanh(1.1) * 0.92

pcm = (np.clip(mix, -1, 1).T * 32767).astype(np.int16)
with wave.open(next((a for a in sys.argv[1:] if not a.startswith("--")), "sound.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", mix.shape)

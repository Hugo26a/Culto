# Génère des échantillons de voix françaises naturelles (modèles libres) pour comparaison.
import os, subprocess, sys
OUT = "voix-echantillons"; os.makedirs(OUT, exist_ok=True)
TEXTE = ("Vendredi, l'Insée a publié un chiffre que personne n'attendait : au troisième trimestre, "
         "le PIB français a reculé de zéro virgule un pour cent. Pour comprendre, il faut le décomposer, "
         "comme une addition. Le commerce extérieur a retiré six dixièmes de point. Les stocks en ont rendu quatre.")
def mp3(wav, name):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "112k", f"{OUT}/{name}.mp3"], check=True)
which = sys.argv[1]
if which == "xtts":
    from TTS.api import TTS
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")
    for i, spk in enumerate(["Damien Black", "Viktor Menelaos", "Claribel Dervla", "Ana Florence"], 1):
        tts.tts_to_file(text=TEXTE, speaker=spk, language="fr", file_path="t.wav"); mp3("t.wav", f"xtts-{i}-{spk.split()[0].lower()}")
elif which == "chatterbox":
    import torchaudio
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    w = m.generate(TEXTE, language_id="fr"); torchaudio.save("t.wav", w, m.sr); mp3("t.wav", "chatterbox-1")
    w = m.generate(TEXTE, language_id="fr", exaggeration=0.35, cfg_weight=0.4); torchaudio.save("t.wav", w, m.sr); mp3("t.wav", "chatterbox-2-pose")

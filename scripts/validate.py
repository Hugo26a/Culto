#!/usr/bin/env python3
"""Vérifie une édition Culto avant publication. Usage : python3 scripts/validate.py editions/AAAA-MM-JJ.json"""
import json, re, sys, os
errs, warns = [], []
def err(m): errs.append(m)
path = sys.argv[1]
ed = json.load(open(path, encoding="utf-8"))
root = os.path.dirname(os.path.dirname(os.path.abspath(path)))
date = os.path.basename(path)[:-5]
if ed.get("date") != date: err(f"date '{ed.get('date')}' ≠ nom du fichier '{date}'")
for k in ("label", "n", "items", "week"):
    if k not in ed: err(f"champ manquant : {k}")
ORDER = ["lit", "essai", "eco", "geo", "log", "ent"]
items = ed.get("items", [])
if [i.get("id") for i in items] != ORDER: err(f"les 6 textes doivent être dans l'ordre {ORDER}")
BLOCK_KEYS = {"h", "h5", "p", "ul", "keys", "quote", "stats", "chart"}
TAG = re.compile(r"<(?!/?(em|b)>)[^>]*>")
def texts(bl):
    for b in bl:
        for k in ("p", "quote", "h", "h5"):
            if k in b: yield b[k]
        for x in b.get("ul", []): yield x
        for t, x in b.get("keys", []): yield t; yield x
def check_blocks(bl, where):
    if not bl: err(f"{where} : aucun bloc"); return
    if not any("h" in b for b in bl): err(f"{where} : aucune section 'h'")
    for b in bl:
        k = set(b) - {"lead", "cite"}
        if len(k) != 1 or not k <= BLOCK_KEYS: err(f"{where} : bloc invalide {list(b)}"); continue
        if "stats" in b and not (2 <= len(b["stats"]) <= 4): err(f"{where} : stats doit contenir 2 à 4 chiffres")
        if "chart" in b:
            c = b["chart"]
            if c.get("type") == "hbar":
                if not c.get("rows") or not all(isinstance(r[1], (int, float)) for r in c["rows"]): err(f"{where} : hbar sans valeurs numériques")
            elif c.get("type") == "vbar":
                n = len(c.get("labels", []))
                if not n or not c.get("series") or any(len(s.get("values", [])) != n for s in c["series"]): err(f"{where} : vbar, nombre de valeurs ≠ nombre de libellés")
            else: err(f"{where} : type de graphique inconnu")
            if not c.get("title"): err(f"{where} : graphique sans titre")
    for t in texts(bl):
        if TAG.search(t): err(f"{where} : balise HTML non autorisée dans « {t[:50]}… »")
words = ed.get("week", {}).get("words", [])
keys = [w.get("key") for w in words]
if len(words) != 2: err("il faut exactement 2 mots de la semaine")
for w in words:
    for f in ("key", "w", "ph", "short", "def", "ety", "ex", "syn"):
        if not w.get(f): err(f"mot {w.get('key')} : champ manquant {f}")
tot_full = tot_ex = 0
use = {k: {"blocks": 0, "ex": 0} for k in keys}
for i in items:
    where = i.get("id")
    for f in ("r", "kind", "title", "by", "min", "exMin", "src", "blocks", "ex"):
        if f not in i: err(f"{where} : champ manquant {f}")
    if i.get("kind") == "analysis" and not (i.get("fig") and i.get("figl")): err(f"{where} : fig et figl obligatoires")
    if i.get("id") == "lit" and not i.get("tagline"): err("lit : tagline manquante")
    if i.get("kind") == "book":
        ks = next((b["keys"] for b in i.get("blocks", []) if "keys" in b), None)
        if not ks or ks[0][0] != "Le livre en bref": err(f"{where} : le point 1 de « À retenir » doit être « Le livre en bref »")
    check_blocks(i.get("blocks", []), f"{where}/complet"); check_blocks(i.get("ex", []), f"{where}/express")
    tot_full += i.get("min", 0); tot_ex += i.get("exMin", 0)
    for part in ("blocks", "ex"):
        s = json.dumps(i.get(part, []), ensure_ascii=False)
        for k in re.findall(r"\[\[(\w+)\|", s):
            if k not in use: err(f"{where} : mot [[{k}|…]] absent des mots de la semaine")
            else: pass
        for k in keys:
            if f"[[{k}|" in s: use[k][part] += 1
for k, u in use.items():
    if u["blocks"] < 3: err(f"mot « {k} » présent dans {u['blocks']} textes (Complet), il en faut au moins 3")
    if u["ex"] < 3: err(f"mot « {k} » présent dans {u['ex']} textes (Express), il en faut au moins 3")
if not 26 <= tot_full <= 36: err(f"durée totale Complet = {tot_full} min (attendu 26 à 36)")
if not 12 <= tot_ex <= 18: err(f"durée totale Express = {tot_ex} min (attendu 12 à 18)")
idx = json.load(open(os.path.join(root, "editions", "index.json"), encoding="utf-8"))
if idx.get("latest") != date: err("index.json : 'latest' ne pointe pas sur cette édition")
if not idx.get("editions") or idx["editions"][0].get("date") != date: err("index.json : l'édition doit être en tête de 'editions'")
titles = [t for e in idx.get("editions", [])[1:] for _, t in e.get("items", [])]
for i in items:
    if i.get("kind") == "book" and i.get("title") in titles: err(f"{i['id']} : livre déjà traité")
print("\n".join("ERREUR : " + e for e in errs) or f"OK — {date} : {tot_full} min en Complet, {tot_ex} min en Express.")
sys.exit(1 if errs else 0)

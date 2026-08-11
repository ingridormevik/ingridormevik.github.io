#!/usr/bin/env python3
"""
Check the guarantees the trail makes about itself.

    python3 tools/verify-trail.py

These are the rules the whole project rests on, so they are tested rather than
trusted. Each check mutates a copy of the data, rebuilds, and asserts the build
either refused or gated — then restores. Exits non-zero on any failure.
"""

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
BUILD = [sys.executable, str(ROOT / "tools" / "build-trail.py")]

fails = []


def check(name, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {name}")
    if not ok:
        fails.append(f"{name}: {detail}")


def build(expect_fail=False):
    r = subprocess.run(BUILD, capture_output=True, text=True, cwd=ROOT)
    if expect_fail:
        return r.returncode != 0, r.stdout + r.stderr
    return r.returncode == 0, r.stdout + r.stderr


def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def main():
    backup = pathlib.Path(tempfile.mkdtemp()) / "data"
    shutil.copytree(DATA, backup)
    try:
        print("baseline")
        ok, out = build()
        check("build succeeds", ok, out)

        print("\nrule 18 — no verified source, no facts")
        h = json.loads(read("data/history.json"))
        for e in h["entries"]:
            if e["id"] == "sandviksbatteriet_construction":
                e["educational_text_en"] = "Built between 1895 and 1902 to defend Bergen."
        (DATA / "history.json").write_text(json.dumps(h, ensure_ascii=False, indent=2))
        build()
        page = read("trail/sandviksbatteriet/index.html")
        check("pasted claim does not reach the page", "1895 and 1902" not in page)
        check("RESEARCH REQUIRED shown instead", "RESEARCH REQUIRED" in page)
        shutil.copy(backup / "history.json", DATA / "history.json")

        print("\nfolklore permission — banned stops refuse beings")
        f = json.loads(read("data/folklore.json"))
        for b in f["beings"]:
            if b["id"] == "huldra":
                b["cast_at"] = "sandviken-sykehus"
        (DATA / "folklore.json").write_text(json.dumps(f, ensure_ascii=False, indent=2))
        failed, out = build(expect_fail=True)
        check("build refuses a being at a banned stop", failed)
        check("refusal names the stop", "sandviken-sykehus" in out, out)
        shutil.copy(backup / "folklore.json", DATA / "folklore.json")

        print("\nfolklore provenance — attestation line is generated")
        build()
        forest = read("trail/forest-transition/index.html")
        check("unattested being says so", "Not attested at this location" in forest)

        print("\nquarantine — banned art cannot reach a page")
        pack = json.loads(read("data/pack-v2.json"))
        q = {x["asset"] for x in pack["quarantined"]}
        pages = "".join(read(p) for p in
                        ROOT.glob("trail/**/index.html"))
        check("no quarantined asset referenced",
              not any(a in pages for a in q), str(q))
        check("battery stop has no banner",
              'class="banner"' not in read("trail/sandviksbatteriet/index.html"))

        print("\nprinted contract — slugs match the URLs on the cards")
        route = json.loads(read("data/route.json"))
        stops = [s["id"] for s in route["stops"]]
        pr = read("trail/print.html")
        check("every stop's URL appears on a card",
              all(f"/trail/{s}" in pr for s in stops))
        check("every stop page exists",
              all((ROOT / "trail" / s / "index.html").exists() for s in stops))
        check("every stop has a QR code",
              all((ROOT / "assets" / "qr" / f"{s}.svg").exists() for s in stops))

        print("\noffline — service worker precaches the whole trail")
        sw = read("trail/sw.js")
        check("all stops precached", all(f'"/trail/{s}/"' in sw for s in stops))
        check("index precached", '"/trail/"' in sw)

        print("\nself-containment — no external requests")
        bad = [p.name for p in ROOT.glob("trail/**/*.html")
               if "http://" in p.read_text() or
               ("https://" in p.read_text() and "snl.no" not in p.read_text()
                and "floyen.no" not in p.read_text())]
        check("pages reference no external hosts beyond cited sources",
              not bad, str(bad))

    finally:
        for f_ in backup.glob("*.json"):
            shutil.copy(f_, DATA / f_.name)
        subprocess.run(BUILD, capture_output=True, cwd=ROOT)

    print()
    if fails:
        print(f"{len(fails)} FAILED")
        for f_ in fails:
            print("  -", f_)
        sys.exit(1)
    print("all checks passed")


if __name__ == "__main__":
    main()

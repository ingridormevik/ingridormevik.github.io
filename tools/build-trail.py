#!/usr/bin/env python3
"""
Build the physical Trail Mix folklore trail: one QR code and one static page per stop.

    pip install segno
    python3 tools/build-trail.py

Reads   data/route.json, data/history.json, data/folklore.json, data/sources.json
Writes  assets/qr/{stop}.svg      print-resolution QR, error correction H
        trail/{stop}/index.html   the stop page a scan lands on
        trail/index.html          the archive index

Design rules enforced here rather than trusted to authors:

  * RULE 18 GATE. An entry renders its educational text only when
    status == "verified" AND it names a source that is itself verified.
    Anything else renders RESEARCH REQUIRED. Plausible text pasted into an
    unverified entry does not reach the page.

  * FOLKLORE PROVENANCE. A being with local_attestation == null always prints
    "Not attested at this location", generated from the data.

  * FOLKLORE PERMISSION. A stop with folklore_permitted == false cannot carry a
    being. Casting one is a build error, not a review comment.

The URL is the contract. Once a card is printed the slug can never change.
"""

import json
import pathlib
import sys

try:
    import segno
except ImportError:
    sys.exit("segno is required:  pip install segno")

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
BASE_URL = "https://ingridormevik.github.io/trail"

# Error correction H (30%): survives rain, scuffs and a fingerprint, and leaves
# room for a centre glyph. Scale 8 gives a crisp code at 3cm+ in print.
QR_ERROR = "h"
QR_SCALE = 8
QR_BORDER = 4


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def verified_sources(sources):
    return {s["id"] for s in sources["sources"] if s.get("verified")}


def source_map(sources):
    return {s["id"]: s for s in sources["sources"]}


def renders(entry, ok_sources):
    """RULE 18. The single gate every factual claim passes through."""
    return entry.get("status") == "verified" and entry.get("source") in ok_sources


# ---------------------------------------------------------------- rendering

def render_record(entry, smap, ok_sources):
    name = entry.get("display_name_en") or entry.get("display_name_no") or entry["id"]
    era = entry.get("era", "")

    if not renders(entry, ok_sources):
        rq = entry.get("research_id", "")
        return f"""<article class="entry unverified">
  <header><span class="tier">RECORD</span><span class="era">{esc(era)}</span></header>
  <h3>{esc(name)}</h3>
  <p class="research">RESEARCH REQUIRED — this entry has no verified source, so it
  shows no facts. {esc(rq and 'Queue: ' + rq or '')}</p>
</article>"""

    src = smap[entry["source"]]
    text_en = entry.get("educational_text_en", "")
    text_no = entry.get("educational_text_no", "")
    no_block = f'<p lang="no" class="no">{esc(text_no)}</p>' if text_no else ""

    return f"""<article class="entry documented">
  <header><span class="tier">RECORD</span><span class="era">{esc(era)}</span></header>
  <h3>{esc(name)}</h3>
  <p>{esc(text_en)}</p>
  {no_block}
  <p class="source">Source: <a href="{esc(src['url'])}" rel="noreferrer">{esc(src['title'])}</a>,
  {esc(src['publisher'])} · checked {esc(src.get('verified_date', ''))}</p>
</article>"""


def render_being(being, portrait=None):
    """A being's card. The attestation line is generated, never authored."""
    name = being.get("display_name_en") or being["id"]
    pic = (f'<img class="portrait" src="/{esc(portrait)}" alt="{esc(name)}, '
           f'artistic interpretation">' if portrait else "")
    fn = being.get("narrative_function", "")
    care = being.get("care", "")

    if being.get("local_attestation"):
        att = f'<p class="attest ok">Attested at this location: {esc(being["local_attestation"])}</p>'
    else:
        att = ('<p class="attest">Not attested at this location — '
               "Mount Media interpretation.</p>")

    if being.get("tradition_source"):
        trad = f'<p class="source">Tradition documented in: {esc(being["tradition_source"])}</p>'
    else:
        trad = ('<p class="research">RESEARCH REQUIRED — the tradition itself is not yet '
                "sourced, so no folk material is shown.</p>")

    body = f"<p>{esc(fn)}</p>" if fn else ""
    care_block = f'<p class="care">{esc(care)}</p>' if care else ""

    return f"""<article class="entry imagined">
  <header><span class="tier">STORY</span><span class="era">interpretation</span></header>
  <h3>{esc(name)}</h3>
  {pic}
  {att}
  {body}
  {care_block}
  {trad}
</article>"""


SHARED_CSS = """
:root{--bg:#f4f1ea;--ink:#1b1a17;--dim:#5d574c;--rule:#cdc5b4;--doc:#2f5d50;
--img:#6b4a7a;--warn:#8a5a1e;--card:#fffdf8;}
:root:not([data-theme=light]) {}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){
--bg:#14130f;--ink:#ece7db;--dim:#a09883;--rule:#3a3630;--doc:#8fd3bd;
--img:#c9a9d8;--warn:#e0a95e;--card:#1d1b16;}}
:root[data-theme=dark]{--bg:#14130f;--ink:#ece7db;--dim:#a09883;--rule:#3a3630;
--doc:#8fd3bd;--img:#c9a9d8;--warn:#e0a95e;--card:#1d1b16;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.6 ui-serif,Georgia,'Times New Roman',serif;
padding:1.25rem;max-width:38rem;margin-inline:auto;}
.chapter{font:600 .72rem/1 ui-sans-serif,system-ui;letter-spacing:.14em;
text-transform:uppercase;color:var(--dim);}
h1{font-size:1.7rem;line-height:1.15;margin:.35rem 0 .2rem;}
.role{color:var(--dim);margin:0 0 1.5rem;font-style:italic;}
.entry{background:var(--card);border:1px solid var(--rule);border-left-width:4px;
border-radius:3px;padding:.9rem 1rem;margin:0 0 1rem;}
.entry.documented{border-left-color:var(--doc);}
.entry.imagined{border-left-color:var(--img);}
.entry.unverified{border-left-color:var(--warn);}
.entry header{display:flex;justify-content:space-between;gap:1rem;
font:600 .68rem/1 ui-sans-serif,system-ui;letter-spacing:.12em;color:var(--dim);}
.entry h3{font-size:1.05rem;margin:.5rem 0 .45rem;}
.entry p{margin:.45rem 0;}
.no{color:var(--dim);font-size:.92rem;}
.source{font-size:.8rem;color:var(--dim);}
.source a{color:inherit;}
.research{font:600 .8rem/1.5 ui-sans-serif,system-ui;color:var(--warn);}
.attest{font:600 .8rem/1.5 ui-sans-serif,system-ui;color:var(--img);}
.attest.ok{color:var(--doc);}
.care{font-size:.85rem;color:var(--dim);}
details.story{margin:0 0 1rem;}
details.story>summary{cursor:pointer;font:600 .8rem/1 ui-sans-serif,system-ui;
letter-spacing:.1em;text-transform:uppercase;color:var(--img);
padding:.85rem 1rem;background:var(--card);border:1px dashed var(--img);
border-radius:3px;}
hr{border:0;border-top:1px solid var(--rule);margin:1.6rem 0;}
.next{display:block;padding:.9rem 1rem;background:var(--card);
border:1px solid var(--rule);border-radius:3px;color:inherit;text-decoration:none;}
.next b{display:block;font-size:1.05rem;}
footer{margin-top:2rem;font-size:.78rem;color:var(--dim);}
footer a{color:inherit;}
.saved{font:600 .75rem/1 ui-sans-serif,system-ui;color:var(--doc);
letter-spacing:.08em;text-transform:uppercase;margin:0 0 1rem;}
.banner{width:100%;height:auto;display:block;border:1px solid var(--rule);
border-radius:3px;margin:0 0 1rem;image-rendering:auto;}
.banner-note{font-size:.7rem;color:var(--dim);margin:-.75rem 0 1.25rem;}
.portrait{float:right;width:5.5rem;height:auto;margin:0 0 .5rem .8rem;
border:1px solid var(--rule);border-radius:2px;}
.entry.imagined::after{content:"";display:block;clear:both;}
"""

# Standing at the place is the collection. Loading the page writes its records
# into the same localStorage key the game reads, so the walk and the game share
# one archive with no server and no account.
ARCHIVE_JS = """
(function(){
  var KEY='trailmix.archive.v1', stop=%s, ids=%s;
  var a;
  try{ a=JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ a={}; }
  a.entries=a.entries||[]; a.scanned=a.scanned||{}; a.walks=a.walks||0;
  var added=0;
  ids.forEach(function(id){ if(a.entries.indexOf(id)<0){ a.entries.push(id); added++; } });
  if(!a.scanned[stop]) a.scanned[stop]=new Date().toISOString();
  try{ localStorage.setItem(KEY,JSON.stringify(a)); }catch(e){}
  var n=document.getElementById('saved');
  if(n) n.textContent = added
    ? added+' new entr'+(added===1?'y':'ies')+' added to your Trail Archive'
    : 'Already in your Trail Archive';
})();
"""


def page(title, body, stop_id, entry_ids):
    js = ARCHIVE_JS % (json.dumps(stop_id), json.dumps(entry_ids))
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} — Trail Mix</title>
<style>{SHARED_CSS}</style>
</head><body>
{body}
<script>{js}</script>
</body></html>
"""


# ---------------------------------------------------------------- print

PRINT_CSS = """
@page{size:A6 portrait;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#666;font:11pt/1.45 ui-serif,Georgia,serif;color:#111}
.card{width:105mm;height:148mm;padding:9mm 8mm;background:#fff;
page-break-after:always;display:flex;flex-direction:column;margin:0 auto 6mm;
position:relative;}
.card .ch{font:600 7pt/1 ui-sans-serif,system-ui;letter-spacing:.16em;
text-transform:uppercase;color:#555}
.card h2{font-size:16pt;line-height:1.1;margin:2mm 0 1mm}
.card .role{font-style:italic;color:#555;margin:0 0 4mm;font-size:9pt}
.rec{margin:0 0 3mm}
.rec .era{font:600 7.5pt/1 ui-sans-serif,system-ui;letter-spacing:.1em;color:#2f5d50}
.rec h3{font-size:10pt;margin:.8mm 0}
.rec p{margin:.8mm 0;font-size:9pt}
.rec .src{font-size:6.5pt;color:#666}
.gap{flex:1}
.foot{display:flex;gap:4mm;align-items:flex-end;border-top:.4mm solid #ccc;
padding-top:3mm}
.foot img{width:26mm;height:26mm;display:block}
.foot .u{font:8pt/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;
word-break:break-all;color:#222}
.foot .hint{font-size:7pt;color:#666;margin:1mm 0 0}
.rub{position:absolute;right:8mm;top:9mm;width:14mm;height:14mm;
border:.4mm dashed #999;border-radius:1mm}
.blank{font-size:8pt;color:#777;font-style:italic}
@media screen{body{padding:8mm 0}}
"""


def build_print_sheet(route, history, smap, ok, stop_by_id, chapter_by_id):
    """A6 cards, one per stop. The RECORD is printed in ink so the trail survives
    a dead phone and no signal. The QR is for the story, the sound and the archive
    — never for the fact."""
    cards = []
    for stop in route["stops"]:
        sid = stop["id"]
        ch = chapter_by_id.get(sid, {})
        recs = []
        for e in history["entries"]:
            if e.get("stop") != sid:
                continue
            nm = e.get("display_name_en") or e["id"]
            if not renders(e, ok):
                recs.append(f'<div class="rec"><div class="era">{esc(e.get("era") or "—")}</div>'
                            f'<h3>{esc(nm)}</h3>'
                            f'<p class="blank">Research in progress. This card carries no '
                            f'claim until the archive is checked.</p></div>')
                continue
            src = smap[e["source"]]
            recs.append(f'<div class="rec"><div class="era">{esc(e.get("era",""))}</div>'
                        f'<h3>{esc(nm)}</h3>'
                        f'<p>{esc(e.get("educational_text_en",""))}</p>'
                        f'<p class="src">{esc(src["title"])}, {esc(src["publisher"])}</p></div>')

        qr = (ROOT / "assets" / "qr" / f"{sid}.svg").read_text(encoding="utf-8")
        import base64
        qr64 = base64.b64encode(qr.encode()).decode()

        cards.append(f"""<section class="card">
<div class="rub"></div>
<div class="ch">Chapter {ch.get('n','')} · {esc(ch.get('theme',''))}</div>
<h2>{esc(stop.get('title_no') or stop['title_en'])}</h2>
<p class="role">{esc(stop.get('scene_role',''))}</p>
{''.join(recs)}
<div class="gap"></div>
<div class="foot">
  <img src="data:image/svg+xml;base64,{qr64}" alt="QR code to {esc(sid)}">
  <div>
    <div class="u">ingridormevik.github.io<br>/trail/{esc(sid)}</div>
    <p class="hint">Scan for the story, the sound and your archive.
    The history above is already here — you do not need a phone to read it.</p>
  </div>
</div>
</section>""")

    html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trail Mix — printable trail cards</title>
<style>{PRINT_CSS}</style></head>
<body>{''.join(cards)}</body></html>
"""
    (ROOT / "trail" / "print.html").write_text(html, encoding="utf-8")


# ---------------------------------------------------------------- build

def main():
    route = load("route.json")
    history = load("history.json")
    folklore = load("folklore.json")
    sources = load("sources.json")

    ok = verified_sources(sources)
    smap = source_map(sources)

    beings = {b["id"]: b for b in folklore["beings"]}

    # Art cut by tools/build-pack-v2.py. Quarantined art is absent from this
    # registry by construction, so a banned panel cannot reach a page.
    pack_file = DATA / "pack-v2.json"
    banners, portraits = {}, {}
    if pack_file.exists():
        pack = json.loads(pack_file.read_text(encoding="utf-8"))
        banners = {l["stop"]: l["asset"] for l in pack["locations"] if l.get("stop")}
        portraits = {f["id"]: f["asset"] for f in pack["folklore"]}
    stops = route["stops"]
    stop_by_id = {s["id"]: s for s in stops}
    chapter_by_id = {c["id"]: c for c in route["chapters"]}

    # Folklore permission is a build-time check.
    for b in folklore["beings"]:
        at = b.get("cast_at")
        if at and not stop_by_id.get(at, {}).get("folklore_permitted", False):
            sys.exit(f"BUILD ERROR: being '{b['id']}' is cast at '{at}', "
                     f"which is folklore_permitted:false. Refusing to build.")

    (ROOT / "assets" / "qr").mkdir(parents=True, exist_ok=True)

    built, gated = 0, 0
    for stop in stops:
        sid = stop["id"]
        url = f"{BASE_URL}/{sid}/"
        ch = chapter_by_id.get(sid, {})

        segno.make(url, error=QR_ERROR).save(
            str(ROOT / "assets" / "qr" / f"{sid}.svg"),
            scale=QR_SCALE, border=QR_BORDER, dark="#1b1a17", light="#ffffff")

        entries = [e for e in history["entries"] if e.get("stop") == sid]
        entry_ids = [e["id"] for e in entries]
        gated += sum(1 for e in entries if not renders(e, ok))

        records = "\n".join(render_record(e, smap, ok) for e in entries) \
            or '<p class="research">No archive entries for this stop yet.</p>'

        being = next((b for b in beings.values() if b.get("cast_at") == sid), None)
        if being:
            # STORY sits below the RECORD, behind a disclosure, so the record is
            # always read first — the same order the game enforces by unlocking.
            story = (f'<details class="story"><summary>A story grew here — open it '
                     f'after the record</summary>\n'
                     f'{render_being(being, portraits.get(being["id"]))}\n</details>')
        elif stop.get("folklore_permitted") is False:
            story = (f'<p class="care">No folklore is told at this stop. '
                     f'{esc(stop.get("folklore_ban_reason", ""))}</p>')
        else:
            story = ""

        nxt = stop.get("next")
        if nxt:
            nt = stop_by_id[nxt]
            nav = (f'<a class="next" href="../{esc(nxt)}/">Next stop →<b>'
                   f'{esc(nt.get("title_no") or nt["title_en"])}</b></a>')
        else:
            nav = ('<a class="next" href="../">You have reached the last stop →'
                   '<b>Open the full Trail Archive</b></a>')

        if sid in banners:
            banner = (f'<img class="banner" src="/{esc(banners[sid])}" '
                      f'alt="{esc(stop.get("title_no") or stop["title_en"])}, '
                      f'painted interpretation">'
                      f'<p class="banner-note">Concept art — a painted '
                      f'interpretation, not a photograph of the site.</p>')
        else:
            banner = ""

        body = f"""<p class="chapter">Chapter {ch.get('n','')} · {esc(ch.get('theme',''))}</p>
<h1>{esc(stop.get('title_no') or stop['title_en'])}</h1>
<p class="role">{esc(stop.get('scene_role',''))}</p>
{banner}
<p class="saved" id="saved"></p>
{records}
{story}
<hr>
{nav}
<footer>Trail Mix — Mount Media × Preem Cast ·
<a href="../../trail-mix-v2.html">play the game</a> ·
this page works offline and makes no external requests</footer>"""

        out = ROOT / "trail" / sid
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(
            page(stop.get("title_no") or stop["title_en"], body, sid, entry_ids),
            encoding="utf-8")
        built += 1

    # Index
    rows = []
    for s in stops:
        ch = chapter_by_id.get(s["id"], {})
        rows.append(f'<a class="next" href="{esc(s["id"])}/">Chapter {ch.get("n","")} · '
                    f'{esc(ch.get("theme",""))}<b>'
                    f'{esc(s.get("title_no") or s["title_en"])}</b></a>')
    q = len(sources["research_queue"])
    index_body = f"""<p class="chapter">Mount Media × Preem Cast</p>
<h1>The Trail Mix folklore trail</h1>
<p class="role">Six stops between Sandviken and Fløyen. Scan them on the mountain,
or read them here.</p>
{"".join(rows)}
<hr>
<p class="research">{q} entries are still waiting on archive research and show no
facts until someone with access to Bergen Byarkiv checks them.</p>
<footer>Trail Mix — Mount Media × Preem Cast ·
<a href="../trail-mix-v2.html">play the game</a></footer>"""
    (ROOT / "trail").mkdir(exist_ok=True)
    (ROOT / "trail" / "index.html").write_text(
        page("The folklore trail", index_body, "index", []), encoding="utf-8")

    build_print_sheet(route, history, smap, ok, stop_by_id, chapter_by_id)

    print(f"built {built} stop pages + index + print sheet")
    print(f"{gated} entries gated by rule 18 (no verified source → no facts shown)")
    print(f"qr codes: assets/qr/*.svg  →  {BASE_URL}/<stop>/")


if __name__ == "__main__":
    main()

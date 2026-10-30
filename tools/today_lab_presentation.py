"""Illustrate the existing Friday routes without changing lesson copy or controls."""
from pathlib import Path
from bs4 import BeautifulSoup


INK = '#101722'


def scene(kind):
    """Original, text-free SVG props, shared by the route map and its workbenches."""
    start = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 230" width="360" height="230" aria-hidden="true" focusable="false" class="tl-mini-scene tl-scene-{kind}">
<path d="M25 191 180 219l155-28-155-35Z" fill="#101722"/>
<path d="M25 175 180 203l155-28-155-35Z" fill="#53675d" stroke="{INK}" stroke-width="4"/>
<path d="m25 175 155 28 155-28v15l-155 28-155-28Z" fill="#31463e" stroke="{INK}" stroke-width="4"/>
<g stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">'''
    end = '''</g><g fill="#a3b89a"><circle cx="40" cy="140" r="2"/><circle cx="317" cy="82" r="3"/><path d="m51 58 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g></svg>'''
    if kind == 'build':
        body = '''<path d="M70 139h218v19H70z" fill="#c29a65"/><path d="M84 159v35m190-35v35" fill="none" stroke-width="8"/>
<path d="M100 63q0-10 10-10h125q10 0 10 10v74H100Z" fill="#9aafa0"/><path d="M111 65h122v57H111Z" fill="#203c42"/>
<g stroke="#cfed88" stroke-width="4"><path d="m124 78 9 7-9 7m23-8h51m-73 21h62" fill="none"/><path class="tl-cursor" d="M197 105h13"/></g>
<path d="M154 138v-11h40v11m-74 8h105" fill="none"/>
<path d="M73 139v-25l-17-12 12-30m-10-4 20 7" fill="none" stroke="#e6b85d" stroke-width="7"/><path d="m60 67 21-27 21 13-24 25Z" fill="#dfbf72"/>
<path d="M253 134v-30h20v30m-27 1h35" fill="#6e638e"/><path d="M257 101v-9m12 9v-9" stroke="#e3cd91"/>
<path d="M273 68v-9l8-7" fill="none" stroke="#c4df8d"/>
<path d="M254 82q0-16 18-16t18 16q0 16-18 16t-18-16Z" fill="#edaa5f"/><path d="m262 80 5-5 4 5m6 0 5-5 3 5m-18 7h13" fill="none" stroke-width="2"/>
<path d="m73 164 34 6-14 12-32-7Z" fill="#d7e2cc"/>
<path d="M128 185h41m38 6h18" stroke="#8ba278" stroke-width="2"/>'''
    elif kind == 'browse':
        body = '''<path d="M68 48h144v127H68Z" fill="#735b7d"/><path d="M77 86h126M77 128h126M77 171h126" stroke="#c6a171" stroke-width="7"/>
<path d="M80 56h16v27H80Z" fill="#d8bc6c"/><path d="M99 53h12v30H99Z" fill="#acd295"/><path d="M115 60h16v23h-16Z" fill="#80c1c9"/><path d="m140 56 14-5 11 28-14 5Z" fill="#dd96ad"/><path d="M170 54h23v29h-23Z" fill="#cec29f"/>
<path d="M81 97h19v28H81Z" fill="#85bec4"/><path d="M104 92h12v33h-12Z" fill="#e1a963"/><path d="M122 99h22v26h-22Z" fill="#c3df87"/><path d="M152 94h12v31h-12Z" fill="#e8d8b1"/><path d="m172 99 14-4 9 26-14 4Z" fill="#a698c8"/>
<path d="M81 141h18v27H81Z" fill="#dd96ad"/><path d="M103 137h22v31h-22Z" fill="#d8bc6c"/><path d="M130 141h11v27h-11Z" fill="#c3df87"/><path d="M148 139h22v29h-22Z" fill="#80c1c9"/><path d="M177 145h17v23h-17Z" fill="#e8d8b1"/>
<path d="m193 83-28 107m46-104-28 108m-12-26 17 4m-10-31 17 4m-10-30 17 4" fill="none" stroke="#d6b581" stroke-width="5"/>
<g class="tl-ghost"><path d="M242 106q-19-30 6-43 26-12 33 13 6 23 22 29l-15 5-11-6-9 11-10-9Z" fill="#e9e5cb"/><path d="M254 80v5m12-9v5" stroke-width="3"/></g>
<path d="m222 160 24-5 10 27-24 6Z" fill="#b7d683"/><path d="m247 153 16 2 7 27-14 1Z" fill="#e9dbb5"/>
<path d="M288 144v-22m-9 0h18" stroke="#c6b88d"/><path d="M285 116q-6-10 3-19 9 12 2 20" fill="#eeb66d" stroke-width="2"/>'''
    elif kind == 'notice':
        body = '''<path d="M77 138h207v19H77Z" fill="#b18d65"/><path d="M91 158v36m179-36v36" stroke-width="7"/>
<path d="m104 118 51-10 40 11-6 29-43-10-48 8Z" fill="#e9dfbe"/><path d="m148 116-2 21m-35-10 23-4m-25 14 23-4m30-10 21 4m-23 5 21 5" fill="none" stroke="#7d826c" stroke-width="2"/>
<path d="m204 89 44 56" stroke="#b5d697" stroke-width="15"/>
<circle cx="180" cy="64" r="43" fill="#a3c5be"/><circle cx="180" cy="64" r="33" fill="#284a4b"/>
<path d="M164 55h30v21h-30Z" fill="#8cb3a0"/><path d="m171 65 5 5 11-12" fill="none" stroke="#dbedb2" stroke-width="3"/>
<path d="m158 40 12-6" stroke="#e0edcc" stroke-width="4"/>
<path d="M264 122v-21l17-11m-5-6 11 12" fill="none" stroke="#dda66e" stroke-width="6"/>
<circle cx="78" cy="87" r="14" fill="#dcaa69"/><path d="M78 80v7l5 4" fill="none" stroke-width="2"/>
<path d="M210 177h18m12 3h25" stroke="#8ba278" stroke-width="2"/>'''
    elif kind == 'mix':
        body = '''<path d="M78 167V76a55 55 0 0 1 110 0v91Z" fill="#88749a"/><path d="M91 165V77a42 42 0 0 1 84 0v88Z" fill="#213e44"/>
<path d="M110 65h44v30h-44Z" fill="#9eb8a4"/><path d="M119 73h26v14h-26Z" fill="#335a52"/><path d="m124 78 4 3-4 3" fill="none" stroke="#d5ec9c" stroke-width="2"/>
<path d="m107 111 22-4 24 4v24l-24-5-22 5Z" fill="#e7d6a8"/><path d="M129 107v23" fill="none" stroke-width="2"/>
<path d="M91 167h83l29 21h-142Z" fill="#c8d598"/>
<path d="M241 173V87m-28 86V94m-13-5 40-29 47 29-47 29Z" fill="#d9ad69"/>
<path d="m240 66 38 23-38 23-32-23Z" fill="#81aca1"/>
<path d="M240 117v57m-15 2 15-2 14 6m-16-32 9 2" fill="none"/>
<path d="m178 148 17 5 13-10 17 7" fill="none" stroke="#d5e79b" stroke-width="3" stroke-dasharray="4 7"/>
<circle class="tl-orbit" cx="228" cy="42" r="9" fill="#e6bc72"/>
<path d="m278 142 15 6 15-6v24l-15 7-15-7Z" fill="#a8cc93"/><path d="M293 148v24" fill="none" stroke-width="2"/>'''
    else:  # Bringing a book's idea back to the creation.
        body = '''<path d="M86 147h189v19H86Z" fill="#c39d6b"/><path d="M100 167v27m160-27v27" stroke-width="7"/>
<path d="M106 66h99v77h-99Z" fill="#a8b99d"/><path d="M118 78h75v51h-75Z" fill="#294649"/><path d="M145 91h22v26h-22Z" fill="#b3cb91"/><path d="m149 94 14 5v18l-14-4Z" fill="#806590"/>
<path d="M144 144v-10h26v10m-37 9h51" fill="none"/>
<path d="m222 116 20-7 23 5v32l-23-5-20 7Z" fill="#ece0ba"/><path d="M242 109v32m-13-18 8-3m10-1 10 2m-10 7 10 2" fill="none" stroke-width="2"/>
<path d="M220 80q26-44 60-14m-13-1 14 1-3-14" fill="none" stroke="#d4ba7d" stroke-width="4"/>
<path d="M274 123q38-23 11-41m6 13-6-14 14 1" fill="none" stroke="#b9d88c" stroke-width="4"/>
<g class="tl-orbit"><circle cx="244" cy="49" r="9" fill="#d9b369"/><path d="M244 31v-6m0 48v-6m18-18h6m-48 0h6" stroke="#c2d49d" stroke-width="2"/></g>
<path d="m67 170 8-5 11 3m193 10 13-4" fill="none" stroke="#8ba278" stroke-width="2"/>'''
    return start + body + end


def art(page, kind, class_name):
    wrapper = page.new_tag('span', attrs={'class': class_name, 'aria-hidden': 'true'})
    wrapper.append(BeautifulSoup(scene(kind), 'html.parser').svg)
    return wrapper


def decorate(page, library=False):
    """Only decorative nodes, presentational classes and one scoped stylesheet."""
    for old in page.select('.tl-art,link[href^="today-lab.css"]'):
        old.decompose()
    if library:
        session_style = page.select_one('link[href^="library-session.css"]')
        session_script = page.select_one('script[src^="library-session.js"]')
        if session_style and session_script:
            session_style.extract()
            session_script.insert_before(session_style)
        for link, kind in zip(page.select('.ls-room-map > a'), ['build', 'notice', 'browse', 'meaning']):
            link.insert(0, art(page, kind, 'tl-art tl-room-art'))
        for panel, kind in zip(page.select('[data-ls-panel]'), ['build', 'notice', 'browse', 'meaning']):
            panel.insert(0, art(page, kind, 'tl-art tl-panel-art'))
    else:
        for button in page.select('[data-hl-route]'):
            button.insert(0, art(page, button['data-hl-route'], 'tl-art tl-route-art'))
        for plan in page.select('[data-hl-plan]'):
            plan.insert(0, art(page, plan['data-hl-plan'], 'tl-art tl-plan-art'))
        for station, kind in zip(page.select('#lab-5 .pv-stations > article'), ['build', 'browse', 'mix']):
            station.insert(0, art(page, kind, 'tl-art tl-station-art'))
    # Later legacy lab styles must not overwrite this presentation. Accessibility stays last.
    access = page.select_one('link[href^="accessibility.css"]')
    wayfinding = page.select_one('link[href^="lab-wayfinding.css"]')
    if access:
        access.extract()
    if wayfinding:
        wayfinding.extract()
    page.head.append(page.new_tag('link', rel='stylesheet', href='today-lab.css?v=1'))
    if wayfinding:
        page.head.append(wayfinding)
    if access:
        page.head.append(access)


def build(root):
    paths = []
    for name in ['lab-programme.html', 'academic-library.html']:
        path = root / 'labs' / name
        paths.append(path)
        page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        decorate(page, library=name == 'academic-library.html')
        path.write_text(str(page), encoding='utf-8', newline='\n')
    from lab_links import apply as lab_links
    lab_links(root, paths)


if __name__ == '__main__':
    build(Path(__file__).resolve().parents[1])

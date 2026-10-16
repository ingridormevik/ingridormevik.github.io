"""An example-led entrance to the broader genre reference."""
from bs4 import BeautifulSoup
from html import escape
from urllib.parse import quote
from genre_atlas import ROWS
from project_routes import PRACTICE

FAMILIES = [('play','Play and gameworlds',[1,7,8,20,21,22,35]),('words','Words and stories',[0,2,3,23,24,25,26,27,31]),('screen','Images and screens',[9,10,11,36,37,38,39]),('sound','Sound and performance',[13,28,29]),('network','People and networks',[5,6,15,16,40,41,43]),('space','Places and immersive worlds',[4,12,14,17,18,19,30,42]),('use','Apps, tools and services',[32,33,34])]

def explore(root):
    path=root / 'labs/academic-library.html'
    s=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    html='''<section class="al-reading ge-explorer" id="genre-explorer"><p class="al-tag">RESEARCH LAB / EXPLORE YOUR OPTIONS</p><h2>What would you like someone to do?</h2><p>Play? Read? Listen? Explore a place? Start with the experience you want to make. Pick a shelf, then open a card that sounds close. You can mix shelves and change your mind.</p><nav class="ge-filters" aria-label="Explore project families"><button type="button" data-ge-filter="all" aria-pressed="false">All shelves</button>'''
    for key,label,_ in FAMILIES:
        pressed = 'true' if key == 'play' else 'false'
        html+=f'<button type="button" data-ge-filter="{key}" aria-pressed="{pressed}">{escape(label)}</button>'
    html+=f'</nav><p id="ge-count" role="status">{len(ROWS)} forms and practices to explore</p><div class="ge-cards">'
    for family,label,indices in FAMILIES:
        for index in indices:
            clue,term,kind,keywords,fields,question=ROWS[index]
            build,test=PRACTICE[index]
            query='https://oria.no/?query=any,contains,'+quote(keywords)
            html+=f'''<details class="ge-card" data-ge-family="{family}" id="genre-route-{index}"><summary><span class="al-tag">{escape(label)}</span><strong>{escape(term)}</strong><span class="ge-clue">{escape(clue)}</span><span class="ge-open">Open the making + research route</span></summary><div class="ge-card-body"><div class="ge-prototype"><p><strong>Start small:</strong> {escape(build)}</p><p><strong>Try it out:</strong> {escape(test)}</p></div><p><strong>What kind of label?</strong> {escape(kind)}.</p><p><strong>Research question:</strong> {escape(question)}</p><p><strong>Fields you could connect:</strong> {escape(fields)}.</p><p><strong>Search words:</strong> <code>{escape(keywords)}</code></p><a href="{escape(query)}" target="_blank" rel="noopener">Search for research in Oria ↗</a><p><a href="#course-workbench">Connect making, research and your DIKULT105 learning</a></p></div></details>'''
    html+='''</div><section class="ge-mix"><p class="al-tag">MIX YOUR OWN ROUTE</p><h3>A genre label is a starting point, not a box.</h3><p>A Pride Park project might be an exploration game about belonging. If reading and digital language are central, e-lit research may also help. If it unfolds across a game, social posts and a physical event, investigate transmedia storytelling too.</p><p>Say what is actually present in the work. A topic you care about does not, by itself, decide the genre.</p><div class="al-table-scroll" tabindex="0" role="region" aria-label="Different kinds of project labels"><table><caption>Four questions. Four kinds of label.</caption><thead><tr><th scope="col">Question</th><th scope="col">Examples</th></tr></thead><tbody><tr><th scope="row">What form does it take?</th><td>Game, poem, documentary, comic, podcast.</td></tr><tr><th scope="row">How does it work?</th><td>Branching paths, generated text, simulation, live participation.</td></tr><tr><th scope="row">What is its tone or story tradition?</th><td>Horror, romance, comedy, fantasy, science fiction, memoir.</td></tr><tr><th scope="row">What do you want to investigate?</th><td>Belonging, climate, gender, memory, power, accessibility.</td></tr></tbody></table></div><p>For games, narrow the search when useful: action, adventure, role-playing, strategy, simulation, puzzle, rhythm, sports or racing. These can overlap too. A horror story might use a puzzle game, a podcast or a visual novel.</p><p><strong>Build a search:</strong> one form + one question. Try <code>exploration games belonging</code>, <code>podcast identity</code> or <code>digital poetry memory</code>. Start broad, then follow terms you find in scholarship.</p></section><section><h3>See actual works before choosing a name.</h3><p><a href="https://collection.eliterature.org/4/filters" target="_blank" rel="noopener">Electronic Literature Collection: works and tags</a> · <a href="https://artbase.rhizome.org/" target="_blank" rel="noopener">Rhizome ArtBase: digital artworks</a> · <a href="https://docubase.mit.edu/" target="_blank" rel="noopener">MIT Docubase: documentary experiments</a> · <a href="https://glossary.cdn.uib.no/" target="_blank" rel="noopener">Living Glossary: unfamiliar terms</a></p><p>These collections help you discover works and terms. Use academic scholarship to support your argument. Older digital works may need emulation or may no longer run in your browser.</p><p>This is a broad, expandable teaching map, not a claim to list every digital-cultural genre. Suggested combinations are from the lab; the reference collections use their own categories.</p><a href="#sources">Next: find an academic source →</a></section></section>'''
    s.select_one('#research-finder').insert_before(BeautifulSoup(html,'html.parser').find())
    explorer=s.select_one('#genre-explorer')
    explorer.select_one('#ge-count').insert_after(BeautifulSoup('<p class="ge-practice-note">The small builds below are ideas to practise with, not assignment requirements. A genre can combine several shelves. Start with one action you can make and test.</p>','html.parser').find())
    for card in explorer.select('.ge-card'):
        index=int(card['id'].rsplit('-',1)[1])
        query='https://scholar.google.com/scholar?q='+quote(' '.join(ROWS[index][3].split()[:3]))
        link=s.new_tag('a',href=query,target='_blank',rel='noopener')
        link.string='Try a shorter search in Google Scholar ↗'
        paragraph=s.new_tag('p');paragraph.append(link)
        card.select_one('.ge-card-body > a').insert_after(paragraph)
    explorer.select_one('section:last-child > p').append(BeautifulSoup(' · <a href="https://ars.electronica.art/prix/en/categories/" target="_blank" rel="noopener">Ars Electronica: art, technology and society</a>','html.parser'))
    atlas=s.select_one('#genre-atlas')
    drawer=s.new_tag('details',attrs={'class':'ge-full-table'})
    summary=s.new_tag('summary');summary.string=f'Open the full comparison table: all {len(ROWS)} routes'
    drawer.append(summary);atlas.replace_with(drawer);drawer.append(atlas)
    for a in s.select('.al-hero nav a'):
        if a.get('href')=='#genre-atlas': a['href']='#genre-explorer';a.string='Explore forms and genres'
    s.head.append(BeautifulSoup('<link rel="stylesheet" href="genre-explorer.css?v=2"/><script defer src="genre-explorer.js?v=2"></script>','html.parser'))
    path.write_text(str(s),encoding='utf-8',newline='\n')

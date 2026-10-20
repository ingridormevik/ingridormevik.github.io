"""Research made in Bergen: electronic literature genres, machine vision and AI stories.

Runs last in the academic library chain. Safe to run again: it replaces its own section
and only adds books that are not already on the shelf.
"""
from bs4 import BeautifulSoup
from html import escape
from urllib.parse import quote

ELIT = [  # Scott Rettberg's genres (Electronic Literature, Polity 2019) and the matching routes in the explorer
 ('Combinatory poetics', 'Rules recombine words, so the text changes.', 'genre-route-2', 'Generative poetry'),
 ('Hypertext fiction', 'Linked pieces; the reader\'s path makes the plot.', 'genre-route-0', 'Hypertext'),
 ('Interactive fiction and other gamelike forms', 'The reader acts in a world of text and rules.', 'genre-route-1', 'Interactive fiction'),
 ('Kinetic and interactive poetry', 'Words move and respond; timing makes meaning.', 'genre-route-3', 'Digital poetry'),
 ('Network writing', 'Writing with and through networks, platforms and many voices.', 'genre-route-5', 'Netprov'),
]

BOOKS = [
 ('Electronic Literature', 'Scott Rettberg', 'Polity · 2019', 'Electronic literature',
  'https://elmcip.net/node/13149', 'ELMCIP record',
  'A survey of the main genres of electronic literature, from combinatory poetics and hypertext fiction to interactive fiction, kinetic poetry and network writing, in their historical and technical contexts. Winner of the 2019 N. Katherine Hayles Award.',
  'Which of the genres is closest to what your visitor does? Name it, then explain how your work changes it.', 'academic-library.html#bergen-research', ''),
 ('Machine Vision: How Algorithms Are Changing the Way We See the World', 'Jill Walker Rettberg', 'Polity · 2023', 'Machine vision',
  'https://jilltxt.net/book/machine-vision-how-algorithms-are-changing-the-way-we-see-the-world/', 'Open access: read it free',
  'How cameras, filters, surveillance and image recognition change how we see, with examples from art, games and science fiction.',
  'Does your work see the visitor, or show a seeing machine? Who is seen, and who decides what the machine sees?', 'academic-library.html#bergen-research', ''),
]

CHICAGO = [
 'Rettberg, Scott. 2019. <i>Electronic Literature</i>. Cambridge: Polity.',
 'Rettberg, Jill Walker. 2023. <i>Machine Vision: How Algorithms Are Changing the Way We See the World</i>. Cambridge: Polity.',
 'Aarseth, Espen J. 1997. <i>Cybertext: Perspectives on Ergodic Literature</i>. Baltimore: Johns Hopkins University Press.',
 'Miller, Carolyn R. 1984. "Genre as Social Action." <i>Quarterly Journal of Speech</i> 70 (2): 151-67.',
]


def card(tag, title, clue, body, colour):
    return (f'<details class="br-card" style="border-top-color:{colour}"><summary><span class="al-tag">{escape(tag)}</span>'
            f'<strong>{title}</strong><span class="br-clue">{clue}</span><span class="br-open">Open the research route</span></summary>'
            f'<div class="br-card-body">{body}</div></details>')


def section():
    elit = ''.join(f'<li><a href="#{rid}"><b>{escape(name)}</b></a> · {escape(what)} <span class="br-route">Route: {escape(route)} →</span></li>'
                   for name, what, rid, route in ELIT)
    cards = ''.join([
      card('Electronic literature · Scott Rettberg', 'Which electronic literature genre is yours?',
           'Five genres from <i>Electronic Literature</i> (Polity 2019). Each opens a making and research route.',
           f'<ul class="br-list">{elit}</ul>'
           '<p><strong>Try it out:</strong> Name the closest genre, then one way your project breaks it.</p>'
           '<p><strong>Find works:</strong> <a href="https://elmcip.net/knowledgebase" target="_blank" rel="noopener">ELMCIP Knowledge Base ↗</a> · '
           '<a href="https://collection.eliterature.org/" target="_blank" rel="noopener">Electronic Literature Collection ↗</a></p>',
           '#8b74b1'),
      card('Machine vision · Jill Walker Rettberg', 'Does your work see?',
           'Cameras, filters, tracking, or a story about a seeing machine.',
           '<p><strong>Read:</strong> <a href="https://jilltxt.net/book/machine-vision-how-algorithms-are-changing-the-way-we-see-the-world/" target="_blank" rel="noopener"><i>Machine Vision</i> (Polity 2023), open access ↗</a></p>'
           '<p><strong>Find works:</strong> <a href="https://machine-vision.no/" target="_blank" rel="noopener">Machine Vision in Art, Games and Narratives ↗</a>, a database of 500 artworks, games and narratives from her ERC project (2018-2023).</p>'
           '<p><strong>Research question:</strong> Who is seen, who is doing the seeing, and who decided what the machine should recognise?</p>'
           '<p><strong>In Construct:</strong> the User Media object uses the camera. Test it with consent, and say what you do with the image.</p>'
           f'<p><strong>Search words:</strong> <code>machine vision art games narrative</code></p><a href="https://oria.no/?query=any,contains,{quote("machine vision algorithms")}" target="_blank" rel="noopener">Search for research in Oria ↗</a>',
           '#579bbf'),
      card('AI and narrative · AI STORIES', 'Did an AI help write it?',
           'Language models, generated text, vibecoding and authorship.',
           '<p><strong>The project:</strong> <a href="https://www.uib.no/en/cdn/169711/ai-stories" target="_blank" rel="noopener">AI STORIES ↗</a>, led by Jill Walker Rettberg (ERC, 2024-2029), asks whether the story patterns in training data shape what large language models tell us.</p>'
           '<p><strong>Research question:</strong> Which story patterns did the model fall back on, and which choices were yours?</p>'
           '<p><strong>Also read:</strong> <i>The Routledge Handbook of AI and Literature</i> on this shelf.</p>'
           '<p><a href="vibecoding.html">Connect it to the vibecoding workshop →</a></p>',
           '#ebbf39'),
      card('Two ideas for your text', 'Effort and action',
           'Concepts that help you explain what your work is, not only how it looks.',
           '<p><strong>Ergodic:</strong> Espen Aarseth (<i>Cybertext</i>, 1997) calls a text ergodic when the reader needs nontrivial effort to get through it. How much work does your visitor do?</p>'
           '<p><strong>Genre as social action:</strong> Carolyn R. Miller (1984) treats genre as what a form does for people in a recurring situation. What does your work do for the person who meets it?</p>'
           '<p><a href="#chicago-author-date">Cite them in Chicago author-date →</a></p>',
           '#afd653'),
    ])
    chicago = ''.join(f'<li>{c}</li>' for c in CHICAGO)
    return BeautifulSoup(
      '<section class="al-reading br-bergen" id="bergen-research"><p class="al-tag">RESEARCH MADE IN BERGEN</p>'
      '<h2>Use the research that happens around you.</h2>'
      '<p>The University of Bergen is one of the world centres for this research. Scott Rettberg leads the '
      '<a href="https://www.uib.no/en/cdn" target="_blank" rel="noopener">Center for Digital Narrative ↗</a>, '
      'and Jill Walker Rettberg leads the AI STORIES project and led the Machine Vision project. Start with the question that fits your project.</p>'
      f'<div class="br-cards">{cards}</div>'
      f'<details class="br-cite"><summary>Ready-made Chicago author-date references</summary><ul>{chicago}</ul>'
      '<p class="al-small">Check the details against the edition you actually read.</p></details></section>',
      'html.parser').find()


def bergen(root):
    path = root / 'labs/academic-library.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    old = s.select_one('#bergen-research')
    if old: old.decompose()
    s.select_one('#genre-explorer').insert_after(section())

    shelf = s.select_one('.al-shelves')
    have = {h.get_text(strip=True) for h in shelf.select('.al-book h2')}
    n = len(shelf.select('.al-book'))
    for title, author, publisher, topic, url, access, desc, prompt, lab, _ in BOOKS:
        if title in have: continue
        n += 1
        search = 'https://oria.no/?query=any,contains,' + quote(title)
        shelf.append(BeautifulSoup(
          f'<section class="al-book" data-topic="{escape(topic)}"><p class="al-tag">{n:02d} / {escape(topic)}</p><h2>{escape(title)}</h2>'
          f'<p class="al-author">{escape(author)}</p><p>{escape(publisher)}</p><p>{escape(desc)}</p>'
          f'<p><a href="{escape(url)}" rel="noopener" target="_blank">{escape(access)} ↗</a> · <a href="{escape(search)}" rel="noopener" target="_blank">Search Oria ↗</a></p>'
          f'<details><summary>Take a question into your project</summary><p>{escape(prompt)}</p><a href="{lab}">Connect this to your project →</a>'
          '<p class="al-small">These are suggested questions from the lab, not quotations from the book.</p></details></section>', 'html.parser').find())
    topic = s.select_one('#al-topic')
    if topic:
        existing = {o.get_text(strip=True) for o in topic.select('option')}
        for t in sorted({b[3] for b in BOOKS} - existing):
            o = s.new_tag('option'); o.string = t; topic.append(o)

    nav = s.select_one('.al-hero nav')
    if nav and not nav.select_one('a[href="#bergen-research"]'):
        a = s.new_tag('a', href='#bergen-research'); a.string = 'Research made in Bergen'
        nav.append(a)
    explorer_intro = s.select_one('#genre-explorer > p:not(.al-tag)')
    if explorer_intro and not explorer_intro.select_one('a[href="#bergen-research"]'):
        explorer_intro.append(BeautifulSoup(' <a href="#bergen-research">Or start from the research made in Bergen →</a>', 'html.parser'))

    for old in s.select('link[href^="bergen-research.css"]'): old.decompose()
    link = BeautifulSoup('<link rel="stylesheet" href="bergen-research.css?v=2"/>', 'html.parser').find()
    access = s.select('link[href^="accessibility.css"]')
    access[-1].insert_before(link) if access else s.head.append(link)  # accessibility stays last
    path.write_text(str(s), encoding='utf-8', newline='\n')


if __name__ == '__main__':
    from pathlib import Path
    bergen(Path(__file__).resolve().parent.parent)

"""A make-first library session, with the full reference collection available underneath."""
from pathlib import Path
from html import escape
from bs4 import BeautifulSoup

LENSES = [
 ('choice','Someone makes a choice','player agency interfaces','Gameworld Interfaces','What changes because of the choice? Interface and agency research may help you investigate it.'),
 ('story','Words or a story unfold','interactive fiction narrative','Electronic Literature','How do the words, order and interaction shape the reading?'),
 ('look','The look or mood matters','digital art aesthetics','Digital Art','What do colour, form, timing or movement make possible?'),
 ('sound','Sound changes the experience','sound listening identity','The Sonic Color Line','How might listening habits affect how a voice is understood? Check how the book’s historical context relates to yours.'),
 ('use','It helps someone do something','participatory design usability','Design Justice','Whose needs shaped the task, and who can take part?'),
 ('data','It selects or shows data','data representation power','Data Feminism','Whose experience is represented, and what is left out?'),
 ('ai','A machine generates or recognises','AI authorship interpretation','The Routledge Handbook of AI and Literature','What did you contribute, and what did the system contribute?'),
 ('place','A place shapes the experience','spatial narrative place','Hamlet on the Holodeck','What does exploring this place let someone notice or understand?'),
 ('people','People or belonging matter','online communities belonging','The Platform Society','Who can participate, and how do the platform’s rules shape that?'),
]

TEMPLATE = '''<section class="ls-session" id="library-session" aria-labelledby="ls-title">
<div class="ls-welcome"><p class="ls-kicker">TURING'S LIBRARY / LAB MODE</p><h2 id="ls-title">Make first. Find meaning.</h2><p>Bring one part of something you made. Try it, notice what it does, then find research that helps you understand it. Your making can lead the research.</p><a class="ls-skip" href="#ls-find" data-ls-go="2">Already looking for a source? Go straight to the shelves →</a></div>
<nav class="ls-room-map" aria-label="Your library session"><a href="#ls-make" data-ls-go="0"><i class="ls-lamp" aria-hidden="true"></i><small>ROOM 01</small><strong>Your creation</strong></a><a href="#ls-notice" data-ls-go="1"><i class="ls-lamp" aria-hidden="true"></i><small>ROOM 02</small><strong>Look closer</strong></a><a href="#ls-find" data-ls-go="2"><i class="ls-lamp" aria-hidden="true"></i><small>ROOM 03</small><strong>Find a voice</strong></a><a href="#ls-connect" data-ls-go="3"><i class="ls-lamp" aria-hidden="true"></i><small>ROOM 04</small><strong>Find meaning</strong></a></nav>
<p class="ls-position" data-ls-position role="status">Four rooms to explore. Start anywhere; return whenever it helps.</p>
<section class="ls-panel" id="ls-make" data-ls-panel="0"><p class="ls-room-no">ROOM 01 / THE MAKING TABLE</p><h3>Start with something you made.</h3><p>Open one scene, screen, sound, text or interaction from your project. It can be unfinished. Choose one small part to explore.</p><div class="ls-action"><b>Do this now</b><p>Try that part of your work, or let a neighbour try it. Watch what actually happens.</p><a href="lab-programme.html#lab-5-workbench">Open the project workbench →</a></div>
<details class="ls-example"><summary>Nothing ready yet? Try a tiny browser prototype.</summary><div class="ls-demo" data-ls-demo="closed"><p class="ls-demo-sign">THE LITTLE ROOM</p><div class="ls-demo-door" aria-hidden="true"><span></span></div><p id="ls-demo-story" data-ls-demo-story role="status">A closed door. A little light underneath.</p><button type="button" data-ls-demo-action hidden>Open the door</button><noscript><p>Imagine a click opening this door and revealing a memory. You can also use any existing digital work as your starting point.</p></noscript></div><p>This is a tiny browser prototype. After trying it, ask what changed and what the action meant.</p></details>
<div class="ls-step-actions" data-ls-controls hidden><button type="button" data-ls-next>Next: look closer →</button></div></section>
<section class="ls-panel" id="ls-notice" data-ls-panel="1"><p class="ls-room-no">ROOM 02 / THE OBSERVATION DESK</p><h3>What is your creation doing?</h3><p>Choose something you noticed. These are possible research leads; you can combine them. You can find the genre name later.</p><div class="ls-lenses" role="group" aria-label="Choose something you noticed">__LENSES__</div><div class="ls-lead"><b>One possible way in</b><p data-ls-question>What changes when someone interacts with your work?</p><p>Try searching for <strong data-ls-words>digital interaction</strong>. You can edit the words in the next room.</p></div><p class="ls-little-link">Still unsure? <a href="#research-finder">Use the longer research finder</a>, or continue with a word from your project.</p><div class="ls-step-actions" data-ls-controls hidden><button type="button" data-ls-back>← Back to the creation</button><button type="button" data-ls-next>Next: find a source →</button></div></section>
<section class="ls-panel" id="ls-find" data-ls-panel="2"><p class="ls-room-no">ROOM 03 / THE SHELVES</p><h3>Find one idea worth spending time with.</h3><p>Look for something that helps you investigate what you noticed. A useful source can support your idea, complicate it or challenge it.</p>
<form class="ls-search" action="https://scholar.google.com/scholar" method="get" target="_blank" rel="noopener"><label for="ls-query">Search words from your work<input id="ls-query" name="q" type="search" value="digital interaction" required=""/></label><div><button type="submit">Search Google Scholar ↗</button><button type="submit" formaction="https://www.google.com/search">Try Google ↗</button><a data-ls-oria href="https://bibsys-d.primo.exlibrisgroup.com/discovery/search?vid=47BIBSYS_UBB%3AUBB&amp;lang=en&amp;tab=default_slot&amp;search_scope=MyInst_and_CI">Search UiB Oria &#8599;</a></div></form>
<aside class="ls-action ls-search-guide"><b>First time looking for research?</b><p>Follow the real screenshots: search words, results, full text and the right account. There is also a listening route with Tibi.</p><a href="research-guide.html#search-start" data-ls-search-guide>Show me how to search, step by step &#8594;</a></aside><div class="ls-source-lead"><small>A POSSIBLE STARTING SOURCE</small><a data-ls-book href="#sources">Explore the book collection</a><span data-ls-author>Choose an observation in room 2 for a suggested starting book.</span><p>Open the book card for its publisher and Oria links. Read the source and decide whether it fits your question.</p></div>
<div class="ls-channel-buttons" role="group" aria-label="Where are you looking?"><button type="button" data-ls-channel="shelf" aria-pressed="true">At the physical library</button><button type="button" data-ls-channel="online" aria-pressed="false">Online from here</button></div>
<div class="ls-channel" data-ls-channel-panel="shelf"><h4>From Oria to a real shelf</h4><ol><li>Search a title, author or topic in <a href="https://bibsys-d.primo.exlibrisgroup.com/discovery/search?vid=47BIBSYS_UBB%3AUBB&amp;lang=en&amp;tab=default_slot&amp;search_scope=MyInst_and_CI" target="_blank" rel="noopener">UiB's Oria</a>. Open the physical book record.</li><li>Find <b>Get It / Finn og bestill</b>. Check the library, availability and complete shelf mark. Keep that information on your phone.</li><li>Follow the signs and compare the shelf mark with the book's spine. Ask staff with the record open if you cannot find it.</li></ol><p>Check which library holds the copy before walking there. Closed-storage items need requesting. You can borrow with your student card or student ID app.</p><a href="https://hjelpekort.app.uib.no/en/KI-3385.html" target="_blank" rel="noopener">UiB's guide: find and borrow the book ↗</a></div>
<div class="ls-channel" data-ls-channel-panel="online"><h4>Find something you can actually read</h4><p>Try Google Scholar's <b>[PDF]</b> or <b>All versions</b> links. Search <a href="https://nva.sikt.no/" target="_blank" rel="noopener">Sikt's NVA</a> for a title or researcher, or use UiB's Oria for library access.</p><p>Check the publication type, author and context. A search result or PDF alone does not establish peer review. If access is blocked, keep the record and ask the library for help.</p><a href="#find-articles">Open the fuller article-search guide →</a></div>
<div class="ls-book-map"><p class="ls-room-no">A BOOK HAS ITS OWN MAP</p><h4>Find your theme. Follow an author.</h4><div class="ls-book-tabs" role="group" aria-label="Ways into a book"><button type="button" data-ls-book-tab="contents" aria-pressed="false">Contents</button><button type="button" data-ls-book-tab="index" aria-pressed="true">Index</button><button type="button" data-ls-book-tab="references" aria-pressed="false">Bibliography</button></div>
<section data-ls-book-page="contents"><span class="ls-book-place">AT THE FRONT</span><h5>The contents show the chapters.</h5><p>Look for a chapter connected to your work or theme. Use it to get your bearings, then read the relevant argument in context.</p></section>
<section data-ls-book-page="index"><span class="ls-book-place">USUALLY AT THE BACK</span><h5>The index points a theme to pages.</h5><p>Look up a word such as <b>agency</b>, <b>identity</b> or <b>play</b>. Follow its page numbers. Try related terms if your exact word is missing. Not every book has an index.</p><p>Read around the passage. Finding a word is the beginning of understanding what the author means.</p></section>
<section data-ls-book-page="references"><span class="ls-book-place">AT THE END, OR AFTER A CHAPTER</span><h5>The bibliography points to other sources.</h5><p>Recognise an author, or spot a title connected to your theme? Take the full reference and search for that title in Oria or Google Scholar.</p><p>Follow it to the original work and read it before citing it as a source you have read. Use the bibliography as a lead to your next source.</p></section></div>
<div class="ls-action"><b>Try this with the source</b><p>Find a passage that helps you see your work differently. What is the author arguing, and what evidence or examples do they use?</p></div><div class="ls-step-actions" data-ls-controls hidden><button type="button" data-ls-back>← Change the search lead</button><button type="button" data-ls-next>Next: bring the idea back →</button></div></section>
<section class="ls-panel" id="ls-connect" data-ls-panel="3"><p class="ls-room-no">ROOM 04 / BACK AT YOUR CREATION</p><h3>What can you see now?</h3><p>Return to the part you made. Use one idea from your reading to understand it, question it or try a change. The meaning can develop through making and researching.</p><div class="ls-meaning-choices" role="group" aria-label="How could you use the idea?"><button type="button" data-ls-meaning="change">Try a design change</button><button type="button" data-ls-meaning="understand">Understand what I made</button><button type="button" data-ls-meaning="question">Follow a new question</button></div><p class="ls-meaning" data-ls-meaning-text role="status">A source does not have to confirm your first idea. Let it help you look again.</p>
<div class="ls-action"><b>Keep a way back to the idea</b><p>Keep the author, year, title, edition and the page you actually used. For an article, keep its journal details and DOI when available.</p><a href="#chicago-author-date">Format it in Chicago author-date →</a></div><p class="ls-little-link"><a href="#across-fields">See Ingrid's Pride Park example and ways to combine subjects</a></p><div class="ls-finish-links"><a href="lab-programme.html#lab-5-workbench">Back to making →</a><a href="final-assessment.html?from=library&amp;room=ls-connect#brief">Peek at the Final Assignment →</a></div><div class="ls-step-actions" data-ls-controls hidden><button type="button" data-ls-back>← Return to the source</button><button type="button" data-ls-go="0">Take another lap</button></div></section>
<p class="ls-footnote">You can stay in the lab, visit the library or combine both. This is a practice route, not an extra assignment.</p></section>'''


def build(root):
    path=root/'labs/academic-library.html'
    page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    for old in page.select('#library-session'):old.decompose()
    # Stable anchors let the session suggest an existing book without duplicating its record.
    books={}
    for index,book in enumerate(page.select('.al-book'),1):
        if not book.get('id'):book['id']=f'ls-book-{index}'
        title=book.h2.get_text(' ',strip=True)
        books[title]=(book['id'],book.select_one('.al-author').get_text(' ',strip=True))
    buttons=[]
    for key,label,query,prefix,question in LENSES:
        title=next(title for title in books if title.startswith(prefix))
        ident,author=books[title]
        attrs={'data-ls-lens':key,'data-ls-query':query,'data-ls-question':question,'data-ls-title':title,'data-ls-author':author,'data-ls-href':'#'+ident}
        serialized=' '.join(f'{k}="{escape(v,quote=True)}"' for k,v in attrs.items())
        buttons.append(f'<button type="button" {serialized} aria-pressed="false">{escape(label)}</button>')
    session=BeautifulSoup(TEMPLATE.replace('__LENSES__',''.join(buttons)),'html.parser').find()
    page.find(id='library-entrance').insert_after(session)
    article_guide=page.find(id='find-articles')
    if article_guide and not article_guide.select_one('[data-ls-search-guide]'):
        article_guide.find(['h2','h3']).insert_after(BeautifulSoup('<p><a href="research-guide.html#search-start" data-ls-search-guide>New to research? Open the step-by-step screenshot guide for Scholar, NVA, UiB access, Internet Archive and Tibi →</a></p>','html.parser').find())
    collection=page.find(id='library-shelves')
    if not collection:
        collection=page.new_tag('details',attrs={'id':'library-shelves','class':'ls-collection'})
        summary=page.new_tag('summary');summary.string="Explore the rest of Turing's shelves: books, genres, sources and writing help"
        collection.append(summary)
        for node in list(page.select('.lq-map,.lq-station')):collection.append(node.extract())
        session.insert_after(collection)
    for station in page.select('.lq-station'):
        for old in station.select('.ls-return'):old.decompose()
        station.select_one('.lq-body').append(BeautifulSoup('<p class="ls-return"><a href="#ls-find" data-ls-return>← Back to room 3: Find a voice</a></p>','html.parser').find())
    for old in page.select('link[href^="library-session.css"],script[src^="library-session.js"]'):old.decompose()
    page.select_one('link[href^="accessibility.css"]').insert_before(page.new_tag('link',rel='stylesheet',href='library-session.css?v=2'))
    page.head.append(page.new_tag('script',src='library-session.js?v=2',defer=''))
    path.write_text(str(page),encoding='utf-8',newline='\n')
    from lab_links import apply as lab_links
    lab_links(root,[path])


if __name__=='__main__':
    build(Path(__file__).resolve().parents[1])

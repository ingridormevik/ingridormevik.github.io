"""Build a small verified academic reading library, separate from lab tasks."""
from bs4 import BeautifulSoup
from html import escape
from urllib.parse import quote

BOOKS = [
 ('The Routledge Handbook of AI and Literature','Will Slocombe and Genevieve Liveley (editors)','Routledge','AI and literature','https://www.routledge.com/The-Routledge-Handbook-of-AI-and-Literature/Slocombe-Liveley/p/book/9781032186948/','Publisher record','Literary approaches to AI and AI in literary practice.','For the vibecoding workshop: what choices did you make, and what did the machine contribute?','vibecoding.html'),
 ('Hamlet on the Holodeck: The Future of Narrative in Cyberspace','Janet H. Murray','MIT Press · updated edition, 2017','Narrative and games','https://mitpress.mit.edu/9780262533485/hamlet-on-the-holodeck/','Publisher record','Digital environments and the possibilities of participatory narrative.','For Construct: what does the visitor do that changes their experience of the story?','lab-programme.html#mapping-first-contact'),
 ('The New Media Reader','Noah Wardrip-Fruin and Nick Montfort (editors)','MIT Press · 2003','Media history','https://mitpress.mit.edu/9780262232272/the-new-media-reader/','Publisher record','A collection of foundational writings in the history of new media.','Connect a historical idea about computing to one interaction you are building.','computing-history.html'),
 ('Design Justice: Community-Led Practices to Build the Worlds We Need','Sasha Costanza-Chock','MIT Press · 2020','Design and participation','https://designjustice.mitpress.mit.edu/','Read open access','Design, power and community-led practice.','For your interface: who gets to take part in deciding what the project should do?','accessibility-lab.html'),
 ('Data Feminism','Catherine D’Ignazio and Lauren F. Klein','MIT Press · 2020','Data and power','https://data-feminism.mitpress.mit.edu/','Read open access','An intersectional feminist approach to data science and data ethics.','For your project: whose experience is represented, and whose perspective is absent?','lab-programme.html#lab-2-sec-3'),
 ('Algorithms of Oppression: How Search Engines Reinforce Racism','Safiya Umoja Noble','NYU Press · 2018','Data and power','https://nyupress.org/9781479866762/algorithms-of-oppression/','Publisher record','A critical study of search engines, racism and discoverability.','For research and AI use: how does a platform influence what you can find?','vibecoding.html')]

def library(root):
    labs = root / 'labs'
    s = BeautifulSoup((labs / 'github-guide.html').read_text(encoding='utf-8'),'html.parser')
    s.title.string = 'Academic library for digital culture | DIKULT105'
    s.body['class'] = ['studio', 'page-academic-library']
    s.body.attrs.pop('data-reader', None)
    description = s.find('meta', attrs={'name':'description'})
    if description:
        description['content'] = 'Find digital narrative genres, academic sources and interdisciplinary research questions.'
    for script in s.select('script:not([src^="accessibility"])'): script.decompose()
    main = s.select_one('main')
    main.clear()
    topics = sorted(set(b[3] for b in BOOKS))
    content = '''<article class="al-library"><p><a href="tools.html">Back to Guides</a> · <a href="lab-programme.html">Back to the labs</a></p><p class="al-tag">DIGITAL CULTURE / ACADEMIC LIBRARY</p><h1>Find an idea.<br/>Take it into your project.</h1><p class="al-intro">A starting collection for studying digital culture: literature, interactive stories, media history, design, data and power. Choose a question, find a source and read the relevant part.</p><p>Optional reading, not an official course reading list. Publisher links verify the books; they do not guarantee UiB access or availability. Open-access links are labelled separately.</p><form class="al-controls" role="search"><label for="al-search">Search title, author or topic<input type="search" id="al-search" placeholder="Try narrative, AI, design or data"/></label><label for="al-topic">Explore a shelf<select id="al-topic"><option value="">All topics</option>'''
    content += ''.join(f'<option>{escape(t)}</option>' for t in topics)
    content += '</select></label></form><p id="al-count" role="status">6 sources</p><div class="al-shelves">'
    for i,(title,author,publisher,topic,url,access,desc,prompt,lab) in enumerate(BOOKS,1):
        search = 'https://oria.no/?query=any,contains,'+quote(title)
        content += f'''<section class="al-book" data-topic="{escape(topic)}"><p class="al-tag">{i:02d} / {escape(topic)}</p><h2>{escape(title)}</h2><p class="al-author">{escape(author)}</p><p>{escape(publisher)}</p><p>{escape(desc)}</p><p><a href="{escape(url)}" target="_blank" rel="noopener">{access} ↗</a> · <a href="{escape(search)}" target="_blank" rel="noopener">Search Oria ↗</a></p><details><summary>Take a question into your project</summary><p>{escape(prompt)}</p><a href="{lab}">Return to the relevant workshop →</a><p class="al-small">These are suggested questions from the lab, not quotations from the book.</p></details></section>'''
    content += '''</div><section class="al-reading" id="reading"><h2>Read with a question.</h2><ol><li>Use the contents or index to locate a relevant chapter. For edited collections, choose a chapter and identify its author.</li><li>Read the passage in context. Separate the author's claim from your own interpretation.</li><li>Record the edition and actual page or locator you used. Cite a chapter by its author, not automatically by the book's editors.</li><li>Use the idea to question a design choice, compare two approaches or develop an argument.</li></ol><p>For library access, choose your institution in Oria and check the actual record. A publisher page may offer a preview or require purchase; it is not automatically free full text.</p><p><a href="https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html" target="_blank" rel="noopener">Chicago author-date examples</a>. Follow your assignment instructions and cite the edition you actually read.</p><a href="lab-programme.html">Back to your project →</a></section></article>'''
    main.append(BeautifulSoup(content,'html.parser'))
    s.head.append(BeautifulSoup('<link rel="stylesheet" href="academic-library.css?v=1"/><script defer src="academic-library.js?v=1"></script>','html.parser'))
    (labs / 'academic-library.html').write_text(str(s),encoding='utf-8',newline='\n')
    from genre_atlas import atlas
    atlas(root)
    path = labs / 'tools.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    old = s.select_one('#academic-library-link')
    if old: old.decompose()
    s.select_one('#lab-floor').insert_before(BeautifulSoup('<section class="help-banner" id="academic-library-link"><h2>Academic library for digital culture</h2><p>Explore literature, narrative, media history, design and data through verified academic sources.</p><a class="primary" href="academic-library.html">Explore the academic library →</a></section>','html.parser').find())
    path.write_text(str(s),encoding='utf-8',newline='\n')
    for name in ['tools.html','lab-programme.html','academic-library.html']:
        path = labs / name
        page = BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
        nav = page.select_one('.studio-header nav')
        if nav and not nav.select_one('a[href="academic-library.html"]'):
            link = page.new_tag('a',href='academic-library.html')
            link.string = 'Academic library'
            if name == 'academic-library.html': link['aria-current']='page'
            nav.append(link)
        path.write_text(str(page),encoding='utf-8',newline='\n')

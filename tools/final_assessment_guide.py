"""DIKULT105 brief fidelity and a beginner Chicago author-date desk.

The supplied DIKULT105 assessment is authoritative. DIKULT203 supplies only the
practical / written / submission / assessment organisation, never its requirements.
Apply to the existing hub without rebuilding Construct lessons or clearing drafts.
"""
from pathlib import Path
from bs4 import BeautifulSoup

COURSE='https://www4.uib.no/en/studies/courses/dikult105'
FILES='https://mitt.uib.no/courses/59620/files'
SCALE='https://www4.uib.no/en/for-students/exams-and-submissions/grading-scale'
CHICAGO='https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html'
CHANGES='https://www.chicagomanualofstyle.org/help-tools/what-s-new.html'

def fragment(raw):return BeautifulSoup(raw,'html.parser').find()

SOURCE_NOTE=f'''<aside class="fag-source-note" id="assessment-source-note"><b>DIKULT105 / THE CURRENT ASSESSMENT</b><p>This guide follows the DIKULT105 Final Assessment brief shared for this course. Read the current file in <a href="{FILES}" target="_blank" rel="noopener">MittUiB → Files</a>; course updates and the official brief take priority.</p><p><a href="{COURSE}" target="_blank" rel="noopener">UiB's course page</a> lists one portfolio grade on the A–F scale and submission on <b>9 December 2026 at 13:00</b>. Check your deadline and upload instructions in Inspera.</p><p><b>Software choice is open.</b> HTML, CSS, JavaScript, Construct 3, Adobe products or other tools can be used. The AI restrictions still apply. Your form may combine art, games, sound, websites and other interactive approaches.</p></aside>'''

CRITERIA=f'''<section class="fq-gate fag-guide" id="assessment-criteria" aria-labelledby="fag-criteria-title"><p class="fq-kicker">THE WORK + THE TEXT / CHECK THE CONNECTION</p><h2 id="fag-criteria-title">What does good work show?</h2><p>The DIKULT105 brief asks for a creative interactive piece and an analysis of its theme, genre and process. UiB's course outcomes also include analysing design and aesthetics, using relevant theory and discussing your own work. <a href="{COURSE}" target="_blank" rel="noopener">Read the course outcomes ↗</a></p><div class="fag-label">LAB GUIDANCE / NOT AN ADDITIONAL MARKING RUBRIC</div><p>Use these questions to improve the connection between what you made and what you write. The DIKULT105 brief and course instructions govern the assessment.</p>
<p><b>One grade covers the assessment portfolio.</b> The practical work and its written analysis should make sense together. UiB lists the A–F grading scale for this course.</p><div class="fag-table-scroll"><table class="fag-criteria"><caption>Use the same creative decisions in your work, analysis and walkthrough.</caption><thead><tr><th scope="col">DIKULT105 focus</th><th scope="col">Show it in the work</th><th scope="col">Explain it in the text</th></tr></thead><tbody>
<tr><th scope="row">Speculative digital futures</th><td>Let an interaction reveal something about your imagined future.</td><td>Explain the future you imagine and how the work addresses the theme. Point to a specific moment.</td></tr>
<tr><th scope="row">Creative interaction</th><td>Give the visitor an action that matters to the experience. A sound piece, artwork, artistic game or creative website can work.</td><td>Explain what the action changes and why you chose it.</td></tr>
<tr><th scope="row">Genre and research</th><td>Use conventions of the form you chose, or adapt them deliberately.</td><td>Identify the genre or combination of genres. Use relevant sources to explain your choices, including similarities and differences.</td></tr>
<tr><th scope="row">Design and aesthetics</th><td>Make deliberate choices about language, image, sound, timing, navigation or other senses.</td><td>Analyse how those choices shape the visitor's experience. Aesthetics includes how the work feels and behaves.</td></tr>
<tr><th scope="row">Creative process</th><td>Develop and test a manageable interaction.</td><td>Discuss a concrete challenge, a decision, what happened and what you changed or learned. Include limitations you can explain.</td></tr>
<tr><th scope="row">A functioning submission</th><td>Publish an accessible version and show it working in the video.</td><td>Label the work and video links clearly. Make your analysis correspond to the submitted version.</td></tr>
</tbody></table></div><details class="fag-detail"><summary>Aiming for a strong result?</summary><p>Choose a clear idea, make the interaction serve it, and support your analysis with examples from the work and sources you have read. Explain your judgement: why this choice, what effect did it have, and what evidence supports your interpretation?</p><p><a href="{SCALE}" target="_blank" rel="noopener">UiB's general A–F descriptors</a> emphasise quality, judgement and independence. They are general descriptors; the course's own assessment instructions determine how your submission is assessed.</p></details><details class="fag-detail"><summary>How does the A–F scale work?</summary><dl class="fag-grades"><dt>A / Excellent</dt><dd>Clearly outstanding work, very good judgement and a high degree of independence.</dd><dt>B / Very good</dt><dd>Very good work, judgement and independence.</dd><dt>C / Good</dt><dd>Good work across most areas, with judgement and independence in the important areas.</dd><dt>D / Satisfactory</dt><dd>Acceptable work with significant shortcomings and some independent judgement.</dd><dt>E / Sufficient</dt><dd>Meets the minimum requirements, with limited judgement and independence.</dd><dt>F / Fail</dt><dd>Does not meet the minimum academic requirements.</dd></dl><p>Plain-language summary of <a href="{SCALE}" target="_blank" rel="noopener">UiB's general descriptors ↗</a>. These are not separate DIKULT105 criteria for each component.</p></details><p class="fag-next"><a href="#doc">Plan the written document →</a> · <a href="#chicago-author-date">Learn Chicago author-date →</a></p></section>'''

def citation_card(key,title,in_text,reference,note,opened=False):
    return f'''<details class="fag-citation-card" id="cite-{key}"{' open' if opened else ''}><summary>{title}</summary><div class="fag-citation-pair"><section><h4>In your text</h4><p class="fag-model">{in_text}</p></section><section><h4>In your reference list</h4><p class="fag-model fag-reference">{reference}</p></section></div><p class="fag-citation-note">{note}</p></details>'''

def citations():
    cards=[
        citation_card('book','01 / Book or e-book','<code>(Jørgensen 2013)</code><br/>For a particular passage: <code>(Jørgensen 2013, [page])</code>',
          'Jørgensen, Kristine. 2013. <cite>Gameworld Interfaces</cite>. MIT Press.',
          'Real book. Replace [page] with the page you actually used. Cite the edition you read. For an online book, add its DOI, stable URL or database as appropriate. For an unpaginated edition, identify a chapter or section. <a href="https://mitpress.mit.edu/9780262026864/gameworld-interfaces/" target="_blank" rel="noopener">Check the publisher record ↗</a>',True),
        citation_card('article','02 / Research article','<code>(Jørgensen 2012)</code><br/>For a particular passage: <code>(Jørgensen 2012, [page])</code>',
          'Jørgensen, Kristine. 2012. “Between the Game System and the Fictional World: A Study of Computer Game Interfaces.” <cite>Games and Culture</cite> 7 (2): 142–63. <a href="https://doi.org/10.1177/1555412012440315" target="_blank" rel="noopener">https://doi.org/10.1177/1555412012440315</a>.',
          'Real article. Collect author → year → article title → journal → volume (issue) → full article page range or article number → DOI. The reference gives the whole article; the in-text citation gives your particular page. Cite the article itself, even if you found it through NVA, Oria or Google Scholar.'),
        citation_card('chapter','03 / A chapter in an edited book','<code>([Chapter author surname] [Year], [page])</code>',
          '[Chapter author surname], [First name]. [Year]. “[Chapter title].” In <cite>[Book title]</cite>, edited by [Editor first name and surname]. [Publisher]. [DOI or URL, if applicable].',
          'Template. The chapter author goes first. The editors belong after the book title. Chicago 18 no longer requires the chapter’s complete page range in the reference; cite the actual page you use in your text. If you read only one chapter, do not attribute its argument automatically to the editors.'),
        citation_card('web','04 / A web page','<code>(University of Bergen n.d.)</code>',
          f'University of Bergen. n.d. “Creating Digital Culture.” Accessed October 30, 2026. <a href="{COURSE}" target="_blank" rel="noopener">{COURSE}</a>.',
          'Real page with no listed publication or revision date. Use the named author or responsible organisation; write an organisation’s name once, in full. A personal author starts Surname, First name. Use the publication/revision year when supplied. Only when no date is given, use n.d. and add your actual access date. If there is no author or organisation, begin with the title and cite a shortened title in the text.'),
        citation_card('digital-work','05 / A game, app or interactive digital work','<code>([Creator or developer] [Year])</code>',
          '[Creator or developer]. [Year]. <cite>[Title of work]</cite>. [Version, if relevant]. [Game, app or interactive artwork; platform]. [Publisher, if different]. [URL, if applicable].',
          'Template for a formal reference to a work you analyse. A personal creator starts Surname, First name; a studio name is written once, in full. Use the credited creator and the version you examined. Identify a scene, level or action in your discussion so the reader can locate your example.'),
        citation_card('image','06 / Image, artwork or someone else’s screenshot','<code>([Artist surname] [Year])</code><br/>In a figure caption: <code>Figure 1. [Description]. Source: [Creator] [Year], [locator].</code>',
          '[Artist surname], [First name]. [Year]. <cite>[Artwork title]</cite>. [Medium]. [Collection or institution, if relevant]. [URL, if viewed online].',
          'Template. A screenshot of another person’s work needs a source for that work; credit an image’s photographer or source where applicable. Use a caption and a matching reference. For your own new project screenshot, “Figure 1. [What it shows]. Screenshot by the author, [year]” makes its origin clear. Give any reused material its own credit.'),
        citation_card('video','07 / Video, recorded talk, podcast or sound recording','<code>([Creator surname or channel] [Year], at [timestamp])</code>',
          '[Creator or channel]. [Year]. “[Recording or episode title].” [Programme, series or platform]. [Month day, if given]. [Video, podcast audio or sound recording], [duration]. [URL].',
          'Template. A personal creator starts Surname, First name; a channel name is written once, in full. Give a timestamp for a particular moment and specify the recording type. A stand-alone musical work may use an italicised work title. For a reused sound asset, also record the creator’s requested credit and licence.'),
        citation_card('lecture','08 / Lecture, lecture slides or course material','<code>([Lecturer surname] [Year], slide [number])</code>',
          '[Lecturer surname], [First name]. [Year]. “[Exact lecture or material title].” [Lecture slides or course handout], DIKULT105, University of Bergen, [Month day]. MittUiB. [Course material URL].',
          'Template for retrievable material. Use the real lecturer, title, date and slide number. If you only heard an unrecorded remark, explain it as a personal communication in the text with its date; it is normally omitted from the reference list. Do not invent a slide number or a publication record.'),
        citation_card('code','09 / Code, templates, software or downloaded assets','<code>([Creator or organisation] [Year])</code>',
          '[Creator or organisation]. [Year]. <cite>[Title]</cite>. [Version or release]. [Software, code repository or asset type]. [Repository or publisher]. [DOI or stable URL].',
          'Template for a formal reference. A personal creator starts Surname, First name; an organisation name is written once, in full. Identify the release or commit when it matters. Credit borrowed code, Construct templates, fonts, images and sounds in the project and your discussion. Keep the licence and requested attribution. Cite the original record.'),
    ]
    return f'''<section class="fq-gate fag-guide" id="chicago-author-date" aria-labelledby="fag-cite-title"><p class="fq-kicker">THE CITATION DESK / CHICAGO AUTHOR-DATE</p><h2 id="fag-cite-title">Chicago author-date: how to cite</h2><p>Use <b>Chicago author-date</b> consistently for your in-text citations and References list. These examples follow Chicago 18. It has two connected parts: the short author–year citation next to the idea, and the full source in <b>References</b> at the end of your document. Follow any more specific course instructions.</p>
<ol class="fag-cite-steps"><li><b>Find the source details.</b> Author, year, title and the page or other locator you actually used.</li><li><b>Cite beside the idea.</b> Write <code>(Surname Year, page)</code>. There is no comma between the name and year.</li><li><b>Add the full source once.</b> Choose its type below and complete the reference.</li><li><b>Match the two.</b> The same creator and year must lead the reader from the citation to the reference.</li></ol>
<div class="fag-citation-pair fag-basics"><section><h3>When you paraphrase</h3><p>Explain the source’s idea in your own words, then cite it. Your own wording still needs a source.</p><p class="fag-model"><code>[Your explanation of the passage] (Jørgensen 2013, [page]).</code></p></section><section><h3>When you quote</h3><p>Copy the exact words, use quotation marks and cite the page or locator. Put the citation before the sentence’s final full stop.</p><p class="fag-model"><code>“[Exact words checked against the source]” (Jørgensen 2013, [page]).</code></p></section></div>
<p class="fag-placeholder-note"><b>Replace every [bracketed field].</b> These are format templates, not sentences to submit. The book and journal article below are real publications; no quotation or claim about a particular page is supplied.</p>
<nav class="fag-source-types" aria-label="Choose the source you need to cite"><a href="#cite-book">Book</a><a href="#cite-article">Article</a><a href="#cite-chapter">Chapter</a><a href="#cite-web">Web page</a><a href="#cite-digital-work">Game / interactive work</a><a href="#cite-image">Image / screenshot</a><a href="#cite-video">Audio / video</a><a href="#cite-lecture">Lecture</a><a href="#cite-code">Code / assets</a></nav>
{''.join(cards)}
<details class="fag-detail"><summary>Two authors, several authors, missing pages or the same year?</summary><ul><li><b>Two authors:</b> <code>(Surname and Surname Year, page)</code>.</li><li><b>Three or more authors:</b> <code>(FirstSurname et al. Year, page)</code>. In Chicago 18, list up to six authors in the reference; if there are more than six, list the first three followed by et al. Preserve the source’s author order.</li><li><b>Same author, same year:</b> use <code>2026a</code> and <code>2026b</code> in both places, assigned by the alphabetic order of the titles.</li><li><b>No stable pages:</b> use a chapter, named section, paragraph number when available, or recording timestamp. Do not use the browser’s printed page number as though it belonged to the source.</li><li><b>A source cited inside another source:</b> find and read the original where possible. If you cannot, acknowledge the secondary citation and list the source you actually read.</li></ul></details>
<div class="fag-reference-check"><h3>Build your References list</h3><ol><li>Order entries alphabetically by surname or responsible organisation. For the same author, order by year.</li><li>Put the year immediately after the creator’s name. Invert the first personal author’s name: <b>Surname, First name</b>.</li><li>Use <cite>italics</cite> for book, journal and stand-alone work titles. Use “quotation marks” for article, chapter and web-page titles.</li><li>Use a hanging indent: the second and later lines of each entry start slightly to the right.</li><li>Check creator, year, title, edition, pages and DOI against the source. Check automatically generated references too.</li></ol><p>Chicago 18 does not require a publisher’s city for a book. Article references still need the complete page range or article number where available.</p></div>
<details class="fag-detail"><summary>What needs a citation in my project?</summary><p>Cite ideas, quotations, definitions, data and works you analyse. Credit material you reuse, including code and media. Your observations of your own new prototype can be described directly and illustrated with labelled screenshots. Your work and walkthrough links identify the submitted project; they do not replace research references.</p><p>Use the references you actually read. Choose sources that help your analysis; the supplied DIKULT105 brief gives no fixed source count. Citing an AI tool does not override the assessment’s AI restrictions. <a href="#ai">Read the AI rules →</a></p></details>
<p class="fag-cite-sources">Check the format: <a href="{CHICAGO}" target="_blank" rel="noopener">official Chicago author-date examples ↗</a> · <a href="{CHANGES}" target="_blank" rel="noopener">Chicago 18 changes ↗</a> · <a href="https://guides.lib.uiowa.edu/citationhelp/chicago/av" target="_blank" rel="noopener">University library help for audio and video ↗</a>.</p><p class="fag-next"><a href="#doc">Back to your text →</a> · <a href="academic-library.html#ls-find">Find a source in the library →</a> · <a href="#seals">Check the submission →</a></p></section>'''

def build(root):
    path=root/'labs/final-assessment.html';page=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    for old in page.select('#assessment-source-note,#assessment-criteria,#chicago-author-date,.fag-outline,.fag-format-note,.fag-quick-links'):
        old.decompose()
    brief=page.find(id='brief');brief.select_one('.fq-sub').insert_after(fragment(SOURCE_NOTE))
    brief.insert_after(fragment(CRITERIA))
    page.find(id='doc').insert_after(fragment(citations()))
    article_map='''<dl class="fag-article-map"><dt>Jørgensen, Kristine</dt><dd>Author of the article</dd><dt>2012</dt><dd>Publication year</dd><dt>“Between the Game System …”</dt><dd>Article title, in quotation marks</dd><dt><cite>Games and Culture</cite></dt><dd>Journal title, in italics</dd><dt>7 (2)</dt><dd>Volume 7, issue 2</dd><dt>142–63</dt><dd>Complete article pages: 142–163</dd><dt>https://doi.org/…</dt><dd>Permanent link to the article</dd></dl>'''
    page.select_one('#cite-article .fag-citation-note').insert_before(fragment(article_map))
    example=fragment('<details class="fag-detail"><summary>What does a finished reference list look like?</summary><div class="fag-example-list"><h3>References</h3></div><p>Example layout using the three real sources above, ordered by author and year. Include the sources you actually cite and have read; replace this example with your own list.</p></details>')
    for ident in ['article','book','web']:
        model=page.select_one(f'#cite-{ident} .fag-reference')
        example.select_one('.fag-example-list').append(fragment(str(model)))
    page.select_one('.fag-reference-check').insert_after(example)
    hero=page.select_one('.fq-hero')
    hero.select_one('h1').clear();hero.h1.append(fragment('<span>Build a future.<br/>Show your choices.</span>'))
    hero.select_one('.fq-lead').clear();hero.select_one('.fq-lead').append(fragment('<span>Your DIKULT105 final assessment: an interactive work about <b>speculative digital futures</b>, a 2000-word written document, a working URL and a video walkthrough.</span>'))
    start=hero.select_one('.fq-start');start['href']='#brief';start.string='Read the DIKULT105 brief ↓'
    start.insert_after(fragment('<p class="fag-quick-links"><a href="#assessment-criteria">Check the criteria</a> · <a href="#chicago-author-date">Chicago author-date: how to cite</a></p>'))
    # Six clear submission stops; the idea rooms remain available as optional tools.
    nav=page.select_one('.fq-rooms');nav.select_one('.fq-kicker').string='YOUR ASSESSMENT ROUTE'
    destinations=[('brief','The task'),('assessment-criteria','Check your work'),('doc','Your text'),('chicago-author-date','Cite your sources'),('publish','Publish'),('seals','Submit')]
    links=nav.find('div');links.clear()
    for number,(ident,label) in enumerate(destinations,1):links.append(fragment(f'<a href="#{ident}"><span>{number:02d}</span>{label}</a>'))
    optional=page.find(id='optional-workshops')
    if not optional:
        optional=page.new_tag('details',attrs={'id':'optional-workshops','class':'fag-workshops'})
        summary=page.new_tag('summary');summary.string='Optional idea rooms: futures, games, senses and sound';optional.append(summary)
        for ident in ['forge','machine','senses','studio']:optional.append(page.find(id=ident).extract())
        page.find(id='doc').insert_before(optional)
    # Keep saved text fields and their data keys. Prompts must not narrow the open genre brief.
    doc=page.find(id='doc');doc.h2.string='2000 words: theme, genre and process.'
    prompts={
      'link':'Label the interactive work URL and the video walkthrough URL clearly near the start of your document. These are submission links, not research references.',
      'theme':'Analyse the imagined future, how your work addresses it and how the interaction connects to the theme. Use a specific moment from the work as evidence.',
      'genre':'Identify your genre or combination of genres. Explain relevant conventions and how your work uses or changes them. Connect the analysis to sources you have read. Game vocabulary is useful when your work calls for it.',
      'process':'Explain how you made the work. Choose a specific challenge, decision or test and discuss its effect. Show what changed and why; you can also discuss a remaining limitation.',
      'frame':'Optional opening and ending: introduce the work, then draw together what the analysis has shown.'}
    for key,text in prompts.items():doc.select_one(f'.fq-part[data-part="{key}"] > p').string=text
    doc.select_one('.fq-sub').string='Write the document yourself, in English or Norwegian. The brief allows AI only for light editing when you submit in English.'
    outline='''<aside class="fag-outline"><h3>A simple structure you can adapt</h3><p><b>Labelled links + introduction → theme → genre → creative process → conclusion → References.</b> The brief requires the labelled work link and analysis of theme, genre and process. These headings and the box-by-box word aims are suggestions.</p><p>For an analytical paragraph, connect <b>a point → an example from the work → an idea from a source, when relevant → your interpretation</b>. Explain what the connection shows. <a href="#chicago-author-date">See exactly how to cite the source →</a></p></aside>'''
    doc.select_one('.fq-sub').insert_after(fragment(outline))
    # Gradebook symbols and a fixed task count are not established by the supplied brief.
    keys=page.select('#gate0 .is-key');keys[0].h3.string='All required obligatory tasks passed'
    paragraphs=keys[0].find_all('p',recursive=False)
    paragraphs[0].clear();paragraphs[0].append(fragment(f'<span>Check each required task and its recorded result in <a href="https://mitt.uib.no/courses/59620/grades" target="_blank" rel="noopener">MittUiB → Grades / Vurderingar</a>. Read the task instructions in <a href="{FILES}" target="_blank" rel="noopener">Files</a>.</span>'))
    paragraphs[1].string='If a result is missing or unclear, ask the course coordinator. The official result determines eligibility.'
    keys[1].select_one('h3').string='Attendance approved by the course coordinator'
    keys[1].find('p',recursive=False).clear();keys[1].find('p',recursive=False).append(fragment(f'<span><a href="{COURSE}" target="_blank" rel="noopener">UiB requires attendance</a>; more than 25% absence prevents exam eligibility. The checklist below is your own memory aid, not an official calculation.</span>'))
    page.find(id='gate0').select_one('.fq-sub').string='All obligatory work and the attendance requirement must be approved. Only the course coordinator can confirm eligibility.'
    # Publishing alternatives are recommendations, never itch.io-only requirements.
    ship=page.select('#publish [data-fq-list="ship"] li')
    ship[1].find('span').clear();ship[1].find('span').append(fragment('<span>Publish an accessible interactive version. <b>itch.io is recommended</b>; GitHub Pages or another public host that the examiners can open is also allowed.</span>'))
    ship[4].find('span').string='Recommended test: use another computer or the device you designed for. Explain any device or control requirements clearly.'
    # Keep the AI exception specific to the practical work. It never permits generated essay text.
    ai=page.select('#ai .fq-card');ai[0].select_one('.fq-big').string='Do not use AI in creating the interactive work unless you are specifically addressing AI as part of speculative digital futures.'
    ai[0].find_all('p')[-1].string='Alinta explains the permitted scope in class. Ask her if you are unsure before using it.'
    seals={
      'link':('The work opens','A public playable link, accessible to the examiners. Test it without your own login.'),
      'parts':('Theme, genre and process','The document analyses all three and clearly labels the work URL.'),
      'ai':('Your own writing','The practical work follows the AI rule. The document is your own; only light editing in English is permitted.'),
      'inspera':('The hand-in','Submit the written document with its work URL and the required walkthrough. Follow Inspera for format, upload method and deadline.')}
    for key,(title,text) in seals.items():
        node=page.select_one(f'[data-fq-seal="{key}"]').find_parent('label').select_one('.l4-txt');node.clear();b=page.new_tag('b');b.string=title;node.append(b);node.append(text)
    page.select_one('#seals .l4-official').clear();page.select_one('#seals .l4-official').append(fragment(f'<span>The official <a href="{FILES}" target="_blank" rel="noopener">DIKULT105 assessment brief in MittUiB → Files</a>, course updates and Inspera govern the hand-in. Check required file format and how references or captions count towards the word limit there.</span>'))
    for a in page.select('a[href="academic-library.html#writing-desk"]'):
        if 'cite' in a.get_text().lower():a['href']='#chicago-author-date'
    # Styles for the paper-coloured citation desk precede the accessibility override.
    for old in page.select('link[href^="final-assessment-guide.css"]'):old.decompose()
    access=page.select_one('link[href^="accessibility.css"]');access.extract()
    page.head.append(page.new_tag('link',rel='stylesheet',href='final-assessment-guide.css?v=1'));page.head.append(access)
    for script in page.select('script[src^="final-quest.js"]'):script['src']='final-quest.js?v=5'
    path.write_text(str(page),encoding='utf-8',newline='\n')
    from lab_links import apply as lab_links
    lab_links(root,[path])

if __name__=='__main__':build(Path(__file__).resolve().parents[1])

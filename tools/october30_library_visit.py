"""Adapt Lab 5 to collaborative project work and a research visit, preserving later labs."""
from pathlib import Path
from bs4 import BeautifulSoup

VISIT = '''<section class="pv-lab" id="project-research-lab" aria-labelledby="pv-title">
<p class="pv-tag">FRIDAY 30 OCTOBER / YOUR PROJECT GOES TO THE LIBRARY</p>
<h3 id="pv-title">Build together. Find something worth using.</h3>
<p class="pv-lead">Bring the project you are already making, at whatever stage it is. Work alongside each other, get help and take a question from your project into the library.</p>
<div class="pv-stations">
<article><span class="pv-number" aria-hidden="true">01</span><h4>At the workbench</h4><p>Open your latest version. Show a neighbour one part you want to improve. Choose one manageable change and help each other try it.</p><p><strong>Take a question:</strong> how can a player find the next room? What makes an interface welcoming? How can sound tell part of the story?</p><a href="tools.html#construct-toolkit">Open the practical guides</a></article>
<article><span class="pv-number" aria-hidden="true">02</span><h4>Among the shelves</h4><p>Go together and find your way around. Start with your question, search Oria and locate a book that could help. Look at nearby books too: another subject may give you a useful angle.</p><p><strong>Open the book:</strong> use its contents or index to find a relevant passage. What does it help you notice about your project?</p><a href="#library-shelf-route">From a search result to the shelf</a></article>
<article><span class="pv-number" aria-hidden="true">03</span><h4>Back to your idea</h4><p>Tell a partner what you found. Use the idea to try a change or question a choice in your project. Test it together if there is time.</p><p><strong>Keep the connection:</strong> save the source details and the page you used alongside your project files. We continue developing the work in Lab 6.</p><a href="academic-library.html#chicago-author-date">Cite the source you actually read</a></article>
</div>
<details class="pv-shelf" id="library-shelf-route"><summary>First library visit? Find the book, step by step.</summary>
<ol><li><strong>Search UiB's Oria.</strong> Try a title, author or two topic words. Select a physical book record rather than an e-book if you want to find it on a shelf.</li>
<li><strong>Check the copy.</strong> Open “Get It” / “Finn og bestill”. Check the library, availability and full shelf location. Keep those details on your phone.</li>
<li><strong>Find the shelf.</strong> Follow the library's signs and compare the complete shelf mark with the book's spine. Ask staff when you cannot find it. Closed-storage items need requesting.</li>
<li><strong>Find the useful part.</strong> Check the contents, index and relevant pages. Compare the author's argument with what you are making.</li>
<li><strong>Keep the reference.</strong> Save author, title, year, edition and the page you used. For an article, keep its journal details and DOI when available.</li>
<li><strong>Borrow if useful.</strong> Bring your student card or student ID app. Use the self-service machine or ask at the desk.</li></ol>
<p><a href="https://www4.uib.no/universitetsbiblioteket/bruk-biblioteket/bibliotekets-sokeportal-oria" target="_blank" rel="noopener">Open UiB's Oria entry and access help ↗</a> · <a href="https://hjelpekort.app.uib.no/en/KI-3385.html" target="_blank" rel="noopener">UiB's guide to finding and borrowing books ↗</a></p>
</details>
<p class="pv-logistics"><strong>Before we leave:</strong> save your work. We walk to the library together.</p>
<p class="pv-alternative">If you cannot join the walk, use the same question with an e-book or article. <a href="academic-library.html#find-articles">Google Scholar, Sikt's NVA and article-search help</a> are available here. If access is blocked, keep the exact record and ask for help. UiB's Oria page explains access to licensed resources.</p>
<p class="pv-connect"><a href="academic-library.html#research-finder">Help me find research words</a> · <a href="academic-library.html#sources">Browse the starting book collection</a> · <a href="#lab-6">Continue with Lab 6: future lab →</a></p>
</section>'''

AGENDA = [
    (5, 'Open your project', 'Bring your current version, finished or not.', 'Show a neighbour what you are working on and choose one manageable next step.'),
    (10, 'Work together: choose what to improve', 'Try one part of your project with a partner.', 'Ask for specific help, compare ideas and begin a useful change.'),
    (10, 'Build alongside each other', 'Continue your own project.', 'Use a guide when needed. You do not need to start again or switch tools.'),
    (20, 'Keep building; find a research question', 'What could research help you understand about this project?', 'Work on your chosen change. Before the break, try two search words in Oria and check a possible book location.'),
    (10, 'Break: step away', 'Save your work and take a real break.', 'Stretch, get water or leave the screen.'),
    (30, 'Library visit: find research and the shelves', 'Go together, find your way around and look for something relevant.', 'This block includes walking. Check the library, copy status and shelf mark in Oria. Open a useful chapter or browse with a partner; ask staff for help.'),
    (5, 'Short break: reset', 'Take a real break.', 'Keep the source details so you can find the material again.'),
    (10, 'Connect the research to your project', 'Share one useful idea with a partner.', 'Wherever we finish, use it to test a change or question a design decision. Keep the actual reference and page.'),
    (5, 'Save and choose your next step', 'Save your project and keep the source you found.', 'Choose what to continue in Lab 6 on 6 November. Follow the current course instructions on Mitt UiB.'),
]


def update(root):
    path = root / 'labs/lab-programme.html'
    page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    lab = page.find(id='lab-5')
    lab.select_one('.lab-title h2').string = 'Project lab + library visit'
    lab.select_one('.lab-title .lead').string = 'Work on your own project together, then find research and discover where the books live.'
    for node in page.select('.lab-nav a[href="#lab-5"] strong'):
        node.string = 'Projects + library'
    orb = page.select_one('.lab-nav a[href="#lab-5"] .lv-orb i')
    if orb: orb.string = 'MAKE'
    arrival = lab.find(id='checkin-title-5')
    arrival.string = 'What does your project need next?'
    lab.select_one('#lab-5-arrival .arrival-prompt').string = 'Open the work you already have. Today we help each other build, then explore the library with a question from our projects.'
    work = lab.find(id='lab-5-workbench')
    for old in page.select('#project-research-lab'): old.decompose()
    band = page.find(id='lab-5-sec-1')
    band.select_one('.sb-title').string = 'Your project + the library'
    band.select_one('.sb-desc').string = 'One project, a useful question and a source to take back into your work.'
    band.select_one('.time-chip')['data-to'] = '85'
    band.insert_after(BeautifulSoup(VISIT, 'html.parser').find())
    work.select_one('.route-kicker').string = 'CONTINUE FROM LAB 4'
    work.select_one('.route-card h4').string = 'Keep your project. Give it a useful next step.'
    # These keep their IDs and scripts; practice and publishing remain available on demand.
    for ident, label in [('test-lab', 'Optional: practise giving useful feedback'), ('publish-your-project', 'Ready to share? Export and publish')]:
        node = page.find(id=ident)
        if not node.parent.get('data-pv-optional'):
            drawer = page.new_tag('details', attrs={'class':'pv-optional', 'data-pv-optional':ident})
            summary = page.new_tag('summary'); summary.string = label; drawer.append(summary)
            node.replace_with(drawer); drawer.append(node)
        work.select_one('.resources').insert_after(node.parent.extract())
    page.find(id='lab-5-sec-2').select_one('.sb-title').string = 'Make the research useful'
    page.find(id='lab-5-sec-2').select_one('.time-chip')['data-from'] = '90'
    page.find(id='lab-5-sec-2').select_one('.time-chip')['data-to'] = '100'
    for href,label in [('#lab-5-sec-1','Projects + library'),('#lab-5-sec-2','Use what you found'),('#lab-5-sec-3','Help when needed')]:
        work.select_one(f'.step-map a[href="{href}"] span').string = label
    mission = work.select_one('[data-mission="5"]')
    brief = mission.select_one('.mission-brief')
    brief.h3.string = 'Let research change something.'
    brief.select_one('h3 + p').string = 'Connect what you found in the library to a choice in the project you are building.'
    brief.select_one('.mission-prompt').string = 'Does the source support your choice, challenge it or suggest something to try?'
    brief.select_one('a.primary')['href'] = '#project-research-lab'
    brief.select_one('a.primary').string = 'Return to the project + library route'
    checks = ['Work on one part of my project with a peer.', 'Find a relevant source and read a useful passage, or identify what I need help accessing.', 'Use research or feedback to choose a revision, and save my current version.']
    for node,text in zip(mission.select('.mission-check span'), checks): node.string = text
    mission.select_one('.own-mind h4').string = 'Your project brings the question.'
    mission.select_one('.own-mind > p:not(.eyebrow)').string = 'Keep building what matters to you. Use another person and a relevant source to see it differently.'
    mission.select_one('.own-mind-actions').clear()
    mission.select_one('.own-mind-actions').append(BeautifulSoup('<li><strong>Build</strong> one useful change.</li><li><strong>Find</strong> a source that fits your question.</li><li><strong>Connect</strong> the idea to a design choice.</li>','html.parser'))
    finish = page.find(id='lab-5-finish')
    finish.select_one('.finish-mission h3').string = 'Save your work. Keep the source.'
    finish.select_one('.finish-mission > ol').clear()
    finish.select_one('.finish-mission > ol').append(BeautifulSoup('<li><strong>Save your current project.</strong> Keep the version you worked on today.</li><li><strong>Keep the source details.</strong> Save the reference and the passage or page you used.</li>','html.parser'))
    link = finish.select_one('.finish-mission > a.primary')
    link['href'] = '#lab-6'; link.string = 'Next lab: future lab, 6 November →'
    agenda = lab.select_one('.agenda'); agenda.clear()
    elapsed = 0
    for minutes,title,prompt,detail in AGENDA:
        row = BeautifulSoup(f'<li class="agenda-row{" break-row" if title.startswith(("Break", "Short break")) else ""}" data-extension="false" data-minutes="{minutes}"><div class="time"><span class="clock"></span><span class="elapsed">{elapsed}-{elapsed+minutes} min</span></div><div class="activity"><h4></h4><p class="row-prompt"></p><details class="row-detail" open=""><summary>Details &amp; help</summary><p></p></details></div></li>','html.parser').find()
        start,end=495+elapsed,495+elapsed+minutes
        row.select_one('.clock').string=f'{start//60:02d}:{start%60:02d}-{end//60:02d}:{end%60:02d}'
        row.h4.string=title;row.select_one('.row-prompt').string=prompt;row.select_one('.row-detail p').string=detail
        agenda.append(row);elapsed+=minutes
    assert elapsed == 105
    resources=work.select_one('.resources ul')
    for href,label in [('academic-library.html#research-finder','Find research for my project'),('academic-library.html#find-articles','Find articles with Google Scholar and Sikt'),('academic-library.html#chicago-author-date','Chicago author-date: cite what I read')]:
        if not resources.select_one(f'a[href="{href}"]'):
            li=page.new_tag('li');a=page.new_tag('a',href=href);a.string=label;li.append(a);resources.insert(0,li)
    if not page.select_one('link[href^="project-library-visit.css"]'):
        stylesheet=page.new_tag('link',rel='stylesheet',href='project-library-visit.css?v=20261030')
        accessibility=page.select_one('link[href^="accessibility.css"]')
        if accessibility: accessibility.insert_before(stylesheet)
        else: page.head.append(stylesheet)
    for a in page.select('a[href="#lab-5"]'):
        if a.get_text(' ',strip=True)=='Lab 5: test and publish →': a.string='Lab 5: projects + library →'
    path.write_text(str(page), encoding='utf-8', newline='\n')
    # Keep the shared eight-week route and roadmap consistent, including the exam hub.
    for name in ['lab-programme.html','final-assessment.html']:
        p=root/'labs'/name
        html=p.read_text(encoding='utf-8')
        html=html.replace('<b>Someone tests it</b><small>Test &amp; publish</small>','<b>Build + investigate</b><small>Projects + library</small>')
        html=html.replace('30 Oct · test and publish. Video lecture counts as attendance','30 Oct · projects + library. Video lecture counts as attendance')
        p.write_text(html,encoding='utf-8',newline='\n')


if __name__ == '__main__':
    update(Path(__file__).resolve().parents[1])

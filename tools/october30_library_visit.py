"""Adapt Lab 5 to collaborative project work and a research visit, preserving later labs."""
from pathlib import Path
from bs4 import BeautifulSoup

VISIT = '''<section class="pv-lab" id="project-research-lab" aria-labelledby="pv-title">
<p class="pv-tag">FRIDAY 30 OCTOBER / PROJECT WORK, LIBRARY OR BOTH</p>
<h3 id="pv-title">Your project. Your route.</h3>
<p class="pv-lead">Stay in the lab and work on your project, explore the library, or combine the two. Choose what helps you today. The library visit is optional.</p>
<div class="pv-stations">
<article><span class="pv-number" aria-hidden="true">BUILD</span><h4>Stay in the lab</h4><p>Open your latest version and choose one manageable change. Work alongside each other, ask for help and let a neighbour try what you are making.</p><p><strong>Your focus:</strong> an interaction, a scene, an interface, sound or a problem you want to solve. You can spend the whole session on your project.</p><a href="tools.html#construct-toolkit">Open the practical guides</a></article>
<article><span class="pv-number" aria-hidden="true">BROWSE</span><h4>Explore the library</h4><p>Find your way around, search Oria and locate a book that could help with your interests. Look at nearby books too: another subject may give you a useful angle.</p><p><strong>Open the book:</strong> use its contents or index to find a relevant passage. Keep the source details and the page you used.</p><a href="#library-shelf-route">From a search result to the shelf</a></article>
<article><span class="pv-number" aria-hidden="true">MIX</span><h4>Combine both</h4><p>Work on your project, take a question to the library and use what you find to try a change or question a design choice. Switch between making and researching when it helps.</p><p><strong>For example:</strong> build a room, read about how game interfaces guide players, then try a clearer signal in your scene.</p><a href="academic-library.html#chicago-author-date">Cite the source you actually read</a></article>
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
<p class="pv-logistics"><strong>If you go to the library:</strong> save any open project files before leaving. Allow time for the walk.</p>
<p class="pv-alternative">You can also research from the lab using an e-book or article. <a href="academic-library.html#find-articles">Google Scholar, Sikt's NVA and article-search help</a> are available here. If access is blocked, keep the exact record and ask for help. UiB's Oria page explains access to licensed resources.</p>
<p class="pv-connect"><a href="academic-library.html#research-finder">Help me find research words</a> · <a href="academic-library.html#sources">Browse the starting book collection</a> · <a href="#lab-6">Continue with Lab 6: future lab →</a></p>
</section>'''

AGENDA = [
    (5, 'Choose your route', 'Project work in the lab, library research, or both.', 'Bring your current project or a research question. Choose one useful goal.'),
    (10, 'Get started and help each other', 'Open your project or begin a research search.', 'Compare ideas, ask for help or look up a book location in Oria if you want to visit the library.'),
    (10, 'Project work or research', 'Continue with the route you chose.', 'Build, test, read or explore the library. Allow walking time if you go.'),
    (20, 'Keep going, or combine the routes', 'Use the time for what your project needs.', 'Work alongside others, follow a research lead or move between the lab and library.'),
    (10, 'Break: step away', 'Save your work and take a real break.', 'Stretch, get water or leave the screen.'),
    (30, 'Continue: project, library or both', 'Stay with your route or try the other one.', 'The library visit is optional. Keep building in the lab, find a useful source, or connect reading to a design choice.'),
    (5, 'Short break: reset', 'Take a real break.', 'Step away from what you are working on.'),
    (10, 'Try, discuss or follow up', 'Use the last work block for your chosen goal.', 'Test a change with a neighbour, read a useful passage or follow up a question.'),
    (5, 'Save and choose your next step', 'Save your project work or the research details you want to keep.', 'Choose what to continue in Lab 6 on 6 November. Follow the current course instructions on Mitt UiB.'),
]


def update(root):
    path = root / 'labs/lab-programme.html'
    page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    lab = page.find(id='lab-5')
    lab.select_one('.lab-title h2').string = 'Project lab: choose your route'
    lab.select_one('.lab-title .lead').string = 'Work on your project in the lab, visit the library, or combine both. The library visit is optional.'
    for node in page.select('.lab-nav a[href="#lab-5"] strong'):
        node.string = 'Project lab'
    orb = page.select_one('.lab-nav a[href="#lab-5"] .lv-orb i')
    if orb: orb.string = 'MAKE'
    arrival = lab.find(id='checkin-title-5')
    arrival.string = 'What does your project need next?'
    lab.select_one('#lab-5-arrival .arrival-prompt').string = 'Choose what would help you today: work on your project in the lab, explore research at the library, or combine the two.'
    work = lab.find(id='lab-5-workbench')
    for old in page.select('#project-research-lab'): old.decompose()
    band = page.find(id='lab-5-sec-1')
    band.select_one('.sb-title').string = 'Choose: project work, library or both'
    band.select_one('.sb-desc').string = 'These are three ways to use the session. You can stay with one or switch between them.'
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
    page.find(id='lab-5-sec-2').select_one('.sb-title').string = 'Your chosen next step'
    page.find(id='lab-5-sec-2').select_one('.time-chip')['data-from'] = '90'
    page.find(id='lab-5-sec-2').select_one('.time-chip')['data-to'] = '100'
    for href,label in [('#lab-5-sec-1','Choose your route'),('#lab-5-sec-2','Your next step'),('#lab-5-sec-3','Help when needed')]:
        work.select_one(f'.step-map a[href="{href}"] span').string = label
    mission = work.select_one('[data-mission="5"]')
    brief = mission.select_one('.mission-brief')
    brief.h3.string = 'Move your work forward.'
    brief.select_one('h3 + p').string = 'Build something, investigate a question or use research to explore a design choice. Choose what is useful for you.'
    brief.select_one('.mission-prompt').string = 'What did you try or discover, and what would you like to do next?'
    brief.select_one('a.primary')['href'] = '#project-research-lab'
    brief.select_one('a.primary').string = 'Return to the project + library route'
    checks = ['Choose a useful project goal or research question.', 'Make progress on my project, explore a relevant source, or combine the two.', 'Save the work or source details I want to keep, and choose my next step.']
    for node,text in zip(mission.select('.mission-check span'), checks): node.string = text
    mission.select_one('.own-mind h4').string = 'Choose what helps you today.'
    mission.select_one('.own-mind > p:not(.eyebrow)').string = 'Continue your project, explore research or mix both. Help each other along the way.'
    mission.select_one('.own-mind-actions').clear()
    mission.select_one('.own-mind-actions').append(BeautifulSoup('<li><strong>Choose</strong> a goal.</li><li><strong>Try</strong> it through making, reading or both.</li><li><strong>Keep</strong> what helps you continue.</li>','html.parser'))
    finish = page.find(id='lab-5-finish')
    finish.select_one('.finish-mission h3').string = 'Keep what you worked on.'
    finish.select_one('.finish-mission > ol').clear()
    finish.select_one('.finish-mission > ol').append(BeautifulSoup('<li><strong>Save what you worked on.</strong> Your project files, research details or both.</li><li><strong>Choose your next step.</strong> What would help you continue next time?</li>','html.parser'))
    saved=finish.select_one('[data-final="saved"]').parent
    saved.contents[-1].replace_with(' I saved my project work or the research details I want to keep.')
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
        html=html.replace('<b>Build + investigate</b><small>Projects + library</small>','<b>Your next step</b><small>Project / research</small>')
        html=html.replace('30 Oct · test and publish. Video lecture counts as attendance','30 Oct · projects + library. Video lecture counts as attendance')
        html=html.replace('30 Oct · projects + library. Video lecture counts as attendance','30 Oct · project lab, optional library visit. Video lecture counts as attendance')
        p.write_text(html,encoding='utf-8',newline='\n')
    from halloween_library import apply
    apply(root)


if __name__ == '__main__':
    update(Path(__file__).resolve().parents[1])

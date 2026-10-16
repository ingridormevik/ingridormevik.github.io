"""Connect the research collection to DIKULT105 through practical decisions."""
from bs4 import BeautifulSoup


def learning(root):
    path = root / 'labs/academic-library.html'
    page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    content = '''<section class="al-reading cw-bench" id="course-workbench" aria-labelledby="cw-title">
<p class="al-tag">DIKULT105 / FROM IDEA TO SOMETHING PEOPLE CAN USE</p>
<h2 id="cw-title">Make it. Try it. Understand it.</h2>
<p>Choose a route from the collection. Build one small part, find research that helps you question it, and use what you discover to improve it. You can return to any stage.</p>
<details class="cw-drawer"><summary>What will I learn, and where do I practise it?</summary>
<ol class="cw-stations">
<li><span class="cw-number" aria-hidden="true">01</span><h3>Choose an experience</h3><p>Who is it for? What can that person do? Start with one screen, scene or task.</p><a href="#genre-explorer">Find a making route</a></li>
<li><span class="cw-number" aria-hidden="true">02</span><h3>Make it respond</h3><p>Connect an input to a visible or audible result. Learn the code or design tool through a working example.</p><a href="javascript-construct.html">A first JavaScript interaction</a><a href="lab-programme.html#mapping-first-contact">Build and play in Construct</a></li>
<li><span class="cw-number" aria-hidden="true">03</span><h3>Shape the experience</h3><p>Use conventions for your form. Compare how type, colour, sound, pacing or movement changes its meaning.</p><a href="#aesthetics">Try the aesthetics bench</a></li>
<li><span class="cw-number" aria-hidden="true">04</span><h3>Investigate a choice</h3><p>Use a relevant source to question your design. Examine the tools and industries behind it: ownership, labour, access or representation.</p><a href="#sources">Find and read a source</a></li>
<li><span class="cw-number" aria-hidden="true">05</span><h3>Test and work together</h3><p>Watch someone try a real task. Revise what gets in the way. In a group, agree responsibilities and negotiate changes.</p><a href="lab-programme.html#test-lab">Use the Test Lab</a><a href="accessibility-lab.html">Check access and alternatives</a></li>
<li><span class="cw-number" aria-hidden="true">06</span><h3>Share and explain</h3><p>Export a working artefact. Use examples, sources and test evidence to discuss your choices, limitations and contribution in a critical report.</p><a href="publish-guide.html">Export and publish</a><a href="#reading">Read and cite accurately</a></li>
</ol>
<p class="cw-source">This practice route connects to <a href="https://www4.uib.no/en/studies/courses/dikult105" target="_blank" rel="noopener">UiB's official DIKULT105 learning outcomes</a>. These are lab suggestions. Your assignment brief and course reading list are in MittUiB.</p>
</details>
<details class="cw-drawer"><summary>Can a podcast, film or useful app belong here too?</summary>
<p>Yes, these forms belong in digital culture research. Whether one meets your assignment depends on the brief. Ask what your digital design contributes: a listener can choose a route, a viewer can compare accounts, or an app can help someone participate.</p>
<p>A button alone does not make a work a game or electronic literature. Explain what the interaction does for the experience. You can prototype the idea with the web and Construct skills from the labs; some forms need other tools.</p>
<p>The collection mixes genres, media, techniques and making practices, and labels which is which. Accessibility, aesthetics, ethics and collaboration matter across the collection. You do not need to try every route.</p>
</details>
</section>'''
    page.select_one('#genre-explorer').insert_before(BeautifulSoup(content, 'html.parser').find())
    page.select_one('.lc-benches').insert_after(BeautifulSoup('<p class="lc-course-link"><a href="#course-workbench">What can I learn here in DIKULT105?</a></p>', 'html.parser').find())
    path.write_text(str(page), encoding='utf-8', newline='\n')

"""Add optional, contextual HTML missions without adding required guide steps."""
from pathlib import Path
from bs4 import BeautifulSoup

def add_missions(out):
    path = out / 'javascript-construct.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    def fragment(text):
        return BeautifulSoup(text, 'html.parser').find()
    for old in s.select('[data-html-mission]'):
        old.decompose()
    missions = [
      (1, '''<details class="html-mission" data-html-mission="1"><summary><span>OPTIONAL MISSION 01 / FIND THE CONTROL</span><span data-html-badge>Signal not checked</span></summary><div class="html-mission-body"><p class="eyebrow">OBJECT SCANNER</p><h3>Which part lets someone act?</h3><p>Inspect this tiny page. Press its button, then match what you see to the HTML.</p><div class="html-mission-preview"><p data-html-demo-text aria-live="polite">A place can hold more than one story.</p><button type="button" data-html-demo>Show another story</button></div><dl><dt><code>&lt;p&gt;</code></dt><dd>The paragraph holds the words.</dd><dt><code>&lt;button&gt;</code></dt><dd>The button gives the visitor a control they can activate.</dd><dt><code>id="future"</code></dt><dd>A unique name for an element. It lets our JavaScript find this button.</dd></dl><p><strong>Scan question:</strong> which part creates the button itself?</p><div class="html-mission-choices" role="group" aria-label="Choose the HTML that creates the control"><button disabled type="button" data-html-choice="p">&lt;p&gt;</button><button disabled type="button" data-html-choice="button">&lt;button&gt;</button><button disabled type="button" data-html-choice="id">id="future"</button></div><p data-html-feedback role="status">Choose an answer when you are ready.</p><p class="look"><strong>Try in VS Code:</strong> change the words between your button tags, save and check the preview. Keep its id the same.</p><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button" target="_blank" rel="noopener">MDN: button reference</a><noscript><p>The definitions and VS Code experiment work without JavaScript. The scanner answers need JavaScript.</p></noscript></div></details>'''),
      (2, '''<details class="html-mission" data-html-mission="2"><summary><span>OPTIONAL MISSION 02 / CONNECT THE CIRCUIT</span><span data-html-badge>Signal not checked</span></summary><div class="html-mission-body"><p class="eyebrow">FILE CONNECTOR</p><h3>What needs to exist before the script runs?</h3><ol class="html-circuit" aria-label="Deferred script sequence"><li>Read the HTML</li><li>Paragraph and button exist</li><li>Run story.js</li></ol><dl><dt><code>&lt;head&gt;</code></dt><dd>Information about the page, including this script connection.</dd><dt><code>&lt;body&gt;</code></dt><dd>The page content, including the paragraph and button.</dd><dt><code>&lt;script src="story.js" defer&gt;&lt;/script&gt;</code></dt><dd>Load story.js and run it after the HTML has been parsed. It can then find the elements.</dd></dl><p><strong>Connection question:</strong> with this deferred script, when do our instructions run?</p><div class="html-mission-choices" role="group" aria-label="Choose when the deferred script runs"><button disabled type="button" data-html-choice="before">Before the HTML is parsed</button><button disabled type="button" data-html-choice="after">After the HTML is parsed</button></div><p data-html-feedback role="status">Choose an answer to check the connection.</p><p class="look"><strong>Try in VS Code:</strong> compare the filename in src with the file in Explorer. Check that the paragraph and button ids match your selectors.</p><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script" target="_blank" rel="noopener">MDN: script reference</a><noscript><p>The circuit diagram and file checks work without JavaScript. The answer check needs JavaScript.</p></noscript></div></details>''')]
    for n, html in missions:
        s.select_one(f'#step-{n} .look').insert_after(fragment(html))
    if not s.select_one('link[href^="html-missions.css"]'):
        s.head.append(fragment('<link rel="stylesheet" href="html-missions.css?v=1"/>'))
    if not s.select_one('script[src^="html-missions.js"]'):
        s.head.append(fragment('<script defer src="html-missions.js?v=1"></script>'))
    path.write_text(str(s), encoding='utf-8', newline='\n')
    tools = out / 'tools.html'
    t = BeautifulSoup(tools.read_text(encoding='utf-8'), 'html.parser')
    if not t.select_one('#html-reference-guide'):
        main = t.select_one('main')
        link = fragment('''<details class="resources" id="html-reference-guide"><summary>HTML field guide / find an element for your project</summary><p>Need a heading, image, list, link or control? Look up the element when your project needs it.</p><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements" target="_blank" rel="noopener">Open MDN's complete HTML elements reference</a><p class="small">Optional reference. The JavaScript beginner guide explains the few elements needed for your first click.</p></details>''')
        footer = main.select_one('footer')
        if footer: footer.insert_before(link)
        else: main.append(link)
    tools.write_text(str(t), encoding='utf-8', newline='\n')

if __name__ == '__main__':
    import sys
    add_missions(Path(sys.argv[1]) / 'labs')

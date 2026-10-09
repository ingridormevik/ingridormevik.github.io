"""Build the plain VS Code beginner route after applying the October lab plan."""
from pathlib import Path
import html
import re
import zipfile
from bs4 import BeautifulSoup

CODE = '''const story = document.querySelector("#story");
const button = document.querySelector("#future");

function revealStory() {
  story.textContent = "Someone else remembers this place differently.";
}

button.addEventListener("click", revealStory);
'''
HTML = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Another perspective</title>
  <script src="story.js" defer></script>
</head>
<body>
  <h1>A place I know</h1>
  <p id="story" aria-live="polite">I know this place.</p>
  <button id="future" type="button">Show another perspective</button>
</body>
</html>
'''

def improve(base, out):
    def parse(text):
        return BeautifulSoup(text, 'html.parser')
    def node(text):
        return parse(text).find()
    def save(name, text):
        path = out / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text.replace('\u2014', ': ').replace('\u2013', '-'), encoding='utf-8', newline='\n')
    def codebox(name, text, ident):
        return f'<div class="code-heading"><strong>{name}</strong><button data-copy="{ident}" type="button">Copy code</button></div><pre tabindex="0"><code id="{ident}">{html.escape(text)}</code></pre><p id="{ident}-status" role="status" class="small"></p>'

    guide = parse((out / 'javascript-construct.html').read_text(encoding='utf-8'))
    guide.title.string = 'JavaScript first steps in VS Code | DIKULT105'
    guide.select_one('meta[name="description"]')['content'] = 'A beginner route in VS Code: open your page, connect a JavaScript file, make one click change text, explain it and test your own change.'
    guide.select_one('.guide-location span').string = 'GUIDE / JAVASCRIPT FIRST STEPS'
    guide.select_one('.intro').replace_with(node('''<section class="intro"><p class="eyebrow">LAB 2 / OPEN VS CODE BESIDE THIS GUIDE</p><h1>One click.<br/><em>Your first response.</em></h1><p class="lead">Make one button change one sentence in your own webpage. Understand it, change it and test it.</p><p>HTML puts the paragraph and button on the page. CSS controls their appearance. JavaScript gives the button an action. Today we connect those three things.</p><p>A workshop, not a speedrun. You can stop with one working response. No AI or terminal is required.</p><p><a class="primary" href="#step-1">Start with your Lab 1 page</a> <a href="javascript-beginner-starter.zip" download>Need a blank starting point? Download the starter</a></p><nav aria-label="Beginner steps"><a href="#step-1">1. Open your page</a> · <a href="#step-2">2. Connect the file</a> · <a href="#step-3">3. Give the click an action</a> · <a href="#step-4">4. Make it yours and test</a></nav><p class="small">Construct scripting is kept in <a href="#construct-extra">an optional section</a>. It is separate from this first webpage exercise.</p></section>'''))

    # Four small steps are the only steps in the guide reader.
    guide.select_one('#step-1').replace_with(node('''<section class="step" data-reader-step id="step-1"><p class="eyebrow">STEP 1 / HTML FIRST</p><h2>Open the page you already made.</h2><ol><li>Keep a copy of your Lab 1 folder before editing it. In VS Code, choose <strong>File &gt; Open Folder</strong> and open that folder.</li><li>Open <strong>index.html</strong>. Look for the <code>&lt;body&gt;</code> and its closing <code>&lt;/body&gt;</code>. The things visitors see belong between them.</li><li>Add the paragraph and button below inside the body. Use each id only once. If you already have an element with that id, adapt it instead.</li><li>Save with <strong>Ctrl+S</strong> on Windows or <strong>Cmd+S</strong> on Mac. Open <strong>Show Preview</strong> with Microsoft Live Preview.</li></ol>''' + codebox('Add this inside the body of index.html', '<p id="story" aria-live="polite">I know this place.</p>\n<button id="future" type="button">Show another perspective</button>', 'beginner-html') + '''<p><code>p</code> is a paragraph. <code>button</code> is a button. Each <code>id</code> is a unique name JavaScript can use to find that element.</p><p class="look"><strong>What you should see:</strong> your sentence and button. Clicking does nothing yet. We have built the controls, but have not given them instructions.</p><details><summary>I do not have a page or cannot find Preview.</summary><p>Use the <a href="javascript-beginner-starter.zip" download>blank starter</a>. Extract it, then open its folder in VS Code. For Live Preview installation and its toolbar, follow the <a href="setup.html">VS Code setup guide</a>.</p><p><a href="javascript-first-example/index.html" target="_blank" rel="noopener">See the finished reference</a>. Your own files are the ones you will edit.</p></details><a class="primary" href="#step-2">Continue: connect the JavaScript file</a></section>'''))

    guide.select_one('#step-2').replace_with(node('''<section class="step" data-reader-step id="step-2"><p class="eyebrow">STEP 2 / TWO FILES, ONE PAGE</p><h2>Tell the page where its JavaScript lives.</h2><ol><li>In VS Code's Explorer, create a file called <strong>story.js</strong> in the same folder as <strong>index.html</strong>. The ending is <code>.js</code>, not <code>.js.txt</code>.</li><li>In index.html, add this line before <code>&lt;/head&gt;</code>. If the starter already contains it, keep that one line.</li></ol>''' + codebox('One line inside the head of index.html', '<script src="story.js" defer></script>', 'beginner-script') + '''<pre class="folder-tree">your-project/
  index.html
  story.js</pre><p><code>src="story.js"</code> names the file to load. <code>defer</code> lets the browser finish reading the HTML before it runs that file. The paragraph and button will then be available to find.</p><p>VS Code edits and saves the files. The browser in Live Preview runs the JavaScript.</p><p class="look"><strong>Check:</strong> both files sit beside each other in Explorer. Save index.html. An empty story.js is fine for now; the button still has no action.</p><details><summary>I am starting with no HTML file.</summary><p>This is the whole starter page. Use it in a new folder, rather than replacing your existing project.</p>''' + codebox('Complete index.html for the blank starter', HTML, 'beginner-full-html') + '''</details><a class="primary" href="#step-3">Continue: write the click action</a></section>'''))

    guide.select_one('#step-3').replace_with(node('''<section class="step" data-reader-step id="step-3"><p class="eyebrow">STEP 3 / FIND, LISTEN, CHANGE</p><h2>Give your button one job.</h2><p>Open <strong>story.js</strong>. Put this code in that file and save. A .js file contains JavaScript, so leave out the HTML <code>&lt;script&gt;</code> tags.</p>''' + codebox('story.js', CODE, 'web-code') + '''<p class="look"><strong>Try it now:</strong> reload Live Preview if needed, then click <strong>Show another perspective</strong>. The paragraph should change. The function waits for your click.</p><div class="code-explain"><p class="ce-title">READ THE CODE FROM TOP TO BOTTOM</p><ol class="ce-lines"><li><code>const story = document.querySelector("#story");</code><span><strong>Find the paragraph.</strong> <code>document</code> is the page. <code>querySelector("#story")</code> finds the element whose id is story. <code>const story</code> gives that element a name in our JavaScript. We can change its text while keeping the same reference.</span></li><li><code>const button = document.querySelector("#future");</code><span><strong>Find the button.</strong> We use the same method, with the button's id. These two lines find things; they do not change what a visitor sees.</span></li><li><code>function revealStory() { ... }</code><span><strong>Name an action.</strong> A function is a set of instructions we can run. The braces <code>{ }</code> enclose this function's instructions. Its name here is revealStory.</span></li><li><code>story.textContent = "Someone else remembers this place differently.";</code><span><strong>Change the paragraph's words.</strong> <code>textContent</code> is its text. <code>=</code> sets it to the sentence on the right. The quotation marks mean this value is text.</span></li><li><code>button.addEventListener("click", revealStory);</code><span><strong>Wait for the click.</strong> When this button receives a click, run revealStory. We pass the function's name here, without <code>()</code>, so it can run later.</span></li></ol></div><details><summary>What are the punctuation marks doing?</summary><ul><li>A dot accesses something on an object: <code>story.textContent</code> means the story element's text.</li><li>Parentheses hold inputs when a function is called: <code>querySelector("#story")</code>.</li><li>The comma separates the event name and the function in addEventListener.</li><li>The semicolon ends each statement in this example. Keep the quotes, parentheses and braces paired.</li><li><code>revealStory()</code> calls the function now. <code>revealStory</code> in the listener tells it which function to call when a click happens.</li></ul></details><p>Click again. The same sentence stays there because the same instructions run again. Reload the page to return to the initial HTML sentence.</p><a class="primary" href="#step-4">Continue: make one deliberate change</a></section>'''))

    guide.select_one('#step-4').replace_with(node('''<section class="step" data-reader-step id="step-4"><p class="eyebrow">STEP 4 / YOUR WORDS, YOUR TEST</p><h2>Make the response belong to your project.</h2><ol><li>In index.html, replace <strong>I know this place.</strong> with your own starting sentence. Choose a place, feeling or question from your project.</li><li>In story.js, replace the sentence inside quotation marks with another perspective. Keep the quotation marks and the rest of the mechanism.</li><li>Change the button's label in index.html so it tells the visitor what they can do.</li><li>Save both files. Reload the preview. Say what you expect before clicking, then compare it with what actually happens.</li></ol><div class="look"><strong>Test three things:</strong><ul><li>Before the first click, the page shows your starting sentence.</li><li>After the click, the page shows your new sentence.</li><li>A second click repeats the same action. It does not return to the first sentence yet.</li></ul></div><p>Use Tab to focus the button, then Enter or Space to activate it. Check the page at a narrow preview width. Keep your CSS from Lab 1.</p><p><strong>Your note:</strong> I wanted the visitor to ____. The click changed ____. My second click ____. I chose these words because ____.</p><p><a class="primary" href="lab-programme.html#lab-2-sec-3">Return to my Lab 2 project and note</a></p><p>One working response is enough to continue with your own project. An AI tool is optional.</p><details><summary>Optional: make a second click bring the first sentence back.</summary><p>This adds <strong>state</strong>: a value that remembers which sentence is showing. Try the <a href="lab-programme.html#signal-room">optional Signal Control Room</a> when the first click makes sense. You can leave this challenge for later.</p></details></section>'''))

    optional = node('<details class="step" id="construct-extra"><summary>Optional later: use JavaScript in Construct</summary><p>The browser exercise above is complete. These older steps are kept as an extra route for students who want scripting. The main Construct labs use event sheets and begin with Mapping.</p></details>')
    for n in range(5,10):
        section = guide.select_one('#step-' + str(n)).extract()
        section.attrs.pop('data-reader-step', None)
        optional.append(section)
    guide.select_one('#steps').insert_after(optional)
    finish = guide.select_one('#steps > .finish')
    if finish:
        finish.decompose()
    help_section = guide.select_one('#help')
    help_section.insert_before(node('''<section class="step" id="first-click-help"><p class="eyebrow">WHEN THE CLICK DOES NOTHING</p><h2>Check one connection at a time.</h2><ol><li><strong>The button is missing:</strong> check index.html and put the button inside the body.</li><li><strong>The button is visible but does nothing:</strong> save story.js and check that the script's filename is exactly story.js.</li><li><strong>The page cannot find an element:</strong> match <code>id="story"</code> with <code>"#story"</code>, and <code>id="future"</code> with <code>"#future"</code>. Keep <code>defer</code> on the script line.</li><li><strong>The code stops:</strong> compare quotes, braces and parentheses with the example. Open the preview in a browser and look at its developer tools Console for an error.</li></ol><p>Show Ingrid the two files, what you expected and what happened. You do not have to debug alone.</p></section>'''))
    # Keep the full older troubleshooting reference, labelled as an extra.
    help_section.extract()
    help_section.attrs.pop('data-reader-step', None)
    optional.append(help_section)
    guide.select_one('#first-click-help').insert_after(node('''<section class="step" id="javascript-sources"><h2>Keep learning when you want to.</h2><p><a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript" target="_blank" rel="noopener">MDN: What is JavaScript?</a> explains how HTML, CSS and JavaScript work together.</p><p><a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash" target="_blank" rel="noopener">MDN: A first splash into JavaScript</a> is a longer number-guessing-game tutorial for a later session. It introduces several ideas together; it is optional reading here.</p><p><a href="https://github.com/microsoft/vscode-livepreview#html-file-previewing" target="_blank" rel="noopener">Microsoft Live Preview instructions</a> · <a href="https://www.freecodecamp.org/learn/" target="_blank" rel="noopener">freeCodeCamp practice</a></p></section>'''))
    # These guide finish screens no longer claim that Construct is a Lab 2 requirement.
    for text in guide.find_all(string=True):
        if 'Finish the Lab 2 checklist separately.' in str(text):
            text.replace_with('Optional practice. Return to your current lab project when you are ready.')
    for script in guide.select('script[src^="javascript-guide.js"]'):
        script['src'] = 'javascript-guide.js?v=beginner-route-1'
    for text in guide.find_all(string=True):
        if 'Extract it, then open its folder in VS Code.' in str(text):
            text.replace_with(str(text).replace('Extract it, then open its folder in VS Code.', 'Extract the zip, then open the my-first-interaction folder in VS Code. The solution folder is a separate completed reference.'))
    quick_help = guide.select_one('#first-click-help')
    collapsed_help = node('<details class="step" id="first-click-help"><summary>My first click does nothing: open the help drawer</summary></details>')
    for child in list(quick_help.contents):
        collapsed_help.append(child.extract())
    quick_help.replace_with(collapsed_help)
    save('javascript-construct.html', str(guide))

    programme = parse((out / 'lab-programme.html').read_text(encoding='utf-8'))
    lab = programme.select_one('#lab-2')
    lab.select_one('#lab-2-sec-2 .sb-title').string = 'JavaScript first steps in VS Code'
    lab.select_one('#lab-2-sec-2 .sb-desc').string = 'Open your own page. Connect a JavaScript file. Make one click change one sentence, then explain and test your change.'
    band = lab.select_one('#lab-2-sec-2')
    band.insert_after(node('''<section class="course-panel" id="javascript-first-contact"><p class="eyebrow">START HERE / YOUR LAB 1 PAGE</p><h3>One button. One visible change.</h3><p>HTML gives you the paragraph and button. CSS gives them an appearance. JavaScript tells the button what to do.</p><ol><li>Open your page in VS Code and add a paragraph and button.</li><li>Connect story.js to index.html.</li><li>Make the click change the paragraph's words.</li><li>Use your own words, then test the first and second clicks.</li></ol><a class="primary" href="javascript-construct.html?lab=2#step-1">Open the beginner guide beside VS Code</a><p class="small">No AI required. A second click can repeat the same action. Making it reversible is an optional next challenge.</p></section>'''))
    room = lab.select_one('#signal-room').extract()
    optional_room = node('<details class="resources" id="signal-practice"><summary>Optional: practice the mechanism in the Signal Control Room</summary><p>This console adds prediction and a reversible click. Use it after your first button works in VS Code, or return later.</p></details>')
    optional_room.append(room)
    lab.select_one('#javascript-first-contact').insert_after(optional_room)
    ai = lab.select_one('#lab-2-sec-1')
    ai.select_one('.eyebrow').string = 'OPTIONAL / AI AFTER YOUR FIRST RESPONSE'
    ai.select_one('p:not(.eyebrow)').string = 'When your own click works and you can explain it, you can explore the Vibe Arena in VS Code. Keep the no-AI route if you prefer.'
    own_project = lab.select_one('.mission-console')
    own_project.insert_after(optional_room.extract())
    optional_room.insert_after(ai.extract())
    lab.select_one('#lab-2-sec-3 .sb-no').string = '02'
    for item, value in zip(lab.select('.own-mind-actions li'), ['Choose one response that matters to your project.', 'Build it and read the JavaScript you keep.', 'Test the first and second clicks.']):
        item.clear(); item.append(value)
    lab.select_one('.step-map').replace_with(node('''<nav class="step-map" aria-label="On this step"><p class="sm-label">ON THIS STEP</p><ol><li><a class="sm-practice" href="#lab-2-sec-2"><b>01</b><span>Start in VS Code</span><em>FIRST CLICK</em></a></li><li><a class="sm-required" href="#lab-2-sec-3"><b>02</b><span>Your project</span><em>MAKE IT YOURS</em></a></li><li><a class="sm-reference" href="#signal-practice"><b>03</b><span>Signal Control Room</span><em>OPTIONAL</em></a></li><li><a class="sm-reference" href="#lab-2-sec-1"><b>04</b><span>AI in VS Code</span><em>OPTIONAL</em></a></li></ol></nav>'''))
    for link in lab.select('a[href^="javascript-construct.html"]'):
        link['href'] = 'javascript-construct.html?lab=2#step-1'
        if 'guide' in link.get_text().lower():
            link.string = 'JavaScript first steps in VS Code'
    for link in lab.select('a[href="javascript-example/index.html"]'):
        link['href'] = 'javascript-first-example/index.html'
        link.string = 'Try the finished first-click reference'
    for link in lab.select('a[href="javascript-starter.zip"]'):
        link['href'] = 'javascript-beginner-starter.zip'
        link.string = 'Download the blank beginner starter'
    for span, value in zip(lab.select('.mission-check span'), ['Explain what your button should change in your page.', 'Connect a JavaScript file and make the button change one sentence.', 'Save, test the first and second clicks, and note what you observed.']):
        span.string = value
    for text in lab.find_all(string=True):
        t = str(text)
        t = t.replace('Use up to 8 minutes of project time or the extension.', 'Use up to 8 minutes of project time.')
        t = t.replace('Labs 1 and 2 are open together; later machines open with their lab.', 'All machines are open.')
        if t != str(text):
            text.replace_with(t)
    save('lab-programme.html', str(programme))

    # Repair damaged source strings in the optional console, too.
    signal = (base / 'signal-guide.js').read_text(encoding='utf-8')
    signal = signal.replace('? Previous checkpoint', 'Previous checkpoint')
    for old, new in [('Mission complete: open my project ?', 'Mission complete: open my project'), ('} ?', '} →'), ('verified ? ', 'verified · '), (' / 6 ? ', ' / 6 · ')]:
        signal = signal.replace(old, new)
    save('signal-guide.js', signal)
    programme_text = (out / 'lab-programme.html').read_text(encoding='utf-8')
    save('lab-programme.html', re.sub(r'src="signal-guide.js(?:\?[^"\s]*)?"', 'src="signal-guide.js?v=beginner-route-1"', programme_text))

    tools = parse((out / 'tools.html').read_text(encoding='utf-8'))
    machine = tools.select_one('a.lab-machine[href="javascript-construct.html"]')
    if machine:
        machine.select_one('strong').string = 'First click'
        machine.select_one('.lm-what').string = 'JavaScript first steps in VS Code'
    save('tools.html', str(tools))
    teacher = parse((out / 'plan-for-alinta.html').read_text(encoding='utf-8'))
    for row in teacher.select('tr'):
        cells = row.select('td')
        if cells and cells[0].get_text(strip=True) == 'Pipeline':
            cells[0].string = 'First click'
            cells[1].string = 'JavaScript first steps in VS Code; Construct scripting stays optional'
            cells[-1].string = 'Lab 2'
        if cells and cells[0].get_text(strip=True) == '2. JavaScript':
            cells[3].string = 'Four steps in VS Code; Signal Control Room and AI are optional'
    save('plan-for-alinta.html', str(teacher))
    victory = (out / 'lab-victory.js').read_text(encoding='utf-8')
    victory = re.sub(r"    2: \{rank:.*?legend:", "    2: {rank: 'Interaction Engineer', title: 'Your first click changed the page', skills: ['Connected a JavaScript file to HTML', 'Found the paragraph and button by id', 'Named an action and connected it to a click', 'Tested the first and second clicks', 'Explained a response in your own project'], legend:", victory, count=1)
    victory = victory.replace('The AI wrote suggestions. The human made the decisions.', 'The code followed instructions. The human made the decisions.')
    save('lab-victory.js', victory)
    worksheet = (out / 'lab-process-worksheet.txt').read_text(encoding='utf-8')
    worksheet = re.sub(r'LAB 2 /.*?(?=LAB 3 /)', '''LAB 2 / 9 October / JavaScript: your first response
Open your Lab 1 page in VS Code. Add a paragraph and button.
Connect story.js with a deferred script line in index.html.
Find the elements, name an action and connect it to the click.
Change the words yourself. Save, preview and test the first and second clicks.
The second click repeats the same action. A reversible click is optional.
I wanted the visitor to ____. Clicking changed ____. My test showed ____.
No AI required. Signal Control Room and the AI route are optional extras.
Attendance: sign the paper attendance sheet. Keep your own process notes.

''', worksheet, count=1, flags=re.S)
    save('lab-process-worksheet.txt', worksheet)
    save('javascript-first-example/index.html', HTML)
    save('javascript-first-example/story.js', CODE)
    from simplify_lab2 import simplify
    simplify(out.parent)
    with zipfile.ZipFile(out / 'javascript-beginner-starter.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('my-first-interaction/index.html', HTML)
        archive.writestr('my-first-interaction/story.js', '// Step 3: write your click action here.\n')
        archive.writestr('my-first-interaction/README.txt', 'Open this folder in VS Code. Follow the JavaScript first steps guide. The empty story.js is intentional.\nSave both files and use Microsoft Live Preview.\nThe solution folder is a separate completed reference.\n')
        archive.writestr('solution/index.html', HTML)
        archive.writestr('solution/story.js', CODE)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    improve(args.source / 'labs', args.output / 'labs')

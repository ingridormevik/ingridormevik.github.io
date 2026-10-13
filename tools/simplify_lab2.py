"""Replace the optional game interfaces with contextual explanations and project work."""
from pathlib import Path
from bs4 import BeautifulSoup

def simplify(root):
    labs = root / 'labs'
    def save(path, soup):
        path.write_text(str(soup), encoding='utf-8', newline='\n')
    path = labs / 'javascript-construct.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    sources = s.select('#javascript-sources')
    for duplicate in sources[1:]:
        duplicate.decompose()
    extras = s.select('#construct-extra')
    for duplicate in extras[1:]:
        duplicate.unwrap()
    if extras:
        summaries = extras[0].find_all('summary', recursive=False)
        for duplicate in summaries[1:]:
            duplicate.decompose()
    help_nodes = s.select('#first-click-help')
    if help_nodes:
        fixed = BeautifulSoup('''<details class="step" id="first-click-help"><summary>My first click does nothing: open the help drawer</summary><p class="eyebrow">WHEN THE CLICK DOES NOTHING</p><h2>Check one connection at a time.</h2><ol><li><strong>Button missing:</strong> put the button inside the body in index.html.</li><li><strong>Click does nothing:</strong> save story.js and check that the script connection names that exact file.</li><li><strong>Element not found:</strong> match id="story" with "#story" and id="future" with "#future". Keep defer on the script line.</li><li><strong>Code stops:</strong> compare quotation marks, braces and parentheses with the example. Check the browser Console for an error.</li></ol><p>Show Ingrid the two files, what you expected and what happened.</p></details>''', 'html.parser').find()
        help_nodes[0].replace_with(fixed)
        for old in help_nodes[1:]:
            if old.parent is not None:
                old.decompose()
    for node in s.select('[data-html-mission], [data-html-help]'):
        node.decompose()
    for node in s.select('link[href^="html-missions"], script[src^="html-missions"]'):
        node.decompose()
    explanations = [
        '<details class="resources" data-html-help="1"><summary>What do p, button and id mean?</summary><p><code>&lt;p&gt;</code> holds a paragraph. <code>&lt;button&gt;</code> creates a button. The words between its opening and closing tags are its label.</p><p><code>id="future"</code> names this particular button so JavaScript can find it. Change the label in VS Code, save and check the preview. Keep the id unchanged.</p></details>',
        '<details class="resources" data-html-help="2"><summary>Why does the script go in head with defer?</summary><p><code>&lt;head&gt;</code> contains information about the page. <code>&lt;body&gt;</code> contains its visible content.</p><p><code>src="story.js"</code> points to your JavaScript file. <code>defer</code> lets the browser finish reading the HTML before running that file, so the paragraph and button exist when the code looks for them.</p><p>Compare the filename with Explorer in VS Code. A different spelling or folder means the browser cannot load that file.</p></details>'
    ]
    for number, html in enumerate(explanations, 1):
        s.select_one(f'#step-{number} .look').insert_after(BeautifulSoup(html, 'html.parser').find())
    save(path, s)
    path = labs / 'vibecoding.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    s.title.string = 'Vibecoding in VS Code | Lab 2'
    for node in s.select('script:not([src^="accessibility"]), link[href^="vibe"], link[href^="lab78"]'):
        node.decompose()
    main = s.select_one('main')
    main.clear()
    main.append(BeautifulSoup('''
<article class="reader"><p><a href="lab-programme.html#lab-2-sec-3">Back to my Lab 2 project</a></p>
<p class="eyebrow">LAB 2 / OPTIONAL AI PRACTICE</p><h1>Make one change with AI in VS Code</h1>
<p>Start with your working first-click project. Use AI to change one behaviour, then check the code and the result yourself. You can also make the same change without AI.</p>
<section id="vibe-project"><h2>1. Choose the change</h2><p>In this example, the first click shows another perspective. We want the second click to bring the original sentence back.</p><p>Open your project folder in VS Code and preview <code>index.html</code> with Live Preview. Copy the folder as a backup before editing.</p></section>
<section id="vibe-replay"><h2>2. Ask about the code you have</h2><p>Open your AI chat in VS Code. Include your current <code>story.js</code> and the paragraph and button from <code>index.html</code>. Ask:</p>
<blockquote><p>My button currently changes the paragraph to another perspective. Change story.js so the next click restores the original sentence. Keep my existing element ids and text. Do not change the HTML or CSS. Show the code you changed and explain how it remembers which sentence is showing.</p></blockquote>
<p>This request is an example for the first-click project. For your own project, describe its current behaviour and the single change you want.</p></section>
<section id="vibe-build"><h2>3. Read the proposed change</h2><p>Here is one possible answer for our example. Your AI may suggest different code. Compare its answer with the file you already have before accepting or pasting it.</p>
<pre><code>const story = document.querySelector("#story");
const button = document.querySelector("#future");
const originalStory = story.textContent;
let showingFuture = false;

function revealStory() {
  showingFuture = !showingFuture;
  if (showingFuture) {
    story.textContent = "Someone else remembers this place differently.";
  } else {
    story.textContent = originalStory;
  }
}

button.addEventListener("click", revealStory);</code></pre>
<p>The two selectors and the click listener stay the same. <code>originalStory</code> keeps the starting sentence. <code>showingFuture</code> starts as false. Each click flips it, and <code>if</code> chooses which sentence to show.</p>
<p>Check that your own words and ids survived. If the answer changes other files or adds unrelated features, ask for a smaller change.</p></section>
<section id="vibe-test"><h2>4. Test in the browser</h2><ol><li>Save story.js. Reload the preview. The original sentence should appear.</li><li>Click once. The other perspective should appear.</li><li>Click again. The original sentence should return.</li><li>Use Tab to reach the button and press Enter. Check that the same change works.</li><li>Reload again. Check the starting sentence.</li></ol><p>If it fails, note what you did and what appeared. Check the ids and filename first. Give the AI the observed problem instead of asking it to rebuild the whole page.</p></section>
<section id="vibe-finish"><h2>5. Keep, adjust or undo</h2><p>Keep the change if it works and you can explain it. Adjust it if the behaviour or wording needs work. Restore story.js from your backup if you prefer the earlier version.</p><p>In your Lab 2 project note, write what you asked for, what changed and what happened when you tested it. Name any AI help you used.</p><p><strong>Without AI:</strong> type the example yourself, change the sentence to your own words and run the same tests.</p><a class="primary" href="lab-programme.html#lab-2-sec-3">Return to my project</a></section></article>
''', 'html.parser'))
    example = main.select_one('pre').extract()
    main.clear()
    main.append(BeautifulSoup('''<article class="reader">
<p><a href="lab-programme.html#lab-2-sec-3">Back to my Lab 2 project</a></p>
<p class="eyebrow">LAB 2 / OPTIONAL</p><h1>Tell the machine what you want.</h1>
<p>Vibecoding means describing what you want to build and asking AI to change the code. Write it in your own words, or use voice input if your tool supports it.</p>
<section id="vibe-project"><h2>Open your project</h2><p>Open your folder and AI chat in VS Code. Keep a backup and open Live Preview so you can see what changes.</p></section>
<section id="vibe-replay"><h2>Say what you want</h2><blockquote><p>Make this button switch between the two stories each time I click it.</p></blockquote><p>Give the AI access to your current files, or paste the relevant code into the chat.</p></section>
<section id="vibe-test"><h2>Try it. Ask again.</h2><p>Save and try the button in your preview. Then tell the AI what you want changed next.</p><blockquote><p>The second click still shows the same story. Make it bring the first one back.</p></blockquote><blockquote><p>That works. Now change the button label to “Another perspective”.</p></blockquote></section>
<section id="vibe-finish"><p>Keep the result you like. Undo changes you do not want. Add a short note about what you made and any AI help you used.</p><p>You can also edit the code yourself.</p><details class="resources" id="vibe-build"><summary>Want to see one possible code solution?</summary><div data-example></div></details><p><a class="primary" href="lab-programme.html#lab-2-sec-3">Return to my project</a></p></section>
</article>''', 'html.parser'))
    main.select_one('[data-example]').append(example)
    save(path, s)
    for name in ['lab-programme.html', 'tools.html']:
        path = labs / name
        text = path.read_text(encoding='utf-8')
        text = text.replace('When your own click works and you can explain it, you can explore the Vibe Arena in VS Code. Keep the no-AI route if you prefer.', 'When your first click works, try one small change with AI in your own VS Code project. Read the change and test it. You can also work without AI.')
        text = text.replace('Your page works. Is it yours?', 'Try one change with AI').replace('Enter the Vibe Arena', 'Try the AI exercise').replace('Vibe Arena', 'AI practice in VS Code')
        text = text.replace('When your first click works, try one small change with AI in your own VS Code project. Read the change and test it. You can also work without AI.', 'Tell AI what you want to build or change in your VS Code project. Try the result and ask for the next change. Use text, or voice input if your tool supports it.')
        text = text.replace('Try one change with AI', 'Vibecoding in your project')
        path.write_text(text, encoding='utf-8', newline='\n')
    from beginner_support import support
    support(root)
    from remove_lab_notes import cleanup
    cleanup(root)
    from room_workshop import rooms
    rooms(root)
    from vibe_workshop import build
    build(root)
    from construct_action_photos import photos
    photos(root)
    from template_workbench import templates
    templates(root)
    from publishing_workshop import publish
    publish(root)
    from connect_steps import connect
    connect(root)

if __name__ == '__main__':
    simplify(Path(__file__).resolve().parent.parent)

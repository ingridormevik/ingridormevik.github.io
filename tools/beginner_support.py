"""Add concrete first-use instructions without requiring theory exercises."""
from bs4 import BeautifulSoup

def support(root):
    labs = root / 'labs'
    def load(name):
        return BeautifulSoup((labs / name).read_text(encoding='utf-8'), 'html.parser')
    def save(name, s):
        (labs / name).write_text(str(s), encoding='utf-8', newline='\n')
    def insert(s, selector, html, marker):
        old = s.select_one('#' + marker)
        if old: old.decompose()
        node = BeautifulSoup(html, 'html.parser').find()
        node['id'] = marker
        s.select_one(selector).append(node)

    s = load('lab-programme.html')
    panel = s.select_one('#mapping-first-contact')
    target = panel.select_one('ol')
    while target.parent != panel and target.parent.name == 'div':
        target = target.parent
    target.replace_with(BeautifulSoup('''<div>
<p>A <strong>layout</strong> is a scene where you place things. A <strong>Text object</strong> is a text box. An <strong>event sheet</strong> holds the rules that make the scene respond.</p>
<ol><li><strong>Open the template.</strong> Follow the <a href="construct-templates.html?lab=3#tpl-map">Mapping download and opening instructions</a>. In Construct's Project Bar, expand Layouts and double-click one of the four maps. Keep using that map for this exercise.</li>
<li><strong>Write your first place.</strong> Click an existing text box. In the Properties panel, find Text and replace its words with a campus place and one sentence about it. Drag the box to where you want it. You should see your words on the map.</li>
<li><strong>Add two more places.</strong> Double-click empty space in the layout, search for Text, select it and place it. Set its Text property. Repeat for a third place. Arrange the three boxes and connect them using the template's arrows or paths.</li>
<li><strong>Make a separate hidden message.</strong> Insert a new Text object and name its object type <code>HiddenThought</code>. Give it one sentence, place it inside the map and set Initially visible to off. Use a separate object type so revealing it does not reveal every map label.</li>
<li><strong>Add the tap input.</strong> Double-click empty space, search for Touch and insert it if the project does not already have it. Touch listens for taps. With Use mouse input enabled, a mouse click can simulate a tap.</li>
<li><strong>Choose the map's rules.</strong> Click empty space in the layout. In Properties, read Event sheet. Open that same sheet from the Project Bar's Event sheets folder.</li>
<li><strong>Add the rule.</strong> Click Add event. Choose Touch, then On tap object. Choose the visible object you want the reader to tap and confirm. On that same row, click Add action. Choose HiddenThought, then Set visible, choose Visible and confirm.</li>
<li><strong>Try it.</strong> Return to your map and use Preview layout. Your three places should appear without the hidden message. Click or tap your chosen object. The message should appear. Close Preview to return to editing.</li>
<li><strong>Keep your work.</strong> Choose Menu &gt; Project &gt; Save as &gt; Download a copy. Keep the .c3p file somewhere you can find again. It contains the project you can reopen and edit.</li></ol>
<p>The rule reads: <strong>when someone taps this object, show HiddenThought.</strong> The condition is on the left of the event row. The action is on the right.</p>
<p class="small"><a href="https://www.construct.net/en/make-games/manuals/construct-3/plugin-reference/touch" target="_blank" rel="noopener">Construct: Touch reference</a> · <a href="https://www.construct.net/en/tutorials/beginners-guide-to-construct-3-1/adding-events-4" target="_blank" rel="noopener">Construct: adding events</a></p>
</div>''', 'html.parser').find())
    insert(s, '#construct-rooms', '''<div class="look"><h4>Start with two rooms</h4><p>A room is a layout. Moving rooms means telling Construct to show another layout.</p><ol><li>Open your saved .c3p in Construct. In the Project Bar, expand Layouts. Double-click your starting room and note its exact name.</li><li>Open the scene template guide linked above if you need ready-made rooms. Choose just two connected rooms to begin with.</li><li>In the starting room, select its arrow. Open the Event sheet assigned to that layout. Find the event for tapping that arrow.</li><li>Look at its action. A System action called Go to layout chooses the destination. Double-click it and choose the room you want to enter.</li><li>Open the destination room and check its return arrow in the same way. Its destination should be your starting room.</li><li>Preview the starting layout. Follow the arrow out, then the return arrow back. Save a new .c3p copy when both directions work.</li></ol><p>In this template, only North has usable arrows at first. An arrow picture alone does not move you anywhere: it needs a tap condition and a Go to layout action.</p><p>If a room does not respond, click empty space in that layout and check its Event sheet property before changing the rule.</p></div>''', 'beginner-rooms')
    save('lab-programme.html', s)

    s = load('construct-guide.html')
    for text in s.find_all(string=True):
        if 'Alinta’s 5 templates' in str(text): text.replace_with(str(text).replace('Alinta’s 5 templates', 'Alinta’s 6 templates'))
    insert(s, '#step-2', '''<div class="look"><p><strong>Two views of the same project:</strong> Layout is where you arrange what the visitor sees. Event sheet is where you say what should happen. Switching tabs does not create a new project.</p><p>The Project Bar lists your layouts, event sheets and object types. The Properties panel changes what you have selected. If its settings look wrong, click the object again.</p></div>''', 'beginner-editor')
    insert(s, '#step-4', '''<div class="look"><p><strong>Read the row as a sentence:</strong> when Button is clicked, Text changes its words. The left side is the condition, the right side is the action.</p><p>Choose Add action on the row you just created. Add event underneath starts another rule. If you picked the wrong option, double-click the condition or action to edit it.</p></div>''', 'beginner-event')
    save('construct-guide.html', s)

    s = load('javascript-construct.html')
    insert(s, '#step-1', '''<div class="look"><p><strong>First time in VS Code?</strong> Choose File &gt; Open Folder and select your project folder. Explorer is the file list on the left. Click index.html to open it in the middle.</p><p>Find <code>&lt;body&gt;</code> and <code>&lt;/body&gt;</code>. Put the example between them, below your existing content. Leave your existing page in place. Save with Ctrl+S on Windows or Cmd+S on Mac.</p><p>Open <a href="setup.html">the setup guide</a> if Live Preview is not installed. Preview shows the page; the editor shows the code you change.</p></div>''', 'beginner-vscode')
    insert(s, '#step-2', '''<div class="look"><p><strong>Create the file:</strong> in Explorer, right-click your project folder, choose New File, type <code>story.js</code> and press Enter. Click its name to open it. It should be empty before the next step.</p><p>The two tabs are two files in the same project. Put the script connection in index.html and the click instructions in story.js.</p></div>''', 'beginner-files')
    save('javascript-construct.html', s)

    s = load('vibecoding.html')
    insert(s, '#vibe-project', '''<div class="look"><p><strong>First time using AI here?</strong> Open the chat panel for the AI extension you have installed in VS Code. If there is no AI chat yet, use the <a href="ai-coding.html?lab=2">AI setup guide</a> or ask Ingrid to help you open it.</p><p>Keep your project folder open. The chat is where you write your request. Live Preview is where you try the page it changes.</p></div>''', 'beginner-ai-chat')
    insert(s, '#vibe-replay', '''<div class="look"><p>Type your request in the chat box and send it. If your tool supports voice input, you can say it instead. Use your own language.</p><p>If the AI cannot see your files, paste the contents of story.js and the paragraph and button from index.html. Say which filename each piece came from.</p><p>If it offers file edits, review and apply the change using your tool's controls. If it only replies with code, ask which file to put it in, then paste it there and save.</p></div>''', 'beginner-ai-change')
    insert(s, '#vibe-test', '''<div class="look"><p><strong>What should happen?</strong> First click: the other story appears. Second click: the starting story returns. If Preview still shows the old version, save the file and reload.</p><p>You can tell the AI what you see: “I clicked twice, but the starting story did not return.” Keep talking until the result fits what you want.</p></div>''', 'beginner-ai-result')
    save('vibecoding.html', s)
    from construct_learning import learning
    learning(root)

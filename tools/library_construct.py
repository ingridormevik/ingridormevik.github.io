"""Continue the existing Construct project through a library-informed change."""
from bs4 import BeautifulSoup

def library(root):
    labs = root / 'labs'
    path = labs / 'library-lab.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    main = s.select_one('main')
    if main.select_one('#library-construct'):
        programme = labs / 'lab-programme.html'
        p = BeautifulSoup(programme.read_text(encoding='utf-8'), 'html.parser')
        if not p.select_one('#library-construct-next'):
            p.select_one('#mapping-first-contact').append(BeautifulSoup('<div class="look" id="library-construct-next"><h4>Continue your map in the library workshop</h4><p>Use a source to change your existing tap reveal, then test it with a reader.</p><a class="primary" href="library-lab.html#library-construct">Continue this Construct project</a></div>', 'html.parser').find())
            programme.write_text(str(p), encoding='utf-8', newline='\n')
        return
    s.title.string = 'Library workshop: continue your Construct story | DIKULT105'
    old = list(main.contents)
    main.clear()
    main.append(BeautifulSoup('''<article class="reader" id="library-construct">
<p><a href="lab-programme.html#mapping-first-contact">Back to the Construct map workshop</a></p>
<p class="eyebrow">LIBRARY WORKSHOP / CONTINUE YOUR CONSTRUCT PROJECT</p>
<h1>A place has another story.</h1>
<p>You have a map, three places and a tap that reveals a thought. Bring that same Construct project here. Find one idea in a real source, then use it to change what your visitor discovers.</p>
<p>No new project needed. Your finished change is one new perspective inside the scene you already made.</p>
<nav aria-label="Workshop steps"><a href="#library-open">Open your map</a> · <a href="#library-find">Find another perspective</a> · <a href="#library-build">Build it</a> · <a href="#library-test">Let someone explore</a></nav>
<section class="step" id="library-open"><p class="eyebrow">01 / RETURN TO YOUR PLACE</p><h2>Open the scene you made.</h2><ol><li>Open <a href="https://editor.construct.net/" target="_blank" rel="noopener">Construct 3</a>. Use Menu &gt; Project &gt; Open and choose your saved .c3p file.</li><li>In the Project Bar, open the map layout you used in the previous workshop.</li><li>Preview that layout. Tap the object that reveals HiddenThought. Check that your existing interaction still works.</li><li>Save a separate copy before changing it, for example <code>my-map-library.c3p</code>.</li></ol>
<figure class="official-shot"><a href="setup-assets/construct-interface.png" target="_blank" rel="noopener"><img src="setup-assets/construct-interface.png" loading="lazy" alt="Actual Construct interface screenshot: Properties on the left, layout in the middle, Project Bar on the right."/></a><figcaption>Real Construct manual screenshot, showing a blank example project. Your map appears in the middle. Find your layout in the Project Bar at marker 7; selected-object settings are at marker 6. <a href="https://www.construct.net/en/make-games/manuals/construct-3/overview/the-interface" target="_blank" rel="noopener">Original source</a>. Select to enlarge.</figcaption></figure>
<details><summary>I do not have a working map yet.</summary><p>Return to <a href="lab-programme.html#mapping-first-contact">the previous Construct walkthrough</a> and make one tap reveal a message. Then continue here. If you are using the room template, keep that project and use one existing Text object for the new perspective.</p></details></section>
<section class="step" id="library-find"><p class="eyebrow">02 / FIND A VOICE YOU DID NOT WRITE</p><h2>What could change how we see this place?</h2><p>Choose one place on your map. Ask a question about it: who gets to belong here, whose memory is missing, or what makes a place feel safe?</p><ol><li>Search <a href="https://oria.no/" target="_blank" rel="noopener">Oria</a> using words from your question, or ask a librarian to help find a source.</li><li>Use an available book, ebook or other suitable source. Read a relevant passage in context.</li><li>Write one idea from it in your own words. Keep the author, title, year and actual page or locator beside your note.</li></ol><p><strong>Example design idea:</strong> a visitor taps a familiar entrance and discovers a perspective they had overlooked. This is a prompt for your project, not a quotation or claim from a source.</p><p>Use an accessible digital source if visiting the shelves does not suit you. The research and citation guide below has more help.</p></section>
<section class="step" id="library-build"><p class="eyebrow">03 / PUT THE IDEA IN THE INTERACTION</p><h2>Change the reveal you already built.</h2><ol><li>Return to your map layout. Select HiddenThought.</li><li>In Properties, change Text to a short sentence in your own voice, informed by the passage you read. Keep Initially visible off.</li><li>Open the Event sheet assigned to this layout. Find your Touch / On tap object condition and HiddenThought / Set visible action.</li><li>Keep that working rule. If another place now fits your idea better, double-click On tap object and choose its visible object.</li><li>Return to the map and Preview layout. The message should start hidden and appear after the tap.</li></ol>
<figure class="official-shot"><a href="setup-assets/construct-events.png" target="_blank" rel="noopener"><img src="setup-assets/construct-events.png" loading="lazy" alt="Actual Construct event sheet with a condition at left, an action at right and Add action on the same row."/></a><figcaption>Real Construct manual example: System / On start of layout changes Text. Read the structure from left to right. Your existing rule instead reads Touch / On tap object, then HiddenThought / Set visible. <a href="https://www.construct.net/en/make-games/manuals/construct-3/interface/event-sheet-view" target="_blank" rel="noopener">Original source</a>. Select to enlarge.</figcaption></figure>
<p><strong>What you are learning:</strong> you can change a story's meaning while keeping its working interaction. Changing the condition changes what triggers it; changing the message changes what the visitor discovers.</p>
<details><summary>The new message does not appear.</summary><p>Check the object named in On tap object, then the object named in Set visible. Select empty space in the layout and check its Event sheet property. Use Preview layout so you test the map you are editing.</p></details></section>
<section class="step" id="library-test"><p class="eyebrow">04 / GIVE SOMEONE THE MAP</p><h2>Watch what they discover.</h2><p>Let a partner explore your preview before telling them where to tap. Ask: “What did this place make you think about?” Watch whether they find the response and can read it.</p><p>Change one thing based on the test: the tap target, the message or where it sits. Preview again and save your .c3p copy.</p><p>Keep a short project note: <strong>The source made me reconsider ____. I changed ____. My visitor noticed ____. My next change is ____.</strong> Include the source details you recorded.</p><p>You can test it yourself if a partner is not available. Start the preview fresh and follow the same path a visitor would take.</p><a class="primary" href="lab-programme.html#construct-rooms">Continue with Construct rooms and rules</a></section>
</article>''', 'html.parser'))
    drawer = BeautifulSoup('<details class="step" id="library-research-reference"><summary>Need help finding or citing a source? Open the research guide</summary></details>', 'html.parser').find()
    for node in old: drawer.append(node)
    main.append(drawer)
    path.write_text(str(s), encoding='utf-8', newline='\n')
    for name in ['tools.html', 'lab-programme.html']:
        path = labs / name
        t = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        if name == 'tools.html':
            for a in t.select('a[href^="library-lab.html"]'):
                a.clear()
                a.string = 'Library workshop: continue your Construct story'
        else:
            panel = t.select_one('#mapping-first-contact')
            if not t.select_one('#library-construct-next'):
                panel.append(BeautifulSoup('''<div class="look" id="library-construct-next"><h4>Next: take your map into the library workshop</h4><p>Keep this .c3p project. Find another perspective in a source, build it into your existing tap reveal and let someone explore the result.</p><a class="primary" href="library-lab.html#library-construct">Continue this project in the library workshop</a></div>''', 'html.parser').find())
        path.write_text(str(t), encoding='utf-8', newline='\n')

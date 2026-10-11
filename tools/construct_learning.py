"""Connect authentic Construct UI references to practical beginner experiments."""
from bs4 import BeautifulSoup

def learning(root):
    labs = root / 'labs'
    def fragment(html): return BeautifulSoup(html, 'html.parser').find()
    def photo(file, alt, caption, source):
        return f'<figure class="official-shot"><a href="setup-assets/{file}" target="_blank" rel="noopener"><img src="setup-assets/{file}" alt="{alt}" loading="lazy"/></a><figcaption>{caption} <a href="{source}" target="_blank" rel="noopener">Original Construct manual screenshot</a>. Select the image to enlarge it.</figcaption></figure>'
    interface = photo('construct-interface.png', 'Construct editor: Properties at left, main layout in the middle, Project Bar at right, and layout and event sheet tabs at top.', 'Find 5: the layout where you place things. Find 6: Properties for your selection. Find 7: the Project Bar listing your layouts and objects. The screenshot shows the manual’s blank project, not the Mapping template.', 'https://www.construct.net/en/make-games/manuals/construct-3/overview/the-interface')
    events = photo('construct-events.png', 'Actual Construct event sheet: a System condition on the left and a Text action on the right, with Add event below and Add action on the row.', 'Look at the two halves of the row and the Add action link. This real example changes text when a layout starts. Your map will use Touch / On tap object and HiddenThought / Set visible instead.', 'https://www.construct.net/en/make-games/manuals/construct-3/interface/event-sheet-view')
    for name in ['lab-programme.html', 'construct-guide.html']:
        path = labs / name
        s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        for old in s.select('[data-construct-learning]'): old.decompose()
        if name == 'lab-programme.html':
            panel = s.select_one('#mapping-first-contact')
            intro = fragment('''<div data-construct-learning><p class="eyebrow">BUILD A PLACE SOMEONE CAN EXPLORE</p><p>Your visitor sees three places. Tapping one reveals a thought they could not see before. Build the visible map first, then give it that response.</p><p>Keep Construct open beside this page. Do each part in the editor before moving on.</p>''' + interface + '</div>')
            panel.select_one('h3').insert_after(intro)
            steps = panel.select('ol > li')
            steps[2].append(fragment('''<div class="look" data-construct-learning><p><strong>Pause in Preview:</strong> can you see all three places and read their text? Close Preview, move one box and preview again. You have changed the layout, which controls where things appear.</p></div>'''))
            steps[5].append(fragment('<div data-construct-learning>' + events + '</div>'))
            steps[7].append(fragment('''<div class="look" data-construct-learning><p><strong>Make the rule yours:</strong> change the On tap object condition to a different visible object. Preview again. The new object should reveal the message; the old one should stop doing it.</p><p>You have changed the input while keeping the action. Use the object that best fits your story, then save.</p><details><summary>The message appears before I tap, or never appears.</summary><p>Appears immediately: select HiddenThought in the layout and turn Initially visible off. Never appears: check that the condition names the object you tapped and the action names HiddenThought. Check the layout's Event sheet property too.</p></details></div>'''))
            rooms = s.select_one('#construct-rooms')
            rooms.append(fragment('''<div data-construct-learning><h4>Follow a real event row</h4>''' + events + '''<p>The same left-to-right structure works for rooms: <strong>Touch / On tap object</strong> on the left, <strong>System / Go to layout</strong> on the right.</p><p>Before Preview, choose where you expect the arrow to take you. Test it, then change the destination and test again. This is how you learn what the action controls.</p><p><a href="construct-templates.html?lab=4#tpl-move">Open the movement template and its example</a></p></div>'''))
        else:
            s.select_one('#step-1').insert_before(fragment('''<section class="step" data-construct-learning><p class="eyebrow">YOUR FIRST WORKING INTERACTION</p><h2>Make a place answer back.</h2><p>Build a small page in the real Construct editor: a sentence, a button and a response. Choose a place you know. The visitor presses the button and sees another possible version of that place.</p><p>Work with this guide beside Construct. Each step ends with something you can find or try in the editor.</p><p>Following Lab 3's campus map? Use <a href="lab-programme.html#mapping-first-contact">the Mapping walkthrough</a> instead. It teaches the same condition/action idea with a tap.</p></section>'''))
            s.select_one('#step-4').append(fragment('''<div class="look" data-construct-learning><p><strong>Now change the result:</strong> double-click Set text and replace the sentence with your own. Preview and press the button. You should see the new sentence.</p><p><strong>Notice what stayed the same:</strong> the button still triggers the rule. Only the action's text changed. You can use this pattern for a memory, a clue or a different point of view.</p></div>'''))
            # Keep deeper reference material available after the first working result.
            for selector in ['#mistakes', '#tricks']:
                section = s.select_one(selector)
                if section and section.parent.name != 'details':
                    drawer = fragment('<details class="step"><summary>' + ('More troubleshooting: find your symptom' if selector == '#mistakes' else 'Later: try one extra technique') + '</summary></details>')
                    section.replace_with(drawer)
                    drawer.append(section)
        path.write_text(str(s), encoding='utf-8', newline='\n')
    # Existing annotated template images are not authenticated editor captures.
    path = labs / 'construct-templates.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    for figure in s.select('figure'):
        img = figure.select_one('img[src^="construct-templates/"]')
        if not img: continue
        caption = figure.select_one('figcaption')
        if caption and not caption.select_one('[data-image-kind]'):
            caption.append(fragment('<span data-image-kind> Template illustration with annotations. For the actual editor interface, see the <a href="construct-guide.html#step-2">official Construct screenshots</a>.</span>'))
    path.write_text(str(s), encoding='utf-8', newline='\n')
    from library_construct import library
    library(root)

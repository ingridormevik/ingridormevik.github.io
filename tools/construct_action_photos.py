"""Place authentic action-dialog references beside the relevant build steps."""
from bs4 import BeautifulSoup

def photos(root):
    labs = root / 'labs'
    def shot(file, title, alt, instruction, source):
        return BeautifulSoup(f'<figure class="construct-action-shot" data-action-photo><h4>{title}</h4><a href="setup-assets/{file}" target="_blank" rel="noopener"><img src="setup-assets/{file}" alt="{alt}" loading="lazy"/></a><figcaption>{instruction} <a href="{source}" target="_blank" rel="noopener">Real screenshot from Construct documentation</a>. Select the image to enlarge it.</figcaption></figure>', 'html.parser').find()
    create = lambda: shot('construct-dialog-163.png','Insert the object','Actual Create new object type dialog with Search at top right and Insert at bottom.','Double-click empty layout space to open this dialog. Type Text in Search, select Text, give the new type its name and choose Insert. The manual screenshot has Array selected; choose Text for this task.','https://www.construct.net/en/make-games/manuals/construct-3/interface/dialogs/create-new-object')
    condition = lambda: shot('construct-add-condition.png','Choose who listens','Actual Add condition dialog showing object choices, Search at top right and Next at bottom.','Add event opens an object picker. Search for Touch in your project, choose it, then choose On tap object. The screenshot is from another project, so its object list differs from yours.','https://www.construct.net/en/make-games/manuals/construct-3/interface/dialogs/add-condition-action')
    action = lambda: shot('construct-events.png','Add the response on the same row','Real Construct event sheet with Add event below and Add action on the existing row.','Use Add action to the right of your tap condition. Choose the object that should change, then its action and parameters. This screenshot shows a start-of-layout text example, not your tap rule.','https://www.construct.net/en/make-games/manuals/construct-3/interface/event-sheet-view')
    preview = lambda: shot('construct-toolbar.png','Run it, then return to editing','Actual Construct toolbar with Menu, Save and triangular Preview control.','The triangle is Preview. Use its menu to preview the layout you are editing. Test the response, close Preview, then save an editable .c3p copy through Menu.','https://www.construct.net/en/make-games/manuals/construct-3/interface/main-toolbar')
    for name in ['lab-programme.html','library-lab.html','construct-guide.html']:
        path = labs / name
        s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        for old in s.select('[data-action-photo]'): old.decompose()
        if name == 'lab-programme.html':
            steps = s.select('#mapping-first-contact ol > li')
            steps[2].append(create())
            steps[6].append(condition())
            steps[7].append(preview())
            missions = s.select('#construct-rooms .cw-task')
            missions[0].append(preview())
            missions[1].append(condition())
            missions[1].append(action())
            s.select_one('#mapping-first-contact h3').string = 'Build a map. Hide a thought. Let someone find it.'
        elif name == 'library-lab.html':
            steps = s.select('#construct-build ol > li')
            steps[0].append(create())
            steps[3].append(condition())
            s.select_one('#construct-choice').append(action())
            s.select_one('#construct-test').append(preview())
        else:
            figure = condition()
            caption = figure.select_one('figcaption')
            for text in caption.find_all(string=True):
                if 'Search for Touch' in str(text):
                    text.replace_with(str(text).replace('Search for Touch', 'Search for Button').replace('On tap object', 'On clicked'))
            s.select_one('#step-4').append(figure)
        for old in s.select('link[href^="construct-actions.css"]'): old.decompose()
        s.head.append(BeautifulSoup('<link rel="stylesheet" href="construct-actions.css?v=1"/>','html.parser').find())
        path.write_text(str(s), encoding='utf-8', newline='\n')

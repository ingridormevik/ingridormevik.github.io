"""Remove note tasks from the visible workflow and progress requirements."""
from bs4 import BeautifulSoup

def cleanup(root):
    labs = root / 'labs'
    for path in labs.glob('*.html'):
        s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        changed = False
        for script in s.select('script[src^="paper-progress"]'):
            script.decompose(); changed = True
        for node in s.select('.own-mind-note, .defend, .vibecoding-notebook, .lab-finish, .checkin-example'):
            node['hidden'] = ''; changed = True
        for actions in s.select('.mission-console .mission-actions'):
            actions.attrs.pop('hidden', None)
            for textarea in actions.select('textarea'):
                textarea['hidden'] = ''
                label = textarea.find_parent('label')
                if label: label['hidden'] = ''
            for p in actions.select('p.mission-small'):
                p.string = 'Try these practical steps in your project. Check them when you have tested the result.'
            changed = True
        for node in s.select('[data-checkin]'):
            node['hidden'] = ''; changed = True
        for text in s.find_all(string=True):
            value = str(text)
            if any(term in value.lower() for term in ['experiment note', 'project note', 'reflection on paper', 'your note:', 'keep a short note:', 'keep a short project note:', 'short note you need']):
                parent = text.parent
                if parent.name in ['p', 'label', 'li']: parent['hidden'] = ''
                changed = True
            if 'Complete all three milestones and write a project note' in value:
                text.replace_with('Try the practical steps, test your result and save your project. All steps remain open.')
            elif 'Save & reflect' in value:
                text.replace_with(value.replace('Save & reflect', 'Save your work')); changed = True
        if changed: path.write_text(str(s), encoding='utf-8', newline='\n')
    path = labs / 'lab-navigation.js'
    text = path.read_text(encoding='utf-8')
    start = text.index('  function ready(lab)')
    end = text.index('  function earned', start)
    text = text[:start] + '  function ready(lab){return true;}\n  function experimentDone(lab){return [...lab.querySelectorAll("[data-check]")].every(x=>x.checked);}\n' + text[end:]
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if 'hints[0].textContent=' in line: lines[i] = "    hints[0].textContent='Open your project and choose what to work on. All steps are open.';"
        if 'const noteOK=' in line: lines[i] = '    const noteOK=true;'
        if 'hints[1].textContent=' in line: lines[i] = "    hints[1].textContent=experimentDone(lab)?'Practical steps checked. Save your work.':`Still to try: ${remaining} practical step${remaining===1?'':'s'}.`;"
        if 'hints[2].textContent=' in line: lines[i] = "    hints[2].textContent='Save your project files and confirm below.';"
    text = '\n'.join(lines).replace('Save & reflect', 'Save your work').replace('Write your arrival note', 'Open your project').replace('Your lab note is ready.', 'Your project is ready.')
    path.write_text(text+'\n', encoding='utf-8', newline='\n')
    path = labs / 'start-lab.js'
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    for i,line in enumerate(lines):
        if 'const pass =' in line: lines[i] = '    const pass = true;'
        if 'const experiment =' in line: lines[i] = '    const experiment = checks.length > 0 && checks.every(x => x.checked);'
    path.write_text('\n'.join(lines)+'\n', encoding='utf-8', newline='\n')
    path = labs / 'lab-motion.js'
    text = path.read_text(encoding='utf-8').replace('Quest marked complete. Write your reflection on paper and hand it to Ingrid.', 'Session complete. Keep your saved project files.')
    path.write_text(text, encoding='utf-8', newline='\n')
    path = labs / 'lab-course-updates.css'
    text = path.read_text(encoding='utf-8')
    if '/* Construct workshop spacing */' not in text:
        text += '''\n/* Construct workshop spacing */
.studio #construct-rooms{padding:clamp(18px,4vw,32px);box-shadow:none;border-width:2px;border-radius:0}
.studio #construct-rooms>p{margin:0 0 18px}
.studio #construct-rooms h3{margin:0 0 18px;color:var(--cp-ink);font-size:clamp(26px,4vw,38px);line-height:1.2}
.studio #construct-rooms ol{padding-left:24px;margin:18px 0}
.studio #construct-rooms li{padding-left:6px;margin-bottom:14px}
.studio #construct-rooms .look{padding:20px;margin:24px 0;background:#fff;color:var(--cp-ink);border:1px solid var(--cp-deep)}
.studio #construct-rooms img{display:block;max-width:100%;height:auto}
.studio #construct-rooms figure{margin:20px 0}
[hidden]{display:none!important}
'''
    path.write_text(text, encoding='utf-8', newline='\n')

"""Route template downloads through course Files and explain project formats."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit
from html import escape

FILES='https://mitt.uib.no/courses/59620/files'
TEMPLATES={'tpl-students':'SceneSetUpForStudents.c3p','tpl-full':'SceneSetUpFullExample.c3p','tpl-move':'SceneSetUpHowToMakeMovementExample.c3p','tpl-redaction':'redaction_game.c3p','tpl-map':'MappingasNonlinearStorytelling (2).c3p','tpl-npc':'NPC_Text (2).c3p'}

def update(root):
    labs=root / 'labs'
    guide=BeautifulSoup((labs / 'construct-guide.html').read_text(encoding='utf-8'),'html.parser')
    guide.title.string='Download and open a Construct template | DIKULT105'
    guide.body.attrs.pop('data-reader',None)
    for script in guide.select('script:not([src^="accessibility"])'): script.decompose()
    main=guide.select_one('main');main.clear()
    html=f'''<article id="steps" class="reader"><p><a href="lab-programme.html#lab-3">Back to Lab 3</a> · <a href="construct-templates.html">Template walkthroughs</a></p><p class="eyebrow">CONSTRUCT / FROM MITTUIB TO YOUR EDITOR</p><h1>Get the project file. Open it in Construct.</h1><section class="step" id="download"><h2>1. Download the actual project.</h2><ol><li>Open <a href="{FILES}" target="_blank" rel="noopener">the course Files section in MittUiB</a>. Sign in with your UiB account if asked.</li><li>Find the template named in your lab task. Open its file entry and use Download. A preview page in MittUiB is not the downloaded project.</li><li>Wait for the download to finish. Use your browser's Downloads list to find it, then choose Show in folder or Show in Finder.</li><li>If you downloaded a ZIP containing several templates, extract that outer ZIP first. On Windows use Extract All; on Mac double-click it. Look inside for the individual .c3p files.</li></ol><p><strong>Keep an individual .c3p intact.</strong> It is already a complete Construct project. You do not need to unpack it or open its internal files.</p><h3>Which file am I looking for?</h3><ul>'''
    for filename in TEMPLATES.values(): html+=f'<li><a href="{FILES}" target="_blank" rel="noopener">Find {escape(filename)} in MittUiB Files ↗</a></li>'
    html+='''</ul><p>The browser may add a number to a duplicate download. Use the template name to identify it. If you cannot find the file in your course, ask Ingrid to help locate it.</p><a href="#open">Next: open the downloaded file →</a></section>
<section class="step" id="open"><h2>2. Open it from inside Construct.</h2><ol><li>Open <a href="https://editor.construct.net/" target="_blank" rel="noopener">the Construct editor</a> in your browser.</li><li>If you already have unsaved work open, save it before opening another project.</li><li>Choose Menu &gt; Project &gt; Open local file. Some versions group this under Open. Choose the local-file option, not a project-folder or cloud option.</li><li>In the file picker, go to Downloads or the folder where you saved the template. Select the .c3p file, then Open.</li><li>Wait for the project to load. In Construct's Project Bar, expand Layouts and open the layout named in your task.</li><li>Save your own copy before editing. Use Save as and Download a copy, or Save as single file where supported. Give it a name you can find again.</li></ol><p><strong>Alternative:</strong> drag the complete .c3p file from Explorer or Finder into the Construct editor window. Do not drag an internal image, JSON file or the browser's download webpage.</p><p><a href="https://www.construct.net/en/make-games/manuals/construct-3/overview/saving-projects" target="_blank" rel="noopener">Official Construct file and folder instructions</a></p><a href="#cannot-see">File missing? Check the format ↓</a></section>
<section class="step" id="cannot-see"><h2>3. Construct cannot see my file.</h2><details open><summary>The folder looks empty in the file picker.</summary><ol><li>Cancel and find the download in Explorer or Finder first. Check its actual folder and full filename.</li><li>In Windows Explorer, turn on View &gt; Show &gt; File name extensions if the ending is hidden. On Mac, use Get Info to inspect Name &amp; Extension.</li><li>Return to Construct's Open local file option. Open the same folder you just checked.</li><li>If the picker offers a file-type filter, confirm it allows Construct projects. All files may reveal what is present, but it does not make an unsupported file valid.</li><li>If you have an outer ZIP, extract it and select the .c3p inside. If you have only a web page, download the actual file from MittUiB again.</li></ol></details><details><summary>I have a .c3proj file and several folders.</summary><p>This is a folder project, not a single-file .c3p. Keep the entire folder together. In a supported browser, use Construct's Open project folder / Open local project folder option and select the project folder. Do not choose the .c3proj file through the single-file picker.</p><p>For this lab, the individual .c3p template is the simpler route. Ask Ingrid for it if you only have an unpacked folder.</p></details><details><summary>I have index.html, scripts or images, but no .c3p.</summary><p>You may have a playable web export rather than an editable project. It belongs on a web host. Download the source .c3p template from the course Files section to edit it in Construct.</p></details><details><summary>It says the format is invalid or the project will not open.</summary><p>Use the current Construct editor. Check that the download finished, and download a fresh copy from MittUiB. Do not fix the problem by changing a file extension: renaming an unrelated file does not convert it into a Construct project.</p><p>If it still fails, show Ingrid the filename, the exact error and the file's location. If the message names an add-on or version requirement, include that message too.</p></details><p><a href="construct-templates.html">Return to the template walkthroughs →</a> · <a href="lab-programme.html#lab-3">Return to Lab 3 →</a></p></section></article>'''
    main.append(BeautifulSoup(html,'html.parser'))
    (labs / 'construct-project-files.html').write_text(str(guide),encoding='utf-8',newline='\n')
    names=['lab-programme.html','lab3-alinta-map.html','construct-guide.html','construct-templates.html','tools.html']
    for name in names:
        path=labs / name
        s=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
        for wrapper in s.select('p > p'):
            if wrapper.select_one('.template-walkthrough-link'): wrapper.name='span'
        for a in list(s.select('a[href]')):
            u=urlsplit(a['href'])
            if u.path!='construct-templates.html': continue
            text=a.get_text(' ',strip=True)
            # Keep explicit walkthrough links and guide content; file actions go to MittUiB.
            explicit_guide=text.lower().startswith('open the guide')
            if explicit_guide or 'template-walkthrough-link' in a.get('class',[]): continue
            original=a['href']
            filename=TEMPLATES.get(u.fragment)
            a['href']=FILES;a['target']='_blank';a['rel']=['noopener'];a['data-template-files']=''
            a['title']=f'Download {filename} from course Files' if filename else 'Get Alinta’s template files from course Files'
            if 'lab-machine' in a.get('class',[]):
                what=a.select_one('.lm-what')
                if what: what.string='Get the template files in MittUiB'
            elif a.find('img'):
                a['aria-label']=a['title']
            else:
                a.clear();a.string=f'Get {filename} in MittUiB Files ↗' if filename else 'Get Alinta’s templates in MittUiB Files ↗'
                help_link=s.new_tag('a',href=original,attrs={'class':'template-walkthrough-link'})
                help_link.string='Then follow the template walkthrough →'
                wrapper=s.new_tag('span');wrapper.append(' · ');wrapper.append(help_link)
                a.insert_after(wrapper)
        if name=='construct-templates.html':
            for ident,filename in TEMPLATES.items():
                section=s.select_one('#'+ident)
                old=section.select_one('[data-template-download]')
                if old: old.decompose()
                section.select_one('h2').insert_after(BeautifulSoup(f'<div class="tp-get" data-template-download><p><strong>Start with the file:</strong> <a href="{FILES}" target="_blank" rel="noopener">open MittUiB Files</a> and download <code>{escape(filename)}</code>.</p><p>In Construct, choose Menu &gt; Project &gt; Open local file and select the downloaded .c3p. <a href="construct-project-files.html#cannot-see">File missing or wrong format? Follow the opening guide.</a></p></div>','html.parser').find())
        if name in ['lab-programme.html','lab3-alinta-map.html','tools.html']:
            old=s.select_one('#template-opening-help')
            if old: old.decompose()
            panel=BeautifulSoup(f'<section class="help-banner" id="template-opening-help"><h2>Get Alinta’s Construct files</h2><p>Open <a href="{FILES}" target="_blank" rel="noopener">the course Files section in MittUiB</a>, download the .c3p named in your task, then open it from inside Construct.</p><a class="primary" href="construct-project-files.html">How to download and open the project</a><p><a href="construct-project-files.html#cannot-see">Construct cannot see the file? Check here.</a></p></section>','html.parser').find()
            if name=='lab-programme.html': s.select_one('#lab-3-workbench').insert(0,panel)
            elif name=='tools.html': s.select_one('#lab-floor').insert_before(panel)
            else: s.select_one('main').insert(0,panel)
        path.write_text(str(s),encoding='utf-8',newline='\n')

if __name__=='__main__': update(Path(__file__).resolve().parents[1])

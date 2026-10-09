# Lab update for 16 October 2026

Implemented on the separate `october-lab-plan` branch, based on GitHub main at `a6c0803`. The older local checkout and the unfinished Construct Arena draft were not edited. This document describes the local result; it does not claim that it is published.

## What students get

Lab 2 now starts with four beginner steps in VS Code: open the Lab 1 page, connect story.js, give one click an action, then personalise and test. Each step says what to do and what should happen. The guide explains the named function, element references, textContent and the event listener. The starter has an intentionally empty story.js. A completed reference is included separately. The Signal Control Room, reversible click, AI route and Construct scripting are optional.

The revised calendar is 2, 9, 16, 23 and 30 October. Construct 1 uses Mapping, three campus text boxes, arrows or paths and a tap reveal. Construct 2 continues that project, includes Gate Engine and repairs room navigation. Test Lab keeps the existing practice and prioritises Construct web export. The library quest is preserved under Guides as optional essay help with Chicago author-date. Six templates are documented, including NPC_Text from the newer supplied archive.

## Access and timing

The baseline already had OPEN_ALL=true. In lab-navigation.js, available() now returns true without checking previous completion, dates or stored progress. OPEN_ALL remains true for access to all three steps. Completion still records the student's own milestones and saved-work confirmations; it does not control access to another lab. The static map no longer says it is checking an unlock date. Optional computing-history machines are available directly with empty or blocked storage.

All five schedules have 105 minutes and two breaks. Morning breaks are 09:00-09:10 and 09:40-09:45; afternoon breaks are 15:00-15:10 and 15:40-15:45. The sessions end at 10:00 and 16:00. Extension rows are removed, and an old saved duration of 120 is ignored. Time chips subtract both breaks when they overlap a work period.

## Encoding and existing build tools

Windows PowerShell 5.1 reports OutputEncoding=us-ascii here. A direct probe piping curly quotation marks to Python produced code point 63, the literal question mark, at both ends. This reproduces the loss before Python writes UTF-8. Changing the output file encoding alone cannot recover characters already lost in the input pipeline.

The damaged strings are present in the committed HTML and JavaScript source. Examples first appear in af7ba22 (project-note quotes), bf21c45 (JavaScript explanation), b471807 (checkpoint controls) and 808ede1 (equipment labels). The exact historical command that ran each edit is not recorded, so the pipeline reproduction establishes a failure mechanism, not proof of every past command.

The referenced field_missions.py and clarity_construct.py are absent from this checkout and its available Git history. The tracked tools build-pack-v2.py, build-sprites.py, build-trail.py and verify-trail.py concern artwork and the separate Trail Mix site; they do not generate the lab pages. The new migration tools are UTF-8 files executed directly. The PowerShell wrapper never pipes Python source. Verification checks the affected source strings and generated pages.

The DIKULT106 / DIGITAL ETHICS label is unchanged. It is baked into 13 HTML pages, for example labs/lab-programme.html in the accessibility bar. A replacement label has not been supplied. The Pro instructions still link to the course announcement; no licence code was added. Attendance is the paper sheet, with no instruction to upload attendance screenshots.

## Checks completed

- All five dates and schedule totals; two breaks per lab; no extension rows.
- Six template sections, Gate Engine in Lab 4, Test Lab preserved and library quest under the optional guide.
- Four primary JavaScript reader steps and the optional advanced routes.
- Local file links, relevant fragments, duplicate programme IDs, UTF-8 and 42 JavaScript syntax checks.
- The actual schedule script with a saved 120 preference, blocked storage and morning/afternoon switching.
- The first-click script: no early text change, first click changes it, second click repeats it, personalised text works and a wrong id exposes the expected error.
- Blank starter and completed solution agree with the example files. Git diff whitespace check passes.

No browser surface is available through the UI tool in this session. Visual layout, keyboard operation and private-window behaviour have not been verified in a real browser.

## Browser checklist before Friday 16 October

1. Open Lab 3 in a private window, without completing Lab 2. Open its experiment and save/reflection steps.
2. Switch morning and afternoon. Check end times 10:00 and 16:00 and both breaks. Try a browser that previously selected 120 minutes.
3. Follow JavaScript steps 1-4 in VS Code with the blank starter. Check the first and second clicks, change the sentence, and test Tab plus Enter or Space. Repeat at phone width.
4. In Lab 3, check the Pro announcement link, Mapping route and NPC_Text images. In Lab 4, test Gate Engine and add a sentence to the Lab 4 note, not Lab 3.
5. Open Library from Guides. Check the optional quest and Chicago route. Open Lab 5 and confirm Construct export is the first publishing route.
6. Test the accessibility console, reduced motion and the no-AI route. The DIKULT106 label should remain as before.

## Run the checks

Requires Python, beautifulsoup4 and Node.js. From this checkout:

```powershell
python tools/verify_lab_plan.py
node tools/verify_schedule.cjs
node tools/verify_first_click.cjs
```

update_lab_plan.py is a one-time migration from the clean baseline, not a build to run over an already migrated checkout. It takes a separate baseline source checkout and the supplied six-template zip. The newer zip is construct-templates (1).zip; the older zip contains only five templates.

## Every changed or added file

The complete list follows. Pages with only shared script-cache or punctuation changes retain their existing content and visual assets.

- [.gitignore](.gitignore)
- [LAB-UPDATE-REVIEW.md](LAB-UPDATE-REVIEW.md)
- [changed-files.json](changed-files.json)
- [labs/accessibility-lab.html](labs/accessibility-lab.html)
- [labs/ai-coding.html](labs/ai-coding.html)
- [labs/computing-history.html](labs/computing-history.html)
- [labs/computing-history.js](labs/computing-history.js)
- [labs/construct-guide.html](labs/construct-guide.html)
- [labs/construct-templates.html](labs/construct-templates.html)
- [labs/construct-templates/19-npc-layout.jpg](labs/construct-templates/19-npc-layout.jpg)
- [labs/construct-templates/20-npc-tap-npc1.jpg](labs/construct-templates/20-npc-tap-npc1.jpg)
- [labs/construct-templates/21-npc-tap-main.jpg](labs/construct-templates/21-npc-tap-main.jpg)
- [labs/construct-templates/22-npc-eventsheet.jpg](labs/construct-templates/22-npc-eventsheet.jpg)
- [labs/credits.html](labs/credits.html)
- [labs/equipment-lab2.js](labs/equipment-lab2.js)
- [labs/field-missions.js](labs/field-missions.js)
- [labs/github-guide.html](labs/github-guide.html)
- [labs/index.html](labs/index.html)
- [labs/javascript-beginner-starter.zip](labs/javascript-beginner-starter.zip)
- [labs/javascript-construct.html](labs/javascript-construct.html)
- [labs/javascript-first-example/index.html](labs/javascript-first-example/index.html)
- [labs/javascript-first-example/story.js](labs/javascript-first-example/story.js)
- [labs/lab-navigation.js](labs/lab-navigation.js)
- [labs/lab-process-worksheet.txt](labs/lab-process-worksheet.txt)
- [labs/lab-programme.html](labs/lab-programme.html)
- [labs/lab-programme.js](labs/lab-programme.js)
- [labs/lab-victory.js](labs/lab-victory.js)
- [labs/library-lab.html](labs/library-lab.html)
- [labs/library-research-card.txt](labs/library-research-card.txt)
- [labs/machine-transmission.js](labs/machine-transmission.js)
- [labs/meet-ingrid.html](labs/meet-ingrid.html)
- [labs/plan-for-alinta.html](labs/plan-for-alinta.html)
- [labs/setup.html](labs/setup.html)
- [labs/signal-guide.js](labs/signal-guide.js)
- [labs/start-lab.js](labs/start-lab.js)
- [labs/tools.html](labs/tools.html)
- [labs/vibecoding.html](labs/vibecoding.html)
- [tools/improve_javascript.py](tools/improve_javascript.py)
- [tools/update_lab_plan.ps1](tools/update_lab_plan.ps1)
- [tools/update_lab_plan.py](tools/update_lab_plan.py)
- [tools/verify_first_click.cjs](tools/verify_first_click.cjs)
- [tools/verify_lab_plan.py](tools/verify_lab_plan.py)
- [tools/verify_schedule.cjs](tools/verify_schedule.cjs)

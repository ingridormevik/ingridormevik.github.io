Construct practical learning revision
====================================

Lab 3 now leads into a campus story built in the actual Construct editor.
The official interface and event-sheet screenshots already stored in setup-assets
are placed beside the relevant map tasks, with descriptive alt text, enlargement
links and original Construct documentation links. Captions explicitly distinguish
the official blank project and On start of layout example from the student's map.

Students test a visible layout, change a tap condition while retaining its action,
and test again. Lab 4 applies the same event-row structure to room destinations.
The standalone Construct guide introduces a personal-place interaction and includes
a change-and-test task. Longer troubleshooting and techniques are closed drawers.

Existing template imagery includes annotated illustrations rather than verified
editor screenshots. Those figures are now labelled as template illustrations,
with a link to authentic editor screenshots. No generated image is presented as
a new capture of the student's project. No new editor screenshots were captured.

Source: tools/construct_learning.py, called by tools/beginner_support.py.
Validation: verify_lab_plan.py and git diff --check passed. The structural suite
checks local files and fragments, UTF-8 and all 43 JavaScript files. Visual browser
and actual Construct interaction checks remain outstanding because this session
has no browser surface. Changes remain local and unpublished.

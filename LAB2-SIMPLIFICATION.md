Lab 2 simplification
====================

This follow-up supersedes the optional HTML missions described in LAB-UPDATE-REVIEW.md.
The beginner guide now has two plain, closed HTML explanations. It no longer loads
the scanner, quiz, badge or circuit scripts. The existing four-step route is intact.

vibecoding.html now contains one optional exercise in the student's own VS Code
project: request a second-click change, review a possible answer, test it and decide
whether to keep, adjust or undo it. The example is explicitly a possible AI answer,
not a claim that an actual AI session occurred. A no-AI route is included.
The page no longer loads the arena scripts or displays rounds, XP or timers.
Its accessibility console remains available.

Source regeneration calls tools/simplify_lab2.py so these changes survive rebuilding.
Unused arena and HTML mission assets remain in the repository as historical files.

Validation: verify_lab_plan.py, verify_first_click.cjs, verify_schedule.cjs,
verify_ai_practice.cjs and git diff --check passed. The new runtime check executes
the displayed AI example and checks repeated clicks, personal starting text and reload.
Browser layout and keyboard testing still require a real browser; no browser surface
is available in this session. These changes are local and have not been published.

"""A compact, practical room repair workshop with authentic UI references."""
from bs4 import BeautifulSoup

def rooms(root):
    labs = root / 'labs'
    path = labs / 'lab-programme.html'
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    panel = s.select_one('#construct-rooms')
    panel.clear()
    panel.append(BeautifulSoup('''<div class="cw-header"><p class="cw-tag">CONSTRUCT 2 / ROOM REPAIR WORKSHOP</p><h3>Get out. Find your way back.</h3><p>North has working exits. The other rooms need your help. Repair one route in the real Construct editor, then make it part of your story.</p><a class="primary" href="construct-templates.html?lab=4#tpl-move">Open the movement template guide</a></div>
<div class="cw-body"><p class="cw-intro">Download and open <strong>SceneSetUpHowToMakeMovementExample.c3p</strong> using the guide above. Keep Construct beside this page. A room is a layout; an event sheet holds its rules.</p>
<div class="cw-route" aria-label="Route you will build"><span>North</span><b aria-hidden="true">↔</b><span>East</span><small>YOUR GOAL: OUT AND BACK</small></div>
<section class="cw-task"><p class="cw-tag">01 / EXPLORE</p><h4>Find the broken route.</h4><ol><li>In Construct's Project Bar, expand Layouts and double-click North.</li><li>Choose Preview layout. Tap the right arrow to enter East.</li><li>Look for a way back. Close Preview and open East in the editor.</li></ol><p class="cw-test"><strong>Discovery:</strong> East's arrow is parked outside the room. A visitor cannot reach it there.</p><details><summary>Where are Layouts and Preview?</summary><figure><a href="setup-assets/construct-interface.png" target="_blank" rel="noopener"><img src="setup-assets/construct-interface.png" alt="Real Construct editor with Project Bar at right and toolbar at top." loading="lazy"/></a><figcaption>Real manual screenshot of a blank project. Marker 7 is the Project Bar. Your room appears in the middle. <a href="https://www.construct.net/en/make-games/manuals/construct-3/overview/the-interface" target="_blank" rel="noopener">Construct source</a>.</figcaption></figure><p>Expand Layouts in the Project Bar. Use the Preview layout option for the room you are editing, rather than starting the project's first layout.</p></details></section>
<section class="cw-task"><p class="cw-tag">02 / REPAIR</p><h4>Give East an exit.</h4><ol><li>In East, drag its arrow inside the room, where the visitor can see and tap it.</li><li>Click empty space in the layout. Read the Event sheet property and open that sheet from the Project Bar.</li><li>Find the tap rule for this arrow. If there is none, choose Add event &gt; Touch &gt; On tap object and select its object type.</li><li>On that row, add or edit System &gt; Go to layout. Choose North as the destination.</li></ol><p class="cw-test"><strong>Try it:</strong> Preview East. Tap the arrow. You should arrive in North.</p><details><summary>Read an event row in the real editor</summary><figure><a href="setup-assets/construct-events.png" target="_blank" rel="noopener"><img src="setup-assets/construct-events.png" alt="Actual Construct event row: condition on the left, action on the right and Add action on the same row." loading="lazy"/></a><figcaption>Real manual example, using System / On start of layout and Text / Set text. Your route uses Touch / On tap object and System / Go to layout. <a href="https://www.construct.net/en/make-games/manuals/construct-3/interface/event-sheet-view" target="_blank" rel="noopener">Construct source</a>.</figcaption></figure><p><strong>When this arrow is tapped → go to North.</strong> The condition is on the left. The action is on the right.</p><p>If the sheet is shared with North, do not change North's working rule. Use a separate arrow object type for East, or scope the new rule to East. Ask Ingrid to check the rule with you if both arrows currently use the same object type.</p></details></section>
<section class="cw-task"><p class="cw-tag">03 / PLAYTEST</p><h4>Make the round trip.</h4><ol><li>Preview North. Go to East, return to North, then go out again.</li><li>Let a partner try without directions. Can they find both exits?</li><li>Move an arrow or add a short Text label if the route is unclear. Test again.</li><li>Save a .c3p copy. Use this room connection in your own project.</li></ol><p class="cw-test"><strong>Working result:</strong> a visitor can travel North → East → North without getting stuck.</p></section>
<details class="cw-extra"><summary>Another repair? South and West</summary><p>Repeat the same process for one more room. Decide its destination before creating the action. Test every new connection in both directions.</p><p>A room can be a place, a memory or a mood. Choose what the journey means in your project.</p></details></div>''', 'html.parser'))
    for link in s.select('link[href^="lab-course-updates.css"]'):
        link['href'] = 'lab-course-updates.css?v=panels-3'
    path.write_text(str(s), encoding='utf-8', newline='\n')
    path = labs / 'lab-course-updates.css'
    text = path.read_text(encoding='utf-8')
    marker = '/* Room repair workshop */'
    if marker in text: text = text.split(marker)[0].rstrip()
    text += '''\n/* Room repair workshop */
.studio #construct-rooms{padding:0!important;background:#f4f2e9!important;color:#172e35!important;border:2px solid #172e35;box-shadow:none;overflow:hidden;max-width:100%;box-sizing:border-box}
.studio #construct-rooms .cw-header{background:#172e35;padding:clamp(20px,4vw,36px)}
.studio #construct-rooms .cw-header :is(h3,p){color:#fff!important;margin:0 0 16px;max-width:64ch}
.studio #construct-rooms .cw-header h3{font:700 clamp(28px,4vw,44px)/1.1 Georgia,serif}
.studio #construct-rooms .cw-header .primary{display:inline-block;background:#d7ee84!important;color:#172e35!important;white-space:normal}
.studio #construct-rooms .cw-body{padding:clamp(16px,3vw,30px);display:grid;gap:20px;min-width:0}
.studio #construct-rooms .cw-body :is(p,li,h4,small,strong,figcaption,summary){color:#172e35!important}
.studio #construct-rooms .cw-body p{margin:0 0 12px;max-width:68ch}
.studio #construct-rooms .cw-tag{font:700 13px/1.4 monospace;letter-spacing:.06em}
.studio #construct-rooms .cw-task{padding:clamp(16px,3vw,26px);border:1px solid #91a1a0;background:#fff;min-width:0}
.studio #construct-rooms h4{font:700 clamp(22px,3vw,29px)/1.25 Georgia,serif;margin:8px 0 18px}
.studio #construct-rooms ol{padding-left:22px;margin:0 0 20px;max-width:68ch}
.studio #construct-rooms li{margin:0 0 12px;line-height:1.65;overflow-wrap:anywhere}
.studio #construct-rooms .cw-test{padding:14px 16px;border-left:4px solid #527025;background:#eff5df;max-width:none}
.studio #construct-rooms details{background:#f4f2e9;padding:14px 16px;border:1px solid #91a1a0}
.studio #construct-rooms summary{font-weight:700;cursor:pointer;line-height:1.5}
.studio #construct-rooms details[open]>summary{margin-bottom:16px}
.studio #construct-rooms figure{margin:16px 0;max-width:800px}
.studio #construct-rooms img{width:100%;height:auto;display:block}
.studio #construct-rooms figcaption{font-size:14px;line-height:1.6;margin-top:10px}
.studio #construct-rooms .cw-route{display:flex;flex-wrap:wrap;align-items:center;gap:14px;padding:16px;border:1px solid #91a1a0}
.studio #construct-rooms .cw-route span{font:700 20px/1.3 monospace;padding:8px 14px;background:#172e35;color:#fff}
.studio #construct-rooms .cw-route small{font:700 12px/1.5 monospace}
'''
    path.write_text(text, encoding='utf-8', newline='\n')

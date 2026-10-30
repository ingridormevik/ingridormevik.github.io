"""The optional play table for the 30 October project and library session."""
from bs4 import BeautifulSoup


STRIP = '''<div class="ff-session-strip" id="friday-session-info" aria-label="Today's session">
<p><strong>14:15–15:30</strong><span>Friday 30 October</span></p>
<p><strong>Make things together</strong><span>Project work + optional library visit</span></p>
<p><strong>Halloween snacks</strong><span>No scheduled breaks. Settle in.</span></p>
</div>'''

PLAY = '''<section class="ff-social" id="friday-play" aria-labelledby="ff-title">
<header class="ff-social-heading"><p class="hl-kicker">THE FRIDAY COMMON ROOM</p><h2 id="ff-title">A little work. A little Halloween.</h2><p>Bring your task, pull up a chair and help each other out. Stay with your own work or try a tiny side quest. Nothing here adds to the assignment.</p></header>
<article class="ff-dip" aria-labelledby="ff-dip-title"><p class="ff-label">OPTIONAL SIDE QUEST / LUCKY DIP</p><div class="ff-ticket"><span class="ff-ticket-number" data-ff-number aria-hidden="true">01</span><h3 id="ff-dip-title" data-ff-title>Swap the mouse.</h3><p data-ff-task>Let a neighbour try one part of your work. Watch what they do first, then ask what felt clear or confusing.</p></div><div class="ff-dip-actions"><button type="button" data-ff-draw hidden>Draw a tiny task</button><a href="#lab-5-workbench" data-ff-link>Try it at the workbench →</a></div><p class="ff-small">Keep it small. Skip it, swap it or carry on with your own task.</p><p class="ff-sr" role="status" data-ff-announcement></p></article>
<aside class="ff-snacks" aria-labelledby="ff-snack-title"><p class="ff-label">THE HALLOWEEN SNACK CORNER</p><h3 id="ff-snack-title">Treats, chats &amp; a friendly ghost.</h3><p>Have some Halloween snacks, talk about what you are making and enjoy the Friday company. Help yourself whenever you like.</p><button class="ff-pumpkin" type="button" data-ff-boo aria-label="Tap the pumpkin for a friendly Halloween greeting" hidden><svg class="ff-bowl" viewBox="0 0 340 220" width="340" height="220" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><g stroke="#101722" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="164" cy="194" rx="117" ry="13" fill="#324b40" stroke="none"/><g class="ff-little-ghost"><path d="M230 86q-14-36 13-45 28-9 33 17 4 20 21 27l-16 6-11-6-9 12-12-10Z" fill="#eee7ce"/><path d="M246 59v6m13-5v5" stroke-width="3"/></g><path d="m69 97-19-18 16-10 25 13m-19 4 18-18 9 20" fill="#b9d998"/><path d="m151 89-6-35 17-7 18 28m-18-14 14-19 13 14-6 23" fill="#b4a0cc"/><path d="m219 92 21-29 20 10-15 27m-3-23 21-2-2 17-15 10" fill="#e6bf73"/><path d="M55 110q-2-45 108-45 110 0 110 45l-11 51q-11 33-99 33-89 0-100-33Z" fill="#dd985a"/><ellipse cx="164" cy="108" rx="109" ry="25" fill="#b46a43"/><path d="m93 107 17-18 28 7-17 21Z" fill="#c9e58e"/><path d="m161 110 10-22 27 6-11 23Z" fill="#dfc783"/><path d="m212 98 17-8 15 17-14 12Z" fill="#b9a4cd"/><path d="m102 149 14-14 13 17m48 0 15-17 14 14m-91 16 20 13 28-2 25-14" fill="#152a30" stroke-width="3"/></g></svg><span>Tap the pumpkin</span></button><p class="ff-snack-status" data-ff-boo-status role="status">The book ghost is keeping the snacks company.</p></aside>
</section>'''


def decorate(page):
    lab = page.find(id='lab-5')
    if not lab:
        return
    for old in page.select('#friday-session-info,#friday-play,script[src^="friday-social.js"]'):
        old.decompose()
    hero = lab.find(id='programme')
    hero.select_one('.hl-entrance-copy').insert_after(BeautifulSoup(STRIP, 'html.parser').find())
    lab.find(id='friday-routes').insert_after(BeautifulSoup(PLAY, 'html.parser').find())
    page.head.append(page.new_tag('script', src='friday-social.js?v=1', defer=''))

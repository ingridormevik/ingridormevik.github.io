"""Three rooms in the Final quest, taught through doing rather than notes:
Future forge (Alinta's lecture on design futures), Game machine (Alinta's lecture on designing and analysing games)
and the Sound & media studio (Hanna's Audacity lab early in the semester, carried into Construct).
The Construct paths were checked in the real editor (r506.3); screenshots are in labs/construct-final/."""

FIN = 'construct-final/'


def shot(src, alt):
    return (f'<figure class="ss-shot"><a href="{FIN}{src}" target="_blank" rel="noopener">'
            f'<img src="{FIN}{src}" alt="{alt}" loading="lazy"/></a></figure>')


def use(text):
    return f'<div class="fq-use"><span class="fq-tag fs-tag-future">IN YOUR FINAL WORK</span> {text}</div>'


def credit(text):
    return f'<p class="fq-credit">{text}</p>'


# ---------------------------------------------------------------- Room A: Future forge
FUTURES = [
 ('growth', 'Growth', 'Today’s systems keep going, and so do their consequences.',
  '<path class="fr-rise" d="M10 60l16-14 12 8 22-28" fill="none" stroke="#c6f15b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
  '<path d="M52 22h10v10" fill="none" stroke="#c6f15b" stroke-width="5" stroke-linecap="round"/>'),
 ('collapse', 'Collapse', 'Something big breaks down. What is left, and who is left?',
  '<rect x="20" y="16" width="16" height="16" fill="#ff7a59" stroke="#080e15" stroke-width="3"/><rect class="fr-fall" x="40" y="16" width="16" height="16" fill="#ff7a59" stroke="#080e15" stroke-width="3"/>'
  '<rect x="20" y="36" width="16" height="16" fill="#ff7a59" stroke="#080e15" stroke-width="3"/><rect class="fr-fall fr-d2" x="40" y="36" width="16" height="16" fill="#ff7a59" stroke="#080e15" stroke-width="3"/>'
  '<path d="M10 66h52" stroke="#edf4dd" stroke-width="3"/>'),
 ('discipline', 'Discipline', 'Life is reorganised around a limit: water, energy, time.',
  '<circle class="fr-pulse" cx="36" cy="38" r="12" fill="#6fb7ff" stroke="#080e15" stroke-width="3"/>'
  '<path d="M12 14v48M24 14v48M48 14v48M60 14v48" stroke="#e9ca85" stroke-width="4"/>'),
 ('transformation', 'Transformation', 'Something changes at the root: technology, society, us.',
  '<path class="fr-morph" d="M36 12l20 14-8 24H24l-8-24Z" fill="#ff5fd2" stroke="#080e15" stroke-width="3"/>'),
]


def forge():
    dial = ''.join(f'<button type="button" data-fr="{k}" aria-pressed="false"><svg viewBox="0 0 72 72" aria-hidden="true">{art}</svg>'
                   f'<span>{t}</span></button>' for k, t, _, art in FUTURES)
    lines = ''.join(f'<span data-fr-line="{k}" hidden=""><b>{t}</b>: {d}</span>' for k, t, d, _ in FUTURES)
    return f'''<section class="fq-gate fr-forge" id="forge" aria-labelledby="gfa"><p class="fq-kicker">ROOM A · THE FUTURE FORGE</p>
{credit('Alinta’s idea, from her lecture on design futures: the future is plural, and design can help shape which one we get.')}
<h2 id="gfa">Which future are you building?</h2>
<p class="fq-sub">Spin the dial. Four ways a future can go.</p>
<div class="fr-dial" role="group" aria-label="Choose a kind of future">{dial}</div>
<p class="fr-out" aria-live="polite"><span data-fr-line="none">My future is a <b>___</b> future.</span>{lines}</p>
<div class="fr-ladder" data-fr-ladder=""><p class="fq-kicker">BACKCASTING · START AT THE END</p>
<div class="fr-in"><label>My preferred future <input type="text" maxlength="60" data-fr-goal="" placeholder="clean water for everyone"/></label>
<label>by the year <input type="number" min="2030" max="2200" data-fr-year="" placeholder="2040"/></label></div>
<ol class="fr-rungs"><li data-rung="0"><b data-fr-y="0">2040</b><span data-fr-g="">clean water for everyone</span></li>
<li data-rung="1"><b data-fr-y="1">2032</b><span>What had to be built?</span></li>
<li data-rung="2"><b data-fr-y="2">2028</b><span>Who had to agree?</span></li>
<li data-rung="3" class="is-today"><b>Today</b><span>Your prototype: one early step.</span></li></ol></div>
<div class="fq-grid">
<article class="fq-card fq-in"><span class="fq-tag">PREFERRED FOR WHOM?</span><h3>Better for who?</h3><p>Who gains? Who is left out, moved on or made invisible?</p><p>Every fix changes the problem. You cannot solve it all, but you can shine a light on it.</p></article>
<article class="fq-card fq-in"><span class="fq-tag">DESIGN FICTION</span><h3>Pretend it is already here</h3><p>A warning sign, a product label, an app screen from 2050. Write your world as fact, and let the visitor step inside.</p></article>
<article class="fq-card fq-in"><span class="fq-tag">YOUR PROCESS</span><h3>Frame, research, try, test</h3><p>Choose a topic. See how others did it. Sketch options. Build the smallest version. Test it.</p></article>
</div>
{use('Part 2 of your text: name your kind of future, who it is preferred for, and how your work is one early step. The frame, research, try, test loop is your process story in part 4.')}
</section>'''


# ---------------------------------------------------------------- Room B: Game machine
PARTS5 = [
 ('rule', 'Rule', '#ffd23f', 'A limit on what can happen.', 'A <b>condition</b>.', '<code>visits ≥ 3</code>'),
 ('mechanic', 'Mechanic', '#ff7a59', 'How the world works when someone acts.', 'An <b>action</b>.', '<code>Add 1 to visits</code>'),
 ('state', 'State', '#6fb7ff', 'The situation right now.', 'A <b>variable</b>.', '<code>visits = 2</code>'),
 ('dynamics', 'Dynamics', '#c6f15b', 'Patterns that appear while people play.', 'You do not code this. You <b>see it when you test</b>.', 'Testers tap fast to reach the message.'),
 ('aesthetics', 'Aesthetics', '#ff5fd2', 'How it feels.', '<b>Sound, pace, colour, words</b>.', 'Calm, tense, lonely, playful.'),
]


def machine():
    btns = ''.join(f'<button type="button" data-gm="{k}" aria-pressed="false" style="--c:{c}"><span class="gm-cog" aria-hidden="true"></span><b>{t}</b></button>'
                   for k, t, c, *_ in PARTS5)
    cards = ''.join(f'<div class="gm-card" data-gm-card="{k}" hidden=""><h3>{t}</h3><p>{d}</p><p><span class="fq-tag">IN CONSTRUCT</span> {c3}</p><p class="gm-ex">{ex}</p></div>'
                    for k, t, _, d, c3, ex in PARTS5)
    flow = ''.join(f'<li><label><input type="checkbox"/><span><b>{a}</b> {b}</span></label></li>' for a, b in [
        ('Clear goal.', 'Do testers know what they are trying to do?'), ('Feedback.', 'Do they see what their action changed?'),
        ('Control.', 'Do they feel their choices matter?'), ('Fair challenge.', 'Not too easy, not impossible.'),
        ('Attention.', 'Does it hold them without overwhelming?'), ('Learnable.', 'Can they get better at it?'),
        ('Absorbing.', 'Do they forget the room around them?'), ('Free, capable, connected.', 'Do they act willingly, feel able, feel part of something?')])
    return f'''<section class="fq-gate gm-room" id="machine" aria-labelledby="gmb"><p class="fq-kicker">ROOM B · THE GAME MACHINE</p>
{credit('Alinta’s idea, from her lecture on designing, creating and analysing games: a game is built from parts you can name, and every rule says something.')}
<h2 id="gmb">Five parts. Tap them.</h2>
<div class="gm-line" role="group" aria-label="The parts of a game">{btns}</div>
<div class="gm-cards" aria-live="polite"><div class="gm-card is-hint" data-gm-card="none"><p>Tap a part. You built all five in Lab 4.</p></div>{cards}</div>
<div class="fq-grid">
<article class="fq-card fq-in"><span class="fq-tag">CHOOSE</span><h3>Like Life is Strange</h3><p>Choices shape what happens later.</p><p><b>Construct:</b> a variable remembers the choice.</p></article>
<article class="fq-card fq-in"><span class="fq-tag">DISCOVER</span><h3>Like Gone Home</h3><p>Explore rooms. Piece together what already happened.</p><p><b>Construct:</b> hidden notes in rooms, like your Lab 3 secret.</p></article>
<article class="fq-card fq-in is-warn"><span class="fq-tag">RULES ARGUE</span><h3>Your system has an opinion</h3><p>Papers, Please argues through what its rules make you do. If saving water costs points in your future, your rules say something.</p></article>
</div>
<p class="gm-note"><b>Rules or story?</b> One way of studying games looks at rules and play, another at story. Your work can be both. Not a game at all? Fine. Use game parts only when they serve the work.</p>
<div class="gm-flow"><p class="fq-kicker">FLOW CHECK · USE IT WHEN SOMEONE TESTS (LAB 7)</p><ol class="fq-steps" data-fq-list="flow">{flow}</ol></div>
{use('Part 3 of your text: describe how your work works with these words (rule, mechanic, state). Part 4: what testers did is your dynamics, and what you changed after the flow check.')}
</section>'''


# ---------------------------------------------------------------- Room C: Sound & media studio
BENCH = [
 ('in', 'Bring it in', 'Record with the microphone button and keep the meter out of the red. Or drag a sound file into the window. Install FFmpeg so Audacity opens most formats.'),
 ('tone', 'Room tone', 'Record 10 seconds of silence first. Select it › Effect › Noise Reduction › <b>Get Noise Profile</b>. Select all (Ctrl/Cmd + A) › Noise Reduction › OK.'),
 ('cut', 'Cut', 'Zoom in. Select the “um” or the silence, listen, then Delete. Edit › Clip Boundaries › <b>Split</b> to move a part.'),
 ('level', 'Level', 'Effect › <b>Normalize</b> to -1 dB. Peaks hitting red are clipping: record again a little quieter.'),
 ('blend', 'Blend', 'Effect › <b>Fade In</b> or <b>Fade Out</b>. Overlap two tracks and use Crossfade Tracks for a smooth change.'),
 ('out', 'Export', 'File › Export › <b>MP3</b>. Keep the .aup3 project file so you can edit later.'),
]
MEDIA = [
 ('sound', 'Sound', [
   ('Right-click <b>Sounds</b> › Import sounds for short effects. Long music or ambience: <b>Music</b> › Import music.', shot('m1-import-sounds.webp', 'Project Bar: right-click Sounds, Import sounds highlighted.')),
   ('Insert the <b>Audio</b> object, once per project. Then an event › Audio › <b>Play</b> ①. Also try Fade volume ②, Set looping ③ and Set volume ④.', shot('m2-audio-actions.webp', 'Add Audio action dialog with Play, Fade volume, Set looping and Set volume highlighted.')),
   ('In Play: choose the file ①, loop ②, volume in dB ③ (0 is full, -10 is quieter). Give it a tag to stop or fade it later.', shot('m3-audio-play.webp', 'Parameters for Audio Play: Audio file, Loop and Volume highlighted.')),
   ('Make it react: Set volume from a variable, or <b>Play at object</b> so the sound sits somewhere in the room.', '')]),
 ('pictures', 'Pictures', [
   ('Insert a <b>Sprite</b> (or a Tiled Background for a repeating floor). In the image editor, <b>Load images from files</b>.', shot('m6-load-image.webp', 'Construct image editor with the Load images from files button highlighted.')),
   ('Several images become the frames of one animation: a flickering light, a breathing wall.', ''),
   ('Draw, photograph or make your own images, or credit whose they are. Screenshots of your work become Figure 1, Figure 2 in your text.', '')]),
 ('video', 'Video', [
   ('Right-click <b>Videos</b> › Import video.', shot('m5-import-video.webp', 'Project Bar: right-click Videos, Import video highlighted.')),
   ('Insert the <b>Video</b> object. Properties › <b>Primary source</b> ①: your video. Autoplay ② Yes or No.', shot('m4-video-props.webp', 'Video object properties with Primary source and Autoplay highlighted.')),
   ('In events: Video › <b>Play</b>, <b>Pause</b> or <b>Set source</b> to change what is shown. MP4 (H.264) plays in most browsers.', '')]),
]


def studio():
    wave = ''.join(f'<rect class="ss-bar" x="{8 + i * 12}" y="{40 - h}" width="7" height="{2 * h}" rx="3" style="--i:{i}"/>'
                   for i, h in enumerate([6, 14, 22, 12, 28, 18, 8, 24, 30, 16, 10, 20, 26, 12, 6, 18, 24, 10, 14, 8, 20, 12, 6, 4]))
    st = ''.join(f'<button type="button" data-ss="{k}" aria-pressed="{str(i == 0).lower()}"><span>{i + 1}</span>{t}</button>' for i, (k, t, _) in enumerate(BENCH))
    cards = ''.join(f'<p class="ss-card" data-ss-card="{k}"{"" if i == 0 else " hidden"}><b>{t}.</b> {d}</p>' for i, (k, t, d) in enumerate(BENCH))
    tabs = ''.join(f'<button type="button" data-ss-tab="{k}" aria-pressed="{str(i == 0).lower()}">{t}</button>' for i, (k, t, _) in enumerate(MEDIA))
    panes = ''
    for i, (k, t, steps) in enumerate(MEDIA):
        lis = ''.join(f'<li><p>{s}</p>{img}</li>' for s, img in steps)
        panes += f'<div class="ss-pane" data-ss-pane="{k}"><ol class="fq-steps">{lis}</ol></div>'
    return f'''<section class="fq-gate ss-room" id="studio" aria-labelledby="gsc"><p class="fq-kicker">ROOM C · THE SOUND &amp; MEDIA STUDIO</p>
{credit('This builds on Hanna’s labs at the start of the semester: clean your sound in Audacity first, then bring sound, pictures and video into your work.')}
<h2 id="gsc">Make it sound like your future.</h2>
<div class="ss-bench"><svg class="ss-wave" viewBox="0 0 300 80" aria-hidden="true"><rect width="300" height="80" fill="#06231f"/>{wave}<rect class="ss-head" x="0" y="0" width="3" height="80" fill="#ff5fd2"/></svg>
<div class="ss-stations" role="group" aria-label="Audacity steps">{st}</div><div class="ss-cards" aria-live="polite">{cards}</div></div>
<div class="ss-into"><p class="fq-kicker">INTO CONSTRUCT · CHECKED IN THE REAL EDITOR</p><div class="ss-tabs" role="group" aria-label="Media type" hidden="">{tabs}</div>{panes}</div>
<div class="fq-grid">
<article class="fq-card fq-in is-warn"><span class="fq-tag">THE BROWSER RULE</span><h3>Silent until the first tap</h3><p>Browsers do not play sound before someone taps or clicks. Start with a “Tap to enter” screen. Test the exported itch.io version with sound on, not only Preview.</p></article>
<article class="fq-card fq-in"><span class="fq-tag">FOR EVERYONE</span><h3>Captions or a transcript</h3><p>Speech in your work? Add captions or a written transcript. YouTube can draft one; correct it yourself.</p></article>
<article class="fq-card fq-in"><span class="fq-tag">CREDITS</span><h3>Whose sound is it?</h3><p>Sounds from <a href="https://freesound.org/" target="_blank" rel="noopener">freesound.org ↗</a> come with a licence. Check it, credit the creator and add it to your references.</p></article>
</div>
{use('A sound, picture or video layer that carries your future. Credit everything you did not make. In your video walkthrough, let the sound be heard.')}
</section>'''


def room_map():
    stops = [('brief', 'The brief'), ('forge', 'Future forge'), ('machine', 'Game machine'), ('senses', 'Beyond the screen'),
             ('studio', 'Sound studio'), ('doc', 'Your text'), ('publish', 'The link'), ('video', 'The video'), ('ai', 'AI rules'), ('seals', 'Seals')]
    chips = ''.join(f'<a href="#{k}"><span>{i:02d}</span>{t}</a>' for i, (k, t) in enumerate(stops, 1))
    return f'<nav class="fq-rooms" aria-label="Rooms in the Final quest"><p class="fq-kicker">DR. TURING’S ROUTE</p><div>{chips}</div></nav>'

// Final quest: the road to week 50. Marks "you are here" on the road (also on the lab map), counts down to week 50,
// and runs the hub tools: attendance tracker, future generator, word counter for the written text, and the seals.
// Everything is saved only in this browser. Test any date with ?now=2026-11-20T09:00 in the address.
(() => {
  const KEY = 'dik105-final-quest';
  const WEEK50 = new Date(2026, 11, 7); // Monday of week 50, 2026. The exact deadline is in Inspera.
  const MIN = 1800, MAX = 2200, SCALE = 2600;

  function now() {
    const forced = new URLSearchParams(location.search).get('now');
    const t = forced ? new Date(forced) : null;
    return t && !isNaN(t) ? t : new Date();
  }
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - start) / 86400000 + 1) / 7);
  }
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const star = () => { try { window.labAudio?.play('star'); } catch {} };
  const t = now();

  // The road: past weeks fade, this week says YOU ARE HERE.
  const week = t.getFullYear() === 2026 ? isoWeek(t) : 99;
  document.querySelectorAll('[data-fq-road] li[data-week]').forEach(li => {
    const w = Number(li.dataset.week);
    li.classList.toggle('is-past', w < week);
    li.classList.toggle('is-now', w === week);
  });

  // Countdown to week 50.
  const count = document.querySelector('[data-fq-count]');
  if (count) {
    const days = Math.ceil((WEEK50 - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
    count.textContent = days > 1 ? `Week 50 starts in ${days} days. Exact deadline: Inspera.`
      : days === 1 ? 'Week 50 starts tomorrow. Exact deadline: Inspera.'
      : week === 50 ? 'It is week 50. Check the exact deadline in Inspera.'
      : 'Week 50 is done. Well done.';
  }

  // Gate 0: attendance, a personal tracker only.
  const att = document.querySelector('[data-fq-att]');
  if (att) {
    st.att ??= {labs: [], lect: 0};
    const boxes = [...att.querySelectorAll('[data-fq-lab]')];
    const lect = att.querySelector('[data-fq-lect]');
    const out = att.querySelector('[data-fq-att-out]');
    const bar = att.querySelector('.fq-meter span');
    const LECT = Number(lect.max) || 10;
    function paint() {
      const labs = boxes.filter(b => b.checked).length;
      const l = Math.max(0, Math.min(LECT, Number(lect.value) || 0));
      const pct = Math.round((labs + l) / (boxes.length + LECT) * 100);
      boxes.forEach(b => b.closest('label').classList.toggle('is-on', b.checked));
      bar.style.width = `${pct}%`;
      out.textContent = `Labs ${labs}/${boxes.length} · Lectures ${l}/${LECT} · Together ${pct}% ${pct >= 75 ? '✓ over 75%' : `· ${75 - pct} points to 75%`}`;
    }
    boxes.forEach(b => {
      b.checked = st.att.labs.includes(b.dataset.fqLab);
      b.addEventListener('change', () => { st.att.labs = boxes.filter(x => x.checked).map(x => x.dataset.fqLab); save(); paint(); });
    });
    lect.value = st.att.lect || 0;
    lect.addEventListener('input', () => { st.att.lect = Number(lect.value) || 0; save(); paint(); });
    paint();
  }

  // Gate 1: the future generator. Only the brief's own example futures.
  const gen = document.querySelector('[data-fq-gen]');
  if (gen) {
    const FUT = ['climate change', 'a pandemic', 'an extinction event', 'environmental loss', 'humans talking with species on other planets',
      'AI taking all the world’s fresh water', 'AI taking all the office jobs', 'what AI does to human creativity'];
    const FORM = ['An interactive artwork', 'An artistic game', 'An interactive sound piece', 'A website that plays with its own design'];
    const POW = ['a variable that remembers', 'a rule that waits', 'rooms and a way back', 'a hidden thought that appears', 'a sound that changes'];
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const outEl = gen.querySelector('[data-fq-gen-out]');
    gen.querySelector('button').hidden = false;
    gen.querySelector('button').addEventListener('click', () => {
      outEl.classList.remove('is-spin'); void outEl.offsetWidth; outEl.classList.add('is-spin');
      outEl.textContent = `${pick(FORM)} about ${pick(FUT)}, built with ${pick(POW)}.`;
      star();
    });
  }

  // Gate 2: the written text. Word count per part and in total.
  const doc = document.querySelector('[data-fq-doc]');
  if (doc) {
    st.doc ??= {};
    const parts = [...doc.querySelectorAll('[data-fq-part]')];
    const words = s => (s.trim().match(/\S+/g) || []).length;
    const totalEl = doc.querySelector('[data-fq-total]');
    const status = doc.querySelector('[data-fq-status]');
    const pin = doc.querySelector('.fq-pin');
    function paint() {
      let total = 0;
      parts.forEach(p => {
        const n = words(p.value); total += n;
        p.closest('.fq-part').querySelector('[data-fq-pc]').textContent = `${n} words${p.dataset.aim ? ` · aim about ${p.dataset.aim}` : ''}`;
      });
      totalEl.textContent = total;
      pin.style.left = `${Math.min(100, total / SCALE * 100)}%`;
      const ok = total >= MIN && total <= MAX;
      status.classList.toggle('is-ok', ok);
      status.textContent = total < MIN ? `${MIN - total} words to the minimum (${MIN}).` : ok ? `In the band ✓ (${MIN}-${MAX}).` : `${total - MAX} words over the maximum (${MAX}).`;
    }
    parts.forEach(p => {
      p.value = st.doc[p.dataset.fqPart] || '';
      p.addEventListener('input', () => { st.doc[p.dataset.fqPart] = p.value; save(); paint(); });
    });
    const msg = doc.querySelector('[data-fq-docmsg]');
    doc.querySelector('[data-fq-copy]').hidden = false;
    doc.querySelector('[data-fq-copy]').addEventListener('click', async () => {
      const text = parts.map(p => `${p.dataset.title}\n\n${p.value.trim()}`).join('\n\n');
      try { await navigator.clipboard.writeText(text); msg.textContent = 'Copied. Paste it into your own document.'; }
      catch { msg.textContent = 'Copy did not work here. Select the text in each box instead.'; }
    });
    const clear = doc.querySelector('[data-fq-clear]');
    clear.hidden = false;
    clear.addEventListener('click', () => {
      if (!clear.dataset.sure) { clear.dataset.sure = '1'; clear.textContent = 'Sure? Click again to clear'; return; }
      delete clear.dataset.sure; clear.textContent = 'Clear the boxes';
      parts.forEach(p => { p.value = ''; }); st.doc = {}; save(); paint(); msg.textContent = 'Cleared on this device.';
    });
    paint();
  }

  // Ticklists in the publish and video gates.
  document.querySelectorAll('[data-fq-list]').forEach(list => {
    const k = list.dataset.fqList;
    st[k] ??= [];
    list.querySelectorAll('input[type=checkbox]').forEach((b, i) => {
      b.checked = st[k].includes(i);
      const li = b.closest('li');
      li?.classList.toggle('is-on', b.checked);
      b.addEventListener('change', () => {
        st[k] = [...list.querySelectorAll('input[type=checkbox]')].flatMap((x, j) => x.checked ? [j] : []);
        li?.classList.toggle('is-on', b.checked); save();
        if (b.checked) star();
      });
    });
  });

  // Beyond the screen: one sense at a time.
  const fs = document.querySelector('[data-fs]');
  if (fs) {
    const btns = [...fs.querySelectorAll('[data-fs]')].filter(b => b.tagName === 'BUTTON');
    const panels = [...fs.querySelectorAll('[data-fs-panel]')];
    const pick = (k, sound) => {
      if (!panels.some(p => p.dataset.fsPanel === k)) k = panels[0].dataset.fsPanel;
      panels.forEach(p => { p.hidden = p.dataset.fsPanel !== k; });
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fs === k)));
      st.sense = k; save();
      if (sound) star();
    };
    fs.classList.add('fs-js');
    fs.querySelector('.fs-switch').hidden = false;
    btns.forEach(b => b.addEventListener('click', () => pick(b.dataset.fs, true)));
    pick(st.sense, false);
  }

  // Final gate: seven seals.
  const seals = document.querySelector('[data-fq-seals]');
  if (seals) {
    st.seals ??= [];
    const boxes = [...seals.querySelectorAll('[data-fq-seal]')];
    const bar = seals.querySelector('.l4-meter span');
    const out = seals.querySelector('.l4-status');
    const done = seals.querySelector('.l4-done');
    function paint() {
      const n = boxes.filter(b => b.checked).length;
      boxes.forEach(b => b.closest('li').classList.toggle('is-done', b.checked));
      bar.style.width = `${n / boxes.length * 100}%`;
      out.textContent = `${n} of ${boxes.length} seals lit`;
      done.hidden = n !== boxes.length;
    }
    boxes.forEach(b => {
      b.checked = st.seals.includes(b.dataset.fqSeal);
      b.addEventListener('change', () => {
        st.seals = boxes.filter(x => x.checked).map(x => x.dataset.fqSeal); save(); paint();
        if (b.checked) { try { window.labAudio?.play(boxes.every(x => x.checked) ? 'unlock' : 'star'); } catch {} }
      });
    });
    paint();
  }
})();

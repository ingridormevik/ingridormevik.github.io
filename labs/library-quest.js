// Turing's library: one station open at a time, deep links open their station, visited stations get a tick.
// The Writing desk: tap the paper, build a citation, spot the mistake. Everything stays in this browser.
(() => {
  const root = document.querySelector('.lq-on');
  if (!root) return;
  const KEY = 'dik105-library-quest';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const star = () => { try { window.labAudio?.play('star'); } catch {} };
  const stations = [...document.querySelectorAll('.lq-station')];
  st.seen ??= [];

  function tick() {
    document.querySelectorAll('.lq-tile').forEach(t => t.classList.toggle('is-seen', st.seen.includes(t.dataset.lqGo)));
  }
  function open(station, scroll) {
    stations.forEach(s => { if (s !== station) s.open = false; });
    station.open = true;
    if (!st.seen.includes(station.dataset.lq)) { st.seen.push(station.dataset.lq); save(); star(); }
    tick();
    if (scroll) station.scrollIntoView({block: 'start'});
  }
  stations.forEach(s => s.addEventListener('toggle', () => {
    if (s.open) open(s, false);
  }));
  // Any link or hash that points inside a station opens it.
  function follow() {
    let t = null;
    try { t = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch {}
    const station = t?.closest('.lq-station') || (t?.classList.contains('lq-station') ? t : null);
    if (!station) return;
    if (!station.open) open(station, false);
    requestAnimationFrame(() => t.scrollIntoView({block: 'start'}));
  }
  addEventListener('hashchange', follow);
  follow();
  tick();

  // The paper: tap a number, read one line.
  const notes = [...document.querySelectorAll('[data-wd-note]')];
  const pins = [...document.querySelectorAll('[data-wd-pin]')];
  pins.forEach(p => p.addEventListener('click', () => {
    pins.forEach(x => x.classList.toggle('is-on', x === p));
    notes.forEach(n => { n.hidden = n.dataset.wdNote !== p.dataset.wdPin; });
    document.querySelector('.wd-paper').dataset.focus = p.dataset.wdPin;
  }));
  pins[0]?.classList.add('is-on');

  // Citation builder.
  const wb = document.querySelector('[data-wb]');
  if (wb) {
    const type = wb.querySelector('[data-wb-type]');
    const page = wb.querySelector('[data-wb-page]');
    const esc = s => s.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
    const dot = s => s && !/[.?!]$/.test(s) ? s + '.' : s;
    function render() {
      const k = type.value;
      wb.querySelectorAll('[data-wb-set]').forEach(x => { x.hidden = x.dataset.wbSet !== k; });
      const set = wb.querySelector(`[data-wb-set="${k}"]`);
      const v = f => esc((set.querySelector(`[data-wb="${f}"]`)?.value || '').trim());
      const last = v('last') || 'Author', first = v('first'), year = v('year') || 'n.d.', title = v('title') || 'Title';
      const who = first ? `${last}, ${first}` : last;
      const yr = dot(year);
      const pg = esc(page.value.trim());
      const url = v('url') ? ` ${v('url')}.` : '';
      const ref = {
        book: `${who}. ${yr} <i>${title}</i>. ${dot(v('pub'))}`,
        article: `${who}. ${yr} “${dot(title)}” <i>${v('journal') || 'Journal'}</i> ${dot(v('vol'))}${url}`,
        web: `${who}. ${yr} “${dot(title)}” ${dot(v('site'))}${url}`,
        game: `${who}. ${yr} <i>${title}</i>. ${dot(v('plat'))} ${dot(v('pub'))}`,
        art: `${who}. ${yr} <i>${title}</i>. ${dot(v('medium'))}${url}`,
        lecture: `${who}. ${yr} “${dot(title)}” Lecture, DIKULT105, University of Bergen, ${dot(v('date'))}`,
        video: `${who}. ${yr} “${dot(title)}” Video. ${dot(v('site'))}${url}`,
        sound: `${who}. ${yr} “${dot(title)}” Sound file. ${dot(v('site'))} ${dot(v('lic'))}${url}`,
      }[k].replace(/\s+/g, ' ').trim();
      wb.querySelector('[data-wb-in]').textContent = `(${last} ${year}${pg ? `, ${pg}` : ''})`.replace(/&amp;/g, '&');
      wb.querySelector('[data-wb-narr]').textContent = `${last} (${year}${pg ? `, ${pg}` : ''})`.replace(/&amp;/g, '&');
      wb.querySelector('[data-wb-ref]').innerHTML = ref;
    }
    wb.addEventListener('input', render);
    wb.addEventListener('change', render);
    const copy = wb.querySelector('[data-wb-copy]');
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const msg = wb.querySelector('[data-wb-msg]');
      try { await navigator.clipboard.writeText(wb.querySelector('[data-wb-ref]').textContent); msg.textContent = 'Copied. Put titles in italics in your document.'; }
      catch { msg.textContent = 'Copy did not work here. Select the text instead.'; }
    });
    render();
  }

  // Spot the mistake: one card at a time, 10 XP per right answer.
  const game = document.querySelector('[data-wq-game]');
  if (game) {
    const cards = [...game.querySelectorAll('[data-wq]')];
    const next = game.querySelector('[data-wq-next]');
    let at = 0, xp = 0;
    cards.forEach(card => card.querySelectorAll('.wq-opts button').forEach(b => b.addEventListener('click', () => {
      if (card.dataset.done) return;
      card.dataset.done = '1';
      const ok = b.dataset.ok === 'true';
      b.classList.add(ok ? 'is-right' : 'is-wrong');
      card.querySelector('[data-ok="true"]').classList.add('is-right');
      card.querySelector('.wq-why').hidden = false;
      if (ok) { xp += 10; game.querySelector('[data-wq-xp]').textContent = xp; star(); }
      next.hidden = false;
      next.textContent = at === cards.length - 1 ? 'Finish →' : 'Next →';
    })));
    next.addEventListener('click', () => {
      cards[at].hidden = true;
      at++;
      next.hidden = true;
      if (at < cards.length) cards[at].hidden = false;
      else { game.querySelector('.wq-done').hidden = false; try { window.labAudio?.play('unlock'); } catch {} }
    });
  }
})();

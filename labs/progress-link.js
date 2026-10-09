// Backup for browser storage: pack every saved lab key into a personal link, and restore it from #restore=…
// Works across phones and browsers, because the progress travels inside the link itself.
(() => {
  const PREFIXES = ['dik105-', 'cdn-biff-intro-'];
  const HOME = 'https://ingridormevik.github.io/labs/lab-programme.html';
  const b64url = bytes => {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const unb64url = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const canZip = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
  async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }

  function collect() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (PREFIXES.some(p => key.startsWith(p))) data[key] = localStorage.getItem(key);
      }
    } catch (_) {}
    return data;
  }
  async function pack(data) {
    const raw = new TextEncoder().encode(JSON.stringify(data));
    if (canZip) { try { return 'z' + b64url(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (_) {} }
    return 'j' + b64url(raw);
  }
  async function unpack(code) {
    const bytes = unb64url(code.slice(1));
    const raw = code[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
    return JSON.parse(new TextDecoder().decode(raw));
  }

  // ---------- Restore ----------
  async function restore() {
    const match = location.hash.match(/^#restore=([zj][A-Za-z0-9_-]+)/);
    if (!match) return;
    let data;
    try { data = await unpack(match[1]); } catch (_) { alert('This progress link is broken or incomplete. Copy the whole link and try again.'); return; }
    const keys = Object.keys(data).filter(k => PREFIXES.some(p => k.startsWith(p)) && typeof data[k] === 'string');
    if (!keys.length) return;
    if (!confirm(`Restore your lab progress (${keys.length} saved items) in this browser?\n\nThis replaces the same items saved here now.`)) { history.replaceState(null, '', location.pathname + location.search); return; }
    try { keys.forEach(k => localStorage.setItem(k, data[k])); }
    catch (_) { alert('This browser cannot save progress (private mode?). Open the link in Safari or Chrome instead.'); return; }
    history.replaceState(null, '', location.pathname + location.search);
    location.reload();
  }

  // ---------- Save button ----------
  function ui() {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pl-button'; btn.textContent = '💾 Save my progress';
    const dlg = document.createElement('dialog');
    dlg.className = 'pl-dialog';
    dlg.innerHTML = `<h2>Save my progress</h2>
<p>Your progress is saved in this browser. This link is a backup: open it on any phone or computer to get everything back.</p>
<p><strong>Send it to yourself</strong> (Messages, email or Notes). Anyone with the link can see your notes, so keep it to yourself.</p>
<textarea readonly rows="3" aria-label="Your progress link"></textarea>
<p class="pl-actions"><button type="button" data-pl-copy>Copy link</button> <button type="button" data-pl-share hidden>Share…</button> <button type="button" data-pl-close>Close</button></p>
<p class="pl-status" role="status"></p>`;
    // Sit in the lab header next to the sound toggle when there is one; float only on pages without it.
    const nav = document.querySelector('.studio-header nav');
    if (nav) { btn.classList.add('pl-in-nav'); btn.textContent = '💾 Save progress'; nav.append(btn); } else document.body.append(btn);
    document.body.append(dlg);
    const box = dlg.querySelector('textarea'), status = dlg.querySelector('.pl-status'), share = dlg.querySelector('[data-pl-share]');
    if (navigator.share) share.hidden = false;
    btn.addEventListener('click', async () => {
      const data = collect();
      status.textContent = Object.keys(data).length ? `${Object.keys(data).length} saved items in this link.` : 'Nothing saved yet. Do a step first, then come back.';
      box.value = `${HOME}#restore=${await pack(data)}`;
      dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
      box.select();
    });
    dlg.querySelector('[data-pl-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(box.value); status.textContent = 'Copied. Paste it into a message to yourself.'; }
      catch (_) { box.select(); status.textContent = 'Selected. Copy it with Ctrl+C, or press and hold to copy on a phone.'; }
    });
    share.addEventListener('click', () => navigator.share({title: 'My DIKULT105 lab progress', url: box.value}).catch(() => {}));
    dlg.querySelector('[data-pl-close]').addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open'));
    const css = document.createElement('style');
    css.textContent = `.pl-button{position:fixed;left:12px;bottom:12px;z-index:60;min-height:44px;padding:8px 12px;border:2px solid #a4b5bd;border-radius:4px;background:#102630;color:#eff5f2;font:700 14px/1.4 Consolas,monospace;cursor:pointer}
.studio .studio-header nav .pl-button.pl-in-nav{position:static;min-height:44px;padding:8px 12px;border:2px solid #a4b5bd;border-radius:4px;background:#102630;color:#eff5f2;font:700 14px/1.4 Consolas,monospace;box-shadow:3px 3px 0 #0b1418}
.pl-button:hover,.studio .studio-header nav .pl-button.pl-in-nav:hover{border-color:#c6f15b;color:#c6f15b}
.pl-button:focus-visible{outline:3px solid #ffd23f;outline-offset:3px}
.pl-dialog{max-width:min(560px,92vw);border:2px solid #a4b5bd;border-radius:4px;background:#102630;color:#eff5f2;padding:22px;font:16px/1.55 'Segoe UI',Arial,sans-serif}
.pl-dialog::backdrop{background:#000c}
.pl-dialog h2{margin:0 0 10px;font:700 20px/1.3 Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;color:#c6f15b!important}
.pl-dialog p,.pl-dialog strong{color:#eff5f2!important}
.pl-dialog textarea{width:100%;box-sizing:border-box;font:12px/1.4 Consolas,monospace;border:2px solid #a4b5bd;border-radius:4px;padding:8px;background:#071116;color:#eff5f2}
.pl-actions{display:flex;flex-wrap:wrap;gap:8px}
.pl-actions button{min-height:44px;font:700 14px/1.4 Consolas,monospace;padding:8px 14px;border:2px solid #a4b5bd;border-radius:4px;background:#102630;color:#eff5f2;cursor:pointer}
.pl-actions [data-pl-copy]{background:#c6f15b;border-color:#c6f15b;color:#102630}
.pl-actions button:focus-visible{outline:3px solid #ffd23f;outline-offset:3px}
.pl-dialog .pl-status{min-height:1.3em;margin:8px 0 0;font-weight:700;color:#c6f15b!important}
@media (max-width:640px){.pl-button:not(.pl-in-nav){font-size:13px;left:8px;bottom:8px}}
@media print{.pl-button{display:none}}`;
    document.head.append(css);
  }

  restore();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();

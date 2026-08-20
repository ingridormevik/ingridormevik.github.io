#!/usr/bin/env node
/*
  The Classifier — CDN Equinox Autumn 2026
  Me, Myself and AI // Ingrid Ormevik

  The room votes from their phones; the deck shows the tally live.

  No dependencies. Node 18+.

      node talk/classifier/server.js
      node talk/classifier/server.js --port 8080 --images /path/to/portraits

  Every vote is appended to votes.jsonl, so the count survives a restart.
  Nothing is stored about the voter beyond a random per-phone id used only
  to stop one phone voting twice on the same face.
*/

'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const crypto = require('crypto');

// ---------------------------------------------------------------- arguments
function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const PORT    = parseInt(arg('port', '8080'), 10);
const HERE    = __dirname;
// portraits live next to the deck by default; --images overrides
const IMG_DIR = path.resolve(arg('images', path.join(HERE, '..')));
const LOG     = path.join(HERE, 'votes.jsonl');

// The six faces, in the order the deck shows them. Filenames must match the
// FACES list in talk/me-myself-and-ai.html.
const FACES = [
  { id: 'running',   file: 'ChatGPT Image 11. aug. 2026, 13_05_53.png' },
  { id: 'techno',    file: 'ChatGPT Image 11. aug. 2026, 13_05_53 (1).png' },
  { id: 'code',      file: 'ChatGPT Image 11. aug. 2026, 13_07_45 (2).png' },
  { id: 'folklore',  file: 'ChatGPT Image 11. aug. 2026, 13_06_30.png' },
  { id: 'fjord',     file: 'ChatGPT Image 11. aug. 2026, 13_06_40 (1).png' },
  { id: 'reference', file: 'ChatGPT Image 11. aug. 2026, 13_06_52.png' }
];
const CHOICES = ['woman', 'man', 'unsure'];

// ---------------------------------------------------------------- the tally
// tally[faceId] = {woman, man, unsure}; seen holds "voter|face" pairs already counted.
const tally = {};
FACES.forEach(f => { tally[f.id] = { woman: 0, man: 0, unsure: 0 }; });
const seen = new Set();
let voters = new Set();

function record(voter, face, choice) {
  const key = voter + '|' + face;
  if (seen.has(key)) return false;            // one vote per phone per face
  if (!tally[face] || CHOICES.indexOf(choice) < 0) return false;
  seen.add(key);
  voters.add(voter);
  tally[face][choice]++;
  return true;
}

// Rebuild from disk so a restart mid-talk does not lose the room.
function replay() {
  if (!fs.existsSync(LOG)) return 0;
  let n = 0;
  for (const line of fs.readFileSync(LOG, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const v = JSON.parse(line);
      if (record(v.voter, v.face, v.choice)) n++;
    } catch (e) { /* skip a torn line rather than refuse to start */ }
  }
  return n;
}

function snapshot() {
  return {
    faces: FACES.map(f => f.id),
    tally: tally,
    responses: voters.size,
    votes: seen.size
  };
}

// ---------------------------------------------------------------- live feed
const clients = new Set();
function broadcast() {
  const payload = 'data: ' + JSON.stringify(snapshot()) + '\n\n';
  for (const res of clients) { try { res.write(payload); } catch (e) { clients.delete(res); } }
}

// ---------------------------------------------------------------- responses
function send(res, code, type, body, extra) {
  const headers = Object.assign({
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',        // the deck runs from file://
    'Cache-Control': 'no-store'
  }, extra || {});
  res.writeHead(code, headers);
  res.end(body);
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function sendImage(res, n) {
  const face = FACES[n];
  if (!face) return send(res, 404, 'text/plain', 'no such face');
  const file = path.join(IMG_DIR, face.file);
  fs.readFile(file, (err, buf) => {
    if (err) {
      // A missing portrait must not take the server down mid-talk.
      return send(res, 404, 'text/plain', 'image not found: ' + face.file);
    }
    send(res, 200, MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', buf,
         { 'Cache-Control': 'public, max-age=3600' });
  });
}

// ---------------------------------------------------------------- the server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const p = url.pathname;

  if (req.method === 'OPTIONS') {
    return send(res, 204, 'text/plain', '', {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }

  if (p === '/' || p === '/index.html') {
    return fs.readFile(path.join(HERE, 'phone.html'), (err, buf) =>
      err ? send(res, 500, 'text/plain', 'phone.html missing')
          : send(res, 200, 'text/html; charset=utf-8', buf));
  }

  if (p.startsWith('/img/')) return sendImage(res, parseInt(p.slice(5), 10));

  if (p === '/tally') return send(res, 200, 'application/json', JSON.stringify(snapshot()));

  if (p === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 2000\n\n');
    res.write('data: ' + JSON.stringify(snapshot()) + '\n\n');
    clients.add(res);
    const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch (e) {} }, 15000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  if (p === '/vote' && req.method === 'POST') {
    let body = '';
    req.on('data', c => {
      body += c;
      if (body.length > 4096) { req.destroy(); }   // nothing legitimate is this big
    });
    req.on('end', () => {
      let v;
      try { v = JSON.parse(body); } catch (e) { return send(res, 400, 'application/json', '{"ok":false}'); }
      const ok = record(String(v.voter || ''), String(v.face || ''), String(v.choice || ''));
      if (ok) {
        fs.appendFile(LOG, JSON.stringify({
          t: new Date().toISOString(), voter: v.voter, face: v.face, choice: v.choice
        }) + '\n', () => {});
        broadcast();
        process.stdout.write('  ' + String(v.face).padEnd(10) + ' ' + String(v.choice).padEnd(7) +
                             '   ' + voters.size + ' phones, ' + seen.size + ' votes\n');
      }
      send(res, 200, 'application/json', JSON.stringify({ ok: ok, counted: seen.size }));
    });
    return;
  }

  send(res, 404, 'text/plain', 'not found');
});

// ---------------------------------------------------------------- start-up
function lanAddresses() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const ni of ifaces[name]) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

const replayed = replay();

server.listen(PORT, '0.0.0.0', () => {
  const addrs = lanAddresses();
  const url = addrs.length ? 'http://' + addrs[0] + ':' + PORT : 'http://localhost:' + PORT;
  const line = '─'.repeat(52);
  console.log('\n' + line);
  console.log('  THE CLASSIFIER is up.');
  console.log(line);
  console.log('\n  Audience opens:   \x1b[1m' + url + '\x1b[0m\n');
  if (addrs.length > 1) console.log('  other interfaces: ' + addrs.slice(1).map(a => 'http://' + a + ':' + PORT).join('  '));
  console.log('  Deck listens on:  ' + url + '/events');
  console.log('  Portraits from:   ' + IMG_DIR);
  if (replayed) console.log('  Replayed ' + replayed + ' earlier votes from votes.jsonl');
  console.log('\n  QR code:  python3 tools/make-classifier-qr.py --url ' + url);
  console.log('\n  Ctrl-C to stop. Votes are appended to votes.jsonl.\n');

  // A missing portrait is worth knowing about before the room arrives.
  const missing = FACES.filter(f => !fs.existsSync(path.join(IMG_DIR, f.file)));
  if (missing.length) {
    console.log('  \x1b[33m' + missing.length + ' portrait(s) not found in ' + IMG_DIR + ':\x1b[0m');
    missing.forEach(f => console.log('    - ' + f.file));
    console.log('  Pass --images /path/to/them\n');
  }
});

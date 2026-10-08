(() => {
  const room = document.getElementById('signal-room');
  if (!room) return;
  const editor = room.querySelector('[data-js-code]');
  const sentence = room.querySelector('#sr-own-sentence');
  const message = room.querySelector('[data-sr-insert-status]');
  const declaration = /const\s+futureText\s*=\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*;/;
  room.querySelector('[data-sr-insert-sentence]').addEventListener('click', () => {
    if (!sentence.value.trim()) { message.textContent = 'Write a sentence first.'; sentence.focus(); return; }
    if (!declaration.test(editor.value)) { message.textContent = 'Your code no longer has the starter futureText line. Edit your own code directly, or reset it first.'; return; }
    editor.value = editor.value.replace(declaration, () => `const futureText = ${JSON.stringify(sentence.value.trim())};`);
    editor.dispatchEvent(new Event('input', {bubbles:true}));
    message.textContent = 'Line 1 now contains your sentence. Press Run my code below.';
  });
  room.querySelector('[data-sr-load-toggle]').addEventListener('click', () => {
    const futureLine = editor.value.match(declaration)?.[0];
    if (!futureLine) { room.querySelector('[data-js-boss-status]').textContent = 'Keep a const futureText sentence in your code so the example can use your words. You can reset the starter if needed.'; return; }
    editor.value = `${futureLine}
const story = document.querySelector("#story");
const button = document.querySelector("#future");
const originalText = story.textContent;
let showingFuture = false;

button.addEventListener("click", () => {
  showingFuture = !showingFuture;
  if (showingFuture) {
    story.textContent = futureText;
  } else {
    story.textContent = originalText;
  }
});`;
    editor.dispatchEvent(new Event('input', {bubbles:true}));
    room.querySelector('[data-js-boss-status]').textContent = 'Your sentence is preserved. Find the state value and the two branches above, then press Test both clicks.';
    editor.focus();
  });
})();

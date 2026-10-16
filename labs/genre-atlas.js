(() => {
  const input = document.querySelector('#al-genre-query');
  if (!input) return;
  const rows = [...document.querySelectorAll('[data-genre-row]')];
  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase();
    rows.forEach(row => { row.hidden = !row.textContent.toLocaleLowerCase().includes(query); });
    const count = rows.filter(row => !row.hidden).length;
    document.querySelector('#al-genre-count').textContent = count ? `${count} routes into research` : 'No matches. Try another word; your project can combine several forms.';
  });
})();

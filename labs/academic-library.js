(() => {
  const search = document.querySelector('#al-search');
  const topic = document.querySelector('#al-topic');
  if (!search || !topic) return;
  const books = [...document.querySelectorAll('.al-book')];
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    books.forEach(book => {
      book.hidden = !(book.textContent.toLocaleLowerCase().includes(query) && (!topic.value || book.dataset.topic === topic.value));
      if (!book.hidden) count++;
    });
    const filtered = query || topic.value;
    document.querySelector('#al-count').textContent = count ? `${count} ${count === 1 ? 'source' : 'sources'}${filtered ? ` of ${books.length} · Filters applied` : ''}` : 'No matches. Try another word or use Show all sources.';
  };
  search.closest('form').addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', update);
  topic.addEventListener('change', update);
  document.querySelector('#al-reset')?.addEventListener('click', () => {
    search.value = ''; topic.value = ''; update(); search.focus();
  });
  update();
})();

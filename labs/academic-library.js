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
    document.querySelector('#al-count').textContent = count ? `${count} sources` : 'No matches. Try another word or choose All topics.';
  };
  search.closest('form').addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', update);
  topic.addEventListener('change', update);
})();

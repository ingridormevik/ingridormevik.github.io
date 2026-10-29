// Carry the student's own search words from the library session into Scholar.
(() => {
  const query = new URLSearchParams(location.search).get('q');
  const field = document.getElementById('rp-query');
  if (query?.trim() && field) field.value = query.slice(0, 500);
})();

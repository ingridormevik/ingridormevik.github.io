(() => {
  const form = document.querySelector('#rf-form');
  if (!form) return;
  const result = document.querySelector('#rf-result');
  const routes = document.querySelector('#rf-routes');
  const glossary = 'https://glossary.cdn.uib.no/';
  const recommend = answers => {
    const found = [];
    const add = (title,why,question,terms,url,label) => found.push({title,why,question,terms,url,label});
    if (answers.agency === 'meaning' || answers.rules === 'game')
      add('Game studies and player agency','Your choices or rule-based actions may make game studies useful. This is a research lead, not proof that the work is a game.','What can the participant change, and how do the rules make that matter?','player agency game mechanics meaningful choice','#jorgensen-start','Start with Kristine Jørgensen');
    if (['branch','fragments'].includes(answers.structure) || answers.agency === 'navigate')
      add('Hypertext, interactive fiction and narrative structure','You describe choice, navigation or a variable reading order. Compare how these terms are used in actual works.','Does the route change events, interpretation, or only the order of presentation?','hypertext fiction nonlinear narrative reader agency',glossary,'Explore the Living Glossary');
    if (['literary','generated'].includes(answers.language))
      add('Electronic literature, digital poetics and authorship','Language or generated text is central. E-lit research can help if computation contributes to the literary experience; text on a screen alone is not sufficient.','How does the digital process change the writing or reading experience?','electronic literature digital poetics generative literature authorship','https://elmcip.net/','Find creative and critical works in ELMCIP');
    if (answers.rules === 'points')
      add('Gamification and motivation','You describe game elements attached to another activity. Investigate gamification without assuming the entire project is a game.','What behaviour do the points reward, and why should the participant care?','gamification motivation gameful design','#sources','Build a reading list');
    if (answers.world === 'interface' || answers.rules === 'game')
      add('Interfaces and player experience','The signals and feedback that make actions understandable connect directly to Jørgensen’s interface research.','What tells the player what they can do and whether it worked?','Kristine Jørgensen Gameworld Interfaces player experience','#jorgensen-start','Read the Jørgensen introduction');
    if (answers.world === 'place' || answers.values === 'experience')
      add('Place, memory and embodied experience','Place or experience matters to your question. Combine narrative research with geography, memory studies or phenomenology.','How does a body, place or memory shape this experience?','locative narrative cultural memory phenomenology place','#across-fields','Connect fields and reading lists');
    if (answers.world === 'media')
      add('Transmedia storytelling','You describe different platforms contributing to a story. Check what each platform adds rather than simply counting media types.','What part of the story can only this medium contribute?','transmedia storytelling transmediality participation','https://glossary.cdn.uib.no/terms/transmediality/','Read the glossary entry');
    if (['belong','ethics'].includes(answers.values))
      add('Inclusion, ethics and design justice','Your question concerns people and values. Combine research about your medium with a relevant critical or philosophical perspective.','Who can participate, who decides, and who bears the consequences?','inclusive game design belonging design justice ethics','#across-fields','See the Pride Park example and interdisciplinary route');
    if (answers.values === 'authorship')
      add('Philosophy of authorship, AI and knowledge','Investigate how creative contribution and evidence are understood rather than assuming a machine’s output explains itself.','Who contributed what, and what justifies the claims made by the work?','AI literature authorship epistemology computational creativity','#sources','Explore literature, AI and philosophy sources');
    if (!found.length) add('Describe one action before choosing a label','You can begin without knowing a genre. Pick one moment in your prototype and say what a visitor does and what changes.','Is the change in the story, the system, the reading route or the visitor’s interpretation?','digital narrative interaction affordances',glossary,'Start with the Living Glossary');
    return found;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answers = Object.fromEntries(new FormData(form));
    routes.replaceChildren();
    recommend(answers).forEach(route => {
      const section = document.createElement('section');
      const h = document.createElement('h4'); h.textContent=route.title; section.append(h);
      [route.why,`Ask: ${route.question}`,`Search terms: ${route.terms}`].forEach(text => {const p=document.createElement('p');p.textContent=text;section.append(p);});
      const reading=document.createElement('a');reading.href=route.url;reading.textContent=route.label;section.append(reading);
      const p=document.createElement('p');const search=document.createElement('a');search.href='https://oria.no/?query=any,contains,'+encodeURIComponent(route.terms);search.textContent='Search these terms in Oria ↗';p.append(search);section.append(p);routes.append(section);
    });
    const answered = Object.keys(answers).length;
    document.querySelector('#rf-context').textContent = answered ? `${answered} of 6 questions answered. These routes can overlap; choose one or two that help explain your project.` : 'No answers selected yet. Start with one action in your prototype, or choose an answer above.';
    result.hidden=false;result.focus();
  });
  form.addEventListener('reset', () => {result.hidden=true;routes.replaceChildren();});
})();

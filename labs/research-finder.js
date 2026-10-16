(() => {
  const form = document.querySelector('#rf-form');
  if (!form) return;
  const result = document.querySelector('#rf-result');
  const routes = document.querySelector('#rf-routes');
  const glossary = 'https://glossary.cdn.uib.no/';
  const recommend = answers => {
    const found = [];
    const formats = Array.isArray(answers.formats) ? answers.formats : [];
    const add = (title,why,question,terms,url,label) => found.push({title,why,question,terms,url,label});
    if (answers.agency === 'meaning' || answers.rules === 'game' || formats.includes('game'))
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
    if (formats.includes('text') && !['literary','generated'].includes(answers.language))
      add('Stories, poetry and reading','You are making something people read. Start with what the words do. If the computer changes how the writing works, electronic literature may be a useful next term.','Would this work differently on paper, and why?','digital narrative electronic literature reading experience',glossary,'Look up a term in the glossary');
    const broad = [
      ['art','Digital art and creative code','You are making an artwork. It might use images, software, the internet or changing patterns.','What does the digital tool make possible in this artwork?','digital art internet art software art generative art','#genre-atlas','Compare art practices in the table'],
      ['video','Video, animation and video essays','People watch moving images. A video essay uses image and sound to make an argument, not just illustrate a topic.','How do editing and sound guide what the viewer understands?','video essay animation audiovisual storytelling','#genre-atlas','Find useful film and media terms'],
      ['audio','Podcasts, audio stories and sound art','Sound is central to your work. You can study listening, voice, music and the way sound suggests a place.','What can listeners understand through sound that an image would not tell them?','podcast studies sound art audio narrative listening','#genre-atlas','Compare sound-based practices'],
      ['documentary','Digital and interactive documentary','Your work deals with real people or events. Research can help you think about evidence, representation and how the audience explores it.','Whose story is told, and how do you know the account is reliable?','interactive documentary documentary ethics co-creation','https://docubase.mit.edu/','Explore projects at MIT Docubase'],
      ['data','Data visualisation and data stories','A chart or map helps people notice patterns. The design also decides what is easy to see and what is left out.','Where did the data come from, and what can it actually support?','data visualisation data storytelling critical data studies','https://data-feminism.mitpress.mit.edu/','Start with Data Feminism, open access'],
      ['social','Social media, memes and online communities','The platform and its participants are part of the work. You can study posts, streams, humour, identity or how people join in.','How do platform rules shape what people make and who gets noticed?','social media storytelling meme studies livestreaming participatory culture','#across-fields','Connect media studies to your own question'],
      ['fan','Fan fiction, remix and fandom','You are working with an existing story or world. Look at what your version changes and how a community takes part.','What does your remix add, question or change?','fan fiction fan studies remix transformative works','#genre-atlas','Find a name and search terms in the table'],
      ['immersive','VR, AR, installations and digital performance','These are different ways to involve space or the body. VR places someone in a virtual world; AR adds digital material to a physical setting. An installation or performance can use many technologies.','What does moving, being present or taking part add to the work?','virtual reality augmented reality interactive installation digital performance embodiment','#genre-atlas','Compare immersive and performance forms']
    ];
    broad.forEach(([key,...route]) => { if (formats.includes(key)) add(...route); });
    if (formats.includes('app'))
      add('App and web development: usability and interaction','You are building something people use to complete a task. Look at user needs, feedback, accessibility and how to test the design.','Can the intended user complete the task without your help?','human computer interaction usability accessible app design','#building-and-research','Connect making and research');
    if (formats.includes('client'))
      add('Interactive solutions for organisations','A client brief is a starting point. Study whether the solution meets the needs of the people who will actually use it.','Whose problem is being solved, and what evidence shows the solution works?','service design participatory design user research design justice','#building-and-research','Find research for a company or community project');
    if (!found.length) add('Describe one action before choosing a label','You can begin without knowing a genre. Pick one moment in your prototype and say what a visitor does and what changes.','Is the change in the story, the system, the reading route or the visitor’s interpretation?','digital narrative interaction affordances',glossary,'Start with the Living Glossary');
    return found;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const answers = Object.fromEntries(data);
    answers.formats = data.getAll('formats');
    routes.replaceChildren();
    recommend(answers).forEach(route => {
      const section = document.createElement('section');
      const h = document.createElement('h4'); h.textContent=route.title; section.append(h);
      [route.why,`Ask: ${route.question}`,`Search terms: ${route.terms}`].forEach(text => {const p=document.createElement('p');p.textContent=text;section.append(p);});
      const reading=document.createElement('a');reading.href=route.url;reading.textContent=route.label;section.append(reading);
      const p=document.createElement('p');const search=document.createElement('a');search.href='https://oria.no/?query=any,contains,'+encodeURIComponent(route.terms);search.textContent='Search these terms in Oria ↗';p.append(search);section.append(p);routes.append(section);
    });
    const answered = ['agency','structure','rules','language','world','values'].filter(key=>answers[key]).length;
    const selected = answers.formats.length;
    document.querySelector('#rf-context').textContent = answered || selected ? `${selected} project ${selected===1?'type':'types'} selected · ${answered} of 6 questions answered. You can combine routes. Pick one or two to explore first. Also consider aesthetics: how does your work look, sound and feel?` : 'Nothing selected yet. Start with one thing your visitor does, or choose a project type above.';
    result.hidden=false;result.focus();
  });
  form.addEventListener('reset', () => {result.hidden=true;routes.replaceChildren();});
})();

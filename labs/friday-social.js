// Optional ideas for working together. No grades, tracking, accounts or stored answers.
(() => {
  const room=document.getElementById('friday-play');
  if(!room)return;
  const cards=[
    ['Swap the mouse.','Let a neighbour try one part of your work. Watch what they do first, then ask what felt clear or confusing.','#lab-5-workbench','Try it at the workbench'],
    ['Make the first click clearer.','Pick one button, arrow or link. Change its words or appearance so someone can tell what it does. Try it together.','#lab-5-workbench','Open the workbench'],
    ['Take a shelf detour.','Choose a topic from your project. Find a book, check its contents or index, and look at the books next to it.','academic-library.html#ls-find','Find a source'],
    ['Borrow another pair of eyes.','Show someone the part you are stuck on. Compare what you expected with what actually happens. Try one change together.','#lab-5-workbench','Bring your work'],
    ['Follow a strange connection.','Could your project connect to sound, belonging, philosophy or another field? Choose one connection and look for a useful research word.','academic-library.html#ls-notice','Look for a connection'],
    ['Change one tiny thing.','Try a different word, colour, sound or response in your project. Compare both versions with a neighbour. Which fits what you want to make?','#lab-5-workbench','Try a small change']
  ];
  const draw=room.querySelector('[data-ff-draw]');
  const title=room.querySelector('[data-ff-title]');
  const task=room.querySelector('[data-ff-task]');
  const link=room.querySelector('[data-ff-link]');
  const number=room.querySelector('[data-ff-number]');
  const announcement=room.querySelector('[data-ff-announcement]');
  let last=0,bag=[];
  const refill=()=>{
    bag=cards.map((_,i)=>i);
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    if(bag.at(-1)===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
  };
  refill();
  draw.hidden=false;
  draw.addEventListener('click',()=>{
    if(!bag.length)refill();
    last=bag.pop();
    const [heading,words,href,label]=cards[last];
    title.textContent=heading;task.textContent=words;
    link.href=href;link.textContent=label+' →';
    number.textContent=String(last+1).padStart(2,'0');
    announcement.textContent='Optional side quest: '+heading+' '+words;
  });
  const pumpkin=room.querySelector('[data-ff-boo]');
  const status=room.querySelector('[data-ff-boo-status]');
  const greetings=['Boo! The friendliest ghost in the library says hello.','A tiny haunting. Back to your very real project.','The pumpkin approves of helping your neighbour.','Happy Halloween. Take your time and enjoy the company.'];
  let taps=0;
  pumpkin.hidden=false;
  pumpkin.addEventListener('click',()=>{
    status.textContent=greetings[taps%greetings.length];
    pumpkin.dataset.ffMood=String(++taps%2);
  });
})();

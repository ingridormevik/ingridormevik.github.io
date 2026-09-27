(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  document.querySelectorAll('[data-checkin]').forEach(panel => {
    const form = panel.querySelector('form');
    const name = form.querySelector('input');
    const idea = form.querySelector('textarea');
    const result = panel.querySelector('.checkin-result');
    const card = panel.querySelector('.lab-pass');
    const feedback = panel.querySelector('.checkin-feedback');
    const lab = panel.closest('.lab');
    let snapshot;
    form.querySelector('button').disabled = false;
    panel.querySelector('.checkin-hint').textContent = 'Complete this one arrival task, then submit the pass. The experiment checklists below are optional learning tools.';
    function invalidate() {
      snapshot = null; result.hidden = true; form.hidden = false;
      feedback.textContent = '';
    }
    [group,duration].forEach(control => control.addEventListener('change', invalidate));
    form.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
      idea.setCustomValidity(idea.value.trim().length >= 10 ? '' : 'Add your observation and what you want to try.');
      if (!form.reportValidity()) return;
      snapshot = {name:name.value.trim(),idea:idea.value.trim(),session:lab.querySelector('.lab-title .eyebrow').textContent+' · '+lab.querySelector('.session-window').textContent};
      card.querySelector('.pass-name').textContent = snapshot.name;
      card.querySelector('.pass-session').textContent = snapshot.session;
      card.querySelector('.pass-idea').textContent = snapshot.idea;
      form.hidden = true; result.hidden = false; card.focus();
    });
    [name,idea].forEach(input => input.addEventListener('input',()=>input.setCustomValidity('')));
    panel.querySelector('[data-edit-pass]').addEventListener('click',()=>{invalidate();idea.focus();});
    panel.querySelector('[data-download-pass]').addEventListener('click',()=>{
      if (!snapshot) return;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw Error('Canvas unavailable');
        const width = 1040, margin = 60;
        function lines(text,font) {
          ctx.font = font;
          const output=[]; let line='';
          for (const char of text) {
            if (char==='\n') {output.push(line);line='';continue;}
            if(ctx.measureText(line+char).width>width-margin*2){output.push(line);line='';}
            line+=char;
          }
          output.push(line);return output;
        }
        const names=lines(snapshot.name,'bold 40px Arial');
        const sessions=lines(snapshot.session,'24px Arial');
        const ideas=lines(snapshot.idea,'30px Arial');
        canvas.width=width;canvas.height=270+names.length*52+sessions.length*36+ideas.length*44;
        ctx.fillStyle='#f6f5eb';ctx.fillRect(0,0,width,canvas.height);
        ctx.fillStyle='#ffcf67';ctx.fillRect(0,0,width,80);
        ctx.fillStyle='#192f3c';ctx.font='bold 26px Arial';ctx.fillText('DIKULT105 / LAB PASS',margin,51);
        let y=135;
        function draw(items,font,step){ctx.font=font;for(const line of items){ctx.fillText(line,margin,y);y+=step;}}
        draw(names,'bold 40px Arial',52);y+=12;
        draw(sessions,'24px Arial',36);y+=25;
        draw(ideas,'30px Arial',44);y+=25;
        ctx.font='bold 22px Arial';ctx.fillText('TASK COMPLETED · READY TO SUBMIT',margin,y);y+=34;
        ctx.font='20px Arial';ctx.fillText('Submit this card in the MittUiB task identified by Ingrid.',margin,y);
        const link=document.createElement('a');
        link.href=canvas.toDataURL('image/png');link.download=`dik105-lab-${panel.dataset.checkin}-pass.png`;
        document.body.append(link);link.click();link.remove();
        feedback.textContent='Download started. Upload the PNG to MittUiB to finish your check-in.';
      } catch {feedback.textContent='Image download is unavailable. Take a screenshot of your card and submit that instead.';}
    });
  });
})();

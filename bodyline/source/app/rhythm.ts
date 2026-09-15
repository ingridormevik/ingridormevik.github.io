export const BPM = 128;
export const BEAT = 60 / BPM;
export const END_BEAT = 196;
export const WINDOW = .145;
export type Note = { beat: number; lane: number; judged: boolean };
export type Run = { notes: Note[]; score: number; combo: number; best: number; perfect: number; good: number; miss: number; stray: number };
export function createRun(easy = false): Run {
  const notes: Note[] = [];
  const phrases = [[0,1,2,3,2,1,0,2],[3,2,1,0,1,2,3,1],[0,2,1,3,0,3,1,2],[1,0,3,2,1,3,0,2]];
  for (let bar = 0; bar < 48; bar++) {
    const pattern = phrases[Math.floor(bar / 4) % phrases.length];
    const dense = !easy && bar >= 8 && bar % 8 >= 4;
    const count = dense ? 8 : 4;
    for (let i = 0; i < count; i++) {
      const beat = 4 + bar * 4 + i * (dense ? .5 : 1);
      const lane = pattern[(i + bar % 4) % 8];
      notes.push({ beat, lane, judged: false });
      if (!easy && bar >= 16 && bar % 4 === 3 && i === 0) notes.push({beat, lane: (lane + 2) % 4, judged:false});
    }
  }
  return {notes, score:0, combo:0, best:0, perfect:0, good:0, miss:0, stray:0};
}
export function expire(run: Run, seconds: number) {
  let misses = 0;
  for (const note of run.notes) if (!note.judged && seconds - note.beat * BEAT > WINDOW) {
    note.judged = true; run.miss++; run.combo = 0; misses++;
  }
  return misses;
}
export function strike(run: Run, lane: number, seconds: number) {
  expire(run, seconds);
  const note = run.notes.find(n => !n.judged && n.lane === lane && Math.abs(n.beat * BEAT - seconds) <= WINDOW);
  if (!note) { run.combo = 0; run.stray++; return {grade:'EMPTY' as const, delta:0}; }
  note.judged = true;
  const delta = seconds - note.beat * BEAT;
  const grade = Math.abs(delta) <= .065 ? 'PERFECT' as const : 'GOOD' as const;
  run.combo++; run.best = Math.max(run.best, run.combo); run[grade === 'PERFECT' ? 'perfect' : 'good']++;
  run.score += Math.round((grade === 'PERFECT' ? 100 : 65) * (1 + Math.min(3, Math.floor(run.combo / 16))));
  return {grade, delta};
}
export function accuracy(run: Run) {
  const total = run.perfect + run.good + run.miss + run.stray;
  return total ? Math.round((run.perfect + run.good * .65) / total * 100) : 100;
}

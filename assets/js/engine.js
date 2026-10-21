// 純函式：分支判斷與計分；不依賴瀏覽器介面。
export function choicesFor(mission, next, stage) {
  if (stage === 1) return mission.nodes.filter(n => n.stage === 1);
  return mission.nodes.filter(n => n.stage === stage && n.id.startsWith(next) && n.id.length === next.length + 1);
}
export function gradeFor(mission, score) {
  if (score >= mission.thresholds.S) return 'S';
  if (score >= mission.thresholds.A) return 'A';
  if (score >= mission.thresholds.B) return 'B';
  return 'C';
}
export function specialEnding(missionId, path) {
  const ids = path.map(p => p.id);
  if (missionId === 3 && ids[0] === 'M3-1C') return '《你說可以吃的欸》';
  if (missionId === 1 && ids.includes('M1-1C') && ids.includes('M1-2C3') && ids.includes('M1-3D3')) return '《B車都到了，你還在等》';
  if (missionId === 2 && ids.includes('M2-1C') && (ids.includes('M2-2C2') || ids.includes('M2-2C3'))) return '《你比房卡還好用》';
  if (missionId === 4) {
    if (ids.includes('M4-1C') && ids.includes('M4-2C1') && ids.includes('M4-3H1')) return '《系統當機，但求援功能正常》';
    if (ids.some(id => ['M4-3O3','M4-3R3','M4-3E3','M4-3H2','M4-3F2','M4-3M3'].includes(id))) return '《你是志工，不是保鑣》';
  }
  return null;
}
export function finish(mission, path) {
  const score = path.reduce((sum,n) => sum + n.score, 0);
  const grade = gradeFor(mission,score);
  const hidden = specialEnding(mission.id,path);
  const base = mission.endings[grade]?.[0] || grade;
  const regular = mission.id === 4 ? (path[0]?.id === 'M4-1C' ? base.split('；').at(-1).replace(/^脫窗線/,'') : base.split('；')[0].replace(/^一般線/,'')) : base;
  return {missionId:mission.id,score,grade,regularEnding:regular,hiddenEnding:hidden,path:path.map(n=>({id:n.id,score:n.score,text:n.text})),completedAt:new Date().toISOString()};
}

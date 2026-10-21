const KEY = 'mission-possible-v2';
const blank = () => ({ team: '', results: {}, draft: null, revealed: false });
export function load() { try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY)) } } catch { return blank() } }
export function save(x) { localStorage.setItem(KEY, JSON.stringify(x)) }
export function clear() { localStorage.removeItem(KEY) }
export function exportData(x) {
    console.log(JSON.stringify({ schema: 'mission-possible-v2', team: x.team, results: x.results, exportedAt: new Date().toISOString() }, null, 2));
    var json = JSON.stringify({ schema: 'mission-possible-v2', team: x.team, results: x.results, exportedAt: new Date().toISOString() }, null, 2);
    try {
        navigator.clipboard.writeText(json);
        Swal.fire("已複製 JSON");
        // alert('已複製 JSON');
    } catch (err) {
        console.error('複製失敗：', err);
    }
    //  const blob=new Blob([JSON.stringify({schema:'mission-possible-v2',team:x.team,results:x.results,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
    //  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
    //  a.download=`mission-${(x.team||'team').replace(/[^\w\u4e00-\u9fff-]/g,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

import {CONFIG} from './config.js';
import {finish} from './engine.js';
const $=id=>document.getElementById(id);
let missions=[],idx=0,remaining=600,deadline=null,interval=null;
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
function update(){const t=$('timer');t.textContent=fmt(remaining);t.className='timer'+(remaining===0?' done':remaining<=60?' warning':'')}
function stop(){if(interval)clearInterval(interval);interval=null;deadline=null}
function tick(){if(deadline===null)return;remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));update();if(remaining===0){stop();$('timerStatus').textContent='TIME UP · 停止作答，進入講解';}}
function reset(){stop();remaining=CONFIG.missions[idx].minutes*60;update();$('timerStatus').textContent='等待主持人開始'}
$('hostMission').replaceChildren();CONFIG.missions.forEach((m,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`LEVEL 0${m.id}｜${m.minutes}分鐘`;$('hostMission').append(o)});
$('hostMission').onchange=e=>{idx=Number(e.target.value);reset()};
$('timerStart').onclick=()=>{if(interval||remaining===0)return;deadline=Date.now()+remaining*1000;interval=setInterval(tick,250);$('timerStatus').textContent='MISSION ACTIVE · 作答中'};
$('timerPause').onclick=()=>{if(interval){tick();stop();$('timerStatus').textContent='PAUSED · 講解或臨時中止'}};
$('timerEnd').onclick=()=>{stop();remaining=0;update();$('timerStatus').textContent='MISSION CLOSED · 講解中'};
$('timerReset').onclick=()=>{if(confirm('確定重設本關倒數？'))reset()};reset();
$('codes').replaceChildren();CONFIG.missions.forEach(m=>{const p=document.createElement('p');p.textContent=`LEVEL 0${m.id}｜${m.code}`;$('codes').append(p)});const p=document.createElement('p');p.textContent=`最終揭曉｜${CONFIG.revealCode}`;$('codes').append(p);
const records=new Map();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function initMissions(){missions=await Promise.all([1,2,3,4].map(async n=>(await fetch(`./data/mission${n}.json`)).json()))}
function rank(){return [...records.values()].map(t=>({...t,total:Object.values(t.results).reduce((a,r)=>a+r.score,0)})).sort((a,b)=>b.total-a.total||a.team.localeCompare(b.team,'zh-Hant'))}
function board(){const rows=rank();let last=null,lastRank=0;
 $('board').innerHTML=rows.length?`<div style="overflow-x:auto"><table><thead><tr><th>排名</th><th>組別</th><th>交通</th><th>選手村</th><th>團膳</th><th>文化夜市</th><th>總分</th></tr></thead><tbody>${rows.map((r,i)=>{if(r.total!==last){lastRank=i+1;last=r.total}return `<tr><td>${lastRank}</td><td>${escape(r.team)}</td>${[1,2,3,4].map(n=>`<td>${r.results[n]?.score??'—'}</td>`).join('')}<td><strong>${r.total}/80</strong></td></tr>`}).join('')}</tbody></table></div>`:'尚未匯入有效成績';return rows}
$('files').onchange=async e=>{let ok=0,bad=0;for(const file of e.target.files){try{const x=JSON.parse(await file.text());if(!['mission-possible-v1','mission-possible-v2'].includes(x.schema)||typeof x.team!=='string'||!x.team.trim()||!x.results||typeof x.results!=='object')throw Error('檔案格式錯誤');
 const old=records.get(x.team)||{team:x.team,results:{}};for(const [k,r] of Object.entries(x.results)){if(!['1','2','3','4'].includes(k)||!Array.isArray(r.path))continue;
 const mission=missions[Number(k)-1];let next='',stage=1,path=[];for(const step of r.path){const node=mission.nodes.find(n=>n.id===step.id);if(!node||!choicesForHost(mission,next,stage).some(n=>n.id===node.id))throw Error('分支路徑無效');path.push(node);next=node.next;stage++;
 if(next.startsWith('END'))break}
 if(!(next.startsWith('END')||stage===4))throw Error('任務未完成');const computed=finish(mission,path);if(computed.score!==r.score)throw Error('分數與劇情不符');const prev=old.results[k];if(!prev||String(r.completedAt)<String(prev.completedAt))old.results[k]={...computed,completedAt:r.completedAt||''}}
 records.set(x.team,old);ok++}catch(err){bad++;$('notice').textContent=`${file.name}：${err.message}`}}
 $('notice').textContent=`成功 ${ok} 份，失敗 ${bad} 份；同組同關只保留最早有效紀錄。`;board();e.target.value=''};
function choicesForHost(m,next,stage){return stage===1?m.nodes.filter(n=>n.stage===1):m.nodes.filter(n=>n.stage===stage&&n.id.startsWith(next)&&n.id.length===next.length+1)}
$('clear').onclick=()=>{if(confirm('確定清空目前匯入的成績？')){records.clear();board()}};
$('csv').onclick=()=>{const rows=rank(),cells=[['組別','交通','選手村','團膳','文化夜市','總分'],...rows.map(r=>[r.team,...[1,2,3,4].map(n=>r.results[n]?.score??''),r.total])];const csv='\ufeff'+cells.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mission_possible_final.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
initMissions().then(board).catch(e=>{$('notice').textContent='任務資料載入失敗：'+e.message});

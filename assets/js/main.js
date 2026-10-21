import { CONFIG } from './config.js';
import { choicesFor, finish } from './engine.js';
import { load, save, clear, exportData } from './storage.js';
const $ = id => document.getElementById(id);
let state = load(), missions = [], current = null, chosen = null;
const screens = ['setup', 'lobby', 'unlock', 'game', 'confirm', 'sealed', 'finale'];
const show = id => screens.forEach(x => $(x).classList.toggle('hidden', x !== id));
const duration = id => CONFIG.missions.find(m => m.id === id);
const completed = () => Object.keys(state.results).length;
function persist() { save(state) }
async function init() { missions = await Promise.all([1, 2, 3, 4].map(async n => { const r = await fetch(`./data/mission${n}.json`); if (!r.ok) throw Error(`任務 ${n} 載入失敗`); return r.json() })); if (!state.team) show('setup'); else if (state.draft) resume(); else lobby() }
function lobby() {
    show('lobby'); $('teamName').textContent = state.team; $('missionList').replaceChildren();
    missions.forEach(m => {
        const done = state.results[m.id], isNext = completed() + 1 === m.id, card = document.createElement('article'); card.className = 'mission-card';
        card.style.setProperty('--accent', duration(m.id).color); const h = document.createElement('h3'); h.textContent = `${duration(m.id).icon} LEVEL 0${m.id}｜${m.title.replace(/^MISSION\s*\d+\s*/, '')}`;
        const sub = document.createElement('p'); sub.textContent = `${duration(m.id).minutes} MIN · ${done ? 'RESULT SEALED' : isNext ? 'READY TO UNLOCK' : 'LOCKED'}`;
        const btn = document.createElement('button'); btn.textContent = done ? '已封存 ✓' : isNext ? '輸入通行碼' : '尚未解鎖 🔒'; btn.disabled = !!done || !isNext; btn.onclick = () => unlock(m); card.append(h, sub, btn); $('missionList').append(card)
    });
    $('revealArea').classList.toggle('hidden', completed() !== 4 || state.revealed);
    $('export').disabled = completed() === 0;
    $('finaleButton').classList.toggle('hidden', !state.revealed);
}
function unlock(m) { current = m; show('unlock'); $('unlockTitle').textContent = `LEVEL 0${m.id}｜${m.title.replace(/^MISSION\s*\d+\s*/, '')}`; $('passcode').value = ''; $('unlockError').textContent = '' }
function begin() { state.draft = { missionId: current.id, stage: 1, next: '', path: [] }; persist(); render() }
function resume() { current = missions.find(m => m.id === state.draft.missionId); render() }
function render() {
    const d = state.draft; if (!d) { lobby(); return } show('game'); $('stageLabel').textContent = `LEVEL 0${current.id} / 04 · STAGE 0${d.stage} / 03`;
    $('gameTitle').textContent = current.title.replace(/^MISSION\s*\d+\s*/, ''); $('stageProgress').style.width = `${(d.stage - 1) / 3 * 100}%`;
    const opts = choicesFor(current, d.next, d.stage); if (!opts.length) { $('gameError').textContent = `分支讀取錯誤：${d.next}，請通知主持人`; return }
    $('gameError').textContent = ''; $('story').textContent = opts[0].story === '同上' ? current.nodes.find(n => n.stage === 1).story : opts[0].story;
    $('choices').replaceChildren(); opts.forEach((n, i) => { const b = document.createElement('button'); b.className = 'choice'; b.textContent = `${String.fromCharCode(65 + i)}　${n.text}`; b.onclick = () => confirmChoice(n); $('choices').append(b) });
}
function confirmChoice(n) { chosen = n; show('confirm'); $('confirmText').textContent = n.text }
function commit() {
    if (!chosen || !state.draft) return; const d = state.draft; d.path.push(chosen.id);
    if (chosen.next.startsWith('END') || d.stage === 3) {
        const path = d.path.map(id => current.nodes.find(n => n.id === id)); const result = finish(current, path);
        state.results[current.id] = result; state.draft = null; persist(); $('sealedTitle').textContent = `LEVEL 0${current.id} · MISSION CLEAR`;
        $('sealedHint').textContent = completed() === 4 ? '四關已完成！請等待主持人公布最終揭曉碼。' : '分數與結局已封存。請聆聽講解，等待主持人公布下一關通行碼。'; show('sealed'); return
    }
    d.stage += 1; d.next = chosen.next; persist(); chosen = null; render();
}
$('start').onclick = () => { const t = $('team').value.trim(); if (!t) { alert('請填寫組別代碼'); return } state = { team: t, results: {}, draft: null, revealed: false }; persist(); lobby() };
$('unlockSubmit').onclick = () => { if ($('passcode').value.trim().toUpperCase() !== duration(current.id).code.toUpperCase()) { $('unlockError').textContent = '通行碼不正確，請等待主持人公布。'; return } begin() };
$('passcode').addEventListener('keydown', e => { if (e.key === 'Enter') $('unlockSubmit').click() });
$('confirmYes').onclick = commit; $('confirmNo').onclick = () => { chosen = null; render() };
$('sealedBack').onclick = lobby;
$('export').onclick = () => exportData(state);
$('revealSubmit').onclick = () => { if ($('revealCode').value.trim().toUpperCase() !== CONFIG.revealCode.toUpperCase()) { $('revealError').textContent = '揭曉碼不正確'; return } state.revealed = true; persist(); finale() };
$('finaleButton').onclick = finale;
var rank=[{
    S:["神級調度員","資訊查證、即時通報與現場協調一氣呵成！你讓失聯的B車重新回到賽事節奏。"],
    A:["可靠的接駁夥伴","你掌握了大部分關鍵資訊，並完成必要協調。再提升確認效率，就更接近完美！"],
    B:["還在尋找B車","你努力處理問題，但部分資訊與通報時機仍有改善空間。記得先確認，再行動。"],
    C:["B車去哪裡了？","現場資訊逐漸失控。下次先穩住聯絡管道、確認車輛位置，並及時向主管求援。"]
},{
    S:["門禁守護神","親切接待與安全查證兼顧！你守住選手村的安全，也照顧了訪客的感受。"],
    A:["值得信賴的接待員","你重視身分查證，也能適時尋求支援。只要交接再完整一些，就更穩健了！"],
    B:["熱心但需要確認","你的服務熱忱值得肯定，但門禁規範不能憑直覺判斷。多一道查證，少一分風險。"],
    C:["房卡不是裝飾品","善意不能取代身分查證！遇到無法確認的訪客，應守住門禁並交由授權人員處理。"]
},{
    S:["餐飲危機化解大師","你沒有憑國籍猜測飲食需求，而是主動確認、協調供餐，讓選手獲得妥善照顧。"],
    A:["貼心的餐飲協調員","你理解飲食差異，也願意積極尋找方案。若能更快確認供餐資訊，表現會更完整。"],
    B:["好心也要問清楚","你試著解決問題，但部分替代方案尚未查證。尊重需求的第一步，是先詢問本人。"],
    C:["這道菜真的能吃嗎？","飲食禁忌與過敏風險不能靠猜測。先確認需求、聯絡供餐窗口，再提供可靠資訊。"]
},{S:["危機應變守護者","你知道何時立即求援、如何維護安全，也懂得與夥伴合作。即使一度僵住，仍能完成關鍵任務！"],
    A:["沉著的現場協助者","你掌握了主要應變方向，並願意配合團隊。再加強求援時機與交接，就更周全了。"],
    B:["緊張也能找到方向","突發事故讓人慌張很正常。記得先確保自身安全、啟動119，並請夥伴協助。"],
    C:["先求援，不必逞英雄","志工不需要獨自解決所有危機。保護自己、通報專業人員、確實交接，才是重要的責任。"]}]
function finale() {
    show('finale'); const total = Object.values(state.results).reduce((s, r) => s + r.score, 0); $('totalScore').textContent = `${total} / 80`;
    $('finaleList').replaceChildren(); missions.forEach(m => {
        const r = state.results[m.id], el = document.createElement('article'); el.className = 'result-row';
        const title = document.createElement('h2'); title.textContent = `LEVEL 0${m.id} · ${r.grade}級 · ${r.score}/20`;
        const ending = document.createElement('h3'); 
        const ending2 = document.createElement('p');
        ending.textContent =rank[m.id-1][r.grade][0];
        ending2.textContent =rank[m.id-1][r.grade][1];
        //  r.hiddenEnding || r.regularEnding; 
        el.append(title, ending,ending2); $('finaleList').append(el)
    })
}
$('finaleBack').onclick = lobby;
// $('reset').onclick = () => { if (confirm('確定清除本機全部紀錄？不可復原。')) { clear(); state = load(); show('setup') } };
init().catch(e => { console.error(e); alert(`${e.message}。請透過HTTP網站開啟，勿直接雙擊HTML檔案。`) });

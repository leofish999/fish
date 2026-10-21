// 竹竹只需要修改這個檔案，就能調整每關時間與解鎖碼。
// 注意：純前端通行碼是控場用，不是安全驗證；有心者可檢視原始碼。
export const CONFIG = {
  missions: [
    {id:1, minutes:10, code:'BUS2026', icon:'🚌', color:'#4FE0F2'},
    {id:2, minutes:10, code:'VILLAGE2026', icon:'🏠', color:'#8FE5AE'},
    {id:3, minutes:15, code:'MEAL2026', icon:'🍱', color:'#FFCF68'},
    {id:4, minutes:15, code:'NIGHT2026', icon:'🚨', color:'#FF849F'}
  ],
  // 全部結束才由主持人公布的揭曉碼。
  revealCode:'FINALE2026'
};

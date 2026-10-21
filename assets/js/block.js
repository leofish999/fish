// 1. 初始化時先往 history 堆疊塞入一個當前頁面的狀態
window.history.pushState(null, null, window.location.href);

// 2. 監聽 popstate 事件（當使用者點擊「上一頁」或「下一頁」時觸發）
window.addEventListener('popstate', function (event) {
    // 顯示提示訊息或執行阻擋邏輯
    Swal.fire("請完成作答");
    window.history.pushState(null, null, window.location.href);
    window.history.go(1);

    //   if (!confirmLeave) {
    //     // 若使用者取消離開，再次 pushState 並用 history.go(1) 導回本頁
    //     
    //   } else {
    //     // 若使用者確認離開，可允許返回（或自行處理導向）
    //     window.history.back();
    //   }
});
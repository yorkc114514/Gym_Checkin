(function () { // 續接 事件回呼() 的運算、回呼或參數：(function () {
  const target = new URL('./index.html', window.location.href); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
  const current = new URL(window.location.href); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
  target.search = current.search; // 續接 事件回呼() 的運算、回呼或參數：target.search = current.search;
  target.hash = current.hash; // 續接 事件回呼() 的運算、回呼或參數：target.hash = current.hash;
  window.location.replace(target.toString()); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
})(); // 續接 事件回呼() 的運算、回呼或參數：})();

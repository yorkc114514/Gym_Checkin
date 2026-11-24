import { NAV_ITEMS } from '../../app/navigation.js'; // 從 ../../app/navigation.js 載入相依介面，供共用日期、表單與介面使用
import { profileName, profileAvatar } from '../profile-display.js'; // 從 ../profile-display.js 載入相依介面，供共用日期、表單與介面使用
export function mountShell() {
  const availablePages = new Set(NAV_ITEMS.flatMap(item => item.children || [item]).map(item => item.href.split('?')[0])); // 以組長已開放的選單判斷哪些模組可用
  for (const link of document.querySelectorAll('[data-stage-pending]')) { // 檢查本頁尚未開放的跨模組捷徑
    const target = link.getAttribute('data-stage-pending'); // 保留原本完整連結
    if (availablePages.has(target.replace(/^\.\//, '').split('?')[0])) { // 目標模組已合併才重新開放
      link.setAttribute('href', target); // 恢復可點擊的原始連結
      link.removeAttribute('data-stage-pending'); // 清除暫停標記
      link.removeAttribute('aria-disabled'); // 更新無障礙狀態
      link.removeAttribute('title'); // 移除尚未完成提示
    } // 結束可用模組判斷
  } // 結束本頁捷徑恢復
 // 定義 mountShell()：處理 共用日期、表單與介面 的 mountShell 邏輯
  if (document.getElementById('side-drawer')) return; // 依元素 ID 或 CSS 選擇器取得頁面控制項

  const activePage = document.body.dataset.page || 'home'; // 宣告不可重新指定的 activePage，供mountShell()使用
  const pageTitle = document.body.dataset.title || '首頁'; // 宣告不可重新指定的 pageTitle，供mountShell()使用
  const navigation = NAV_ITEMS.map((item) => { // 宣告不可重新指定的 navigation，供事件回呼()使用
    if (Array.isArray(item.children)) { // 檢查 (Array.isArray(item.children))；成立時才執行此分支
      const groupIsActive = item.children.some((child) => child.key === activePage); // 宣告不可重新指定的 groupIsActive，供事件回呼()使用
      const children = item.children // 宣告不可重新指定的 children，供事件回呼()使用
        .map( // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
          (child) => `
          <li>
            <a href="./${child.href}" data-nav-key="${child.key}"
              ${child.key === activePage ? 'aria-current="page"' : ''}>
              <span class="nav-icon" aria-hidden="true">${child.icon}</span>
              <span>${child.label}</span>
            </a>
          </li>
        `, // 續接 事件回呼() 的運算、回呼或參數：`,
        ) // 結束 事件回呼() 的目前區塊、參數或資料結構
        .join(''); // 呼叫 .join()，處理 共用日期、表單與介面 的 join 邏輯

      return `
          <li class="drawer-nav-group${groupIsActive ? ' active' : ''}">
            <button class="drawer-submenu-toggle" type="button"
              data-submenu-toggle="${item.key}"
              aria-controls="drawer-subnav-${item.key}"
              aria-expanded="${String(groupIsActive)}">
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              <span>${item.label}</span>
              <span class="nav-chevron" aria-hidden="true">›</span>
            </button>
            <ul id="drawer-subnav-${item.key}"
              class="drawer-subnav${groupIsActive ? '' : ' hidden'}">
              ${children}
            </ul>
          </li>
        `; // 續接 事件回呼() 的運算、回呼或參數：`;
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    return `
        <li${item.adminOnly ? ' class="admin-only hidden"' : ''}>
          <a href="./${item.href}" data-nav-key="${item.key}"
            ${item.key === activePage ? 'aria-current="page"' : ''}>
            <span class="nav-icon" aria-hidden="true">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        </li>
      `; // 續接 事件回呼() 的運算、回呼或參數：`;
  }).join(''); // 續接 事件回呼() 的運算、回呼或參數：}).join('');

  document.body.insertAdjacentHTML( // 以 HTML 樣板建立介面結構；插入動態文字時需留意跳脫
    'afterbegin', // 提供 'afterbegin', 文字、路徑或資料欄位值
    `
      <header class="topbar">
        <button id="menu-button" class="menu-button" type="button"
          aria-label="開啟功能選單" aria-controls="side-drawer" aria-expanded="false">☰</button>
        <div class="topbar-title">
          <span class="site-name">運動科學實驗室簽到系統</span>
          <span class="page-context">｜${pageTitle}</span>
        </div>
        <div id="topbar-user" class="topbar-user hidden">
          <img id="topbar-avatar" alt="使用者頭像">
          <span id="topbar-user-name">—</span>
        </div>
      </header>

      <div id="drawer-overlay" class="drawer-overlay" aria-hidden="true"></div>
      <aside id="side-drawer" class="side-drawer" aria-label="功能選單" aria-hidden="true">
        <div class="drawer-header">
          <div class="drawer-brand">
            <strong>功能選單</strong>
            <span>v1.5 現場 QR 簽到認證</span>
          </div>
          <button id="drawer-close-button" class="drawer-close-button"
            type="button" aria-label="關閉功能選單">×</button>
        </div>
        <nav aria-label="主要功能">
          <ul class="drawer-nav">${navigation}</ul>
        </nav>
        <div class="drawer-footer">
          <div class="drawer-legal-links">
            <a href="./privacy.html">隱私權政策</a>
            <a href="./terms.html">服務條款</a>
          </div>
          <button id="drawer-logout-button" class="secondary-button hidden" type="button">
            登出 Google 帳號
          </button>
        </div>
      </aside>

    `, // 續接 mountShell() 的運算、回呼或參數：`,
  ); // 結束 mountShell() 的目前區塊、參數或資料結構

  const menuButton = document.getElementById('menu-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const closeButton = document.getElementById('drawer-close-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const drawer = document.getElementById('side-drawer'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const overlay = document.getElementById('drawer-overlay'); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  function setDrawerOpen(isOpen) { // 定義 setDrawerOpen()：處理 共用日期、表單與介面 的 setDrawerOpen 邏輯
    drawer.classList.toggle('open', isOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    overlay.classList.toggle('open', isOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    document.body.classList.toggle('drawer-open', isOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    drawer.setAttribute('aria-hidden', String(!isOpen)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    overlay.setAttribute('aria-hidden', String(!isOpen)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    menuButton.setAttribute('aria-expanded', String(isOpen)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致

    if (isOpen) closeButton.focus(); // 檢查 (isOpen) closeButton.focus();；成立時才執行此分支
    else menuButton.focus(); // 前一條件未成立時，執行 setDrawerOpen() 的另一分支
  } // 結束 setDrawerOpen() 的目前區塊、參數或資料結構

  menuButton.addEventListener('click', () => setDrawerOpen(true)); // 綁定 click 事件，交由回呼處理使用者操作
  closeButton.addEventListener('click', () => setDrawerOpen(false)); // 綁定 click 事件，交由回呼處理使用者操作
  overlay.addEventListener('click', () => setDrawerOpen(false)); // 綁定 click 事件，交由回呼處理使用者操作
  drawer.addEventListener('click', (event) => { // 綁定 click 事件，交由回呼處理使用者操作
    const submenuToggle = event.target.closest('[data-submenu-toggle]'); // 宣告不可重新指定的 submenuToggle，供事件回呼()使用
    if (submenuToggle) { // 檢查 (submenuToggle)；成立時才執行此分支
      const submenu = document.getElementById( // 依元素 ID 或 CSS 選擇器取得頁面控制項
        `drawer-subnav-${submenuToggle.dataset.submenuToggle}`, // 續接 事件回呼() 的運算、回呼或參數：`drawer-subnav-${submenuToggle.dataset.submenuToggle}`,
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      const shouldOpen = submenu.classList.contains('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      submenu.classList.toggle('hidden', !shouldOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      submenuToggle.setAttribute('aria-expanded', String(shouldOpen)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
      submenuToggle.closest('.drawer-nav-group')?.classList.toggle('expanded', shouldOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (event.target.closest('a')) setDrawerOpen(false); // 檢查 (event.target.closest('a')) setDrawerOpen(false);；成立時才執行此分支
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  document.addEventListener('keydown', (event) => { // 綁定 keydown 事件，交由回呼處理使用者操作
    if (event.key === 'Escape' && drawer.classList.contains('open')) { // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      setDrawerOpen(false); // 呼叫 setDrawerOpen()，處理 共用日期、表單與介面 的 setDrawerOpen 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 mountShell() 的目前區塊、參數或資料結構
export function updateAuthShell(session, profile) { // 定義 updateAuthShell()：處理 共用日期、表單與介面 的 updateAuthShell 邏輯
  const userArea = document.getElementById('topbar-user'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const logoutButton = document.getElementById('drawer-logout-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  if (!userArea || !logoutButton) return; // 檢查 (!userArea || !logoutButton) return;；成立時才執行此分支

  const signedIn = Boolean(session); // 宣告不可重新指定的 signedIn，供updateAuthShell()使用
  const isAdmin = signedIn && profile?.app_role === 'admin' && profile?.status === 'active'; // 宣告不可重新指定的 isAdmin，供updateAuthShell()使用
  userArea.classList.toggle('hidden', !signedIn); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  logoutButton.classList.toggle('hidden', !signedIn); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  document.querySelectorAll('.admin-only').forEach((element) => { // 依元素 ID 或 CSS 選擇器取得頁面控制項
    element.classList.toggle('hidden', !isAdmin); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  if (signedIn) { // 檢查 (signedIn)；成立時才執行此分支
    document.getElementById('topbar-user-name').textContent = profileName(profile, session); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    document.getElementById('topbar-avatar').src = profileAvatar(profile, session); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  } // 結束 updateAuthShell() 的目前區塊、參數或資料結構
} // 結束 updateAuthShell() 的目前區塊、參數或資料結構

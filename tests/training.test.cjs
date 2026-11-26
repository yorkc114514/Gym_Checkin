/* Run against a local static server. Uses a disposable browser profile only. */
const assert = require('node:assert/strict'); // 宣告不可重新指定的 assert，供本機訓練紀錄使用
const { chromium } = require( // 續接 本機訓練紀錄 的運算、回呼或參數：const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES // 續接 本機訓練紀錄 的運算、回呼或參數：process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' // 續接 本機訓練紀錄 的運算、回呼或參數：? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
    : 'playwright', // 續接 本機訓練紀錄 的運算、回呼或參數：: 'playwright',
); // 結束 本機訓練紀錄 的目前區塊、參數或資料結構
const artifacts = // 宣告不可重新指定的 artifacts，供本機訓練紀錄使用
  process.env.TEST_ARTIFACT_DIR || // 續接 本機訓練紀錄 的運算、回呼或參數：process.env.TEST_ARTIFACT_DIR ||
  require('node:fs').mkdtempSync( // 呼叫 require()，處理 本機訓練紀錄 的 require 邏輯
    require('node:path').join(require('node:os').tmpdir(), 'gym-training-test-'), // 呼叫 require()，處理 本機訓練紀錄 的 require 邏輯
  ); // 結束 本機訓練紀錄 的目前區塊、參數或資料結構
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8765'; // 宣告不可重新指定的 base，供本機訓練紀錄使用
(async () => { // 續接 事件回呼() 的運算、回呼或參數：(async () => {
  const browser = await chromium.launch({ // 宣告不可重新指定的 browser，供事件回呼()使用
    headless: true, // 設定 headless 欄位的值或型別
    executablePath: process.env.CHROMIUM_PATH, // 設定 executablePath 欄位的值或型別
    args: ['--no-sandbox'], // 設定 args 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const context = await browser.newContext({ // 宣告不可重新指定的 context，供事件回呼()使用
    viewport: { width: 390, height: 844 }, // 設定 viewport 欄位的值或型別
    isMobile: true, // 設定 isMobile 欄位的值或型別
    deviceScaleFactor: 1, // 設定 deviceScaleFactor 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const page = await context.newPage(); // 宣告不可重新指定的 page，供事件回呼()使用
  const requests = [], // 宣告不可重新指定的 requests，供事件回呼()使用
    errors = []; // 更新 errors，保存本步處理結果
  page.on('request', (r) => requests.push(r.url())); // 呼叫 page.on()，處理 本機訓練紀錄 的 on 邏輯
  page.on('pageerror', (e) => errors.push(e.message)); // 呼叫 page.on()，處理 本機訓練紀錄 的 on 邏輯
  await context.route('**/*', (route) => // 等待非同步操作完成後，才繼續同一流程
    route.request().url().startsWith(base) ? route.continue() : route.abort(), // 呼叫 route.request()，處理 本機訓練紀錄 的 request 邏輯
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  page.on('dialog', (dialog) => dialog.accept()); // 呼叫 page.on()，處理 本機訓練紀錄 的 on 邏輯
  await page.goto(base + '/training.html'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => !document.querySelector('#training-fields').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const today = await page.inputValue('#training-date'); // 宣告不可重新指定的 今天日期，供事件回呼()使用
  await page.fill('#training-exercise', '啞鈴臥推'); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-weight', '17.5'); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-reps', '12'); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-sets', '3'); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-note', '單手重量'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#training-save'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => document.querySelectorAll('.training-record').length === 1); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  assert.match(await page.locator('.training-record').innerText(), /17.5 kg × 12 次 × 3 組/); // 測試斷言：檢查 assert.match(await page.locator('.training-record').innerText(), /17.5 kg × 12 次 × 3 組/); 所要求的行為
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => document.querySelectorAll('.training-record').length === 1); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  await page.fill('#training-exercise', '啞鈴臥推'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#last-training').innerText(), /17.5 kg/); // 測試斷言：檢查 assert.match(await page.locator('#last-training').innerText(), /17.5 kg/); 所要求的行為
  await page.locator('#last-training button').click(); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.inputValue('#training-weight'), '17.5'); // 測試斷言：檢查 assert.equal(await page.inputValue('#training-weight'), '17.5'); 所要求的行為
  await page.locator('.training-record').getByRole('button', { name: '編輯', exact: true }).click(); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-weight', '20'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#training-save'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('.training-record-numbers').textContent.includes('20 kg'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await page.locator('.training-record').count(), 1); // 測試斷言：檢查 assert.equal(await page.locator('.training-record').count(), 1); 所要求的行為
  await page.locator('.training-record').getByRole('button', { name: '再記一次' }).click(); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-sets', '1'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#training-save'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => document.querySelectorAll('.training-record').length === 2); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  await page.fill('#history-exercise', '深蹲'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('.training-record').count(), 0); // 測試斷言：檢查 assert.equal(await page.locator('.training-record').count(), 0); 所要求的行為
  await page.click('#history-all'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('.training-record').count(), 2); // 測試斷言：檢查 assert.equal(await page.locator('.training-record').count(), 2); 所要求的行為
  // Untrusted input must remain text, including imported records.
  const fixture = await page.evaluate(async () => { // 宣告不可重新指定的 fixture，供事件回呼()使用
    const list = await TrainingStore.all(); // 宣告不可重新指定的 list，供事件回呼()使用
    const extra = { // 宣告不可重新指定的 extra，供事件回呼()使用
      ...list[0], // 續接 事件回呼() 的運算、回呼或參數：...list[0],
      id: crypto.randomUUID(), // 設定 id 欄位的值或型別
      exercise: '<img src=x onerror=alert(1)>', // 設定 exercise 欄位的值或型別
      date: '2026-10-01', // 設定 查詢日期 欄位的值或型別
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    await TrainingStore.merge([extra]); // 等待非同步操作完成後，才繼續同一流程
    return { format: 'gym-training-backup', version: 1, records: [...list, extra] }; // 回傳 { format: 'gym-training-backup', version: 1, records: [...list, extra] }，交給 事件回呼() 的呼叫端
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => !document.querySelector('#training-fields').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  await page.click('#history-all'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('.training-record img').count(), 0); // 測試斷言：檢查 assert.equal(await page.locator('.training-record img').count(), 0); 所要求的行為
  assert.equal(await page.locator('.training-record').count(), 3); // 測試斷言：檢查 assert.equal(await page.locator('.training-record').count(), 3); 所要求的行為
  await page.locator('.training-backup summary').click(); // 等待非同步操作完成後，才繼續同一流程
  const downloadEvent = page.waitForEvent('download'); // 宣告不可重新指定的 downloadEvent，供事件回呼()使用
  await page.click('#training-export'); // 等待非同步操作完成後，才繼續同一流程
  const downloaded = await downloadEvent; // 宣告不可重新指定的 downloaded，供事件回呼()使用
  const saved = await downloaded.path(); // 宣告不可重新指定的 saved，供事件回呼()使用
  const exported = JSON.parse(require('node:fs').readFileSync(saved, 'utf8')); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
  assert.equal(exported.records.length, 3); // 測試斷言：檢查 assert.equal(exported.records.length, 3); 所要求的行為
  await page.setInputFiles('#training-import-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'backup.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(fixture)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('新增 0 筆'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await page.locator('.training-record').count(), 3); // 測試斷言：檢查 assert.equal(await page.locator('.training-record').count(), 3); 所要求的行為
  const invalid = structuredClone(fixture); // 宣告不可重新指定的 invalid，供事件回呼()使用
  invalid.records[0].reps = -1; // 續接 事件回呼() 的運算、回呼或參數：invalid.records[0].reps = -1;
  await page.setInputFiles('#training-import-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'bad.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(invalid)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('匯入失敗'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 3); // 測試斷言：檢查 assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 3); 所要求的行為
  // Concurrent edits are rejected, preserving the most recently saved version.
  const conflict = await page.evaluate(async () => { // 宣告不可重新指定的 conflict，供事件回呼()使用
    const old = (await TrainingStore.all())[0], // 宣告不可重新指定的 old，供事件回呼()使用
      newer = { ...old, weight: 25, updatedAt: old.updatedAt + 1 }; // 更新 newer，保存本步處理結果
    await TrainingStore.save(newer, old.updatedAt); // 等待非同步操作完成後，才繼續同一流程
    try { // 開始可捕捉例外的操作範圍
      await TrainingStore.save({ ...old, weight: 30, updatedAt: old.updatedAt + 2 }, old.updatedAt); // 等待非同步操作完成後，才繼續同一流程
      return false; // 回傳 false，交給 事件回呼() 的呼叫端
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      return (await TrainingStore.all()).find((r) => r.id === old.id).weight === 25; // 回傳 (await TrainingStore.all()).find((r) => r.id === old.id).weight === 25，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(conflict, true); // 測試斷言：檢查 assert.equal(conflict, true); 所要求的行為
  // A new browser has no records until the local backup is imported.
  const other = await browser.newContext(); // 宣告不可重新指定的 other，供事件回呼()使用
  const second = await other.newPage(); // 宣告不可重新指定的 second，供事件回呼()使用
  await second.goto(base + '/training.html'); // 等待非同步操作完成後，才繼續同一流程
  await second.waitForFunction(() => !document.querySelector('#training-fields').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  assert.equal(await second.evaluate(async () => (await TrainingStore.all()).length), 0); // 測試斷言：檢查 assert.equal(await second.evaluate(async () => (await TrainingStore.all()).length), 0); 所要求的行為
  second.on('dialog', (d) => d.accept()); // 呼叫 second.on()，處理 本機訓練紀錄 的 on 邏輯
  await second.setInputFiles('#training-import-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'restore.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(exported)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await second.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('新增 3 筆'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await second.locator('.training-record').count(), 3); // 測試斷言：檢查 assert.equal(await second.locator('.training-record').count(), 3); 所要求的行為
  await other.close(); // 等待非同步操作完成後，才繼續同一流程
  // Saving after the page is loaded works with all network access disabled.
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => !document.querySelector('#training-fields').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  await context.setOffline(true); // 等待非同步操作完成後，才繼續同一流程
  await page.fill('#training-exercise', '離線深蹲'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#training-save'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('已存入本機'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 4); // 測試斷言：檢查 assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 4); 所要求的行為
  await context.setOffline(false); // 等待非同步操作完成後，才繼續同一流程
  // No API, CDN, authentication or other network request is made by the training page.
  assert( // 測試斷言：檢查 assert( 所要求的行為
    requests.every((url) => url.startsWith(base + '/') && !/supabase|cdn\./.test(url)), // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    requests.join('\n'), // 呼叫 requests.join()，處理 本機訓練紀錄 的 join 邏輯
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  console.log( // 把偵錯或測試資訊寫到開發者主控台
    'PASS records: create, reload, previous values, edit, repeat, filters, XSS, backup, import, conflict, offline, zero API', // 提供 'PASS records: create, reload, previous values, edit, repeat, filters, XSS, back… 文字、路徑或資料欄位值
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  // Failed writes must not clear the form or claim success.
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    window.originalSave = TrainingStore.save; // 續接 事件回呼() 的運算、回呼或參數：window.originalSave = TrainingStore.save;
    TrainingStore.save = async () => { // 續接 事件回呼() 的運算、回呼或參數：TrainingStore.save = async () => {
      throw new Error('QuotaExceededError'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.fill('#training-exercise', '儲存失敗保留輸入'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#training-save'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('QuotaExceededError'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(await page.inputValue('#training-exercise'), '儲存失敗保留輸入'); // 測試斷言：檢查 assert.equal(await page.inputValue('#training-exercise'), '儲存失敗保留輸入'); 所要求的行為
  assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 4); // 測試斷言：檢查 assert.equal(await page.evaluate(async () => (await TrainingStore.all()).length), 4); 所要求的行為
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    TrainingStore.save = window.originalSave; // 續接 事件回呼() 的運算、回呼或參數：TrainingStore.save = window.originalSave;
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  console.log('PASS failed storage: input retained, no false success, existing records preserved'); // 把偵錯或測試資訊寫到開發者主控台
  // Persistent timer uses a deadline instead of counting callbacks.
  await page.clock.install(); // 等待非同步操作完成後，才繼續同一流程
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => !document.querySelector('#training-fields').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    RestTimer.setDuration(60); // 呼叫 RestTimer.setDuration()，處理 本機訓練紀錄 的 setDuration 邏輯
    RestTimer.start(); // 呼叫 RestTimer.start()，處理 本機訓練紀錄 的 start 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.clock.runFor(10000); // 等待非同步操作完成後，才繼續同一流程
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), '00:50'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), '00:50'); 所要求的行為
  await page.click('#rest-start'); // 等待非同步操作完成後，才繼續同一流程
  const paused = await page.locator('#rest-clock').textContent(); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  await page.clock.runFor(5000); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), paused); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), paused); 所要求的行為
  await page.click('#rest-add'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), '01:05'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), '01:05'); 所要求的行為
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), '01:05'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), '01:05'); 所要求的行為
  await page.click('#rest-start'); // 等待非同步操作完成後，才繼續同一流程
  await page.clock.runFor(66000); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-status').textContent(), '休息結束 ✓'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-status').textContent(), '休息結束 ✓'); 所要求的行為
  await page.click('#rest-reset'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), '01:00'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), '01:00'); 所要求的行為
  await page.click('#rest-add'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#rest-start'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-clock').textContent(), '01:15'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-clock').textContent(), '01:15'); 所要求的行為
  await page.goto(base + '/guide.html'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#rest-mini').innerText(), /休息/); // 測試斷言：檢查 assert.match(await page.locator('#rest-mini').innerText(), /休息/); 所要求的行為
  await page.locator('#rest-mini button').click(); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#rest-mini').innerText(), /已暫停/); // 測試斷言：檢查 assert.match(await page.locator('#rest-mini').innerText(), /已暫停/); 所要求的行為
  await page.goto(base + '/training.html'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#rest-status').textContent(), '已暫停'); // 測試斷言：檢查 assert.equal(await page.locator('#rest-status').textContent(), '已暫停'); 所要求的行為
  await page.evaluate(() => RestTimer.reset()); // 等待非同步操作完成後，才繼續同一流程
  // Screenshots with realistic records, plus narrow-screen overflow check.
  await page.click('#history-today'); // 等待非同步操作完成後，才繼續同一流程
  await page.evaluate(() => window.scrollTo(0, 0)); // 等待非同步操作完成後，才繼續同一流程
  await page.screenshot({ // 等待非同步操作完成後，才繼續同一流程
    path: require('node:path').join(artifacts, 'training-mobile.png'), // 設定 path 欄位的值或型別
    fullPage: true, // 設定 fullPage 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  for (const width of [320, 390, 768, 1280]) { // 依 for (const width of [320, 390, 768, 1280]) 逐項處理或重複等待
    await page.setViewportSize({ width, height: 900 }); // 等待非同步操作完成後，才繼續同一流程
    assert( // 測試斷言：檢查 assert( 所要求的行為
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), // 等待非同步操作完成後，才繼續同一流程
      'horizontal overflow at ' + width, // 提供 'horizontal overflow at ' + width, 文字、路徑或資料欄位值
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.screenshot({ // 等待非同步操作完成後，才繼續同一流程
    path: require('node:path').join(artifacts, 'training-desktop.png'), // 設定 path 欄位的值或型別
    fullPage: true, // 設定 fullPage 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.deepEqual(errors, []); // 測試斷言：檢查 assert.deepEqual(errors, []); 所要求的行為
  console.log( // 把偵錯或測試資訊寫到開發者主控台
    'PASS timer: pause/resume, +15s, reload, expiry, cross-page; layout: 320/390/768/1280; no runtime errors', // 提供 'PASS timer: pause/resume, +15s, reload, expiry, cross-page; layout: 320/390/768… 文字、路徑或資料欄位值
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await browser.close(); // 等待非同步操作完成後，才繼續同一流程
})().catch((error) => { // 續接 事件回呼() 的運算、回呼或參數：})().catch((error) => {
  console.error(error); // 把偵錯或測試資訊寫到開發者主控台
  process.exit(1); // 呼叫 process.exit()，處理 本機訓練紀錄 的 exit 邏輯
}); // 結束 事件回呼() 的目前區塊、參數或資料結構

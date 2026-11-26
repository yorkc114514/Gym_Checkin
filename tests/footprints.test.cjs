const assert = require('node:assert/strict'); // 宣告不可重新指定的 assert，供個人集章與簽退成果卡使用
const { chromium } = require( // 續接 個人集章與簽退成果卡 的運算、回呼或參數：const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES // 續接 個人集章與簽退成果卡 的運算、回呼或參數：process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' // 續接 個人集章與簽退成果卡 的運算、回呼或參數：? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
    : 'playwright', // 續接 個人集章與簽退成果卡 的運算、回呼或參數：: 'playwright',
); // 結束 個人集章與簽退成果卡 的目前區塊、參數或資料結構
const fs = require('node:fs'), // 宣告不可重新指定的 fs，供個人集章與簽退成果卡使用
  path = require('node:path'); // 更新 path，保存本步處理結果
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8765'; // 宣告不可重新指定的 base，供個人集章與簽退成果卡使用
const artifacts = // 宣告不可重新指定的 artifacts，供個人集章與簽退成果卡使用
  process.env.TEST_ARTIFACT_DIR || // 續接 個人集章與簽退成果卡 的運算、回呼或參數：process.env.TEST_ARTIFACT_DIR ||
  fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'gym-footprints-test-')); // 呼叫 fs.mkdtempSync()，處理 個人集章與簽退成果卡 的 mkdtempSync 邏輯
const uid = '11111111-1111-4111-8111-111111111111', // 宣告不可重新指定的 uid，供個人集章與簽退成果卡使用
  other = '22222222-2222-4222-8222-222222222222'; // 更新 other，保存本步處理結果
// Test-only SDK. The production auth/attendance flow is executed against deterministic responses.
const sdk = `(()=>{
  const uid='${uid}', other='${other}';
  const state=()=>JSON.parse(localStorage.getItem('__test_sessions')||'[]');
  const save=s=>localStorage.setItem('__test_sessions',JSON.stringify(s));
  const active=()=>localStorage.getItem('__test_user')||uid;
  const session=()=>active()==='signed-out'?null:{user:{id:active(),email:'test@example.invalid',user_metadata:{full_name:active()===uid?'測試使用者':'另一位使用者'}},access_token:'test-only'};
  const profile=id=>({id,display_name:id===uid?'測試使用者':'另一位使用者',name_confirmed:true,status:'active',app_role:'member'});
  window.__calls=[];window.__authCallbacks=[];
  const client={auth:{
    getSession:async()=>({data:{session:session()},error:null}),
    onAuthStateChange:cb=>{window.__authCallbacks.push(cb);return {data:{subscription:{unsubscribe(){}}}}},
    signOut:async()=>{localStorage.setItem('__test_user','signed-out');window.__authCallbacks.forEach(cb=>cb('SIGNED_OUT',null));return {error:null}},
    signInWithOAuth:async()=>({error:null})
  },from(table){
    window.__calls.push({table});let ids=[];
    const q={select(){return q},eq(_k,id){ids=[id];return q},in(_k,v){ids=v;return q},is(){return q},
      single:async()=>({data:profile(ids[0]),error:null}),
      order:async()=>({data:state().filter(r=>!r.checked_out_at),error:null}),
      then(resolve,reject){return Promise.resolve({data:ids.map(profile),error:null}).then(resolve,reject)}
    };return q;
  },async rpc(name,args){
    window.__calls.push({rpc:name,args});
    if(localStorage.getItem('__test_rpc_error')===name)return {data:null,error:{message:'模擬伺服器拒絕'}};
    const now=localStorage.getItem('__test_now')||'2026-10-05T01:00:00.000Z';
    if(name==='presence_token_status')return {data:{is_valid:true,expires_at:new Date(Date.now()+60000).toISOString()},error:null};
    const s=state();let row=s.find(r=>r.user_id===active()&&!r.checked_out_at);
    if(name==='gym_check_in_with_presence'){
      if(!row){row={id:crypto.randomUUID(),user_id:active(),gym_role:args.requested_role,checked_in_at:now,checked_out_at:null,checked_out_by:null,checkout_method:null};s.push(row);save(s)}
      return {data:row,error:null};
    }
    if(name==='gym_check_out'){
      if(row){row.checked_out_at=now;row.checked_out_by=active();row.checkout_method='self';save(s)}
      else row=s.filter(r=>r.user_id===active()).at(-1);
      return {data:row,error:null};
    }
    return {data:null,error:{message:'unexpected RPC'}};
  }};
  window.supabase={createClient:()=>client};
})();`; // 續接 個人集章與簽退成果卡 的運算、回呼或參數：})();`;
(async () => { // 續接 事件回呼() 的運算、回呼或參數：(async () => {
  const browser = await chromium.launch({ // 宣告不可重新指定的 browser，供事件回呼()使用
    headless: true, // 設定 headless 欄位的值或型別
    executablePath: process.env.CHROMIUM_PATH, // 設定 executablePath 欄位的值或型別
    args: ['--no-sandbox'], // 設定 args 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const context = await browser.newContext({ // 宣告不可重新指定的 context，供事件回呼()使用
    viewport: { width: 390, height: 844 }, // 設定 viewport 欄位的值或型別
    locale: 'zh-TW', // 設定 locale 欄位的值或型別
    timezoneId: 'Asia/Taipei', // 設定 timezoneId 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const page = await context.newPage(), // 宣告不可重新指定的 page，供事件回呼()使用
    errors = [], // 更新 errors，保存本步處理結果
    external = []; // 更新 external，保存本步處理結果
  await context.route('**/*', (route) => { // 等待非同步操作完成後，才繼續同一流程
    const url = route.request().url(); // 宣告不可重新指定的 url，供事件回呼()使用
    if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2')) // 檢查 (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2'))；成立時才執行此分支
      return route.fulfill({ contentType: 'text/javascript', body: sdk }); // 回傳 route.fulfill({ contentType: 'text/javascript', body: sdk })，交給 事件回呼() 的呼叫端
    if (url.startsWith(base + '/')) return route.continue(); // 檢查 (url.startsWith(base + '/')) return route.continue();；成立時才執行此分支
    external.push(url); // 呼叫 external.push()，處理 個人集章與簽退成果卡 的 push 邏輯
    return route.abort(); // 回傳 route.abort()，交給 事件回呼() 的呼叫端
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  page.on('pageerror', (e) => errors.push(e.message)); // 呼叫 page.on()，處理 個人集章與簽退成果卡 的 on 邏輯
  page.on('dialog', (d) => d.accept()); // 呼叫 page.on()，處理 個人集章與簽退成果卡 的 on 邏輯
  const gotoHome = async () => { // 宣告不可重新指定的 gotoHome，供gotoHome()使用
    await page.goto(base + '/index.html?presence_token=abcdefghijklmnop123456'); // 等待非同步操作完成後，才繼續同一流程
    await page.waitForFunction(() => !document.querySelector('#refresh-button').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  }; // 結束 gotoHome() 的目前區塊、參數或資料結構
  const time = async (value) => page.evaluate((v) => localStorage.setItem('__test_now', v), value); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  const all = () => page.evaluate((id) => FootprintsStore.all(id), uid); // 宣告不可重新指定的 all，供事件回呼()使用
  const dismiss = async () => { // 宣告不可重新指定的 dismiss，供dismiss()使用
    await page // 等待非同步操作完成後，才繼續同一流程
      .locator('#stamp-dialog') // 呼叫 .locator()，處理 個人集章與簽退成果卡 的 locator 邏輯
      .getByRole('button', { name: '回到簽到／簽退', exact: true }) // 呼叫 .getByRole()，處理 個人集章與簽退成果卡 的 getByRole 邏輯
      .click(); // 呼叫 .click()，處理 個人集章與簽退成果卡 的 click 邏輯
    await page.waitForFunction(() => !document.querySelector('#refresh-button').disabled); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  }; // 結束 dismiss() 的目前區塊、參數或資料結構
  async function action(kind, value) { // 定義 action()：處理 個人集章與簽退成果卡 的 action 邏輯
    await time(value); // 等待非同步操作完成後，才繼續同一流程
    await page.click(kind === 'in' ? '#check-in-button' : '#check-out-button'); // 等待非同步操作完成後，才繼續同一流程
    await page.waitForSelector('#stamp-dialog .stamp-seal'); // 等待非同步操作完成後，才繼續同一流程
  } // 結束 action() 的目前區塊、參數或資料結構
  await gotoHome(); // 等待非同步操作完成後，才繼續同一流程
  // Server failures cannot stamp.
  await page.evaluate(() => localStorage.setItem('__test_rpc_error', 'gym_check_in_with_presence')); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await page.click('#check-in-button'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('簽到失敗'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal((await all()).length, 0); // 測試斷言：檢查 assert.equal((await all()).length, 0); 所要求的行為
  assert.equal(await page.locator('#stamp-dialog').count(), 0); // 測試斷言：檢查 assert.equal(await page.locator('#stamp-dialog').count(), 0); 所要求的行為
  await page.evaluate(() => localStorage.removeItem('__test_rpc_error')); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await action('in', '2026-10-05T01:00:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog').innerText(), /到訪認證/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog').innerText(), /到訪認證/); 所要求的行為
  assert.equal((await all()).length, 1); // 測試斷言：檢查 assert.equal((await all()).length, 1); 所要求的行為
  await page.locator('.stamp-seal').evaluate((el) => el.getAnimations().forEach((a) => a.finish())); // 等待非同步操作完成後，才繼續同一流程
  await page.screenshot({ path: path.join(artifacts, 'stamp-in-mobile.png') }); // 等待非同步操作完成後，才繼續同一流程
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  // A failed checkout leaves the prior attendance open and creates no outcome.
  await page.evaluate(() => localStorage.setItem('__test_rpc_error', 'gym_check_out')); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await page.click('#check-out-button'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('簽退失敗'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal((await all()).length, 1); // 測試斷言：檢查 assert.equal((await all()).length, 1); 所要求的行為
  await page.evaluate(() => localStorage.removeItem('__test_rpc_error')); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await action('out', '2026-10-05T02:15:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog').innerText(), /1 小時 15 分鐘/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog').innerText(), /1 小時 15 分鐘/); 所要求的行為
  assert.equal((await all()).length, 2); // 測試斷言：檢查 assert.equal((await all()).length, 2); 所要求的行為
  await page.locator('.stamp-seal').evaluate((el) => el.getAnimations().forEach((a) => a.finish())); // 等待非同步操作完成後，才繼續同一流程
  await page.screenshot({ path: path.join(artifacts, 'stamp-out-mobile.png') }); // 等待非同步操作完成後，才繼續同一流程
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  // Same-day additional sessions do not add either stamp or overwrite first checkout content.
  await gotoHome(); // 等待非同步操作完成後，才繼續同一流程
  await action('in', '2026-10-05T05:00:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog h1').innerText(), /今天已蓋過章/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog h1').innerText(), /今天已蓋過章/); 所要求的行為
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  await action('out', '2026-10-05T05:30:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog h1').innerText(), /今天已蓋過章/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog h1').innerText(), /今天已蓋過章/); 所要求的行為
  assert.equal((await all()).length, 2); // 測試斷言：檢查 assert.equal((await all()).length, 2); 所要求的行為
  assert.match(await page.locator('#stamp-dialog').innerText(), /1 小時 15 分鐘/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog').innerText(), /1 小時 15 分鐘/); 所要求的行為
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  // Cross-midnight timestamps follow Taiwan, not UTC or browser clock.
  await gotoHome(); // 等待非同步操作完成後，才繼續同一流程
  await action('in', '2026-10-05T15:55:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal((await all()).length, 2); // 測試斷言：檢查 assert.equal((await all()).length, 2); 所要求的行為
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  await action('out', '2026-10-05T16:05:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  let rows = await all(); // 宣告可更新的 顯示用資料列，供事件回呼()使用
  assert.equal(rows.length, 3); // 測試斷言：檢查 assert.equal(rows.length, 3); 所要求的行為
  assert(rows.some((r) => r.kind === 'out' && r.date === '2026-10-06')); // 測試斷言：檢查 assert(rows.some((r) => r.kind === 'out' && r.date === '2026-10-06')); 所要求的行為
  assert.match(await page.locator('#stamp-dialog').innerText(), /10 分鐘/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog').innerText(), /10 分鐘/); 所要求的行為
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  // Local write failure keeps backend success; retry stores without another RPC.
  await gotoHome(); // 等待非同步操作完成後，才繼續同一流程
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    window.realRecord = FootprintsStore.record; // 續接 事件回呼() 的運算、回呼或參數：window.realRecord = FootprintsStore.record;
    FootprintsStore.record = async () => { // 續接 事件回呼() 的運算、回呼或參數：FootprintsStore.record = async () => {
      throw new Error('測試：手機空間不足'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await time('2026-10-06T01:00:00.000Z'); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#check-in-button'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#stamp-dialog .message.error'); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog h1').innerText(), /簽到已成功/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog h1').innerText(), /簽到已成功/); 所要求的行為
  assert.equal(await page.locator('#stamp-dialog .stamp-seal').count(), 0); // 測試斷言：檢查 assert.equal(await page.locator('#stamp-dialog .stamp-seal').count(), 0); 所要求的行為
  const beforeRPC = await page.evaluate( // 宣告不可重新指定的 beforeRPC，供事件回呼()使用
    () => window.__calls.filter((c) => c.rpc === 'gym_check_in_with_presence').length, // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    FootprintsStore.record = window.realRecord; // 續接 事件回呼() 的運算、回呼或參數：FootprintsStore.record = window.realRecord;
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.getByRole('button', { name: '重試儲存印章' }).click(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#stamp-dialog .stamp-seal'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal((await all()).length, 4); // 測試斷言：檢查 assert.equal((await all()).length, 4); 所要求的行為
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    await page.evaluate( // 等待非同步操作完成後，才繼續同一流程
      () => window.__calls.filter((c) => c.rpc === 'gym_check_in_with_presence').length, // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    ), // 結束 事件回呼() 的目前區塊、參數或資料結構
    beforeRPC, // 續接 事件回呼() 的運算、回呼或參數：beforeRPC,
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await dismiss(); // 等待非同步操作完成後，才繼續同一流程
  // Unique key transaction prevents races across tabs.
  const data = { // 宣告不可重新指定的 查詢或回應資料，供事件回呼()使用
    id: '33333333-3333-4333-8333-333333333333', // 設定 id 欄位的值或型別
    user_id: uid, // 設定 user_id 欄位的值或型別
    checked_in_at: '2026-10-07T01:00:00.000Z', // 設定 checked_in_at 欄位的值或型別
    checked_out_at: null, // 設定 checked_out_at 欄位的值或型別
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  const tab = await context.newPage(); // 宣告不可重新指定的 tab，供事件回呼()使用
  await tab.goto(base + '/training.html'); // 等待非同步操作完成後，才繼續同一流程
  await tab.addScriptTag({ url: base + '/assets/footprints-store.js' }); // 等待非同步操作完成後，才繼續同一流程
  const raced = await Promise.all([ // 同時等待多個互不依賴的非同步操作
    page.evaluate((d) => FootprintsStore.record(d.user_id, 'in', d), data), // 呼叫 page.evaluate()，處理 個人集章與簽退成果卡 的 evaluate 邏輯
    tab.evaluate((d) => FootprintsStore.record(d.user_id, 'in', d), data), // 呼叫 tab.evaluate()，處理 個人集章與簽退成果卡 的 evaluate 邏輯
  ]); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.deepEqual(raced.map((r) => r.duplicate).sort(), [false, true]); // 測試斷言：檢查 assert.deepEqual(raced.map((r) => r.duplicate).sort(), [false, true]); 所要求的行為
  await tab.close(); // 等待非同步操作完成後，才繼續同一流程
  const rejected = await page.evaluate(async (d) => { // 宣告不可重新指定的 rejected，供事件回呼()使用
    let n = 0; // 宣告可更新的 n，供事件回呼()使用
    for (const payload of [ // 依 for (const payload of [ 逐項處理或重複等待
      { ...d, user_id: '${other}' }, // 續接 事件回呼() 的運算、回呼或參數：{ ...d, user_id: '${other}' },
      { // 續接 事件回呼() 的運算、回呼或參數：{
        ...d, // 續接 事件回呼() 的運算、回呼或參數：...d,
        checked_out_at: '2026-10-07T02:00:00Z', // 設定 checked_out_at 欄位的值或型別
        checked_out_by: '${other}', // 設定 checked_out_by 欄位的值或型別
        checkout_method: 'assisted', // 設定 checkout_method 欄位的值或型別
      }, // 結束 事件回呼() 的目前區塊、參數或資料結構
    ]) { // 續接 事件回呼() 的運算、回呼或參數：]) {
      try { // 開始可捕捉例外的操作範圍
        await FootprintsStore.record(d.user_id, 'out', payload); // 等待非同步操作完成後，才繼續同一流程
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        n++; // 續接 事件回呼() 的運算、回呼或參數：n++;
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
    return n; // 回傳 n，交給 事件回呼() 的呼叫端
  }, data); // 續接 事件回呼() 的運算、回呼或參數：}, data);
  assert.equal(rejected, 2); // 測試斷言：檢查 assert.equal(rejected, 2); 所要求的行為
  // Both review tabs share one navigation category, and viewing cannot stamp.
  const count = (await all()).length; // 宣告不可重新指定的 count，供事件回呼()使用
  await page.goto(base + '/footprints.html?view=in&month=2026-10'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#footprints-content:not(.hidden)'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#month-count').innerText(), '3'); // 測試斷言：檢查 assert.equal(await page.locator('#month-count').innerText(), '3'); 所要求的行為
  assert.equal(await page.locator('#drawer-subnav-footprints a').count(), 2); // 測試斷言：檢查 assert.equal(await page.locator('#drawer-subnav-footprints a').count(), 2); 所要求的行為
  assert.deepEqual( // 測試斷言：檢查 assert.deepEqual( 所要求的行為
    await page.evaluate(() => // 等待非同步操作完成後，才繼續同一流程
      window.__calls.filter((c) => c.rpc || c.table === 'attendance_sessions'), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    ), // 結束 事件回呼() 的目前區塊、參數或資料結構
    [], // 續接 事件回呼() 的運算、回呼或參數：[],
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    FootprintsStore.record = () => { // 續接 事件回呼() 的運算、回呼或參數：FootprintsStore.record = () => {
      throw new Error('Review must not write'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.locator('#stamp-calendar button').first().click(); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog h1').innerText(), /這天，我來了/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog h1').innerText(), /這天，我來了/); 所要求的行為
  await page.getByRole('button', { name: '關閉回顧' }).click(); // 等待非同步操作完成後，才繼續同一流程
  assert.equal((await all()).length, count); // 測試斷言：檢查 assert.equal((await all()).length, count); 所要求的行為
  await page.screenshot({ path: path.join(artifacts, 'stampbook-mobile.png'), fullPage: true }); // 等待非同步操作完成後，才繼續同一流程
  await page.click('#tab-out'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#footprints-content:not(.hidden)'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#month-count').innerText(), '2'); // 測試斷言：檢查 assert.equal(await page.locator('#month-count').innerText(), '2'); 所要求的行為
  assert.equal(await page.locator('.checkout-mini-card').count(), 2); // 測試斷言：檢查 assert.equal(await page.locator('.checkout-mini-card').count(), 2); 所要求的行為
  await page.locator('.checkout-mini-card button').first().click(); // 等待非同步操作完成後，才繼續同一流程
  assert.match(await page.locator('#stamp-dialog').innerText(), /本月完成簽退\s*2 天/); // 測試斷言：檢查 assert.match(await page.locator('#stamp-dialog').innerText(), /本月完成簽退\s*2 天/); 所要求的行為
  await page.getByRole('button', { name: '關閉回顧' }).click(); // 等待非同步操作完成後，才繼續同一流程
  assert.equal((await all()).length, count); // 測試斷言：檢查 assert.equal((await all()).length, count); 所要求的行為
  await page.screenshot({ // 等待非同步操作完成後，才繼續同一流程
    path: path.join(artifacts, 'checkout-history-mobile.png'), // 設定 path 欄位的值或型別
    fullPage: true, // 設定 fullPage 欄位的值或型別
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  // Backup deduplication and account separation.
  const backup = await page.evaluate( // 宣告不可重新指定的 backup，供事件回呼()使用
    async (id) => ({ // 續接 事件回呼() 的運算、回呼或參數：async (id) => ({
      format: 'gym-footprints-backup', // 設定 format 欄位的值或型別
      version: 1, // 設定 version 欄位的值或型別
      userId: id, // 設定 userId 欄位的值或型別
      stamps: await FootprintsStore.all(id), // 設定 stamps 欄位的值或型別
    }), // 結束 事件回呼() 的目前區塊、參數或資料結構
    uid, // 續接 事件回呼() 的運算、回呼或參數：uid,
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.locator('.footprints-backup summary').click(); // 等待非同步操作完成後，才繼續同一流程
  const downloadEvent = page.waitForEvent('download'); // 宣告不可重新指定的 downloadEvent，供事件回呼()使用
  await page.click('#footprints-export'); // 等待非同步操作完成後，才繼續同一流程
  const download = await downloadEvent; // 宣告不可重新指定的 download，供事件回呼()使用
  assert.equal(JSON.parse(fs.readFileSync(await download.path(), 'utf8')).stamps.length, count); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
  await page.setInputFiles('#footprints-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'footprints.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(backup)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('已新增 0 個'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const malformed = structuredClone(backup); // 宣告不可重新指定的 malformed，供事件回呼()使用
  malformed.stamps[0].date = '2026-02-31'; // 續接 事件回呼() 的運算、回呼或參數：malformed.stamps[0].date = '2026-02-31';
  await page.setInputFiles('#footprints-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'bad.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(malformed)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('匯入未完成'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal((await all()).length, count); // 測試斷言：檢查 assert.equal((await all()).length, count); 所要求的行為
  await page.evaluate((id) => localStorage.setItem('__test_user', id), other); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await page.reload(); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#footprints-content:not(.hidden)'); // 等待非同步操作完成後，才繼續同一流程
  assert.equal(await page.locator('#total-count').innerText(), '0'); // 測試斷言：檢查 assert.equal(await page.locator('#total-count').innerText(), '0'); 所要求的行為
  assert.equal(await page.locator('.checkout-mini-card').count(), 0); // 測試斷言：檢查 assert.equal(await page.locator('.checkout-mini-card').count(), 0); 所要求的行為
  await page.setInputFiles('#footprints-file', { // 等待非同步操作完成後，才繼續同一流程
    name: 'wrong-account.json', // 設定 name 欄位的值或型別
    mimeType: 'application/json', // 設定 mimeType 欄位的值或型別
    buffer: Buffer.from(JSON.stringify(backup)), // 把資料轉成 JSON 字串以傳送或保存
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForFunction(() => // 等待非同步操作完成後，才繼續同一流程
    document.querySelector('#message').textContent.includes('同一 Google 帳號'), // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    await page.evaluate((id) => FootprintsStore.all(id).then((r) => r.length), other), // 等待非同步操作完成後，才繼續同一流程
    0, // 續接 事件回呼() 的運算、回呼或參數：0,
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  // Auth change hides the old account's personal view.
  await page.evaluate(() => { // 等待非同步操作完成後，才繼續同一流程
    localStorage.setItem('__test_user', 'signed-out'); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
    window.__authCallbacks.forEach((cb) => cb('SIGNED_OUT', null)); // 呼叫 window.__authCallbacks.forEach()，處理 個人集章與簽退成果卡 的 forEach 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.waitForURL('**/index.html'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#signed-out-card:not(.hidden)'); // 等待非同步操作完成後，才繼續同一流程
  await page.evaluate((id) => localStorage.setItem('__test_user', id), uid); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  await page.goto(base + '/footprints.html?view=in&month=2026-10'); // 等待非同步操作完成後，才繼續同一流程
  await page.waitForSelector('#footprints-content:not(.hidden)'); // 等待非同步操作完成後，才繼續同一流程
  for (const width of [320, 390, 768, 1280]) { // 依 for (const width of [320, 390, 768, 1280]) 逐項處理或重複等待
    await page.setViewportSize({ width, height: 900 }); // 等待非同步操作完成後，才繼續同一流程
    assert( // 測試斷言：檢查 assert( 所要求的行為
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), // 等待非同步操作完成後，才繼續同一流程
      'overflow ' + width, // 提供 'overflow ' + width, 文字、路徑或資料欄位值
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
  await page.screenshot({ path: path.join(artifacts, 'stampbook-desktop.png'), fullPage: true }); // 等待非同步操作完成後，才繼續同一流程
  assert.deepEqual(errors, []); // 測試斷言：檢查 assert.deepEqual(errors, []); 所要求的行為
  assert.deepEqual(external, []); // 測試斷言：檢查 assert.deepEqual(external, []); 所要求的行為
  console.log( // 把偵錯或測試資訊寫到開發者主控台
    'PASS: RPC failures do not stamp; check-in/out receipts; daily dedup; preserve first checkout; Taiwan midnight; local failure/retry without new RPC; cross-tab race; reject assisted/mismatched events; review no writes/history queries; shared menu; backup/dedup/invalid input/account isolation/sign-out; mobile layout 320–1280.', // 提供 'PASS: RPC failures do not stamp; check-in/out receipts; daily dedup; preserve f… 文字、路徑或資料欄位值
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await browser.close(); // 等待非同步操作完成後，才繼續同一流程
})().catch((e) => { // 續接 事件回呼() 的運算、回呼或參數：})().catch((e) => {
  console.error(e); // 把偵錯或測試資訊寫到開發者主控台
  process.exit(1); // 呼叫 process.exit()，處理 個人集章與簽退成果卡 的 exit 邏輯
}); // 結束 事件回呼() 的目前區塊、參數或資料結構

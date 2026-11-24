export const FALLBACK_AVATAR = // 宣告不可重新指定的 FALLBACK_AVATAR，供共用日期、表單與介面使用
  'data:image/svg+xml;charset=UTF-8,' + // 提供 'data:image/svg+xml;charset=UTF-8,' + 文字、路徑或資料欄位值
  encodeURIComponent( // 呼叫 encodeURIComponent()，處理 共用日期、表單與介面 的 encodeURIComponent 邏輯
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' + // 提供 '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' + 文字、路徑或資料欄位值
      '<rect width="100%" height="100%" fill="#1f2937"/>' + // 提供 '<rect width="100%" height="100%" fill="#1f2937"/>' + 文字、路徑或資料欄位值
      '<text x="50%" y="56%" text-anchor="middle" fill="#67e8f9" font-size="32">👤</text>' + // 提供 '<text x="50%" y="56%" text-anchor="middle" fill="#67e8f9" font-size="32">👤</te… 文字、路徑或資料欄位值
      '</svg>', // 提供 '</svg>', 文字、路徑或資料欄位值
  ); // 結束 共用日期、表單與介面 的目前區塊、參數或資料結構

export function profileName(profile, session) { // 定義 profileName()：處理 共用日期、表單與介面 的 profileName 邏輯
  const metadata = session?.user?.user_metadata || {}; // 宣告不可重新指定的 metadata，供profileName()使用
  return profile?.display_name || metadata.full_name || metadata.name || '未命名使用者'; // 回傳 profile?.display_name || metadata.full_name || metadata.name || '未命名使用者'，交給 profileName() 的呼叫端
} // 結束 profileName() 的目前區塊、參數或資料結構

export function profileAvatar(profile, session) { // 定義 profileAvatar()：處理 共用日期、表單與介面 的 profileAvatar 邏輯
  const metadata = session?.user?.user_metadata || {}; // 宣告不可重新指定的 metadata，供profileAvatar()使用
  return profile?.avatar_url || metadata.avatar_url || metadata.picture || FALLBACK_AVATAR; // 回傳 profile?.avatar_url || metadata.avatar_url || metadata.picture || FALLBACK_AVATA…，交給 profileAvatar() 的呼叫端
} // 結束 profileAvatar() 的目前區塊、參數或資料結構

export function roleLabel(role) { // 定義 roleLabel()：處理 共用日期、表單與介面 的 roleLabel 邏輯
  return role === 'primary' ? '主要借用者' : '共同使用者'; // 回傳 role === 'primary' ? '主要借用者' : '共同使用者'，交給 roleLabel() 的呼叫端
} // 結束 roleLabel() 的目前區塊、參數或資料結構

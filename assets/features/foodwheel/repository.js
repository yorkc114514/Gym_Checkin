const KEY = 'food_wheel_custom_restaurants'; // 宣告不可重新指定的 KEY，供餐廳分類與美食轉盤使用
export const readCustomItems = () => localStorage.getItem(KEY); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
export const writeCustomItems = (value) => localStorage.setItem(KEY, value); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
export const removeCustomItems = () => localStorage.removeItem(KEY); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置

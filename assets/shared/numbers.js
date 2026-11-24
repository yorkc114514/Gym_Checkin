export const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100; // 宣告不可重新指定的 round，供round()使用

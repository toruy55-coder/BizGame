export const INITIAL_CASH = 50000;
export const GAME_DAYS = 10;

export const PRODUCTS = [
  {
    id: 'coffee',
    name: 'コーヒー',
    costPrice: 30,
    standardPrice: 100,
    baseDemand: 60,
    stockType: 'carryover', // 翌日以降持ち越し可
  },
  {
    id: 'sandwich',
    name: 'サンドイッチ',
    costPrice: 180,
    standardPrice: 320,
    baseDemand: 35,
    stockType: 'daily_discard', // 当日廃棄
  },
  {
    id: 'bakery',
    name: '焼き菓子',
    costPrice: 150,
    standardPrice: 300,
    baseDemand: 25,
    stockType: 'two_day', // 翌日まで持ち越し可、翌々日廃棄
  },
  {
    id: 'strawberry',
    name: 'いちごトッピング',
    costPrice: 30,
    standardPrice: 100,
    baseDemand: 20,
    stockType: 'daily_discard',
    dependsOn: 'bakery', // 焼き菓子販売数が上限
  },
];

// 曜日配列（1日目=月曜）
export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日', '月', '火', '水'];

export const MARKET_INFO = [
  {
    day: 1, weekday: '月',
    event: '通常営業',
    eventKey: 'normal',
    memo: 'まずは標準的な需要が見込まれます。仕入れと価格設定を確認しましょう。',
    costMultiplier: 1.0,      // 仕入単価倍率
    eventCoeff: { default: 1.0 }, // 商品別イベント係数
  },
  {
    day: 2, weekday: '火',
    event: '通常営業',
    eventKey: 'normal',
    memo: '前日の結果を参考に、仕入れと価格を調整しましょう。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.0 },
  },
  {
    day: 3, weekday: '水',
    event: '仕入単価上昇',
    eventKey: 'cost_up',
    memo: '今日は仕入れコストが1.2倍になっています。価格と数量の判断が重要です。',
    costMultiplier: 1.2,
    eventCoeff: { default: 1.0 },
  },
  {
    day: 4, weekday: '木',
    event: '通常営業',
    eventKey: 'normal',
    memo: '学園祭前にSNSを継続するか判断する日です。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.0 },
  },
  {
    day: 5, weekday: '金',
    event: '学園祭準備・競合店出店',
    eventKey: 'rival',
    memo: '学園祭準備で人はいますが、競合店に一部流れています。需要は約70%です。',
    costMultiplier: 1.0,
    eventCoeff: { default: 0.7 },
  },
  {
    day: 6, weekday: '土',
    event: '学園祭1日目',
    eventKey: 'festival1',
    memo: '学園祭1日目！これまでのSNS発信が集客に大きく影響します。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.2 }, // SNS係数で上書きされる
  },
  {
    day: 7, weekday: '日',
    event: '学園祭2日目',
    eventKey: 'festival2',
    memo: '学園祭2日目。前日の評判も影響しています。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.1 },
  },
  {
    day: 8, weekday: '月',
    event: '通常営業・学園祭疲れ',
    eventKey: 'fatigue',
    memo: '翌週月曜日。学園祭疲れで来店が少なめです。需要は約70%です。',
    costMultiplier: 1.0,
    eventCoeff: { default: 0.7 },
  },
  {
    day: 9, weekday: '火',
    event: 'ゼミ発表会',
    eventKey: 'seminar',
    memo: '発表会前後の軽食需要が高まっています。サンドイッチが特に人気です。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.0, sandwich: 1.3 },
  },
  {
    day: 10, weekday: '水',
    event: 'サークルイベント',
    eventKey: 'circle',
    memo: 'サークルイベント参加者の休憩需要があります。コーヒーと焼き菓子が人気です。',
    costMultiplier: 1.0,
    eventCoeff: { default: 1.0, coffee: 1.2, bakery: 1.1, strawberry: 1.1 },
  },
];

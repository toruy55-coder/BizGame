// パスワード "kkd" の SHA-256 ハッシュ（ソースコードに平文を残さないため）
export const TEST_PASSWORD_HASH = '68c07b6bf4f591095ad1c43c065a801822a6c9cdd8e1536413df05c9fc573643';
export const TEST_SHOP_NAME = 'テスト店舗';

// 7日分の仕入れシナリオ（productId + Price で指定）
export const TEST_SCENARIO = [
  // 1日目：月曜・通常営業
  { coffee: 50, sandwich: 30, cookie: 20, coffeePrice: 100, sandwichPrice: 320, cookiePrice: 300, sns: false },
  // 2日目：火曜・通常営業
  { coffee: 55, sandwich: 32, cookie: 18, coffeePrice: 110, sandwichPrice: 330, cookiePrice: 300, sns: true },
  // 3日目：水曜・仕入単価上昇
  { coffee: 45, sandwich: 28, cookie: 15, coffeePrice: 120, sandwichPrice: 360, cookiePrice: 330, sns: false },
  // 4日目：木曜・通常営業
  { coffee: 50, sandwich: 30, cookie: 20, coffeePrice: 110, sandwichPrice: 340, cookiePrice: 310, sns: true },
  // 5日目：金曜・学園祭準備
  { coffee: 60, sandwich: 35, cookie: 25, coffeePrice: 100, sandwichPrice: 320, cookiePrice: 300, sns: true },
  // 6日目：土曜・学園祭1日目
  { coffee: 80, sandwich: 50, cookie: 30, coffeePrice: 100, sandwichPrice: 320, cookiePrice: 300, sns: true },
  // 7日目：日曜・学園祭2日目
  { coffee: 70, sandwich: 45, cookie: 25, coffeePrice: 110, sandwichPrice: 330, cookiePrice: 310, sns: false },
];

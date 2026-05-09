export const INITIAL_CASH = 30000;
export const GAME_DAYS = 5;

export const PRODUCTS = [
  { id: 'coffee',   name: 'コーヒー',     costPrice: 100, standardPrice: 180, baseDemand: 30, carryOver: true  },
  { id: 'sandwich', name: 'サンドイッチ', costPrice: 180, standardPrice: 320, baseDemand: 20, carryOver: false },
  { id: 'sweets',   name: 'スイーツ',     costPrice: 150, standardPrice: 300, baseDemand: 15, carryOver: false },
];

export const MARKET_INFO = [
  { day: 1, weather: '晴れ', event: '通常授業日',         memo: 'まずは標準的な需要が見込まれます',   weatherKey: 'sunny', eventKey: 'normal'   },
  { day: 2, weather: '雨',   event: '通常授業日',         memo: '来店数はやや少なくなりそうです',     weatherKey: 'rain',  eventKey: 'normal'   },
  { day: 3, weather: '晴れ', event: '昼休みにゼミ発表会', memo: 'サンドイッチ需要が高まりそうです', weatherKey: 'sunny', eventKey: 'seminar'  },
  { day: 4, weather: '暑い', event: 'サークルイベント',   memo: 'コーヒー需要が高まりそうです',      weatherKey: 'hot',   eventKey: 'circle'   },
  { day: 5, weather: '晴れ', event: '学園祭準備',         memo: 'スイーツ需要が高まりそうです',      weatherKey: 'sunny', eventKey: 'festival' },
];

import { PRODUCTS, MARKET_INFO } from './gameData.js';

/** 価格係数 */
export function getPriceCoefficient(sellingPrice, standardPrice) {
  const ratio = sellingPrice / standardPrice;
  if (ratio <= 0.80) return 1.40;
  if (ratio <= 0.90) return 1.20;
  if (ratio <= 1.00) return 1.00;
  if (ratio <= 1.10) return 0.85;
  if (ratio <= 1.20) return 0.70;
  return 0.50;
}

/** イベント係数（商品別） */
export function getEventCoefficient(market, productId) {
  const coeff = market.eventCoeff;
  return coeff[productId] !== undefined ? coeff[productId] : coeff.default;
}

/**
 * SNS係数を計算する
 * @param {number} day - 現在の日（1-indexed）
 * @param {boolean} useSns - 今日SNSを投稿するか
 * @param {boolean[]} snsHistory - 過去の投稿履歴（0-indexed, [0]=1日目）
 */
export function getSnsCoefficient(day, useSns, snsHistory) {
  // 1〜5日目: 即時効果なし
  if (day <= 5) return 1.0;

  // 8連続SNS疲れチェック（9日目・10日目）
  const isBurntOut = snsHistory.slice(0, 8).length === 8 && snsHistory.slice(0, 8).every(Boolean);

  if (day === 6) {
    // 1〜5日目のSNS投稿回数で判定
    const count = snsHistory.slice(0, 5).filter(Boolean).length;
    return count >= 4 ? 1.2 : 0.5;
  }

  if (day === 7) {
    return useSns ? 1.1 : 1.0;
  }

  if (day >= 8 && day <= 10) {
    let coeff = useSns ? (1.0 + Math.random() * 0.15) : 1.0;
    if (day === 9 && isBurntOut) coeff *= 0.7;
    if (day === 10 && isBurntOut) coeff *= 0.8;
    return coeff;
  }

  return 1.0;
}

/** ランダム係数 0.85〜1.15 */
export function getRandomCoefficient() {
  return 0.85 + Math.random() * 0.30;
}

/**
 * 1日の営業結果を計算する
 */
export function calcDayResult({ cash, coffeeStock, bakeryCarryoverStock, orders, useSns, snsHistory, day }) {
  const market = MARKET_INFO[day - 1];
  const randomCoeff = getRandomCoefficient();
  const snsCoeff = getSnsCoefficient(day, useSns, snsHistory);

  // SNS疲れかどうか
  const isBurntOut = snsHistory.slice(0, 8).length === 8 && snsHistory.slice(0, 8).every(Boolean);
  const snsBurntOut = (day === 9 || day === 10) && isBurntOut;

  // 焼き菓子の販売可能在庫（持ち越し + 今日の仕入）
  const bakeryOrder = orders.find(o => o.productId === 'bakery') || { quantity: 0, sellingPrice: 300 };
  const bakeryPurchaseQty = Number(bakeryOrder.quantity) || 0;
  const bakeryAvailableStock = bakeryCarryoverStock + bakeryPurchaseQty;

  let bakeryActualSold = 0; // 後でstrawberry計算に使う

  const productResults = PRODUCTS.map((product) => {
    const order = orders.find(o => o.productId === product.id) || { quantity: 0, sellingPrice: product.standardPrice };
    const purchaseQty = Number(order.quantity) || 0;
    const sellingPrice = Number(order.sellingPrice) || product.standardPrice;

    // 実効仕入単価（3日目は1.2倍）
    const actualCostPrice = product.costPrice * market.costMultiplier;

    // 販売可能在庫
    let availableStock;
    if (product.id === 'coffee') {
      availableStock = coffeeStock + purchaseQty;
    } else if (product.id === 'bakery') {
      availableStock = bakeryAvailableStock;
    } else {
      availableStock = purchaseQty; // sandwich, strawberry
    }

    // 係数
    const priceCoeff = getPriceCoefficient(sellingPrice, product.standardPrice);
    const eventCoeff = getEventCoefficient(market, product.id);

    // 需要計算
    let demand = Math.floor(product.baseDemand * priceCoeff * eventCoeff * snsCoeff * randomCoeff);

    // いちごトッピングは焼き菓子販売数を超えない
    let soldQty;
    if (product.id === 'strawberry') {
      soldQty = Math.min(availableStock, demand, bakeryActualSold);
    } else {
      soldQty = Math.min(availableStock, demand);
    }

    if (product.id === 'bakery') {
      bakeryActualSold = soldQty;
    }

    const leftover = availableStock - soldQty;
    const revenue = sellingPrice * soldQty;
    const costTotal = actualCostPrice * purchaseQty;
    const grossProfit = revenue - costTotal;

    // 廃棄数
    let discardQty = 0;
    if (product.id === 'sandwich' || product.id === 'strawberry') {
      discardQty = leftover; // 当日廃棄
    } else if (product.id === 'bakery') {
      discardQty = Math.min(leftover, bakeryCarryoverStock); // 持ち越し分だけ廃棄
    }

    return {
      productId: product.id,
      productName: product.name,
      purchaseQty,
      availableStock,
      sellingPrice,
      actualCostPrice,
      priceCoeff,
      eventCoeff,
      demand,
      soldQty,
      leftover,
      discardQty,
      revenue,
      costTotal,
      grossProfit,
    };
  });

  const totalRevenue = productResults.reduce((s, r) => s + r.revenue, 0);
  const totalCost = productResults.reduce((s, r) => s + r.costTotal, 0);
  const totalProfit = totalRevenue - totalCost;
  const newCash = cash - totalCost + totalRevenue;

  // 翌日持ち越し在庫
  const coffeeResult = productResults.find(r => r.productId === 'coffee');
  const newCoffeeStock = coffeeResult ? coffeeResult.leftover : 0;

  const bakeryResult = productResults.find(r => r.productId === 'bakery');
  // 今日仕入れた分の売れ残りだけ翌日持ち越し
  const bakeryTodaySoldFromNew = Math.max(0, bakeryActualSold - bakeryCarryoverStock);
  const bakeryTodayLeftover = bakeryPurchaseQty - bakeryTodaySoldFromNew;
  const newBakeryCarryoverStock = Math.max(0, bakeryTodayLeftover);

  return {
    day,
    market,
    productResults,
    totalRevenue,
    totalCost,
    totalProfit,
    newCash,
    newCoffeeStock,
    newBakeryCarryoverStock,
    snsUsed: useSns,
    snsCoeff,
    randomCoeff,
    snsBurntOut,
  };
}

/** 経営タイプ判定 */
export function getManagementType(totalProfit, totalDiscard) {
  const highProfit = totalProfit > 20000;
  const highDiscard = totalDiscard > 30;
  if (highProfit && !highDiscard) return 'バランス型の店長';
  if (highProfit && highDiscard) return '攻め型の店長';
  if (!highProfit && !highDiscard) return '慎重型の店長';
  return '売上重視型の店長';
}

/** 最終サマリー計算 */
export function calcFinalSummary(gameState) {
  const { cash, dayResults, coffeeStock } = gameState;

  const totalRevenue = dayResults.reduce((s, d) => s + d.totalRevenue, 0);
  const totalCost = dayResults.reduce((s, d) => s + d.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalDiscard = dayResults.reduce(
    (s, d) => s + d.productResults.reduce((ss, r) => ss + r.discardQty, 0), 0
  );

  const productSummary = ['coffee', 'sandwich', 'bakery', 'strawberry'].map(pid => {
    const totalSold = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === pid);
      return s + (r ? r.soldQty : 0);
    }, 0);
    const totalGross = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === pid);
      return s + (r ? r.grossProfit : 0);
    }, 0);
    const totalDiscardProd = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === pid);
      return s + (r ? r.discardQty : 0);
    }, 0);
    const name = { coffee: 'コーヒー', sandwich: 'サンドイッチ', bakery: '焼き菓子', strawberry: 'いちごトッピング' }[pid];
    return { productId: pid, productName: name, totalSold, totalGross, totalDiscard: totalDiscardProd };
  });

  const bestSold = productSummary.reduce((a, b) => a.totalSold >= b.totalSold ? a : b);
  const bestProfit = productSummary.reduce((a, b) => a.totalGross >= b.totalGross ? a : b);

  const snsCount = (gameState.snsHistory || []).filter(Boolean).length;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalDiscard,
    coffeeStock,
    productSummary,
    bestSold,
    bestProfit,
    snsCount,
    managementType: getManagementType(totalProfit, totalDiscard),
  };
}

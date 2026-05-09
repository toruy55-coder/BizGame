import { PRODUCTS, MARKET_INFO, COST_MULTIPLIER_FROM_DAY } from './gameData.js';

export function getPriceCoefficient(sellingPrice, standardPrice) {
  const ratio = sellingPrice / standardPrice;
  if (ratio <= 0.80) return 1.40;
  if (ratio <= 0.90) return 1.20;
  if (ratio <= 1.00) return 1.00;
  if (ratio <= 1.10) return 0.85;
  if (ratio <= 1.20) return 0.70;
  return 0.50;
}

export function getEventCoefficient(market, productId) {
  const c = market.eventCoeff;
  return c[productId] !== undefined ? c[productId] : c.default;
}

/** SNS係数（6日目以外の通常SNS効果） */
export function getSnsCoefficient(useSns) {
  if (!useSns) return 1.0;
  return 1.0 + Math.random() * 0.10; // 1.00〜1.10
}

/** ランダム係数（刻み幅stepPct、±maxPct%） */
export function getRandomCoefficient(maxPct = 40, stepPct = 5) {
  const stepsEach = Math.round(maxPct / stepPct); // 片側のステップ数
  const totalSteps = stepsEach * 2 + 1;
  const chosen = Math.floor(Math.random() * totalSteps);
  return 1.0 + ((chosen - stepsEach) * stepPct) / 100;
}

/** 仕入単価倍率 */
export function getCostMultiplier(day) {
  return day >= COST_MULTIPLIER_FROM_DAY ? 1.2 : 1.0;
}

/**
 * 1日の営業結果を計算する
 */
export function calcDayResult({ cash, coffeeStock, cookieCarryoverStock, orders, useSns, snsHistory, day, variationMax, variationStep }) {
  const market = MARKET_INFO[day - 1];
  const randomCoeff = getRandomCoefficient(variationMax, variationStep);
  const snsCoeff = getSnsCoefficient(useSns); // 6日目も通常SNS係数を使う（売上補正は別途）
  const costMultiplier = getCostMultiplier(day);

  // クッキーの販売可能在庫
  const cookieOrder = orders.find(o => o.productId === 'cookie') || { quantity: 0, sellingPrice: 300 };
  const cookiePurchaseQty = Number(cookieOrder.quantity) || 0;
  const cookieAvailableStock = cookieCarryoverStock + cookiePurchaseQty;

  const productResults = PRODUCTS.map((product) => {
    const order = orders.find(o => o.productId === product.id) || { quantity: 0, sellingPrice: product.standardPrice };
    const purchaseQty = Number(order.quantity) || 0;
    const sellingPrice = Number(order.sellingPrice) || product.standardPrice;
    const actualCostPrice = product.costPrice * costMultiplier;

    let availableStock;
    if (product.id === 'coffee') {
      availableStock = coffeeStock + purchaseQty;
    } else if (product.id === 'cookie') {
      availableStock = cookieAvailableStock;
    } else {
      availableStock = purchaseQty;
    }

    const priceCoeff = getPriceCoefficient(sellingPrice, product.standardPrice);
    const eventCoeff = getEventCoefficient(market, product.id);
    const demand = Math.floor(product.baseDemand * priceCoeff * eventCoeff * snsCoeff * randomCoeff);
    const soldQty = Math.min(availableStock, demand);
    const leftover = availableStock - soldQty;
    const revenue = sellingPrice * soldQty;
    const costTotal = actualCostPrice * purchaseQty;
    const grossProfit = revenue - costTotal;

    // 廃棄数
    let discardQty = 0;
    if (product.id === 'sandwich') {
      discardQty = leftover;
    } else if (product.id === 'cookie') {
      // 持ち越し分の売れ残り → 廃棄
      discardQty = Math.min(leftover, cookieCarryoverStock);
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

  // 合計計算
  let totalRevenue = productResults.reduce((s, r) => s + r.revenue, 0);
  const totalCost = productResults.reduce((s, r) => s + r.costTotal, 0);

  // 6日目のSNS売上補正（需要ではなく売上に掛ける）
  const snsCountDays1to5 = snsHistory.slice(0, 5).filter(Boolean).length;
  const snsFestivalBonusApplied = day === 6 && snsCountDays1to5 >= 4;
  if (snsFestivalBonusApplied) {
    totalRevenue = Math.round(totalRevenue * 1.2);
  }

  const totalProfit = totalRevenue - totalCost;
  const newCash = cash - totalCost + totalRevenue;

  // 翌日持ち越し在庫
  const coffeeResult = productResults.find(r => r.productId === 'coffee');
  const newCoffeeStock = coffeeResult ? coffeeResult.leftover : 0;

  // クッキーの翌日持ち越し（今日仕入れた分の売れ残りのみ）
  const cookieSoldFromCarryover = Math.min(cookieCarryoverStock, productResults.find(r => r.productId === 'cookie')?.soldQty || 0);
  const cookieSoldFromToday = (productResults.find(r => r.productId === 'cookie')?.soldQty || 0) - cookieSoldFromCarryover;
  const cookieTodayLeftover = Math.max(0, cookiePurchaseQty - Math.max(0, cookieSoldFromToday));
  const newCookieCarryoverStock = cookieTodayLeftover;

  return {
    day,
    market,
    productResults,
    totalRevenue,
    totalCost,
    totalProfit,
    newCash,
    newCoffeeStock,
    newCookieCarryoverStock,
    snsUsed: useSns,
    snsCoeff,
    randomCoeff,
    snsFestivalBonusApplied,
    costMultiplier,
  };
}

export function getManagementType(totalProfit, totalDiscard) {
  const highProfit = totalProfit > 15000;
  const highDiscard = totalDiscard > 20;
  if (highProfit && !highDiscard) return 'バランス型の店長';
  if (highProfit && highDiscard) return '攻め型の店長';
  if (!highProfit && !highDiscard) return '慎重型の店長';
  return '売上重視型の店長';
}

export function calcFinalSummary(gameState) {
  const { cash, dayResults, coffeeStock } = gameState;

  const totalRevenue = dayResults.reduce((s, d) => s + d.totalRevenue, 0);
  const totalCost = dayResults.reduce((s, d) => s + d.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalDiscard = dayResults.reduce(
    (s, d) => s + d.productResults.reduce((ss, r) => ss + r.discardQty, 0), 0
  );

  const productSummary = PRODUCTS.map(product => {
    const totalSold = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === product.id);
      return s + (r ? r.soldQty : 0);
    }, 0);
    const totalGross = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === product.id);
      return s + (r ? r.grossProfit : 0);
    }, 0);
    const totalDiscardProd = dayResults.reduce((s, d) => {
      const r = d.productResults.find(r => r.productId === product.id);
      return s + (r ? r.discardQty : 0);
    }, 0);
    return { productId: product.id, productName: product.name, totalSold, totalGross, totalDiscard: totalDiscardProd };
  });

  const bestSold = productSummary.reduce((a, b) => a.totalSold >= b.totalSold ? a : b);
  const bestProfit = productSummary.reduce((a, b) => a.totalGross >= b.totalGross ? a : b);
  const snsCount = (gameState.snsHistory || []).filter(Boolean).length;

  return {
    totalRevenue, totalCost, totalProfit, totalDiscard,
    coffeeStock, productSummary, bestSold, bestProfit, snsCount,
    managementType: getManagementType(totalProfit, totalDiscard),
  };
}

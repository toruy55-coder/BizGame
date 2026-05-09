import { PRODUCTS } from './gameData.js';

/**
 * 価格係数を返す
 */
export function getPriceCoefficient(sellingPrice, standardPrice) {
  const ratio = sellingPrice / standardPrice;
  if (ratio <= 0.85) return 1.40;
  if (ratio <= 0.95) return 1.20;
  if (ratio <= 1.05) return 1.00;
  if (ratio <= 1.15) return 0.85;
  if (ratio <= 1.25) return 0.70;
  return 0.50;
}

/**
 * 市場係数を返す
 */
export function getMarketCoefficient(weatherKey, eventKey, productId) {
  let coeff = 1.0;
  if (weatherKey === 'rain') coeff *= 0.80;
  if (weatherKey === 'hot'  && productId === 'coffee')   coeff *= 1.20;
  if (eventKey === 'seminar' && productId === 'sandwich') coeff *= 1.30;
  if (eventKey === 'circle'  && productId === 'coffee')  coeff *= 1.20;
  if (eventKey === 'circle'  && productId === 'sweets')  coeff *= 1.10;
  if (eventKey === 'festival'&& productId === 'sweets')  coeff *= 1.40;
  return coeff;
}

/**
 * SNS係数を返す（投稿する場合はランダム）
 */
export function getSnsCoefficient(useSns) {
  if (!useSns) return 1.0;
  const roll = Math.random();
  if (roll < 1 / 3) return 1.0;
  if (roll < 2 / 3) return 1.1;
  return 1.2;
}

/**
 * 1日分の営業結果を計算する
 * @param {Object} params
 * @param {number} params.cash - 営業前の資金
 * @param {number} params.coffeeStock - コーヒー持ち越し在庫
 * @param {Array}  params.orders - [{ productId, quantity, sellingPrice }]
 * @param {boolean} params.useSns - SNS投稿するか
 * @param {Object} params.market - MARKET_INFO の1要素
 * @returns {Object} result
 */
export function calcDayResult({ cash, coffeeStock, orders, useSns, market }) {
  const snsCoeff = getSnsCoefficient(useSns);
  const snsResult = snsCoeff; // 実際の結果値を保存

  const productResults = PRODUCTS.map((product) => {
    const order = orders.find((o) => o.productId === product.id) || { quantity: 0, sellingPrice: product.standardPrice };
    const purchaseQty = Number(order.quantity) || 0;
    const sellingPrice = Number(order.sellingPrice) || product.standardPrice;

    const carryStock = product.carryOver ? coffeeStock : 0;
    const availableStock = carryStock + purchaseQty;

    const priceCoeff  = getPriceCoefficient(sellingPrice, product.standardPrice);
    const marketCoeff = getMarketCoefficient(market.weatherKey, market.eventKey, product.id);
    const demand = Math.floor(product.baseDemand * priceCoeff * marketCoeff * snsCoeff);

    const soldQty    = Math.min(availableStock, demand);
    const leftover   = availableStock - soldQty;
    const revenue    = sellingPrice * soldQty;
    const costTotal  = product.costPrice * purchaseQty;
    const grossProfit = revenue - costTotal;

    return {
      productId: product.id,
      productName: product.name,
      purchaseQty,
      carryStock,
      availableStock,
      sellingPrice,
      demand,
      soldQty,
      leftover,
      revenue,
      costTotal,
      grossProfit,
    };
  });

  const totalRevenue  = productResults.reduce((s, r) => s + r.revenue,    0);
  const totalCost     = productResults.reduce((s, r) => s + r.costTotal,  0);
  const totalProfit   = totalRevenue - totalCost;
  const newCash       = cash - totalCost + totalRevenue;

  // コーヒーの翌日持ち越し在庫
  const coffeeResult  = productResults.find((r) => r.productId === 'coffee');
  const newCoffeeStock = coffeeResult ? coffeeResult.leftover : 0;

  return {
    market,
    productResults,
    totalRevenue,
    totalCost,
    totalProfit,
    newCash,
    newCoffeeStock,
    snsUsed: useSns,
    snsCoeff: snsResult,
  };
}

/**
 * 経営タイプを判定する
 */
export function getManagementType(totalProfit, totalLeftover) {
  const highProfit   = totalProfit   > 10000;
  const highLeftover = totalLeftover > 20;
  if  (highProfit && !highLeftover) return 'バランス型の店長';
  if  (highProfit &&  highLeftover) return '攻め型の店長';
  if (!highProfit && !highLeftover) return '慎重型の店長';
  return '売上重視型の店長';
}

/**
 * 最終サマリーを計算する
 */
export function calcFinalSummary(gameState) {
  const { cash, dayResults } = gameState;

  const totalRevenue  = dayResults.reduce((s, d) => s + d.totalRevenue, 0);
  const totalCost     = dayResults.reduce((s, d) => s + d.totalCost,    0);
  const totalProfit   = totalRevenue - totalCost;
  const totalLeftover = dayResults.reduce(
    (s, d) => s + d.productResults.reduce((ss, r) => ss + r.leftover, 0),
    0
  );

  // 商品別集計
  const productSummary = PRODUCTS.map((product) => {
    const totalSold   = dayResults.reduce((s, d) => {
      const r = d.productResults.find((r) => r.productId === product.id);
      return s + (r ? r.soldQty : 0);
    }, 0);
    const totalGross  = dayResults.reduce((s, d) => {
      const r = d.productResults.find((r) => r.productId === product.id);
      return s + (r ? r.grossProfit : 0);
    }, 0);
    return { productId: product.id, productName: product.name, totalSold, totalGross };
  });

  const bestSold   = productSummary.reduce((a, b) => (a.totalSold  >= b.totalSold  ? a : b));
  const bestProfit = productSummary.reduce((a, b) => (a.totalGross >= b.totalGross ? a : b));

  const managementType = getManagementType(totalProfit, totalLeftover);

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalLeftover,
    coffeeStock: gameState.coffeeStock,
    bestSold,
    bestProfit,
    managementType,
  };
}

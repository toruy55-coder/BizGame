import { useState, useMemo } from 'react';
import { PRODUCTS, MARKET_INFO } from '../gameData.js';
import { getCostMultiplier } from '../gameLogic.js';

export default function PurchaseScreen({ gameState, onSubmit, onShowHistory, autoPlayOrders }) {
  const { currentDay, cash, coffeeStock, cookieCarryoverStock, snsHistory } = gameState;
  const market = MARKET_INFO[currentDay - 1];
  const costMultiplier = getCostMultiplier(currentDay);
  const costUp = costMultiplier > 1;

  const [quantities, setQuantities] = useState(
    Object.fromEntries(PRODUCTS.map(p => [p.id, autoPlayOrders ? String(autoPlayOrders[p.id] ?? 0) : '0']))
  );
  const [prices, setPrices] = useState(
    Object.fromEntries(PRODUCTS.map(p => [p.id, autoPlayOrders ? String(autoPlayOrders[p.id + 'Price'] ?? p.standardPrice) : String(p.standardPrice)]))
  );
  const [useSns, setUseSns] = useState(autoPlayOrders?.sns ?? false);
  const [errors, setErrors] = useState([]);

  function getActualCostPrice(product) {
    return product.costPrice * costMultiplier;
  }

  const totalCost = useMemo(() => {
    return PRODUCTS.reduce((sum, p) => {
      const qty = parseInt(quantities[p.id]) || 0;
      return sum + qty * getActualCostPrice(p);
    }, 0);
  }, [quantities, costMultiplier]);

  const remainingCash = cash - totalCost;

  function validate() {
    const errs = [];
    for (const p of PRODUCTS) {
      const qty = quantities[p.id];
      const price = prices[p.id];
      if (!/^\d+$/.test(qty) || parseInt(qty) < 0) errs.push(`${p.name}の仕入数は0以上の整数で入力してください。`);
      if (!price || parseFloat(price) <= 0) errs.push(`${p.name}の販売価格を入力してください。`);
    }
    if (remainingCash < 0) errs.push('現在資金を超えています。仕入数を見直してください。');
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    const orders = PRODUCTS.map(p => ({
      productId: p.id,
      quantity: parseInt(quantities[p.id]) || 0,
      sellingPrice: parseFloat(prices[p.id]) || p.standardPrice,
    }));
    onSubmit(orders, useSns);
  }

  const snsCountSoFar = (snsHistory || []).filter(Boolean).length;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{currentDay}日目（{market.weekday}曜日）仕入れ・価格設定</h2>
        {(snsHistory || []).length > 0 && (
          <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={onShowHistory}>
            過去の結果を見る
          </button>
        )}
      </div>

      <div style={{ marginBottom: 16, color: '#555' }}>
        現在資金：<strong>¥{cash.toLocaleString()}</strong>
        {costUp && (
          <span style={{ marginLeft: 12, color: '#dc2626', fontWeight: 'bold', fontSize: '0.9rem' }}>
            仕入単価が上昇しています（3日目以降継続中）
          </span>
        )}
      </div>

      {PRODUCTS.map(product => {
        const carryStock = product.id === 'coffee' ? coffeeStock
                         : product.id === 'cookie' ? cookieCarryoverStock : 0;
        const actualCost = getActualCostPrice(product);

        return (
          <div key={product.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{product.name}</strong>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                  {product.id === 'coffee' && '翌日以降も販売可能（賞味期限なし）'}
                  {product.id === 'sandwich' && '当日廃棄'}
                  {product.id === 'cookie' && '翌日まで販売可能（翌々日廃棄）'}
                </div>
              </div>
              {carryStock > 0 && (
                <div style={{ fontSize: '0.85rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                  持ち越し {carryStock} 個
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem', color: '#555', marginBottom: 10 }}>
              <div>仕入単価：<strong>¥{actualCost}{costUp ? ` (通常¥${product.costPrice})` : ''}</strong></div>
              <div>標準販売価格：<strong>¥{product.standardPrice}</strong></div>
              <div>標準需要：<strong>{product.baseDemand}個</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>仕入数（個）</label>
                <input type="number" min="0" value={quantities[product.id]}
                  onChange={e => setQuantities(prev => ({ ...prev, [product.id]: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>販売価格（円）</label>
                <input type="number" min="1" value={prices[product.id]}
                  onChange={e => setPrices(prev => ({ ...prev, [product.id]: e.target.value }))} />
              </div>
            </div>
          </div>
        );
      })}

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="checkbox" id="sns" checked={useSns} onChange={e => setUseSns(e.target.checked)}
            style={{ width: 20, height: 20 }} />
          <label htmlFor="sns" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            今日SNS投稿をする（費用0円）
          </label>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 6 }}>
          {currentDay <= 5
            ? `累計SNS投稿：${snsCountSoFar}日 ／ 学園祭（6日目）の集客に影響します。`
            : currentDay === 6
            ? 'SNS投稿すると、来店客の反応が変わる場合があります。'
            : 'SNS投稿すると、少し来店客が増える場合があります。'}
        </div>
      </div>

      <div className="card" style={{ background: remainingCash < 0 ? '#fef2f2' : '#f9fafb', borderColor: remainingCash < 0 ? '#fca5a5' : '#e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span>仕入合計</span>
          <strong>¥{totalCost.toLocaleString()}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
          <span>仕入後残り資金</span>
          <strong style={{ color: remainingCash < 0 ? '#dc2626' : '#16a34a' }}>
            ¥{remainingCash.toLocaleString()}
          </strong>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
          {errors.map((e, i) => <p key={i} className="error" style={{ margin: '2px 0' }}>{e}</p>)}
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}
        onClick={handleSubmit} disabled={remainingCash < 0}>
        営業開始
      </button>
    </div>
  );
}

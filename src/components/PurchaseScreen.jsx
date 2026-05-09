import { useState, useMemo } from 'react';
import { PRODUCTS, MARKET_INFO } from '../gameData.js';

export default function PurchaseScreen({ gameState, onSubmit }) {
  const { currentDay, cash, coffeeStock, bakeryCarryoverStock } = gameState;
  const market = MARKET_INFO[currentDay - 1];

  const [quantities, setQuantities] = useState(
    Object.fromEntries(PRODUCTS.map(p => [p.id, '0']))
  );
  const [prices, setPrices] = useState(
    Object.fromEntries(PRODUCTS.map(p => [p.id, String(p.standardPrice)]))
  );
  const [useSns, setUseSns] = useState(false);
  const [errors, setErrors] = useState([]);

  // 実効仕入単価（3日目は1.2倍）
  function getActualCostPrice(product) {
    return product.costPrice * market.costMultiplier;
  }

  // 仕入合計
  const totalCost = useMemo(() => {
    return PRODUCTS.reduce((sum, p) => {
      const qty = parseInt(quantities[p.id]) || 0;
      return sum + qty * getActualCostPrice(p);
    }, 0);
  }, [quantities, market]);

  const remainingCash = cash - totalCost;

  function setQty(id, val) { setQuantities(prev => ({ ...prev, [id]: val })); }
  function setPrice(id, val) { setPrices(prev => ({ ...prev, [id]: val })); }

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

  // いちごトッピング警告
  const bakeryQty = parseInt(quantities['bakery']) || 0;
  const strawberryQty = parseInt(quantities['strawberry']) || 0;
  const bakeryTotal = bakeryCarryoverStock + bakeryQty;
  const showStrawberryWarning = strawberryQty > 0 && bakeryTotal === 0;

  return (
    <div className="container">
      <h2 style={{ marginBottom: 4 }}>{currentDay}日目（{market.weekday}曜日）仕入れ・価格設定</h2>
      <div style={{ marginBottom: 16, color: '#555', fontSize: '0.9rem' }}>
        現在資金：<strong>¥{cash.toLocaleString()}</strong>
        {market.costMultiplier > 1 && (
          <span style={{ marginLeft: 12, color: '#dc2626', fontWeight: 'bold' }}>
            ⚠️ 今日は仕入単価 {market.costMultiplier} 倍
          </span>
        )}
      </div>

      {PRODUCTS.map(product => {
        const carryStock = product.id === 'coffee' ? coffeeStock
                         : product.id === 'bakery' ? bakeryCarryoverStock : 0;
        const actualCost = getActualCostPrice(product);

        return (
          <div key={product.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{product.name}</strong>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                  {product.id === 'coffee' && '翌日以降も販売可能（賞味期限なし）'}
                  {product.id === 'sandwich' && '当日廃棄'}
                  {product.id === 'bakery' && '翌日まで販売可能（翌々日廃棄）'}
                  {product.id === 'strawberry' && '当日廃棄 ／ 焼き菓子販売数が上限'}
                </div>
              </div>
              {carryStock > 0 && (
                <div style={{ fontSize: '0.85rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '2px 8px' }}>
                  持ち越し {carryStock} 個
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem', color: '#555', marginBottom: 10 }}>
              <div>仕入単価：<strong>¥{actualCost}{market.costMultiplier > 1 ? ` (通常¥${product.costPrice})` : ''}</strong></div>
              <div>標準販売価格：<strong>¥{product.standardPrice}</strong></div>
              <div>標準需要：<strong>{product.baseDemand}個</strong></div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>仕入数（個）</label>
                <input
                  type="number"
                  min="0"
                  value={quantities[product.id]}
                  onChange={e => setQty(product.id, e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>販売価格（円）</label>
                <input
                  type="number"
                  min="1"
                  value={prices[product.id]}
                  onChange={e => setPrice(product.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {showStrawberryWarning && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', marginBottom: 12 }}>
          <span className="warning">⚠️ いちごトッピングは焼き菓子の販売数を超えて売れません。焼き菓子も仕入れてください。</span>
        </div>
      )}

      {/* SNS */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="checkbox"
            id="sns"
            checked={useSns}
            onChange={e => setUseSns(e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          <label htmlFor="sns" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            今日SNS投稿をする（費用0円）
          </label>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 6 }}>
          {currentDay <= 5
            ? '1〜5日目のSNS投稿回数が学園祭（6日目）の集客に影響します。'
            : currentDay === 6
            ? '今日のSNS投稿は7日目（学園祭2日目）の需要に影響します。'
            : '投稿すると今日の需要がランダムで最大+15%増加します。'}
        </div>
      </div>

      {/* 合計 */}
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

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 8 }}
        onClick={handleSubmit}
        disabled={remainingCash < 0}
      >
        営業開始
      </button>
    </div>
  );
}

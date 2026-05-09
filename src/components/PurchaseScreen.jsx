import { useState, useMemo } from 'react';
import { PRODUCTS } from '../gameData.js';
import { getPriceCoefficient } from '../gameLogic.js';

function PriceHint({ sellingPrice, standardPrice }) {
  if (!sellingPrice || !standardPrice) return null;
  const coeff = getPriceCoefficient(Number(sellingPrice), standardPrice);
  const pct = Math.round((coeff - 1) * 100);
  const color = coeff > 1 ? '#16a34a' : coeff < 1 ? '#dc2626' : '#6b7280';
  const label = coeff > 1 ? `需要 +${pct}%` : coeff < 1 ? `需要 ${pct}%` : '需要 標準';
  return <span style={{ fontSize: '0.8rem', color }}>{label}</span>;
}

export default function PurchaseScreen({ gameState, onSubmit }) {
  const { cash, coffeeStock } = gameState;

  const initOrders = () =>
    PRODUCTS.map((p) => ({
      productId: p.id,
      quantity: 0,
      sellingPrice: p.standardPrice,
    }));

  const [orders, setOrders] = useState(initOrders);
  const [useSns, setUseSns] = useState(false);
  const [errors, setErrors] = useState({});

  function updateOrder(productId, field, value) {
    setOrders((prev) =>
      prev.map((o) => (o.productId === productId ? { ...o, [field]: value } : o))
    );
    setErrors((prev) => ({ ...prev, [productId]: undefined }));
  }

  const totalCost = useMemo(() => {
    return PRODUCTS.reduce((sum, p) => {
      const order = orders.find((o) => o.productId === p.id);
      return sum + p.costPrice * (Number(order?.quantity) || 0);
    }, 0);
  }, [orders]);

  const remainingCash = cash - totalCost;

  function validate() {
    const newErrors = {};
    PRODUCTS.forEach((p) => {
      const order = orders.find((o) => o.productId === p.id);
      const qty = Number(order?.quantity);
      const price = Number(order?.sellingPrice);
      if (qty < 0 || !Number.isInteger(qty)) {
        newErrors[p.id] = '仕入数は0以上の整数を入力してください';
      }
      if (!price || price < 1) {
        newErrors[p.id] = '販売価格は1以上を入力してください';
      }
    });
    return newErrors;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (remainingCash < 0) return;
    onSubmit(orders, useSns);
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h2>{gameState.currentDay}日目 仕入れ・価格設定</h2>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{gameState.currentDay} / 5日目</span>
      </div>

      {PRODUCTS.map((product) => {
        const order = orders.find((o) => o.productId === product.id);
        const isCarry = product.carryOver;
        const carryQty = isCarry ? coffeeStock : 0;
        const purchaseQty = Number(order?.quantity) || 0;
        const available = carryQty + purchaseQty;

        return (
          <div className="card" key={product.id}>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '1.1rem' }}>{product.name}</strong>
              {isCarry && (
                <span style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                  ♻️ 持ち越し可能（在庫: {coffeeStock}個）
                </span>
              )}
            </div>

            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 8, fontSize: '0.85rem', color: '#555' }}>
              <span>仕入単価: <strong>¥{product.costPrice}</strong></span>
              <span>標準価格: <strong>¥{product.standardPrice}</strong></span>
              <span>利用可能在庫: <strong>{available}個</strong></span>
            </div>

            <div className="flex" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem' }}>
                  仕入数（個）
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={order?.quantity ?? 0}
                  onChange={(e) => updateOrder(product.id, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                />
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                  仕入原価: ¥{(product.costPrice * purchaseQty).toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem' }}>
                  販売価格（円）
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={order?.sellingPrice ?? product.standardPrice}
                  onChange={(e) => updateOrder(product.id, 'sellingPrice', e.target.value === '' ? '' : Number(e.target.value))}
                />
                <div style={{ marginTop: 2 }}>
                  <PriceHint sellingPrice={order?.sellingPrice} standardPrice={product.standardPrice} />
                </div>
              </div>
            </div>

            {errors[product.id] && (
              <div className="error" style={{ marginTop: 8 }}>{errors[product.id]}</div>
            )}
          </div>
        );
      })}

      <div className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '1rem' }}>
          <input
            type="checkbox"
            checked={useSns}
            onChange={(e) => setUseSns(e.target.checked)}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
          <span>
            <strong>SNS投稿する</strong>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: 8 }}>
              ランダムで需要が 0〜+20% アップ（効果なしの場合もあり）
            </span>
          </span>
        </label>
      </div>

      <div className="card flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>仕入合計</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{totalCost.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>現在資金</div>
          <div style={{ fontSize: '1.1rem' }}>¥{cash.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>残り資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: remainingCash < 0 ? '#dc2626' : '#16a34a' }}>
            ¥{remainingCash.toLocaleString()}
          </div>
        </div>
      </div>

      {remainingCash < 0 && (
        <div className="error" style={{ marginBottom: 12 }}>
          資金が不足しています。仕入数を減らしてください。
        </div>
      )}

      <div style={{ textAlign: 'right' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={remainingCash < 0}
        >
          営業開始！
        </button>
      </div>
    </div>
  );
}

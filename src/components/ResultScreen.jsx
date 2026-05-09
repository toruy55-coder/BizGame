export default function ResultScreen({ gameState, onNext }) {
  const { currentDay, cash, dayResults } = gameState;
  const result = dayResults[dayResults.length - 1];

  if (!result) return null;

  const { productResults, totalRevenue, totalCost, totalProfit, snsUsed, snsCoeff, market } = result;

  function snsComment() {
    if (!snsUsed) return null;
    if (snsCoeff === 1.0) return 'SNS投稿しましたが、今日は反応がありませんでした。';
    if (snsCoeff === 1.1) return `SNS投稿が効果的でした！需要が 10% アップしました。`;
    if (snsCoeff === 1.2) return `SNS投稿が大バズり！需要が 20% アップしました！`;
    return null;
  }

  const comment = snsComment();

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h2>{currentDay}日目の営業結果</h2>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{currentDay} / 5日目</span>
      </div>

      <div className="card" style={{ marginBottom: 16, fontSize: '0.9rem', color: '#555' }}>
        {market.weather} / {market.event}
      </div>

      {comment && (
        <div className="card" style={{
          background: snsCoeff > 1 ? '#f0fdf4' : '#f9fafb',
          borderColor: snsCoeff > 1 ? '#86efac' : '#e5e7eb',
          marginBottom: 16,
        }}>
          📱 <strong>SNS効果：</strong>{comment}
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>仕入数</th>
              <th>持越</th>
              <th>在庫</th>
              <th>販売価格</th>
              <th>販売数</th>
              <th>売れ残り</th>
              <th>売上</th>
              <th>粗利益</th>
            </tr>
          </thead>
          <tbody>
            {productResults.map((r) => (
              <tr key={r.productId}>
                <td>{r.productName}</td>
                <td>{r.purchaseQty}</td>
                <td>{r.carryStock}</td>
                <td>{r.availableStock}</td>
                <td>¥{r.sellingPrice.toLocaleString()}</td>
                <td>{r.soldQty}</td>
                <td style={{ color: r.leftover > 0 ? '#d97706' : undefined }}>{r.leftover}</td>
                <td>¥{r.revenue.toLocaleString()}</td>
                <td style={{ color: r.grossProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                  ¥{r.grossProfit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>本日の売上合計</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>本日の仕入原価合計</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{totalCost.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>本日の利益</div>
          <div className={totalProfit >= 0 ? 'profit' : 'loss'}>
            ¥{totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>現在の資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={onNext}>
          振り返りへ →
        </button>
      </div>
    </div>
  );
}

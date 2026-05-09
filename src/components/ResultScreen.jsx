import { MARKET_INFO } from '../gameData.js';

const SNS_LABEL = { 1.2: '需要1.2倍（学園祭認知効果）', 0.5: '需要0.5倍（SNS不足）', 1.1: '少し反応あり', 1.0: '反応なし' };

export default function ResultScreen({ gameState, onNext }) {
  const { currentDay, cash, dayResults } = gameState;
  const result = dayResults[dayResults.length - 1];
  const market = result.market;

  const randomPct = Math.round((result.randomCoeff - 1) * 100);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 4 }}>{currentDay}日目（{market.weekday}曜日）営業結果</h2>
      <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: 16 }}>イベント：{market.event}</div>

      {/* 係数サマリ */}
      <div className="card" style={{ background: '#f8fafc', marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>需要に影響した係数</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '0.85rem' }}>
          <span style={{ background: '#e0f2fe', borderRadius: 4, padding: '2px 8px' }}>
            SNS効果：×{result.snsCoeff.toFixed(2)}
          </span>
          <span style={{ background: '#fef9c3', borderRadius: 4, padding: '2px 8px' }}>
            ランダム変動：{randomPct >= 0 ? '+' : ''}{randomPct}%
          </span>
          {result.snsBurntOut && (
            <span style={{ background: '#fee2e2', borderRadius: 4, padding: '2px 8px', color: '#991b1b' }}>
              ⚠️ SNS発信疲れ
            </span>
          )}
        </div>
        {result.snsBurntOut && (
          <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: 6, marginBottom: 0 }}>
            SNSを連日発信しすぎたため、発信疲れによるマイナス反応が出ました。
          </p>
        )}
      </div>

      {/* 商品別テーブル */}
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>仕入数</th>
              <th>在庫</th>
              <th>販売数</th>
              <th>売れ残り</th>
              <th>廃棄</th>
              <th>価格</th>
              <th>売上</th>
              <th>原価</th>
              <th>粗利</th>
            </tr>
          </thead>
          <tbody>
            {result.productResults.map(r => (
              <tr key={r.productId}>
                <td>{r.productName}</td>
                <td>{r.purchaseQty}</td>
                <td>{r.availableStock}</td>
                <td>{r.soldQty}</td>
                <td style={r.leftover > 0 ? { color: '#d97706', fontWeight: 'bold' } : {}}>{r.leftover}</td>
                <td style={r.discardQty > 0 ? { color: '#dc2626', fontWeight: 'bold' } : {}}>{r.discardQty}</td>
                <td>¥{r.sellingPrice.toLocaleString()}</td>
                <td>¥{r.revenue.toLocaleString()}</td>
                <td>¥{r.costTotal.toLocaleString()}</td>
                <td style={{ color: r.grossProfit >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                  ¥{r.grossProfit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f3f4f6', fontWeight: 'bold' }}>
              <td>合計</td>
              <td colSpan={7}></td>
              <td>¥{result.totalRevenue.toLocaleString()}</td>
              <td>¥{result.totalCost.toLocaleString()}</td>
              <td style={{ color: result.totalProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                ¥{result.totalProfit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* サマリ */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>本日の利益</div>
          <div className={result.totalProfit >= 0 ? 'profit' : 'loss'}>
            ¥{result.totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>現在資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNext}>
        振り返りへ
      </button>
    </div>
  );
}

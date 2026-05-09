import { MARKET_INFO } from '../gameData.js';

export default function ResultScreen({ gameState, onNext, onShowHistory }) {
  const { currentDay, cash, dayResults } = gameState;
  const result = dayResults[dayResults.length - 1];
  const market = result.market;
  const isFestival = ['festival_prep', 'festival1', 'festival2'].includes(market.eventKey);

  // ランダム変動の表示（パーセントは表示するが、イベント係数・SNS係数は非表示）
  const randomPct = Math.round((result.randomCoeff - 1) * 100);

  // SNSコメント
  let snsComment = '';
  if (result.snsFestivalBonusApplied) {
    snsComment = 'これまでのSNS発信が集客に良い影響を与えました。';
  } else if (result.snsUsed) {
    const r = result.snsCoeff;
    snsComment = r > 1.05
      ? 'SNS投稿をしました。少し反応があったようです。'
      : 'SNS投稿をしましたが、今日は大きな反応はありませんでした。';
  } else {
    snsComment = '今日はSNS投稿をしませんでした。';
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{currentDay}日目（{market.weekday}曜日）営業結果</h2>
          <div style={{ color: '#555', fontSize: '0.9rem' }}>イベント：{market.event}</div>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={onShowHistory}>
          過去の結果を見る
        </button>
      </div>

      {/* SNSコメント */}
      <div className="card" style={{ background: '#f0fdf4', borderColor: '#86efac', marginBottom: 12 }}>
        <div style={{ fontSize: '0.95rem' }}>{snsComment}</div>
        {isFestival && (
          <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>
            学園祭の影響で、いつもとは違う来店傾向になりました。
          </div>
        )}
        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>
          需要の変動：{randomPct >= 0 ? '+' : ''}{randomPct}%（ランダム変動）
        </div>
      </div>

      {/* 商品別テーブル */}
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>仕入数</th>
              <th>在庫</th>
              <th>需要</th>
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
                <td style={{ color: '#2563eb', fontWeight: 'bold' }}>{r.demand}</td>
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
              <td>合計</td><td colSpan={8}></td>
              <td>¥{result.totalRevenue.toLocaleString()}</td>
              <td>¥{result.totalCost.toLocaleString()}</td>
              <td style={{ color: result.totalProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                ¥{result.totalProfit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>本日の利益</div>
          <div className={result.totalProfit >= 0 ? 'profit' : 'loss'}>¥{result.totalProfit.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>現在資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNext}>振り返りへ</button>
    </div>
  );
}

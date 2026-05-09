import { MARKET_INFO } from '../gameData.js';

const QUESTIONS = [
  '今日、一番うまくいった判断は何ですか？',
  '仕入れすぎや売れ残りはありましたか？',
  '価格設定は適切だったと思いますか？',
  'SNS投稿は今後どうしますか？',
  '明日は何を変えますか？',
];

export default function HistoryScreen({ gameState, onBack }) {
  const { dayResults, reviewMemos } = gameState;

  if (dayResults.length === 0) {
    return (
      <div className="container">
        <h2>過去の営業結果</h2>
        <p style={{ color: '#555' }}>まだ営業結果がありません。</p>
        <button className="btn btn-secondary" onClick={onBack}>戻る</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>過去の営業結果</h2>
        <button className="btn btn-secondary" onClick={onBack}>戻る</button>
      </div>

      {dayResults.map((day, di) => {
        const market = MARKET_INFO[di];
        const memos = reviewMemos[di] || [];
        const hasMemo = memos.some(m => m.trim());
        const totalDiscardDay = day.productResults.reduce((s, r) => s + r.discardQty, 0);

        return (
          <div key={di} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb' }}>
                {di + 1}日目（{market.weekday}曜日）
              </div>
              <div style={{ fontSize: '0.85rem', color: '#555' }}>{market.event}</div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>仕入数</th>
                    <th>価格</th>
                    <th>在庫</th>
                    <th>販売数</th>
                    <th>売れ残り</th>
                    <th>廃棄</th>
                    <th>売上</th>
                    <th>粗利</th>
                  </tr>
                </thead>
                <tbody>
                  {day.productResults.map(r => (
                    <tr key={r.productId}>
                      <td>{r.productName}</td>
                      <td>{r.purchaseQty}</td>
                      <td>¥{r.sellingPrice.toLocaleString()}</td>
                      <td>{r.availableStock}</td>
                      <td>{r.soldQty}</td>
                      <td style={r.leftover > 0 ? { color: '#d97706' } : {}}>{r.leftover}</td>
                      <td style={r.discardQty > 0 ? { color: '#dc2626', fontWeight: 'bold' } : {}}>{r.discardQty}</td>
                      <td>¥{r.revenue.toLocaleString()}</td>
                      <td style={{ color: r.grossProfit >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        ¥{r.grossProfit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex" style={{ flexWrap: 'wrap', gap: 6, fontSize: '0.82rem', marginBottom: hasMemo ? 8 : 0 }}>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                SNS: {day.snsUsed ? '投稿あり' : 'なし'}
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                本日売上: <strong>¥{day.totalRevenue.toLocaleString()}</strong>
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                本日利益:
                <strong style={{ color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626', marginLeft: 4 }}>
                  ¥{day.totalProfit.toLocaleString()}
                </strong>
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                資金: ¥{day.newCash.toLocaleString()}
              </span>
              {totalDiscardDay > 0 && (
                <span style={{ background: '#fef2f2', borderRadius: 4, padding: '2px 8px', color: '#dc2626' }}>
                  廃棄 {totalDiscardDay}個
                </span>
              )}
            </div>

            {hasMemo && (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>振り返りメモ</div>
                {memos.map((m, qi) =>
                  m.trim() ? (
                    <div key={qi} style={{ fontSize: '0.82rem', color: '#444', marginBottom: 2 }}>
                      <strong>Q{qi + 1}. {QUESTIONS[qi]}</strong><br />{m.trim()}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 40 }} onClick={onBack}>戻る</button>
    </div>
  );
}

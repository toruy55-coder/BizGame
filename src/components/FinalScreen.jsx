import { INITIAL_CASH, MARKET_INFO } from '../gameData.js';
import { calcFinalSummary } from '../gameLogic.js';

const QUESTIONS = [
  '今日、一番うまくいった判断は何ですか？',
  '仕入れすぎや売れ残りはありましたか？',
  '価格設定は適切だったと思いますか？',
  'SNS投稿は今後どうしますか？',
  '明日は何を変えますか？',
];

export default function FinalScreen({ gameState, onRestart }) {
  const summary = calcFinalSummary(gameState);
  const { teamName, shopName, dayResults, reviewMemos, snsHistory } = gameState;
  const {
    totalRevenue, totalCost, totalProfit, totalDiscard,
    coffeeStock, productSummary, bestSold, bestProfit, snsCount, managementType,
  } = summary;

  const finalCash = gameState.cash;
  const profitFromInitial = finalCash - INITIAL_CASH;
  const labelStyle = { fontSize: '0.8rem', color: '#6b7280', marginBottom: 2 };

  function buildResultText() {
    const lines = [
      '【学内カフェ店長ゲーム v3 結果】',
      `チーム名: ${teamName}`,
      `店舗名: ${shopName}`,
      '',
      `初期資金: ¥${INITIAL_CASH.toLocaleString()}`,
      `最終資金: ¥${finalCash.toLocaleString()}`,
      `資金増減: ${profitFromInitial >= 0 ? '+' : ''}¥${profitFromInitial.toLocaleString()}`,
      `総売上: ¥${totalRevenue.toLocaleString()}`,
      `総利益: ¥${totalProfit.toLocaleString()}`,
      `総廃棄数: ${totalDiscard}個`,
      `コーヒー最終在庫: ${coffeeStock}個`,
      `SNS投稿日数: ${snsCount}日`,
      `一番売れた商品: ${bestSold.productName}（${bestSold.totalSold}個）`,
      `一番利益が出た商品: ${bestProfit.productName}（¥${bestProfit.totalGross.toLocaleString()}）`,
      `経営タイプ: ${managementType}`,
      '',
      '--- 日別詳細 ---',
    ];

    dayResults.forEach((day, di) => {
      const market = MARKET_INFO[di];
      lines.push('');
      lines.push(`【${di + 1}日目（${market.weekday}曜日）】${market.event}`);
      lines.push(`  SNS: ${day.snsUsed ? '投稿あり' : 'なし'} / ランダム変動: ${Math.round((day.randomCoeff - 1) * 100)}%`);
      day.productResults.forEach(r => {
        lines.push(`  ${r.productName}: 仕入${r.purchaseQty} 販売${r.soldQty} 廃棄${r.discardQty} 売上¥${r.revenue.toLocaleString()} 粗利¥${r.grossProfit.toLocaleString()}`);
      });
      lines.push(`  本日利益: ¥${day.totalProfit.toLocaleString()} / 資金: ¥${day.newCash.toLocaleString()}`);
      const memos = reviewMemos[di];
      if (memos) {
        memos.forEach((m, qi) => { if (m.trim()) lines.push(`  Q${qi + 1}: ${m.trim()}`); });
      }
    });

    return lines.join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildResultText()).then(
      () => alert('クリップボードにコピーしました！'),
      () => alert('コピーに失敗しました。'),
    );
  }

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>最終結果</h2>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: 24 }}>10日間の営業、お疲れさまでした！</p>

      {/* 経営タイプ */}
      <div className="card" style={{ textAlign: 'center', background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ fontSize: '1rem', color: '#555' }}>{teamName} / {shopName}</div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0' }}>経営タイプ</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>{managementType}</div>
      </div>

      {/* 資金 */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>初期資金</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{INITIAL_CASH.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>最終資金</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{finalCash.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>資金増減</div>
          <div className={profitFromInitial >= 0 ? 'profit' : 'loss'}>
            {profitFromInitial >= 0 ? '+' : ''}¥{profitFromInitial.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 売上・利益 */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総売上</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総仕入原価</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¥{totalCost.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総利益</div>
          <div className={totalProfit >= 0 ? 'profit' : 'loss'}>¥{totalProfit.toLocaleString()}</div>
        </div>
      </div>

      {/* 廃棄・SNS */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 130 }}>
          <div style={labelStyle}>総廃棄数</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: totalDiscard > 0 ? '#d97706' : '#222' }}>{totalDiscard} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 130 }}>
          <div style={labelStyle}>コーヒー最終在庫</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{coffeeStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 130 }}>
          <div style={labelStyle}>SNS投稿日数</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{snsCount} 日 / 10日</div>
        </div>
      </div>

      {/* 商品別サマリ */}
      <div className="card" style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>商品別集計</strong>
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>販売数</th>
              <th>廃棄数</th>
              <th>粗利合計</th>
            </tr>
          </thead>
          <tbody>
            {productSummary.map(p => (
              <tr key={p.productId}>
                <td>{p.productName}</td>
                <td>{p.totalSold}</td>
                <td style={p.totalDiscard > 0 ? { color: '#d97706' } : {}}>{p.totalDiscard}</td>
                <td style={{ color: p.totalGross >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                  ¥{p.totalGross.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ベスト */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={labelStyle}>一番売れた商品</div>
          <div style={{ fontWeight: 'bold' }}>{bestSold.productName}</div>
          <div style={{ fontSize: '0.85rem', color: '#555' }}>{bestSold.totalSold} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={labelStyle}>一番利益が出た商品</div>
          <div style={{ fontWeight: 'bold' }}>{bestProfit.productName}</div>
          <div style={{ fontSize: '0.85rem', color: '#555' }}>¥{bestProfit.totalGross.toLocaleString()}</div>
        </div>
      </div>

      {/* 日別詳細 */}
      <h3 style={{ borderBottom: '2px solid #2563eb', paddingBottom: 6, color: '#2563eb' }}>日別 詳細記録</h3>

      {dayResults.map((day, di) => {
        const market = MARKET_INFO[di];
        const memos = reviewMemos[di] || [];
        const hasMemo = memos.some(m => m.trim());
        const totalDiscardDay = day.productResults.reduce((s, r) => s + r.discardQty, 0);
        const randomPct = Math.round((day.randomCoeff - 1) * 100);

        return (
          <div key={di} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb' }}>
                {di + 1}日目（{market.weekday}曜日）
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555' }}>{market.event}</div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>仕入</th>
                    <th>在庫</th>
                    <th>販売</th>
                    <th>廃棄</th>
                    <th>価格</th>
                    <th>売上</th>
                    <th>粗利</th>
                  </tr>
                </thead>
                <tbody>
                  {day.productResults.map(r => (
                    <tr key={r.productId}>
                      <td>{r.productName}</td>
                      <td>{r.purchaseQty}</td>
                      <td>{r.availableStock}</td>
                      <td>{r.soldQty}</td>
                      <td style={r.discardQty > 0 ? { color: '#dc2626', fontWeight: 'bold' } : {}}>{r.discardQty}</td>
                      <td>¥{r.sellingPrice.toLocaleString()}</td>
                      <td>¥{r.revenue.toLocaleString()}</td>
                      <td style={{ color: r.grossProfit >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        ¥{r.grossProfit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f3f4f6', fontWeight: 'bold' }}>
                    <td>合計</td>
                    <td colSpan={5}></td>
                    <td>¥{day.totalRevenue.toLocaleString()}</td>
                    <td style={{ color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                      ¥{day.totalProfit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex" style={{ flexWrap: 'wrap', gap: 6, fontSize: '0.8rem', marginBottom: hasMemo ? 8 : 0 }}>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                SNS: {day.snsUsed ? `投稿あり（×${day.snsCoeff.toFixed(2)}）` : 'なし'}
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                ランダム: {randomPct >= 0 ? '+' : ''}{randomPct}%
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                本日利益:
                <span style={{ fontWeight: 'bold', color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626', marginLeft: 4 }}>
                  ¥{day.totalProfit.toLocaleString()}
                </span>
              </span>
              <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>
                資金: ¥{day.newCash.toLocaleString()}
              </span>
              {totalDiscardDay > 0 && (
                <span style={{ background: '#fef2f2', borderRadius: 4, padding: '2px 8px', color: '#dc2626' }}>
                  廃棄 {totalDiscardDay}個
                </span>
              )}
              {day.snsBurntOut && (
                <span style={{ background: '#fee2e2', borderRadius: 4, padding: '2px 8px', color: '#991b1b' }}>
                  SNS疲れ
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

      <div className="flex" style={{ justifyContent: 'center', gap: 12, marginTop: 24, marginBottom: 40 }}>
        <button className="btn btn-secondary" onClick={handleCopy}>結果をコピー</button>
        <button className="btn btn-danger" onClick={onRestart}>最初からやり直す</button>
      </div>
    </div>
  );
}

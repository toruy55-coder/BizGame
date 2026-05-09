import { INITIAL_CASH, MARKET_INFO } from '../gameData.js';
import { calcFinalSummary } from '../gameLogic.js';

const SNS_LABEL = { 1.0: '反応なし', 1.1: '少し反応あり', 1.2: '反応がよい' };
const QUESTIONS = [
  '一番うまくいった判断は何ですか？',
  '売れ残りや機会損失はありましたか？',
  '翌日（次回）は何を変えますか？',
];

export default function FinalScreen({ gameState, onRestart }) {
  const summary = calcFinalSummary(gameState);
  const { teamName, shopName, dayResults, reviewMemos } = gameState;
  const {
    totalRevenue, totalCost, totalProfit,
    totalLeftover, coffeeStock, bestSold, bestProfit, managementType,
  } = summary;

  const finalCash = gameState.cash;
  const profitFromInitial = finalCash - INITIAL_CASH;

  // ---- コピー用テキスト生成 ----
  function buildResultText() {
    const lines = [
      '【学内カフェ店長ゲーム 結果】',
      `チーム名: ${teamName}`,
      `店舗名: ${shopName}`,
      '',
      `初期資金: ¥${INITIAL_CASH.toLocaleString()}`,
      `最終資金: ¥${finalCash.toLocaleString()}`,
      `資金増減: ${profitFromInitial >= 0 ? '+' : ''}¥${profitFromInitial.toLocaleString()}`,
      `総売上: ¥${totalRevenue.toLocaleString()}`,
      `総利益: ¥${totalProfit.toLocaleString()}`,
      `売れ残り合計: ${totalLeftover}個`,
      `コーヒー最終在庫: ${coffeeStock}個`,
      `一番売れた商品: ${bestSold.productName}（${bestSold.totalSold}個）`,
      `一番利益が出た商品: ${bestProfit.productName}（¥${bestProfit.totalGross.toLocaleString()}）`,
      `経営タイプ: ${managementType}`,
      '',
      '--- 日別詳細 ---',
    ];

    dayResults.forEach((day, di) => {
      const market = MARKET_INFO[di];
      lines.push('');
      lines.push(`【${di + 1}日目】天気:${market.weather} / ${market.event}`);
      day.productResults.forEach((r) => {
        lines.push(
          `  ${r.productName}: 仕入${r.purchaseQty}個 販売${r.soldQty}個 売れ残り${r.leftover}個 売上¥${r.revenue.toLocaleString()} 粗利¥${r.grossProfit.toLocaleString()}`
        );
      });
      lines.push(`  SNS: ${day.snsUsed ? `投稿あり（${SNS_LABEL[day.snsCoeff] ?? ''}）` : 'なし'}`);
      lines.push(`  本日利益: ¥${day.totalProfit.toLocaleString()} / 資金: ¥${day.newCash.toLocaleString()}`);
      const memos = reviewMemos[di];
      if (memos) {
        memos.forEach((m, qi) => {
          if (m.trim()) lines.push(`  Q${qi + 1}: ${m.trim()}`);
        });
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

  // ---- スタイル定数 ----
  const labelStyle = { fontSize: '0.8rem', color: '#6b7280', marginBottom: 2 };
  const valueStyle = { fontSize: '1.2rem', fontWeight: 'bold' };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>最終結果</h2>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: 24 }}>
        5日間の営業、お疲れさまでした！
      </p>

      {/* 経営タイプ */}
      <div className="card" style={{ textAlign: 'center', background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ fontSize: '1rem', color: '#555' }}>{teamName} / {shopName}</div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0' }}>経営タイプ</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>{managementType}</div>
      </div>

      {/* 資金サマリ */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>初期資金</div>
          <div style={valueStyle}>¥{INITIAL_CASH.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>最終資金</div>
          <div style={valueStyle}>¥{finalCash.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>資金増減</div>
          <div className={profitFromInitial >= 0 ? 'profit' : 'loss'}>
            {profitFromInitial >= 0 ? '+' : ''}¥{profitFromInitial.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 売上・利益サマリ */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総売上</div>
          <div style={valueStyle}>¥{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総仕入原価</div>
          <div style={valueStyle}>¥{totalCost.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>総利益</div>
          <div className={totalProfit >= 0 ? 'profit' : 'loss'}>
            ¥{totalProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 在庫・売れ残り */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>売れ残り合計</div>
          <div style={valueStyle}>{totalLeftover} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>コーヒー最終在庫</div>
          <div style={valueStyle}>{coffeeStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>一番売れた商品</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{bestSold.productName}</div>
          <div style={{ fontSize: '0.85rem', color: '#555' }}>{bestSold.totalSold} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={labelStyle}>一番利益が出た商品</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{bestProfit.productName}</div>
          <div style={{ fontSize: '0.85rem', color: '#555' }}>¥{bestProfit.totalGross.toLocaleString()}</div>
        </div>
      </div>

      {/* ===== 日別詳細 ===== */}
      <h3 style={{ marginTop: 32, borderBottom: '2px solid #2563eb', paddingBottom: 6, color: '#2563eb' }}>
        日別 詳細記録
      </h3>

      {dayResults.map((day, di) => {
        const market = MARKET_INFO[di];
        const memos = reviewMemos[di] || [];
        const hasMemo = memos.some((m) => m.trim());

        return (
          <div key={di} className="card" style={{ marginBottom: 20 }}>
            {/* 日付ヘッダ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {di + 1}日目
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {market.weather}　{market.event}
              </div>
            </div>

            {/* 商品別テーブル */}
            <div style={{ overflowX: 'auto', marginBottom: 10 }}>
              <table>
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>仕入数</th>
                    <th>在庫</th>
                    <th>販売数</th>
                    <th>売れ残り</th>
                    <th>販売価格</th>
                    <th>売上</th>
                    <th>仕入原価</th>
                    <th>粗利益</th>
                  </tr>
                </thead>
                <tbody>
                  {day.productResults.map((r) => (
                    <tr key={r.productId}>
                      <td>{r.productName}</td>
                      <td>{r.purchaseQty}</td>
                      <td>{r.availableStock}</td>
                      <td>{r.soldQty}</td>
                      <td style={r.leftover > 0 ? { color: '#d97706', fontWeight: 'bold' } : {}}>
                        {r.leftover}
                      </td>
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
                    <td colSpan={5}></td>
                    <td>¥{day.totalRevenue.toLocaleString()}</td>
                    <td>¥{day.totalCost.toLocaleString()}</td>
                    <td style={{ color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                      ¥{day.totalProfit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SNS・資金情報 */}
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: hasMemo ? 10 : 0 }}>
              <div style={{ fontSize: '0.85rem', background: '#f3f4f6', borderRadius: 6, padding: '4px 10px' }}>
                SNS: {day.snsUsed
                  ? `投稿あり（${SNS_LABEL[day.snsCoeff] ?? ''}）`
                  : 'なし'}
              </div>
              <div style={{ fontSize: '0.85rem', background: '#f3f4f6', borderRadius: 6, padding: '4px 10px' }}>
                本日利益:
                <span style={{ fontWeight: 'bold', color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626', marginLeft: 4 }}>
                  ¥{day.totalProfit.toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', background: '#f3f4f6', borderRadius: 6, padding: '4px 10px' }}>
                営業後資金:
                <span style={{ fontWeight: 'bold', marginLeft: 4 }}>
                  ¥{day.newCash.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 振り返りメモ */}
            {hasMemo && (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#92400e', marginBottom: 6 }}>
                  振り返りメモ
                </div>
                {memos.map((m, qi) =>
                  m.trim() ? (
                    <div key={qi} style={{ fontSize: '0.85rem', color: '#444', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold' }}>Q{qi + 1}. {QUESTIONS[qi]}</span><br />
                      {m.trim()}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ボタン */}
      <div className="flex" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 24, marginBottom: 40 }}>
        <button className="btn btn-secondary" onClick={handleCopy}>
          結果をコピー
        </button>
        <button className="btn btn-danger" onClick={onRestart}>
          最初からやり直す
        </button>
      </div>
    </div>
  );
}

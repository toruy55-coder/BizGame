import { MARKET_INFO, INITIAL_CASH } from '../gameData.js';

const WEATHER_ICON = { '月': '📅', '火': '📅', '水': '📅', '木': '📅', '金': '📅', '土': '🎉', '日': '🎉' };

export default function MarketScreen({ gameState, onNext }) {
  const { currentDay, cash, coffeeStock, bakeryCarryoverStock, snsHistory } = gameState;
  const market = MARKET_INFO[currentDay - 1];
  const snsCount = snsHistory.filter(Boolean).length;

  // 6日目はSNS投稿日数でプレビュー
  let snsNote = '';
  if (currentDay === 6) {
    const count = snsHistory.slice(0, 5).filter(Boolean).length;
    snsNote = count >= 4
      ? `SNS認知が広がり、需要が1.2倍になりそうです！（${count}日投稿済み）`
      : `SNS投稿が少なく、需要が0.5倍になりそうです。（${count}日投稿済み）`;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 4 }}>
          {currentDay}日目（{market.weekday}曜日）/ 10日間
        </h2>
        <div style={{ color: '#555', fontSize: '0.9rem' }}>営業時間：10:00〜17:00</div>
      </div>

      {/* 資金・在庫 */}
      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>現在資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>コーヒー在庫（持ち越し）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{coffeeStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>焼き菓子在庫（持ち越し）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{bakeryCarryoverStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>SNS投稿日数（累計）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{snsCount} 日</div>
        </div>
      </div>

      {/* イベント */}
      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 12 }}>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }}>今日のイベント</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8 }}>{market.event}</div>
        <div style={{ fontSize: '0.95rem', color: '#444' }}>{market.memo}</div>
        {snsNote && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef9c3', borderRadius: 6, fontSize: '0.9rem', color: '#854d0e' }}>
            {snsNote}
          </div>
        )}
        {market.costMultiplier > 1 && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fee2e2', borderRadius: 6, fontSize: '0.9rem', color: '#991b1b' }}>
            ⚠️ 今日は全商品の仕入単価が {market.costMultiplier} 倍になっています
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNext}>
        仕入れ・価格設定へ
      </button>
    </div>
  );
}

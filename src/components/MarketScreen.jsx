import { MARKET_INFO } from '../gameData.js';

export default function MarketScreen({ gameState, onNext, onShowHistory }) {
  const { currentDay, cash, coffeeStock, cookieCarryoverStock, snsHistory } = gameState;
  const market = MARKET_INFO[currentDay - 1];
  const snsCount = snsHistory.filter(Boolean).length;
  const costUp = currentDay >= 3;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{currentDay}日目（{market.weekday}曜日）/ 7日間</h2>
          <div style={{ color: '#555', fontSize: '0.9rem' }}>営業時間：10:00〜17:00</div>
        </div>
        {snsHistory.length > 0 && (
          <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={onShowHistory}>
            過去の結果を見る
          </button>
        )}
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>現在資金</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>コーヒー在庫（持ち越し）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{coffeeStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>クッキー在庫（持ち越し）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{cookieCarryoverStock} 個</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>SNS投稿日数（累計）</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{snsCount} 日</div>
        </div>
      </div>

      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 12 }}>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }}>今日のイベント</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8 }}>{market.event}</div>
        <div style={{ fontSize: '0.95rem', color: '#444' }}>{market.memo}</div>
      </div>

      {costUp && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', marginBottom: 12 }}>
          <span style={{ color: '#991b1b', fontWeight: 'bold' }}>
            仕入単価が上昇しています。仕入れ数量と販売価格に注意してください。
          </span>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNext}>
        仕入れ・価格設定へ
      </button>
    </div>
  );
}

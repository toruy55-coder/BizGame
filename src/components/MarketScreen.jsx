import { MARKET_INFO } from '../gameData.js';

const WEATHER_EMOJI = {
  sunny: '☀️',
  rain: '🌧️',
  hot: '🔥',
};

export default function MarketScreen({ gameState, onNext }) {
  const { currentDay, cash, coffeeStock } = gameState;
  const market = MARKET_INFO[currentDay - 1];

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h2>{currentDay}日目の市場情報</h2>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{currentDay} / 5日目</span>
      </div>

      <div className="flex" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>現在の資金</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>¥{cash.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>コーヒー持ち越し在庫</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{coffeeStock} 個</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 12px' }}>本日の情報</h3>
        <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }}>天気</div>
            <div style={{ fontSize: '1.2rem' }}>
              {WEATHER_EMOJI[market.weatherKey] || '🌤️'} {market.weather}
            </div>
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }}>イベント</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>📅 {market.event}</div>
          </div>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px' }}>
          <span className="warning">💡 市場メモ：</span> {market.memo}
        </div>
      </div>

      <div className="card" style={{ fontSize: '0.9rem', color: '#555' }}>
        <strong>ヒント</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>天気・イベントによって需要が変わります</li>
          <li>価格を下げると売れやすくなりますが利益は減ります</li>
          <li>コーヒーは売れ残っても翌日に持ち越せます</li>
          <li>サンドイッチ・スイーツは当日限りです</li>
        </ul>
      </div>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onNext}>
          仕入れ・価格設定へ →
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MARKET_INFO } from '../gameData.js';

const QUESTIONS = [
  '今日、一番うまくいった判断は何ですか？',
  '仕入れすぎや売れ残りはありましたか？',
  '価格設定は適切だったと思いますか？',
  'SNS投稿は今後どうしますか？',
  '明日は何を変えますか？',
];

export default function ReviewScreen({ gameState, onNext, onShowHistory }) {
  const { currentDay, dayResults } = gameState;
  const [memos, setMemos] = useState(QUESTIONS.map(() => ''));
  const result = dayResults[dayResults.length - 1];
  const market = MARKET_INFO[currentDay - 1];
  const isLastDay = currentDay >= 7;
  const totalDiscard = result.productResults.reduce((s, r) => s + r.discardQty, 0);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{currentDay}日目（{market.weekday}曜日）振り返り</h2>
        <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={onShowHistory}>
          過去の結果を見る
        </button>
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>本日の利益</div>
          <div className={result.totalProfit >= 0 ? 'profit' : 'loss'} style={{ fontSize: '1.2rem' }}>
            ¥{result.totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>本日の廃棄数</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: totalDiscard > 0 ? '#d97706' : '#222' }}>
            {totalDiscard} 個
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>SNS投稿</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{result.snsUsed ? '投稿した' : 'しなかった'}</div>
        </div>
      </div>

      {QUESTIONS.map((q, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Q{i + 1}. {q}</label>
          <textarea
            value={memos[i]}
            onChange={e => { const n = [...memos]; n[i] = e.target.value; setMemos(n); }}
            rows={2}
            style={{ width: '100%', padding: 8, fontSize: '0.95rem', border: '1px solid #d1d5db', borderRadius: 6, resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
            placeholder="（入力任意）"
          />
        </div>
      ))}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNext(memos)}>
        {isLastDay ? '最終結果を見る' : `${currentDay + 1}日目へ進む`}
      </button>
    </div>
  );
}

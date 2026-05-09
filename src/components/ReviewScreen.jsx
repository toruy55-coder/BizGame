import { useState } from 'react';

const QUESTIONS = [
  '今日の仕入れ・価格設定で良かった点は何ですか？',
  '今日の営業で改善できる点・反省点はありますか？',
  '明日（次の営業日）に向けてどんな工夫をしますか？',
];

export default function ReviewScreen({ gameState, onNext }) {
  const { currentDay } = gameState;
  const isLastDay = currentDay === 5;

  const [memos, setMemos] = useState(['', '', '']);

  function updateMemo(index, value) {
    setMemos((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleNext() {
    onNext(memos);
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h2>{currentDay}日目の振り返り</h2>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{currentDay} / 5日目</span>
      </div>

      <p style={{ color: '#555', marginBottom: 16 }}>
        今日の営業を振り返って、以下の質問に答えてください。（入力は任意です）
      </p>

      {QUESTIONS.map((q, i) => (
        <div className="card" key={i}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>
            Q{i + 1}. {q}
          </label>
          <textarea
            value={memos[i]}
            onChange={(e) => updateMemo(i, e.target.value)}
            rows={3}
            placeholder="自由に記入してください…"
            style={{
              width: '100%',
              padding: 8,
              fontSize: '0.95rem',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              resize: 'vertical',
              fontFamily: 'sans-serif',
            }}
          />
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleNext}>
          {isLastDay ? '最終結果を見る →' : `${currentDay + 1}日目へ →`}
        </button>
      </div>
    </div>
  );
}

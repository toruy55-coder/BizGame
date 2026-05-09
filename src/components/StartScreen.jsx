import { useState } from 'react';

export default function StartScreen({ hasSaveData, onStart, onResume }) {
  const [teamName, setTeamName] = useState('');
  const [shopName, setShopName] = useState('');
  const [showDialog, setShowDialog] = useState(hasSaveData);

  function handleStart() {
    if (!teamName.trim() || !shopName.trim()) return;
    onStart(teamName.trim(), shopName.trim());
  }

  if (showDialog) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2>前回のデータが残っています</h2>
          <p>前回のゲームデータが残っています。続きから再開しますか？</p>
          <div className="flex" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onResume}>続きから再開</button>
            <button className="btn btn-danger" onClick={() => setShowDialog(false)}>新しくはじめる</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1>☕ 学内カフェ店長ゲーム</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: 32 }}>
        あなたは学内カフェの店長です。<br />
        5日間の営業で利益を最大化しましょう！<br />
        仕入れ・価格設定・SNS活用で売上アップを目指せ！
      </p>

      <div className="card" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>チーム名</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="例: チームA"
            style={{ padding: 8, fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>店舗名</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="例: キャンパスカフェ"
            style={{ padding: 8, fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }}
          />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleStart}
          disabled={!teamName.trim() || !shopName.trim()}
        >
          ゲーム開始！
        </button>
      </div>

      <div className="card" style={{ maxWidth: 400, margin: '16px auto', textAlign: 'left', fontSize: '0.9rem', color: '#555' }}>
        <strong>ゲームの流れ</strong>
        <ol style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>市場情報（天気・イベント）を確認</li>
          <li>各商品の仕入数・販売価格を設定</li>
          <li>SNS投稿の有無を選択</li>
          <li>営業結果を確認</li>
          <li>振り返りメモを記入</li>
          <li>5日間繰り返して最終結果へ</li>
        </ol>
      </div>
    </div>
  );
}

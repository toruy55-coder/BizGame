import { useState } from 'react';

export default function StartScreen({ hasSaveData, onStart, onResume }) {
  const [teamName, setTeamName] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [showResume, setShowResume] = useState(hasSaveData);

  function handleStart() {
    if (!teamName.trim()) { setError('チーム名を入力してください。'); return; }
    if (!shopName.trim()) { setError('店舗名を入力してください。'); return; }
    setError('');
    onStart(teamName.trim(), shopName.trim());
  }

  if (showResume) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2>前回のゲームデータが残っています</h2>
        <p>続きから再開しますか？</p>
        <div className="flex" style={{ justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button className="btn btn-primary" onClick={onResume}>続きから再開</button>
          <button className="btn btn-secondary" onClick={() => setShowResume(false)}>最初から始める</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 40 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>学内カフェ店長ゲーム</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: 32 }}>
        あなたたちは、大学内にある小さなカフェの店長です。<br />
        10日間の営業で、できるだけ利益を出しましょう。
      </p>

      <div className="card" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div><span style={{ color: '#555' }}>営業時間：</span><strong>10:00〜17:00</strong></div>
          <div><span style={{ color: '#555' }}>初期資金：</span><strong>¥50,000</strong></div>
          <div><span style={{ color: '#555' }}>ゲーム期間：</span><strong>10日間</strong></div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>チーム名</label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="例：チームA"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>店舗名</label>
          <input
            type="text"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            placeholder="例：朝陽カフェ"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleStart}>
          ゲーム開始
        </button>
      </div>
    </div>
  );
}

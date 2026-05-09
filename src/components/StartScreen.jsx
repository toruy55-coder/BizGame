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
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>前回のゲームデータが残っています</h2>
        <p style={{ color: '#555' }}>続きから再開しますか？</p>
        <div className="flex" style={{ justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button className="btn btn-primary" onClick={onResume}>続きから再開</button>
          <button className="btn btn-secondary" onClick={() => setShowResume(false)}>最初から始める</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600, paddingTop: 40 }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: 8 }}>学内カフェ店長ゲーム</h1>
      <p style={{ textAlign: 'center', color: '#555', fontSize: '1rem', marginBottom: 32 }}>
        あなたたちは、大学内にある小さなカフェの店長です。<br />
        7日間の営業で、できるだけ利益を出しましょう。
      </p>

      <div className="card" style={{ background: '#f0fdf4', borderColor: '#86efac', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '1rem' }}>
          <div><span style={{ color: '#555' }}>営業時間：</span><strong>10:00〜17:00</strong></div>
          <div><span style={{ color: '#555' }}>初期資金：</span><strong>¥50,000</strong></div>
          <div><span style={{ color: '#555' }}>ゲーム期間：</span><strong>7日間</strong></div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '1.1rem' }}>
            チーム名
          </label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="例：チームA"
            style={{ fontSize: '1.2rem', padding: '12px 16px', width: '100%', border: '2px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '1.1rem' }}>
            店舗名
          </label>
          <input
            type="text"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            placeholder="例：朝陽カフェ"
            style={{ fontSize: '1.2rem', padding: '12px 16px', width: '100%', border: '2px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }}
          />
        </div>
        {error && <p className="error" style={{ marginBottom: 12 }}>{error}</p>}
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1.2rem', padding: '14px' }}
          onClick={handleStart}
        >
          ゲーム開始
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { DEFAULT_VARIATION_MAX, DEFAULT_VARIATION_STEP } from '../gameData.js';
import { TEST_PASSWORD_HASH } from '../testScenario.js';

export default function StartScreen({ hasSaveData, onStart, onResume, gameConfig, onAutoStart }) {
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [showResume, setShowResume] = useState(hasSaveData);
  const [variationMax, setVariationMax] = useState(String(gameConfig?.variationMax ?? DEFAULT_VARIATION_MAX));
  const [variationStep, setVariationStep] = useState(String(gameConfig?.variationStep ?? DEFAULT_VARIATION_STEP));
  const [showSettings, setShowSettings] = useState(false);
  const [testPassword, setTestPassword] = useState('');
  const [testError, setTestError] = useState('');

  async function handleTestStart() {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testPassword));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === TEST_PASSWORD_HASH) {
      setTestError('');
      onAutoStart();
    } else {
      setTestError('パスワードが違います');
      setTestPassword('');
    }
  }

  function handleStart() {
    if (!shopName.trim()) { setError('店舗名を入力してください。'); return; }
    const max = parseInt(variationMax);
    const step = parseInt(variationStep);
    if (!max || max < 5 || max > 100) { setError('需要変動幅は5〜100の整数で入力してください。'); return; }
    if (!step || step < 1 || step > max) { setError('刻み幅は1以上・変動幅以下の整数で入力してください。'); return; }
    setError('');
    onStart(shopName.trim(), { variationMax: max, variationStep: step });
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

      {/* テスト実行（教員専用・パスワード保護） */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password"
            value={testPassword}
            onChange={e => { setTestPassword(e.target.value); setTestError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleTestStart()}
            placeholder="パスワード"
            style={{ fontSize: '0.78rem', padding: '4px 8px', width: 90, border: '1px solid #d1d5db', borderRadius: 4 }}
          />
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
            onClick={handleTestStart}
          >
            テスト実行
          </button>
        </div>
        {testError && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{testError}</div>}
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          onClick={() => setShowSettings(v => !v)}
        >
          {showSettings ? '▲ 需要設定を閉じる' : '▼ 需要設定（教員用）'}
        </button>
      </div>

      {showSettings && (
        <div className="card" style={{ marginTop: 8, background: '#fefce8', borderColor: '#fde68a' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#92400e' }}>需要変動の設定</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>
                変動幅（±%）
              </label>
              <input
                type="number" min="5" max="100" step="5"
                value={variationMax}
                onChange={e => setVariationMax(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 2 }}>
                現在：±{variationMax}%（5〜100）
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>
                刻み幅（%）
              </label>
              <input
                type="number" min="1" max="100" step="1"
                value={variationStep}
                onChange={e => setVariationStep(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 2 }}>
                現在：{variationStep}%刻み（1以上）
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

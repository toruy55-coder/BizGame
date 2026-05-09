import { useState, useEffect, useRef } from 'react';
import { INITIAL_CASH, MARKET_INFO, DEFAULT_VARIATION_MAX, DEFAULT_VARIATION_STEP } from './gameData.js';
import { calcDayResult } from './gameLogic.js';
import { saveGame, loadGame, clearGame } from './storage.js';
import { TEST_SCENARIO, TEST_SHOP_NAME } from './testScenario.js';

import StartScreen    from './components/StartScreen.jsx';
import MarketScreen   from './components/MarketScreen.jsx';
import PurchaseScreen from './components/PurchaseScreen.jsx';
import ResultScreen   from './components/ResultScreen.jsx';
import ReviewScreen   from './components/ReviewScreen.jsx';
import FinalScreen    from './components/FinalScreen.jsx';
import HistoryScreen  from './components/HistoryScreen.jsx';

const SCREENS = {
  START:    'start',
  MARKET:   'market',
  PURCHASE: 'purchase',
  RESULT:   'result',
  REVIEW:   'review',
  FINAL:    'final',
  HISTORY:  'history',
};

// 各画面の待機時間（ミリ秒）
const AUTO_PLAY_DELAYS = {
  [SCREENS.MARKET]:   2500,
  [SCREENS.PURCHASE]: 3000,
  [SCREENS.RESULT]:   3500,
  [SCREENS.REVIEW]:   2000,
};

function createInitialState(shopName = '') {
  return {
    shopName,
    currentDay: 1,
    cash: INITIAL_CASH,
    coffeeStock: 0,
    cookieCarryoverStock: 0,
    snsHistory: [],
    dayResults: [],
    reviewMemos: [],
  };
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.START);
  const [prevScreen, setPrevScreen] = useState(SCREENS.MARKET);
  const [gameState, setGameState] = useState(createInitialState());
  const [hasSaveData, setHasSaveData] = useState(false);
  const [gameConfig, setGameConfig] = useState({ variationMax: DEFAULT_VARIATION_MAX, variationStep: DEFAULT_VARIATION_STEP });
  const [autoPlay, setAutoPlay] = useState(false);

  // autoPlay中に最新のgameStateを参照するためにrefを使う
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    if (loadGame()) setHasSaveData(true);
  }, []);

  useEffect(() => {
    if (screen !== SCREENS.START) {
      saveGame({ screen, prevScreen, gameState });
    }
  }, [screen, gameState]);

  // 自動再生ロジック
  useEffect(() => {
    if (!autoPlay) return;
    const delay = AUTO_PLAY_DELAYS[screen];
    if (!delay) return;

    const timer = setTimeout(() => {
      const gs = gameStateRef.current;
      if (screen === SCREENS.MARKET) {
        handleMarketNext();
      } else if (screen === SCREENS.PURCHASE) {
        const dayConfig = TEST_SCENARIO[gs.currentDay - 1];
        const orders = [
          { productId: 'coffee',    quantity: dayConfig.coffee,    sellingPrice: dayConfig.coffeePrice },
          { productId: 'sandwich',  quantity: dayConfig.sandwich,  sellingPrice: dayConfig.sandwichPrice },
          { productId: 'cookie',    quantity: dayConfig.cookie,    sellingPrice: dayConfig.cookiePrice },
        ];
        handlePurchaseSubmit(orders, dayConfig.sns);
      } else if (screen === SCREENS.RESULT) {
        handleResultNext();
      } else if (screen === SCREENS.REVIEW) {
        handleReviewNext(['', '', '', '', '']);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [screen, autoPlay]);

  function handleStart(shopName, config) {
    clearGame();
    setGameConfig(config);
    setGameState(createInitialState(shopName));
    setScreen(SCREENS.MARKET);
  }

  function handleAutoStart() {
    clearGame();
    setAutoPlay(true);
    setGameState(createInitialState(TEST_SHOP_NAME));
    setScreen(SCREENS.MARKET);
  }

  function handleResume() {
    const saved = loadGame();
    if (saved) {
      setGameState(saved.gameState);
      setPrevScreen(saved.prevScreen || SCREENS.MARKET);
      setScreen(saved.screen || SCREENS.MARKET);
    }
    setHasSaveData(false);
  }

  function handleShowHistory(fromScreen) {
    setPrevScreen(fromScreen);
    setScreen(SCREENS.HISTORY);
  }

  function handleHistoryBack() {
    setScreen(prevScreen);
  }

  function handleMarketNext() { setScreen(SCREENS.PURCHASE); }

  function handlePurchaseSubmit(orders, useSns) {
    const { cash, coffeeStock, cookieCarryoverStock, currentDay, snsHistory } = gameStateRef.current;
    const result = calcDayResult({ cash, coffeeStock, cookieCarryoverStock, orders, useSns, snsHistory, day: currentDay, variationMax: gameConfig.variationMax, variationStep: gameConfig.variationStep });
    const newSnsHistory = [...snsHistory, useSns];
    setGameState(prev => ({
      ...prev,
      cash: result.newCash,
      coffeeStock: result.newCoffeeStock,
      cookieCarryoverStock: result.newCookieCarryoverStock,
      snsHistory: newSnsHistory,
      dayResults: [...prev.dayResults, result],
    }));
    setScreen(SCREENS.RESULT);
  }

  function handleResultNext() { setScreen(SCREENS.REVIEW); }

  function handleReviewNext(memos) {
    const { currentDay } = gameStateRef.current;
    const newMemos = [...gameStateRef.current.reviewMemos, memos];
    if (currentDay >= 7) {
      setGameState(prev => ({ ...prev, reviewMemos: newMemos }));
      setAutoPlay(false); // 最終画面で停止
      setScreen(SCREENS.FINAL);
    } else {
      setGameState(prev => ({ ...prev, currentDay: prev.currentDay + 1, reviewMemos: newMemos }));
      setScreen(SCREENS.MARKET);
    }
  }

  function handleRestart() {
    clearGame();
    setAutoPlay(false);
    setGameState(createInitialState(''));
    setHasSaveData(false);
    setScreen(SCREENS.START);
  }

  // autoPlay中の現在の日のシナリオを仕入れ画面に渡す
  const autoPlayOrders = autoPlay && gameState.currentDay
    ? TEST_SCENARIO[gameState.currentDay - 1]
    : null;

  return (
    <>
      {autoPlay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#f59e0b', color: '#fff',
          textAlign: 'center', padding: '5px 0', fontSize: '0.82rem', fontWeight: 'bold',
        }}>
          テストモード実行中
        </div>
      )}

      {screen === SCREENS.START    && <StartScreen hasSaveData={hasSaveData} onStart={handleStart} onResume={handleResume} gameConfig={gameConfig} onAutoStart={handleAutoStart} />}
      {screen === SCREENS.MARKET   && <MarketScreen gameState={gameState} onNext={handleMarketNext} onShowHistory={() => handleShowHistory(SCREENS.MARKET)} autoPlay={autoPlay} />}
      {screen === SCREENS.PURCHASE && <PurchaseScreen gameState={gameState} onSubmit={handlePurchaseSubmit} onShowHistory={() => handleShowHistory(SCREENS.PURCHASE)} autoPlayOrders={autoPlayOrders} />}
      {screen === SCREENS.RESULT   && <ResultScreen gameState={gameState} onNext={handleResultNext} onShowHistory={() => handleShowHistory(SCREENS.RESULT)} />}
      {screen === SCREENS.REVIEW   && <ReviewScreen gameState={gameState} onNext={handleReviewNext} onShowHistory={() => handleShowHistory(SCREENS.REVIEW)} />}
      {screen === SCREENS.FINAL    && <FinalScreen gameState={gameState} onRestart={handleRestart} onShowHistory={() => handleShowHistory(SCREENS.FINAL)} />}
      {screen === SCREENS.HISTORY  && <HistoryScreen gameState={gameState} onBack={handleHistoryBack} />}
    </>
  );
}

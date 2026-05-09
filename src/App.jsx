import { useState, useEffect } from 'react';
import { INITIAL_CASH, MARKET_INFO, DEFAULT_VARIATION_MAX, DEFAULT_VARIATION_STEP } from './gameData.js';
import { calcDayResult } from './gameLogic.js';
import { saveGame, loadGame, clearGame } from './storage.js';

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
  const [prevScreen, setPrevScreen] = useState(SCREENS.MARKET); // 履歴から戻る先
  const [gameState, setGameState] = useState(createInitialState());
  const [hasSaveData, setHasSaveData] = useState(false);
  const [gameConfig, setGameConfig] = useState({ variationMax: DEFAULT_VARIATION_MAX, variationStep: DEFAULT_VARIATION_STEP });

  useEffect(() => {
    if (loadGame()) setHasSaveData(true);
  }, []);

  useEffect(() => {
    if (screen !== SCREENS.START) {
      saveGame({ screen, prevScreen, gameState });
    }
  }, [screen, gameState]);

  function handleStart(shopName, config) {
    clearGame();
    setGameConfig(config);
    setGameState(createInitialState(shopName));
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
    const { cash, coffeeStock, cookieCarryoverStock, currentDay, snsHistory } = gameState;
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
    const { currentDay } = gameState;
    const newMemos = [...gameState.reviewMemos, memos];
    if (currentDay >= 7) {
      setGameState(prev => ({ ...prev, reviewMemos: newMemos }));
      setScreen(SCREENS.FINAL);
    } else {
      setGameState(prev => ({ ...prev, currentDay: prev.currentDay + 1, reviewMemos: newMemos }));
      setScreen(SCREENS.MARKET);
    }
  }

  function handleRestart() {
    clearGame();
    setGameState(createInitialState(''));
    setHasSaveData(false);
    setScreen(SCREENS.START);
  }

  return (
    <>
      {screen === SCREENS.START    && <StartScreen hasSaveData={hasSaveData} onStart={handleStart} onResume={handleResume} gameConfig={gameConfig} />}
      {screen === SCREENS.MARKET   && <MarketScreen gameState={gameState} onNext={handleMarketNext} onShowHistory={() => handleShowHistory(SCREENS.MARKET)} />}
      {screen === SCREENS.PURCHASE && <PurchaseScreen gameState={gameState} onSubmit={handlePurchaseSubmit} onShowHistory={() => handleShowHistory(SCREENS.PURCHASE)} />}
      {screen === SCREENS.RESULT   && <ResultScreen gameState={gameState} onNext={handleResultNext} onShowHistory={() => handleShowHistory(SCREENS.RESULT)} />}
      {screen === SCREENS.REVIEW   && <ReviewScreen gameState={gameState} onNext={handleReviewNext} onShowHistory={() => handleShowHistory(SCREENS.REVIEW)} />}
      {screen === SCREENS.FINAL    && <FinalScreen gameState={gameState} onRestart={handleRestart} onShowHistory={() => handleShowHistory(SCREENS.FINAL)} />}
      {screen === SCREENS.HISTORY  && <HistoryScreen gameState={gameState} onBack={handleHistoryBack} />}
    </>
  );
}

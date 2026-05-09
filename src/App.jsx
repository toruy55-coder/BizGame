import { useState, useEffect } from 'react';
import { INITIAL_CASH, MARKET_INFO } from './gameData.js';
import { calcDayResult } from './gameLogic.js';
import { saveGame, loadGame, clearGame } from './storage.js';

import StartScreen    from './components/StartScreen.jsx';
import MarketScreen   from './components/MarketScreen.jsx';
import PurchaseScreen from './components/PurchaseScreen.jsx';
import ResultScreen   from './components/ResultScreen.jsx';
import ReviewScreen   from './components/ReviewScreen.jsx';
import FinalScreen    from './components/FinalScreen.jsx';

const SCREENS = {
  START:    'start',
  MARKET:   'market',
  PURCHASE: 'purchase',
  RESULT:   'result',
  REVIEW:   'review',
  FINAL:    'final',
};

function createInitialState(teamName = '', shopName = '') {
  return {
    teamName,
    shopName,
    currentDay: 1,
    cash: INITIAL_CASH,
    coffeeStock: 0,
    dayResults: [],
    reviewMemos: [],
  };
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.START);
  const [gameState, setGameState] = useState(createInitialState());
  const [hasSaveData, setHasSaveData] = useState(false);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setHasSaveData(true);
    }
  }, []);

  // ゲーム状態が変わったらLocalStorageに保存
  useEffect(() => {
    if (screen !== SCREENS.START) {
      saveGame({ screen, gameState });
    }
  }, [screen, gameState]);

  // ---- ハンドラ ----

  function handleStart(teamName, shopName) {
    clearGame();
    const newState = createInitialState(teamName, shopName);
    setGameState(newState);
    setScreen(SCREENS.MARKET);
  }

  function handleResume() {
    const saved = loadGame();
    if (saved) {
      setGameState(saved.gameState);
      setScreen(saved.screen || SCREENS.MARKET);
    }
    setHasSaveData(false);
  }

  function handleMarketNext() {
    setScreen(SCREENS.PURCHASE);
  }

  function handlePurchaseSubmit(orders, useSns) {
    const { cash, coffeeStock, currentDay } = gameState;
    const market = MARKET_INFO[currentDay - 1];

    const result = calcDayResult({ cash, coffeeStock, orders, useSns, market });

    setGameState((prev) => ({
      ...prev,
      cash: result.newCash,
      coffeeStock: result.newCoffeeStock,
      dayResults: [...prev.dayResults, result],
    }));
    setScreen(SCREENS.RESULT);
  }

  function handleResultNext() {
    setScreen(SCREENS.REVIEW);
  }

  function handleReviewNext(memos) {
    const { currentDay } = gameState;
    const newMemos = [...gameState.reviewMemos, memos];

    if (currentDay >= 5) {
      setGameState((prev) => ({ ...prev, reviewMemos: newMemos }));
      setScreen(SCREENS.FINAL);
    } else {
      setGameState((prev) => ({
        ...prev,
        currentDay: prev.currentDay + 1,
        reviewMemos: newMemos,
      }));
      setScreen(SCREENS.MARKET);
    }
  }

  function handleRestart() {
    clearGame();
    setGameState(createInitialState());
    setHasSaveData(false);
    setScreen(SCREENS.START);
  }

  // ---- レンダリング ----

  return (
    <>
      {screen === SCREENS.START && (
        <StartScreen
          hasSaveData={hasSaveData}
          onStart={handleStart}
          onResume={handleResume}
        />
      )}
      {screen === SCREENS.MARKET && (
        <MarketScreen
          gameState={gameState}
          onNext={handleMarketNext}
        />
      )}
      {screen === SCREENS.PURCHASE && (
        <PurchaseScreen
          gameState={gameState}
          onSubmit={handlePurchaseSubmit}
        />
      )}
      {screen === SCREENS.RESULT && (
        <ResultScreen
          gameState={gameState}
          onNext={handleResultNext}
        />
      )}
      {screen === SCREENS.REVIEW && (
        <ReviewScreen
          gameState={gameState}
          onNext={handleReviewNext}
        />
      )}
      {screen === SCREENS.FINAL && (
        <FinalScreen
          gameState={gameState}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

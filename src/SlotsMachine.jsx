// SlotMachine.jsx
import React, { useState, useEffect, useCallback } from "react";

const SYMBOLS = ["💎", "🍒", "🎲", "🔔", "7️⃣", "BAR", "🍋", "🍉", "🍇"];
const PAYOUTS = {
  "💎": 50,
  "🍒": 40,
  "🎲": 30,
  "🔔": 20,
  "7️⃣": 15,
  BAR: 10,
  "🍋": 5,
  "🍉": 5,
  "🍇": 5,
};

const ROWS = 3;
const COLS = 5;

const SlotMachine = ({ winProbability = 0.6 }) => {
  const generateReelStrip = useCallback(() => {
    return Array(30)
      .fill()
      .map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }, []);

  const initialReels = useCallback(() => {
    return Array(COLS)
      .fill()
      .map(() => generateReelStrip().slice(0, ROWS));
  }, [generateReelStrip]);

  const [reels, setReels] = useState(initialReels);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(20670000);
  const [bet, setBet] = useState(10000);
  const [win, setWin] = useState(0);
  const [winningRow, setWinningRow] = useState(null);

  const spin = useCallback(() => {
    if (balance < bet || spinning) return;

    setSpinning(true);
    setBalance((prev) => prev - bet);
    setWin(0);
    setWinningRow(null);

    let spinDuration = 3000;
    let intervalDuration = 50;
    let totalTicks = spinDuration / intervalDuration;
    let currentTick = 0;

    const isWin = Math.random() < winProbability;

    const newReels = Array(COLS)
      .fill()
      .map(() => generateReelStrip());

    if (isWin) {
      // Ensuring at least 3 same symbols on a winning row
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      for (let i = 0; i < 3; i++) {
        newReels[i][0] = winningSymbol; // Force at least 3 same symbols on the first row
      }
    }

    const spinInterval = setInterval(() => {
      setReels((reels) =>
        reels.map((reel, i) => {
          const newReel = [...reel];
          newReel.unshift(newReel.pop());
          return newReel;
        })
      );

      currentTick++;
      if (currentTick >= totalTicks) {
        clearInterval(spinInterval);
        setSpinning(false);
        const finalReels = newReels.map((reel) => reel.slice(0, ROWS));
        setReels(finalReels);
        calculateWin(finalReels, isWin);
      }
    }, intervalDuration);
  }, [balance, bet, spinning, generateReelStrip, winProbability]);

  const calculateWin = useCallback(
    (finalReels, isWin) => {
      let totalWin = 0;
      let winningRowIndex = null;

      if (isWin) {
        for (let row = 0; row < ROWS; row++) {
          const rowSymbols = finalReels.map((reel) => reel[row]);
          const symbolCounts = rowSymbols.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
          }, {});

          const maxCount = Math.max(...Object.values(symbolCounts));
          const winningSymbol = Object.keys(symbolCounts).find(
            (symbol) => symbolCounts[symbol] === maxCount
          );

          if (maxCount >= 3) {
            const rowWin = bet * PAYOUTS[winningSymbol] * (maxCount - 2);
            totalWin += rowWin;

            if (row === 0) {
              winningRowIndex = row;
            }
          }
        }
      }

      if (totalWin > 0) {
        setWin(totalWin);
        setBalance((prev) => prev + totalWin);
        setWinningRow(winningRowIndex);
      }
    },
    [bet]
  );

  return (
    <div className="p-4 bg-purple-900 text-white rounded-lg shadow-xl max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">💰 ${balance.toLocaleString()}</div>
        <div className="text-xl">Level 3</div>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4 bg-purple-800 p-2 rounded overflow-hidden h-64 relative">
        {reels.map((reel, i) => (
          <div key={i} className="relative h-full overflow-hidden">
            <div
              className={`absolute inset-0 flex flex-col transition-transform duration-[3000ms] ease-in-out ${
                spinning ? "animate-slot-spin" : ""
              }`}
            >
              {reel.map((symbol, j) => (
                <div
                  key={j}
                  className={`flex items-center justify-center h-1/3 text-5xl ${
                    j === 1 && winningRow === 1
                      ? "animate-pulse bg-yellow-500"
                      : ""
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        ))}
        {winningRow === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl font-bold text-yellow-400 animate-bounce">
              BIG WIN!
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setBet(Math.max(1000, bet - 1000))}
          className="bg-red-500 px-4 py-2 rounded text-xl font-bold"
          disabled={spinning}
        >
          -
        </button>
        <div className="text-xl font-bold">Bet: ${bet.toLocaleString()}</div>
        <button
          onClick={() => setBet(Math.min(100000, bet + 1000))}
          className="bg-green-500 px-4 py-2 rounded text-xl font-bold"
          disabled={spinning}
        >
          +
        </button>
        <button
          onClick={spin}
          disabled={spinning || balance < bet}
          className="bg-green-600 px-6 py-2 rounded disabled:opacity-50 text-xl font-bold"
        >
          {spinning ? "Spinning..." : "SPIN"}
        </button>
      </div>
      {win > 0 && (
        <div className="mt-4 text-2xl font-bold text-yellow-400 text-center animate-bounce">
          You won ${win.toLocaleString()}!
        </div>
      )}
    </div>
  );
};

export default SlotMachine;

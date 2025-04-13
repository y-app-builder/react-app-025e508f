import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initBoard = useCallback((rows: number, cols: number, mines: number) => {
    const board: number[][] = [];
    const revealed: boolean[][] = [];

    for (let i = 0; i < rows; i++) {
      board[i] = [];
      revealed[i] = [];
      for (let j = 0; j < cols; j++) {
        board[i][j] = 0;
        revealed[i][j] = false;
      }
    }

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (board[row][col] !== -1) {
        board[row][col] = -1;
        minesPlaced++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (board[i][j] !== -1) {
          let count = 0;
          for (let x = Math.max(0, i - 1); x <= Math.min(rows - 1, i + 1); x++) {
            for (let y = Math.max(0, j - 1); y <= Math.min(cols - 1, j + 1); y++) {
              if (board[x][y] === -1) {
                count++;
              }
            }
          }
          board[i][j] = count;
        }
      }
    }

    setBoard(board);
    setRevealed(revealed);
  }, []);

  useEffect(() => {
    initBoard(10, 10, 10);
  }, [initBoard]);

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (revealed[row][col] || gameOver || gameWon) return;

      const newRevealed = [...revealed];
      newRevealed[row][col] = true;

      if (board[row][col] === -1) {
        setGameOver(true);
      } else if (board[row][col] === 0) {
        revealNeighbors(row, col, newRevealed);
      }

      let allRevealed = true;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (board[i][j] !== -1 && !newRevealed[i][j]) {
            allRevealed = false;
            break;
          }
        }
      }

      if (allRevealed) {
        setGameWon(true);
      }

      setRevealed(newRevealed);
    },
    [board, revealed, gameOver, gameWon]
  );

  const revealNeighbors = useCallback(
    (row: number, col: number, newRevealed: boolean[][]) => {
      for (let i = Math.max(0, row - 1); i <= Math.min(board.length - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(board[i].length - 1, col + 1); j++) {
          if (!newRevealed[i][j] && board[i][j] !== -1) {
            newRevealed[i][j] = true;
            if (board[i][j] === 0) {
              revealNeighbors(i, j, newRevealed);
            }
          }
        }
      }
    },
    [board]
  );

  const resetGame = useCallback(() => {
    initBoard(10, 10, 10);
    setGameOver(false);
    setGameWon(false);
  }, [initBoard]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>Mine Sweeper</h1>
      {gameOver && <p style={{ color: 'red' }}>Game Over!</p>}
      {gameWon && <p style={{ color: 'green' }}>You Win!</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 30px)' }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: revealed[rowIndex][colIndex] ? 'lightgray' : 'gray',
                border: '1px solid black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => revealCell(rowIndex, colIndex)}
            >
              {revealed[rowIndex][colIndex] && board[rowIndex][colIndex] !== -1
                ? board[rowIndex][colIndex] || ''
                : revealed[rowIndex][colIndex] && board[rowIndex][colIndex] === -1
                ? '💣'
                : ''}
            </div>
          ))
        )}
      </div>
      <button style={{ marginTop: '20px' }} onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}

export default App;
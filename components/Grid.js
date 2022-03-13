import React, {useState, useEffect} from 'react';
import Tile from './Tile';
import styles from '../styles/Home.module.css'

const gameSettings = {
    rows: 12,
    columns: 7,
    mines: 12,
};

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmptyGrid = gameSettings => {
    const newGrid = [];
    for (let i = 0; i < gameSettings.rows; i++) {
      const newRow = [];
      for (let j = 0; j < gameSettings.columns; j++) {
        const newTile = {
          mined: false,
          status: 'hidden', // hidden / flagged / shown
          adjacentMines: 0
        };
        newRow.push(newTile);
      }
      newGrid.push(newRow);
    }
    return newGrid;
  };

export default function Grid() {
  const [grid, setGrid] = useState(generateEmptyGrid(gameSettings));
  const [gameState, setGameState] = useState('notStarted'); // notStarted / started / lost / won / ended
  const [seconds, setSeconds] = useState(0);
  const [clock, setClock] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [minesClicked, setMinesClicked] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    //stop
    if(seconds === 40) {
      showAllMines(grid);
      setGameState('ended');
      clearInterval(clock);
      setStatusMessage('Too bad! You lost! 😢');
    }
  }, [seconds, clock, grid]);
  
  const clearAdjacentTilesAt = (x, y, newGrid) => {
    for (let i = (x === 0 ? 0 : -1); i <= ((x+1) === gameSettings.columns ? 0 : 1); i++)
      for (let j = (y === 0 ? 0 : -1); j <= ((y+1) === gameSettings.rows ? 0 : 1); j++)
        clearTileAt(x + i, y + j, newGrid);
  }

  const showAllMines = newGrid => {
    for (let i = 0; i < gameSettings.rows; i++) {
      for (let j = 0; j < gameSettings.columns; j++) {
        const tile = newGrid[i][j];
        if (tile.mined === true && tile.status !== 'flagged')
          tile.status = 'shown';
        else if (tile.mined === false && tile.status === 'flagged')
          tile.wrong = true;
      }
    }
  };

  const checkIfWon = newGrid => {
    let hiddenTiles = 0;
    for (let i = 0; i < gameSettings.rows; i++) {
      for (let j = 0; j < gameSettings.columns; j++) {
        const tile = newGrid[i][j];
        if (tile.status === 'hidden' || tile.status === 'flagged')
          hiddenTiles++;
      }
    }
    return hiddenTiles === gameSettings.mines;
  };
  
  const handleStartGame = () => {
    setGrid(generateEmptyGrid(gameSettings));
    setGameState('notStarted');
    setScore(0);
    setMinesClicked(0);

    if (clock !== 0)
      clearInterval(clock);
    setSeconds(0);
  };

  const countAdjacentXAt = (grid, gameSettings, x, y, predicate) => {
    let minesNear = 0;
    for (let i = (y === 0 ? 0 : -1); i <= ((y+1) === gameSettings.rows ? 0 : 1); i++)
      for (let j = (x === 0 ? 0 : -1); j <= ((x+1) === gameSettings.columns ? 0 : 1); j++)
        if (predicate(grid[y+i][x+j]) === true)
          minesNear++;
    return minesNear;
  };

  const countAdjacentMinesAt = (grid, gameSettings, x, y) =>
  countAdjacentXAt(grid, gameSettings, x, y, tile => tile.mined === true);

  const generateGridWithMines = (gameSettings, x, y, newGrid) => {

    // generate mines
    let minesLeft = gameSettings.mines;
  
    while (minesLeft > 0)
    {
      const randomX = randomInteger(0, gameSettings.columns - 1);
      const randomY = randomInteger(0, gameSettings.rows - 1);
  
      const tile = newGrid[randomY][randomX];
  
      // tile isn't valid to place a mine if
      // (a) it already contains a mine, or
      // (b) it is the first tile that the player clicked
  
      if (tile.mined === true || (x === randomX && y === randomY))
        continue;
      else {
        tile.mined = true;
        minesLeft--;
      }
    }
  
    // calculate adjacent mines
  
    for (let i = 0; i < gameSettings.rows; i++) {
      for (let j = 0; j < gameSettings.columns; j++) {
        newGrid[i][j].adjacentMines = countAdjacentMinesAt(newGrid, gameSettings, j, i);
      }
    }
  };

  const clearTileAt = (x, y, newGrid) => {
    const tile = newGrid[y][x];
  
      
    if (tile.status === 'hidden') {
      tile.status = 'shown';

      if (tile.mined) {
        tile.exploded = true;
        if(minesClicked === 3) {
          showAllMines(newGrid);
          setGameState('lost');
          clearInterval(clock);
          setStatusMessage('Too bad! You lost! 😢');
        }
        setScore(prevState => prevState>5 ? prevState - 3 : 0);
        setMinesClicked(prevState => prevState + 1);
      }
      else {
        setScore(prevState => prevState + tile.adjacentMines);
        if (checkIfWon(newGrid) === true) {
          setGameState('won');
          clearInterval(clock);
          setStatusMessage('Congratulations! You won! 🎉');
        }
        else if (tile.adjacentMines === 0) { // clear tiles around
          clearAdjacentTilesAt(x, y, newGrid);
        }
      }
    }
  };

  const handleTileClick = (x, y) => {
    // copy the grid
    let newGrid = grid.map(row => row.map(tile => ({...tile})));

    // if this is the first click, generate mines
    if (gameState === 'notStarted') {
      generateGridWithMines(gameSettings, x, y, newGrid);
      setGameState('started');
      setClock(setInterval(() => setSeconds(prevSeconds => prevSeconds + 1), 1000));
    }

    // clear the tile (if applicable) and adjacent tiles (if applicable)
    if (gameState === 'notStarted' || gameState === 'started')
      clearTileAt(x, y, newGrid);

    // update the grid
    setGrid(newGrid);
  };

  const handleLongPressTile = (x, y) => {
    const oldTile = grid[y][x];
    if ((oldTile.status === 'hidden' || oldTile.status === 'flagged')
        && (gameState === 'notStarted' || gameState === 'started')) {
      
      const newTile = {
        ...oldTile,
        status: oldTile.status === 'hidden' ? 'flagged' : 'hidden'
      };

      const newGrid = grid.map((row, i) =>
        row.map((tile, j) => i === y && j === x ? newTile : tile)
      );
  
      setGrid(newGrid);
    //   setFlagsUsed(flagsUsed + ((oldTile.status === 'hidden') ? 1 : -1));
    }
  };

  return (
    <>
        <div className={styles.header}>
          hello
        </div>
        <div className={styles.headerOuter}>
          <div className={styles.headerInner}>
            <button className={styles.button} onClick={handleStartGame}>Reset</button>
            <div className={styles.timer}>00 : {40 - seconds}</div>
          </div>
        </div>
        <div>{score}</div>
        <table className={styles.table}>
          <tbody>
            {
              grid.length && grid.map((row, i) => <tr key={`row_${i}`}>
                {
                  row.map((tile, j) => <td key={`tile_${j}`}>
                    <Tile 
                        i={i}
                        j={j}
                        tile={tile}
                        handleTileClick={handleTileClick}
                        handleLongPressTile={handleLongPressTile}
                    />
                  </td>)
                }
              </tr>)
            }
          </tbody>
        </table>
    </>
  )
}
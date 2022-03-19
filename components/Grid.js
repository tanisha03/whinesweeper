import React, {useState, useEffect} from 'react';
import Tile from './Tile';
import styles from '../styles/Home.module.css'
import Modal from 'react-modal';
import toast, { Toaster } from 'react-hot-toast';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '400px'
  },
};

const numberMapper = {
  0: '⬜️',
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
};

Modal.setAppElement('#ModalPlaceholder');

const gameSettings = {
    rows: 12,
    columns: 8,
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
  const [helpModalIsOpen, setHelpModalIsOpen] = React.useState(false);
  const [resultModallIsOpen, setResultModallIsOpen] = React.useState(false);
  const gamesPlayed = (typeof window !== 'undefined') ? +localStorage.getItem('games') : 0;
  const highestScore = (typeof window !== 'undefined') ? +localStorage.getItem('score') : 0;

  const openHelpModal = () => {
    setHelpModalIsOpen(true);
  }

  const closeHelpModal = () => {
    setHelpModalIsOpen(false);
  }

  const openResultModal = () => {
    setResultModallIsOpen(true);
  }

  const closeResultModal = () => {
    setResultModallIsOpen(false);
  }

  const endGame = (state, statusMsg) => {
      showAllMines(grid);
      setGameState(state);
      clearInterval(clock);
      setStatusMessage(statusMsg);
      openResultModal();
      localStorage.setItem('games', gamesPlayed+1);
      localStorage.setItem('score', score>highestScore ? score : highestScore);
  };

  useEffect(() => {
    (gamesPlayed === 0) && openHelpModal();
  }, []);

  useEffect(() => {
    //stop
    if(seconds === 40) {
      endGame('ended', 'Time\'s up!🕣');
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
        if(minesClicked === 5) {
          endGame('lost', 'Too bad! You lost! 😢');
        }
        setScore(prevState => prevState>10 ? prevState - 10 : 0);
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

  const shareResults = () => {
    let gameGrid = ``;
    grid.forEach(gridRow => {
      let row = ``;
      gridRow.forEach(col => {
        if(col.status === 'hidden') row+='🟧';
        else if(col.status === 'flagged' && col.mined) row+='🚩';
        else if(col.status === 'flagged' && !col.mined) row+='❌';
        else if(col.mined) row+='💣';
        else row+=numberMapper[col.adjacentMines];
      })
      gameGrid+=row+'\n';
    });
    let message = `Whinesweeper #${gamesPlayed+1} - ${score}\n${gameGrid}`;
    navigator.clipboard.writeText(message);
    toast('Copied to clipboard.');
  }

  return (
    <>
        <div style={{background: '#C0C0C0', padding: '4px'}}>
          <Toaster />
          <div className={styles.header}>
            💣 Whinesweeper
          </div>
          <div style={{padding: '8px'}}>
            <button className={styles.actionButtons} style={{marginRight: '12px'}} onClick={handleStartGame}>New Game</button>
            <button className={styles.actionButtons} onClick={openHelpModal}>Help</button>
          </div>
        </div>
        <div className={styles.headerOuter}>
          <div className={styles.headerInner}>
            <div className={styles.timer}>{("00" + score).slice(-3)}</div>
            <div className={styles.timer}>00 : {40 - seconds}</div>
          </div>
        </div>
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
        <Modal
          isOpen={helpModalIsOpen}
          onRequestClose={closeHelpModal}
          style={customStyles}
          contentLabel="Help Modal"
        >
          <button className={styles.close} onClick={closeHelpModal}>X</button>
          <p>This is a minesweeper you cannot loose!</p>
          <p>Rules are simple. Keep mining for 40 sec & collect points. Every bomb mined leads to a -10. If you explode more than six mines out of total 12, then I guess this game is not for you!</p>
          <h2>Controls</h2>
          <ul style={{padding: '0 1rem'}}>
            <li>Click or press to reveal the block</li>
            <li>Long press or right click to flag the block</li>
          </ul>
          <h3>Stop whining, start playing!</h3>
        </Modal>
        <Modal
          isOpen={resultModallIsOpen}
          onRequestClose={closeResultModal}
          style={customStyles}
          contentLabel="Results Modal"
        >
          <center>
            <button className={styles.close} onClick={closeResultModal}>X</button>
            <p>{statusMessage}</p>
            <h2 style={{color: '#0070f3'}}>Score: {score}</h2>
            <div style={{display: 'flex', justifyContent: 'space-around', margin: '2rem 0'}}>
              <div>
                <h3 style={{margin: 0}}>{gamesPlayed+1}</h3>
                <p style={{margin: '0.4rem'}}>Games Played</p>
              </div>
              <div>
                <h3 style={{margin: 0}}>{score>highestScore ? score : highestScore}</h3>
                <p style={{margin: '0.4rem'}}>Highest Score</p>
              </div>
            </div>
            <button className={styles.shareButton} onClick={shareResults}>Share</button>
          </center>
        </Modal>
    </>
  )
}

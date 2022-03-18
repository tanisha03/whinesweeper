import React, {useState} from 'react'
import styles from '../styles/Home.module.css'

const tileButtonStyles = {
  minWidth: '42px',
  minHeight: '42px',
  padding: 0,
  margin: 0,
  fontSize: '14px',
  backgroundColor: '#BFBFBF',
  color: 'black',
  borderBottom: '2px solid #7B7B7B',
  borderLeft: '2px solid #ffffff',
  borderTop: '2px solid #ffffff',
  borderRight: '2px solid #7B7B7B'
}

const revealedTileButton = {
  minWidth: '42px',
  minHeight: '42px',
  padding: 0,
  margin: 0,
  fontSize: '14px',
  border: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
  fontSize: '80%'
};

export default function Tile(props) {
  const [leftMouseButtonDownDate, setLeftMouseButtonDownDate] = useState(0);

  const getTileView = (tile) => {
    if (tile.status === 'flagged') {
      if (tile.wrong === true)
        return '❌';
      else
        return (
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <rect x="8" width="2" height="19" fill="black"/>
            <rect y="16" width="16" height="4" fill="#010000"/>
            <rect x="4" y="14" width="8" height="2" fill="#010000"/>
            <rect x="6" width="4" height="10" fill="#FC0D1B"/>
            <rect x="2" y="2" width="4" height="6" fill="#FC0D1B"/>
            <rect y="4" width="2" height="2" fill="#FC0D1B"/>
          </svg>
        );
    }
    else if (tile.status === 'shown') {
      if (tile.mined)
        return (
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="12" width="2" height="26" fill="black"/>
            <rect x="26" y="12" width="2" height="26" transform="rotate(90 26 12)" fill="black"/>
            <rect x="8" y="4" width="10" height="18" fill="black"/>
            <rect x="22" y="8" width="10" height="18" transform="rotate(90 22 8)" fill="black"/>
            <rect x="6" y="6" width="14" height="14" fill="black"/>
            <rect x="20" y="4" width="2" height="2" fill="black"/>
            <rect x="20" y="20" width="2" height="2" fill="black"/>
            <rect x="4" y="4" width="2" height="2" fill="black"/>
            <rect x="4" y="20" width="2" height="2" fill="black"/>
            <rect x="8" y="8" width="4" height="4" fill="white"/>
          </svg>
        );
      else
        return tile.adjacentMines ? tile.adjacentMines : '';
    }
    else if (tile.status === 'hidden')
        return ' ';
    else
      return '!'; // not supposed to happen
  };

  const getTileStyle = tile => {
    if (tile.exploded)
      return {...revealedTileButton, backgroundColor: 'red'};
    else if (tile.status === 'flagged')
      return {...tileButtonStyles};
    else if (tile.status === 'shown') {
      switch (tile.adjacentMines) {
        case 0: return {...revealedTileButton, color: 'transparent', backgroundColor: '#AAA'};
        case 1: return {...revealedTileButton, color: 'rgb(0, 0, 255)', backgroundColor: '#AAA'};
        case 2: return {...revealedTileButton, color: 'rgb(0, 122, 0)', backgroundColor: '#AAA'};
        case 3: return {...revealedTileButton, color: 'rgb(255, 0, 0)', backgroundColor: '#AAA'};
        case 4: return {...revealedTileButton, color: 'rgb(0, 0, 122)', backgroundColor: '#AAA'};
        case 5: return {...revealedTileButton, color: 'rgb(122, 0, 0)', backgroundColor: '#AAA'};
        case 6: return {...revealedTileButton, color: 'rgb(0, 122, 122)', backgroundColor: '#AAA'};
        case 7: return {...revealedTileButton, color: 'rgb(122, 0, 122)', backgroundColor: '#AAA'};
        case 8: return {...revealedTileButton, color: 'rgb(0, 0, 0)', backgroundColor: '#AAA'};
        default: return {...revealedTileButton, backgroundColor: 'pink'}; // should not happen
      }
    }
    else
      return tileButtonStyles;
  };

  const handleTouchStart = () => {
    setLeftMouseButtonDownDate(new Date());
  }

  const handleTouchEnd = () => {
    const now = new Date();
    const elapsed = now - leftMouseButtonDownDate;

    setLeftMouseButtonDownDate(0);
    if (elapsed > 500) // longpress
      props.handleLongPressTile(props.j, props.i);
    else
      props.handleTileClick(props.j, props.i);
  }

  const handleMouseDown = (e) => {
    if(e.buttons === 2)
      props.handleLongPressTile(props.j, props.i);
    else
      props.handleTileClick(props.j, props.i);
  }

  return (
    <button 
      disabled={props.tile.status === 'shown' ? true : false}
      className={styles.tileButton}
      style={getTileStyle(props.tile)}
      onContextMenu={e => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {getTileView(props.tile)}
    </button>
  )
}

import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export const boardSize = 8;
export const charsUser = [Bowman, Swordsman, Magician];
export const charsComp = [Daemon, Undead, Vampire];
export const charsUserByType = { bowman: Bowman, swordsman: Swordsman, magician: Magician };
export const charsCompByType = { daemon: Daemon, undead: Undead, vampire: Vampire };
export const charsByType = {
  bowman: Bowman,
  swordsman: Swordsman,
  magician: Magician,
  daemon: Daemon,
  undead: Undead,
  vampire: Vampire,
};

// const startUserPositions = [...Array(boardSize).keys()].map((elm) => elm * boardSize);
const startUserPositions = [];
const startCompPositions = [];

for (let i = 0; i < boardSize; i++) {
  startUserPositions.push(i * boardSize);
  startUserPositions.push(i * boardSize + 1);
  startCompPositions.push((i + 1) * boardSize - 2);
  startCompPositions.push((i + 1) * boardSize - 1);
}

export { startCompPositions, startUserPositions };

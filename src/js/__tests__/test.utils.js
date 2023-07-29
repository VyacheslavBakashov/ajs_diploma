import { calcTileType, getMoveCells, getAttackCells } from '../utils';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import PositionedCharacter from '../PositionedCharacter';

test.each([
  [0, 'top-left'],
  [7, 'top-right'],
  [56, 'bottom-left'],
  [63, 'bottom-right'],
  [3, 'top'],
  [58, 'bottom'],
  [8, 'left'],
  [15, 'right'],
  [10, 'center'],
])('check function calcTileType from utils.js', (input, result) => {
  const received = calcTileType(input, 8);

  expect(received).toBe(result);
});

test.each([
  [new Bowman(1), 0, [1, 2, 8, 9, 16, 18]],
  [new Daemon(1), 19, [10, 11, 12, 18, 20, 26, 27, 28]],
  [new Magician(1), 58, [49, 50, 51, 57, 59]],
  [new Swordsman(1), 16, [
    0, 2, 8, 9, 17, 18,
    19, 20, 24, 25, 32, 34,
    40, 43, 48, 52,
  ]],
  [new Undead(1), 7, [
    3, 4, 5, 6, 14,
    15, 21, 23, 28, 31,
    35, 39,
  ]],
  [new Vampire(1), 20, [
    2, 4, 6, 11, 12, 13,
    18, 19, 21, 22, 27, 28,
    29, 34, 36, 38,
  ]],
])('check movement ranges for characters', (char, position, result) => {
  const posChar = new PositionedCharacter(char, position);
  const received = getMoveCells(posChar);

  expect(received).toEqual(result);
});

test.each([
  [new Bowman(1), 0, [1, 2, 8, 9, 10, 16, 17, 18]],
  [new Daemon(1), 19, [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
    49, 50, 51, 52, 53, 54, 55,
  ]],
  [new Magician(1), 58, [
    24, 25, 26, 27, 28, 29, 30, 32, 33,
    34, 35, 36, 37, 38, 40, 41, 42, 43,
    44, 45, 46, 48, 49, 50, 51, 52, 53,
    54, 56, 57, 59, 60, 61, 62,
  ]],
  [new Swordsman(1), 16, [8, 9, 17, 24, 25]],
  [new Undead(1), 7, [6, 14, 15]],
  [new Vampire(1), 20, [
    2, 3, 4, 5, 6, 10, 11, 12,
    13, 14, 18, 19, 21, 22, 26, 27,
    28, 29, 30, 34, 35, 36, 37, 38,
  ]],
])('check attack ranges for characters', (char, position, result) => {
  const posChar = new PositionedCharacter(char, position);
  const received = getAttackCells(posChar);

  expect(received).toEqual(result);
});

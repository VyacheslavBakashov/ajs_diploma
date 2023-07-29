import { getMoveCells, getAttackCells } from './utils';

export default class GameState {
  constructor() {
    this.level = 1;
    this.charsPositioned = [];
    this.selectedChar = null;
    this.userTurn = null;
  }

  resetToInitial() {
    this.level = 1;
    this.charsPositioned = [];
    this.selectedChar = null;
    this.userTurn = null;
  }

  getRangesForChar() {
    const char = this.selectedChar;
    char.moveCells = getMoveCells(char);
    char.attackCells = getAttackCells(char);
  }
}

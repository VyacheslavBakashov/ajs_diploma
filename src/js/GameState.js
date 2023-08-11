import { getMoveCells, getAttackCells } from './utils';
import { generateTeam } from './generators';

export default class GameState {
  constructor() {
    this.level = 1;
    this.userTeam = null;
    this.compTeam = null;
    this._selectedChar = null;
    this.userTurn = null;
    this.gameOver = false;
    this.currentScore = 0;
    this._bestScore = 0;
  }

  get bestScore() {
    return this._bestScore;
  }

  set bestScore(value) {
    if (value > this._bestScore) {
      this._bestScore = value;
    }
  }

  calcScore() {
    const userChars = this.userTeam.charsAtPositions;
    const res = userChars.reduce((sum, current) => sum + current.character.health, 0);
    return Math.round(res * 1.1 ** (this.level - 1), 0);
  }

  get charsPositioned() {
    return this.updateCharsAtPositions();
  }

  get selectedChar() {
    return this._selectedChar;
  }

  set selectedChar(char) {
    this._selectedChar = char;
    if (char) {
      this.getRangesForChar();
    }
  }

  resetToInitial() {
    this.level = 1;
    this.userTeam = null;
    this.compTeam = null;
    this._selectedChar = null;
    this.userTurn = null;
    this.gameOver = false;
    this.currentScore = 0;
  }

  setState(data) {
    this.level = data.level;
    this.userTeam = generateTeam([], this.level, 0);
    this.compTeam = generateTeam([], this.level, 0, false);

    this.userTeam.createPosCharFromData(data.userTeam.charsAtPositions);
    this.compTeam.createPosCharFromData(data.compTeam.charsAtPositions);

    this._selectedChar = null;
    this.userTurn = null;
    this.gameOver = false;
    this.currentScore = data.currentScore;
    this._bestScore = data._bestScore;
  }

  getRangesForChar() {
    const char = this._selectedChar;
    char.moveCells = getMoveCells(char);
    char.attackCells = getAttackCells(char);
  }

  updateCharsAtPositions() {
    return [...this.userTeam.charsAtPositions, ...this.compTeam.charsAtPositions];
  }

  nextLevelUp() {
    this.currentScore += this.calcScore();
    this.level++;
    this.userTeam.charsAtPositions.forEach((char) => char.character.levelUp(this.level));
  }

  setGameOver() {
    this.bestScore = this.currentScore + this.calcScore();
    this.userTeam.charsAtPositions = [];
    this.compTeam.charsAtPositions = [];
    this.gameOver = true;
  }
}

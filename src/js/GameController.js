import thems from './themes';
import GameState from './GameState';
import { getStartPositions } from './utils';
import {
  startCompPositions, startUserPositions, charsComp, charsUser, typesUser,
} from './constants';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import { generateTeam } from './generators';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(thems.prairie);
    this.start();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
  }

  start(charNum = 3, charsAtPosinions = []) {
    const compTeam = generateTeam(charsComp, 1, charNum);
    const userTeam = generateTeam(charsUser, 1, charNum);
    const compPos = getStartPositions(startCompPositions, charNum);
    const userPos = getStartPositions(startUserPositions, charNum);

    this.gameState.charsPositioned = charsAtPosinions;

    this.gameState.resetToInitial();
    this.gamePlay.deselectAllCells();

    compTeam.characters.forEach((char, index) => {
      this.gameState.charsPositioned.push(new PositionedCharacter(char, compPos[index]));
    });
    userTeam.characters.forEach((char, index) => {
      this.gameState.charsPositioned.push(new PositionedCharacter(char, userPos[index]));
    });
    this.gamePlay.redrawPositions(this.gameState.charsPositioned);
  }

  onNewGameClick() {
    this.start();
  }

  onCellClick(index) {
    const prevChar = this.gameState.selectedChar;
    const charIntoCell = this.checkCharIntoCell(index);

    if (GameController.isAlly(charIntoCell)) {
      if (prevChar) {
        this.gamePlay.deselectCell(prevChar.position);
      }

      this.gamePlay.selectCell(charIntoCell.position);
      this.gameState.selectedChar = charIntoCell;
      this.gameState.getRangesForChar();
    } else if (charIntoCell) {
      GamePlay.showError('Это персонаж противника');
    }

    // movement
    const currentChar = this.gameState.selectedChar;
    const checkMoveCells = currentChar.moveCells.includes(index);

    if (currentChar && !charIntoCell && checkMoveCells) {
      const prevPosition = currentChar.position;
      this.gamePlay.deselectCell(prevPosition);
      currentChar.position = index;
      this.gamePlay.selectCell(currentChar.position);

      this.gameState.getRangesForChar();
      this.gamePlay.redrawPositions(this.gameState.charsPositioned);
    }
  }

  onCellEnter(index) {
    // const prevChar = this.gameState.selectedChar;
    const charIntoCell = this.checkCharIntoCell(index);
    const char = this.gameState.selectedChar;
    if (GameController.isAlly(charIntoCell)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (charIntoCell && char && char.attackCells.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    if (!charIntoCell && char) {
      if (char.moveCells.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      }
    }

    if (charIntoCell) {
      const msg = GameController.getCharInfo(charIntoCell.character);
      this.gamePlay.showCellTooltip(msg, index);
    }
  }

  onCellLeave(index) {
    // const charIntoCell = this.checkCharIntoCell(index);
    const selChar = this.gameState.selectedChar;
    if (selChar && selChar.position !== index) {
      this.gamePlay.deselectCell(index);
    }

    // if (charIntoCell) {
    //   this.gamePlay.hideCellTooltip(index);
    // } else {
    //   this.gamePlay.deselectCell(index);
    // }
  }

  checkCharIntoCell(index) {
    return this.gameState.charsPositioned.find((el) => el.position === index);
  }

  static isAlly(charPosinioned) {
    return charPosinioned ? typesUser.includes(charPosinioned.character.type) : false;
  }

  static getCharInfo(character) {
    const { level, attack, defence, health } = character;
    return `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
  }
}

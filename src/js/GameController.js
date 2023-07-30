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

    this.gameState.userTurn = true;
  }

  onNewGameClick() {
    this.start();
  }

  onCellClick(index) {
    const prevChar = this.gameState.selectedChar;
    const charIntoCell = this.checkCharIntoCell(index);

    if (!this.gameState.selectedChar && !GameController.isAlly(charIntoCell)) {
      GamePlay.showError('Это персонаж противника');
      return;
    }

    if (GameController.isAlly(charIntoCell)) {
      if (prevChar) {
        this.gamePlay.deselectCell(prevChar.position);
      }

      this.gamePlay.selectCell(charIntoCell.position);
      this.gameState.selectedChar = charIntoCell;
      this.gameState.getRangesForChar();
    } else if (charIntoCell) {
      this.attackAction(charIntoCell, index);
      // GamePlay.showError('attack');
    }

    // movement
    const currentChar = this.gameState.selectedChar;

    if (currentChar && !charIntoCell) {
      this.moveAction(currentChar, index);
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

  // attackLogic() {

  // }

  attackAction(target, index) {
    const attacker = this.gameState.selectedChar.character;
    const attackRange = this.gameState.selectedChar.attackCells;
    if (attackRange.includes(index)) {
      const charTarget = target.character;
      const damage = Math.max(attacker.attack - charTarget.defence, attacker.attack * 0.1);

      charTarget.health -= damage;
      this.checkAlive(target);
      this.nextTurn();
      // console.log(charTarget.health);
    }
  }

  moveAction(currentCharacter, index) {
    const checkMoveCells = currentCharacter.moveCells.includes(index);
    if (checkMoveCells) {
      const prevPosition = currentCharacter.position;
      this.gamePlay.deselectCell(prevPosition);
      currentCharacter.position = index;
      // this.gamePlay.selectCell(currentCharacter.position);

      this.gameState.getRangesForChar();
      this.gamePlay.redrawPositions(this.gameState.charsPositioned);

      // end movement of user
      // this.gameState.userTurn = false;
      // this.gamePlay.deselectAllCells();
      // this.gameState.selectedChar = null;
      this.nextTurn();
    }
  }

  nextTurn() {
    this.gameState.userTurn = !this.gameState.userTurn;
    this.gamePlay.deselectAllCells();
    this.gameState.selectedChar = null;
    // console.log(this.gameState.userTurn);
  }

  // comp turn

  getCompCharacters() {
    const compChars = this.gameState.charsPositioned.filter((char) => !GameController.isAlly(char));
    return compChars;
  }

  // check character health and delete him from board if health less than 0
  checkAlive(target) {
    const chars = this.gameState.charsPositioned;
    if (target.character.health <= 0) {
      this.gameState.charsPositioned = chars.filter((elm) => elm.position !== target.position);
    }
    this.gamePlay.redrawPositions(this.gameState.charsPositioned);
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

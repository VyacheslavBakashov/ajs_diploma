import thems from './themes';
import GameState from './GameState';
import { charsComp, charsUser } from './constants';
import GamePlay from './GamePlay';
import { generateTeam } from './generators';
import cursors from './cursors';
import { getAttackCells, getRandomInt } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    this.start();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  load(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.gameState[key] = value;
    });
  }

  start(data = null) {
    // first start
    const charsNum = this.gameState.level + 1;
    if (!data) {
      if (this.gameState.level > 1) {
        const userCharsToLevelUp = this.gameState.userTeam.characters;
        const existingCharsNum = userCharsToLevelUp.length;
        const additionalChars = Math.max(0, charsNum - existingCharsNum);
        const newUserTeam = generateTeam(charsUser, this.gameState.level, additionalChars);
        newUserTeam.addAll(userCharsToLevelUp);
        this.gameState.userTeam = newUserTeam;
      } else {
        this.gameState.userTeam = generateTeam(charsUser, this.gameState.level, charsNum);
      }

      this.gameState.compTeam = generateTeam(charsComp, this.gameState.level, charsNum, false);
    } else {
      // this.gameState = data;
      this.gameState.setState(data);
    }
    this.gamePlay.drawUi(thems[Object.keys(thems)[(this.gameState.level - 1) % 4]]);

    this.gamePlay.deselectAllCells();
    this.gamePlay.redrawPositions(this.gameState.charsPositioned);
    this.gameState.userTurn = true;
  }

  onNewGameClick() {
    this.gameState.resetToInitial();
    this.start();
  }

  async onCellClick(index) {
    if (this.gameState.gameOver) { return; }

    const prevChar = this.gameState.selectedChar;
    const charIntoCell = this.checkCharIntoCell(index);
    const compCheckPos = this.gameState.compTeam.checkCharsPos(index);
    const userCheckPos = this.gameState.userTeam.checkCharsPos(index);

    if (!this.gameState.selectedChar && compCheckPos) {
      GamePlay.showError('Это персонаж противника');
      return;
    }

    if (userCheckPos) {
      if (prevChar) {
        this.gamePlay.deselectCell(prevChar.position);
      }

      this.gamePlay.selectCell(charIntoCell.position);
      this.gameState.selectedChar = charIntoCell;
    } else if (compCheckPos) {
      if (!this.gameState.selectedChar.attackCells.includes(index)) { return; }

      await this.attackAction(charIntoCell, index);
      this.compLogic();
    } else {
      if (!this.gameState.selectedChar && !this.checkCharIntoCell()) { return; }
      if (!this.gameState.selectedChar.moveCells.includes(index)) { return; }

      // movement
      this.moveAction(index);
      this.compLogic();
    }
  }

  onCellEnter(index) {
    const charIntoCell = this.checkCharIntoCell(index);
    const char = this.gameState.selectedChar;
    const userCheckPos = this.gameState.userTeam.checkCharsPos(index);

    if (userCheckPos) {
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
    const selChar = this.gameState.selectedChar;

    if (selChar && selChar.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  compLogic() {
    const compChars = this.gameState.compTeam.charsAtPositions;
    const userChars = this.gameState.userTeam.charsAtPositions;

    const charCompCanAttack = compChars.map((char) => {
      const targetsArr = [];

      for (const userChar of userChars) {
        if (getAttackCells(char).includes(userChar.position)) { targetsArr.push(userChar); }
      }

      return { attacker: char, targets: targetsArr };
    });

    const objToAttack = charCompCanAttack.find((elm) => elm.targets.length > 0);

    if (objToAttack) {
      // comp attack
      this.gameState.selectedChar = objToAttack.attacker;
      const target = objToAttack.targets[0];
      this.attackAction(target, target.position);
    } else if (!this.gameState.userTurn) {
      // comp move
      const randChar = compChars[getRandomInt(compChars.length)];
      this.gameState.selectedChar = randChar;
      const availableCellsToMove = this.gameState.selectedChar.moveCells;
      const indexToMove = availableCellsToMove[getRandomInt(availableCellsToMove.length)];
      this.moveAction(indexToMove);
    }
  }

  findTargets(char) {
    const userChars = this.gameState.userTeam.charsAtPositions;
    const targetsArr = [];
    for (const userChar of userChars) {
      if (char.attackCells.includes(userChar.position)) {
        targetsArr.push(userChar);
      }
    }
    return targetsArr ? { attacker: char, targets: targetsArr } : null;
  }

  async attackAction(target, index) {
    const attacker = this.gameState.selectedChar.character;
    const attackRange = this.gameState.selectedChar.attackCells;

    if (attackRange.includes(index)) {
      const tgt = target.character;
      const damage = Math.round(Math.max(attacker.attack - tgt.defence, attacker.attack * 0.1), 0);
      tgt.health -= damage;
      await this.gamePlay.showDamage(index, damage);
      this.checkAlive(target);
      this.nextTurn();
    }
  }

  moveAction(index) {
    const currentCharacter = this.gameState.selectedChar;
    const charIntoCell = this.checkCharIntoCell(index);

    if (currentCharacter && !charIntoCell) {
      const checkMoveCells = currentCharacter.moveCells.includes(index);

      if (checkMoveCells) {
        const prevPosition = currentCharacter.position;
        this.gamePlay.deselectCell(prevPosition);
        currentCharacter.position = index;
        this.gameState.getRangesForChar();
        this.gamePlay.redrawPositions(this.gameState.charsPositioned);
        this.nextTurn();
      }
    }
  }

  nextTurn() {
    this.gameState.userTurn = !this.gameState.userTurn;
    this.gamePlay.deselectAllCells();
    this.gameState.selectedChar = null;
    if (this.gameState.compTeam.isEmpty()) {
      this.nextLevel();
      this.gameState.userTurn = true;
    } else if (this.gameState.userTeam.isEmpty()) {
      this.gameState.setGameOver();
      this.gamePlay.redrawPositions(this.gameState.charsPositioned);
      GamePlay.showMessage('Game Over');
    }
  }

  // check character health and delete him from board if health less than 0
  checkAlive(target) {
    const underAttackUser = this.gameState.userTeam.charsAtPositions.includes(target);
    if (target.character.health <= 0) {
      if (underAttackUser) {
        this.gameState.userTeam.removeChar(target);
      } else {
        this.gameState.compTeam.removeChar(target);
      }
    }
    this.gamePlay.redrawPositions(this.gameState.charsPositioned);
  }

  checkCharIntoCell(index) {
    return this.gameState.charsPositioned.find((el) => el.position === index);
  }

  nextLevel() {
    this.gameState.nextLevelUp();
    if (this.gameState.level < 5) {
      this.start();
    } else {
      this.gameState.setGameOver();
      this.gamePlay.redrawPositions(this.gameState.charsPositioned);
      GamePlay.showMessage('Game Over, You Won!!');
    }
  }

  static getCharInfo(character) {
    const { level, attack, defence, health } = character;
    return `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Game has been saved!');
  }

  onLoadGameClick() {
    if (this.stateService.storage.length) {
      this.start(this.stateService.load());
      setTimeout(() => GamePlay.showMessage('Saved game has been loaded!'), 200);
    } else {
      GamePlay.showMessage('There is no saved game in local storage');
    }
  }
}

import { startCompPositions, startUserPositions, charsByType } from './constants';
import PositionedCharacter from './PositionedCharacter';
import { getRandomPositions } from './utils';

/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  static compStartPos = startCompPositions;

  static userStartPos = startUserPositions;

  constructor(chars, userTeam = true) {
    this.userTeam = userTeam;
    this.charsAtPositions = this.#arrangeChars(chars, true);
  }

  get characters() {
    return this.charsAtPositions.map((elm) => elm.character);
  }

  checkCharsPos(index) {
    return this.getCurrentPos().includes(index);
  }

  removeChar(char) {
    const teamChars = this.charsAtPositions;
    this.charsAtPositions = teamChars.filter((elm) => elm !== char);
  }

  add(char) {
    this.#arrangeChars([char]).map((elm) => this.charsAtPositions.push(elm));
  }

  addAll(chars) {
    this.#arrangeChars(chars).map((elm) => this.charsAtPositions.push(elm));
  }

  #getStartPositions() {
    return this.userTeam ? Team.userStartPos : Team.compStartPos;
  }

  getCurrentPos() {
    return this.charsAtPositions.map((elm) => elm.position);
  }

  #arrangeChars(chars, firstCall = false) {
    const arr = [];
    const startPos = this.#getStartPositions();
    const existPos = firstCall ? [] : this.getCurrentPos();
    const posArr = getRandomPositions(startPos, chars.length, existPos);
    chars.forEach((char, index) => {
      arr.push(new PositionedCharacter(char, posArr[index]));
    });
    return arr;
  }

  getCharWithMaxProp(property) {
    const maxProp = Math.max(...this.charsAtPositions.map((elm) => elm.character[property]));
    return this.charsAtPositions.find((char) => char.character[property] === maxProp);
  }

  getCharWithMinProp(property) {
    const minProp = Math.min(...this.charsAtPositions.map((elm) => elm.character[property]));
    return this.charsAtPositions.find((char) => char.character[property] === minProp);
  }

  getCharAtPos(index) {
    return this.charsAtPositions.find((char) => char.position === index);
  }

  isEmpty() {
    return this.charsAtPositions.length === 0;
  }

  createPosCharFromData(positionedDataArr) {
    positionedDataArr.forEach((positionedData) => {
      const { position, character } = positionedData;
      const { type } = character;
      const char = new charsByType[type](character.level);

      Object.entries(character).forEach(([key, val]) => {
        char[key] = val;
      });

      this.charsAtPositions.push(new PositionedCharacter(char, position));
    });
  }
}

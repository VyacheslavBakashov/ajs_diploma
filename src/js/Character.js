/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = 1;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (new.target.name === 'Character') {
      throw new Error('new Character() is not allowed');
    }
  }

  levelUp(level) {
    const prevLevel = this.level;

    if (level > 1) {
      for (let i = prevLevel; i < level; i++) {
        this.level++;
        this.attack = this.#levelUpProp(this.attack);
        this.defence = this.#levelUpProp(this.defence);
        this.health = Math.min(100, this.health + 80);
      }
    }
  }

  #levelUpProp(prop) {
    return Math.round(Math.max(prop, prop * ((this.health + 80) / 100)), 0);
  }
}

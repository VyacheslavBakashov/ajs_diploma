import Character from '../Character';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test.each([
  [Bowman, {
    level: 1, attack: 25, defence: 25, health: 50, type: 'bowman', attackRange: 2, movementRange: 2,
  }],
  [Magician, {
    level: 1, attack: 10, defence: 40, health: 50, type: 'magician', attackRange: 4, movementRange: 1,
  }],
  [Swordsman, {
    level: 1, attack: 40, defence: 10, health: 50, type: 'swordsman', attackRange: 1, movementRange: 4,
  }],
  [Daemon, {
    level: 1, attack: 10, defence: 10, health: 50, type: 'daemon', attackRange: 4, movementRange: 1,
  }],
  [Undead, {
    level: 1, attack: 40, defence: 10, health: 50, type: 'undead', attackRange: 1, movementRange: 4,
  }],
  [Vampire, {
    level: 1, attack: 25, defence: 25, health: 50, type: 'vampire', attackRange: 2, movementRange: 2,
  }],
])('check childrens for class Character', (Char, exp) => {
  const input = new Char(1);

  expect(input).toEqual(exp);
});

test('check throw error for new Character', () => {
  expect(() => new Character(1)).toThrowError(new Error('new Character() is not allowed'));
});

import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import { characterGenerator, generateTeam } from '../generators';

test('Check character generator for created character', () => {
  const charactersUser = [Bowman];
  const input = characterGenerator(charactersUser, 1);

  expect(input.next().value).toEqual(new Bowman(1));
});

test('Check character generator for infinite generation', () => {
  const charactersUser = [Bowman, Swordsman];
  const playerGenerator = characterGenerator(charactersUser, 1);
  const char1 = playerGenerator.next().value;
  const char2 = playerGenerator.next().value;
  const char3 = playerGenerator.next().value;
  const char4 = playerGenerator.next().value;
  const chars = [char1, char2, char3, char4];
  const exp = ['bowman', 'swordsman'];

  expect(chars.every((elm) => exp.includes(elm.type))).toBe(true);
});

test('check function to generate team', () => {
  const charactersUser = [Bowman, Swordsman, Magician];
  const input = generateTeam(charactersUser, 2, 3);

  expect(input.characters.length).toBe(3);
  expect(input.characters.every((char) => char.level < 3)).toBe(true);
});

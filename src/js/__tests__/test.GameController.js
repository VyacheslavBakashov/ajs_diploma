import Bowman from '../characters/Bowman';
import GameController from '../GameController';

test('check get character info', () => {
  const bowman = new Bowman(1);
  const res = `\u{1F396}${bowman.level} \u{2694}${bowman.attack} \u{1F6E1}${bowman.defence} \u{2764}${bowman.health}`;

  expect(GameController.getCharInfo(bowman)).toEqual(res);
});

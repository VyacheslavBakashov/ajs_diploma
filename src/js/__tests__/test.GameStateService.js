import GameStateService from '../GameStateService';
import storageMock from '../mocks/localStorage.json';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('check load', () => {
  const stateService = new GameStateService();
  stateService.load.mockReturnValue(storageMock);
  const received = stateService.load();
  expect(received).toEqual(storageMock);
});

test('error for loading', () => {
  const stateService = new GameStateService();

  expect(() => {
    const received = stateService.load.mockReturnValue(new Error('Invalid state'));
    // stateService.save();
    expect(received).toThrow();
  });
});

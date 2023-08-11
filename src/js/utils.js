/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const topRight = boardSize - 1;
  const topLeft = 0;
  const bottomRight = boardSize ** 2 - 1;
  const bottomLeft = boardSize ** 2 - boardSize;

  if (index === topLeft) {
    return 'top-left';
  }
  if (index === topRight) {
    return 'top-right';
  }
  if (index === bottomLeft) {
    return 'bottom-left';
  }
  if (index === bottomRight) {
    return 'bottom-right';
  }
  if (index > topLeft && index < topRight) {
    return 'top';
  }
  if (index > bottomLeft && index < bottomRight) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if (index % boardSize === topRight) {
    return 'right';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getRandomPositions(allowedPositions, count, existingPositions = []) {
  const positions = new Set();
  while (positions.size < count) {
    const randIndex = getRandomInt(allowedPositions.length);
    if (!existingPositions.includes(allowedPositions[randIndex])) {
      positions.add(allowedPositions[randIndex]);
    }
  }
  return Array.from(positions);
}

export function createBoard(size) {
  return [...Array(size ** 2).keys()].map((elm) => elm);
}

function getRow(position, size) {
  return Math.floor(position / size, 0);
}

function getCol(position, size) {
  return position % size;
}

export function getAttackCells(charPosinioned, size = 8) {
  const { character, position } = charPosinioned;
  const attackRng = character.attackRange;
  const cellsArr = [];
  const board = createBoard(size);
  const row = getRow(position, size);
  const col = getCol(position, size);

  for (const i of board) {
    const rc = getRow(i, size);
    const cc = getCol(i, size);
    if (Math.abs(cc - col) <= attackRng && Math.abs(rc - row) <= attackRng) {
      if (i !== position) {
        cellsArr.push(i);
      }
    }
  }
  return cellsArr;
}

export function getMoveCells(charPosinioned, size = 8) {
  const { character, position } = charPosinioned;
  const move = character.movementRange;
  const cellsArr = [];
  const board = createBoard(size);
  const row = getRow(position, size);
  const col = getCol(position, size);

  for (const i of board) {
    const rc = Math.floor(i / size, 0);
    const cc = i % size;
    if (Math.abs(cc - col) <= move && Math.abs(rc - row) <= move) {
      if ((Math.abs(col - cc) === Math.abs(row - rc))) {
        cellsArr.push(i);
      } else if ((rc === row || cc === col)) {
        cellsArr.push(i);
      }
    }
  }
  cellsArr.splice(cellsArr.indexOf(position), 1);
  return cellsArr;
}

export function forNumSort(a, b) {
  return a - b;
}

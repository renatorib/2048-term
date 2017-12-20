import { clone, pipe, equals, flatten, reduce } from 'ramda'

// directions keywords
export const directions = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
}

// directions mapped to cartesian coodinates offset moves
export const offsets = {
  [directions.LEFT]: [-1, 0],
  [directions.RIGHT]: [+1, 0],
  [directions.UP]: [0, -1],
  [directions.DOWN]: [0, +1],
}

// move a coordinate
// ex.: moveCoord('right', [2, 2]) -> [3, 2]
//      moveCoord('up', [2, 2]) -> [2, 1]
const moveCoord = (direction, coord) =>
  offsets[direction].map((offset, i) => offset + coord[i])

/* tiles */

const createKey = () =>
  Math.random()
    .toString(36)
    .substr(2, 8)

export const newTile = ({
  // key is a unique hash for each tile
  // when tile is moved the key dont change
  // it's great to track the tile movement before/after
  // and can be used to animate
  key = createKey(),
  // value is the tile value: 0, 2, 4, 8, 16...
  // 0 means empty
  value = 0,
  // locked is a state to game look know if
  // tile can me merged
  locked = false,
  // the score of title, used to
  // calculate the score of board
  score = 0,
}) => ({ key, value, locked, score })

export const mergeTiles = (tile, target) =>
  newTile({
    locked: true,
    value: tile.value + target.value,
    score: tile.value + target.value + tile.score + target.score,
    key: tile.key,
  })

export const mapMatrix = fn => board =>
  clone(board).map((row, y) => row.map((tile, x) => fn(tile, x, y)))

export const mapTiles = mapMatrix

export const eachMatrixValue = fn => board =>
  clone(board).forEach((row, y) => row.forEach((tile, x) => fn(tile, x, y)))

export const eachTile = eachMatrixValue

export const emptyTiles = board => {
  const positions = []

  eachTile((tile, x, y) => {
    if (tile.value === 0) positions.push([x, y])
  })(board)

  return positions
}

export const randomEmptyTile = board => {
  const positions = emptyTiles(board)
  const chosen = positions[Math.floor(Math.random() * positions.length)]

  return typeof chosen === 'undefined' ? false : chosen
}

/* board */

export const emptyBoard = (size = 4) =>
  Array(size)
    .fill()
    .map(() =>
      Array(size)
        .fill()
        .map(() => newTile({}))
    )

export const newBoard = (size = 4) =>
  pipe(emptyBoard, spawnTile, spawnTile)(size)

export const matrixToBoard = matrix =>
  mapMatrix(value => newTile({ value }))(matrix)

export const values = board => mapTiles(tile => tile.value)(board)

export const flatValues = board => pipe(values, flatten)(board)

export const spawnTile = board => {
  const cloned = clone(board)
  const position = randomEmptyTile(cloned)
  const value = Math.random() <= 0.1 ? 4 : 2

  if (position) {
    const [x, y] = position
    cloned[y][x] = newTile({ value })
  }

  return cloned
}

export const moveBoard = (direction, coord = [0, 0], turn = 1) => board => {
  // calculate target coordinate based on direction
  const [x, y] = coord
  const [tx, ty] = moveCoord(direction, coord)

  // clone board to safely mutate the tiles
  const cloned = clone(board)
  const tile = cloned[y][x]
  const target = cloned[ty] && cloned[ty][tx]

  if (!target) {
    // tile do not have a target
    // it's already on the right wall
  } else if (
    tile.value > 0 &&
    target.value === tile.value &&
    !target.locked &&
    !tile.locked
  ) {
    // tile and target tile have same value and both are unlocked
    // time to merge tile in target tile
    cloned[ty][tx] = mergeTiles(tile, target)
    cloned[y][x] = newTile({})
  } else if (tile.value > 0 && target.value === 0) {
    // previous tile is empty, time to move!
    cloned[ty][tx] = newTile({ ...tile })
    cloned[y][x] = newTile({})
  } else {
    // otherwise, we can't move it, keep the tile intact.
  }

  if (cloned[y][x + 1]) {
    // keep moving tiles from row
    return moveBoard(direction, [x + 1, y], turn)(cloned)
  } else if (cloned[y + 1]) {
    // now, lets to next row
    return moveBoard(direction, [0, y + 1], turn)(cloned)
  } else if (turn < cloned[0].length - 1) {
    // new turn of row tile moving
    return moveBoard(direction, [0, 0], turn + 1)(cloned)
  }

  // our work is done, unlock all tiles
  // and return fresh-new moved board
  return mapTiles(tile => ({ ...tile, locked: false }))(cloned)
}

export const canMoveBoard = direction => board => {
  const moved = moveBoard(direction)(clone(board))
  return !equals(flatValues(board), flatValues(moved))
}

export const scoreBoard = board =>
  pipe(clone, flatten, reduce((value, tile) => value + tile.score, 0))(board)

export const isGameOver = board => {
  return !Object.values(directions).some(dir => canMoveBoard(dir)(board))
}

/* game */

export const newGameState = (size = 4) => ({
  board: newBoard(size),
  gameOver: false,
  score: 0,
  scoreEarned: 0,
  moves: 0,
})

export const move = direction => prevState => {
  if (!canMoveBoard(direction)(prevState.board)) {
    return clone(prevState)
  }

  const board = pipe(moveBoard(direction), spawnTile)(prevState.board)
  const gameOver = isGameOver(board)
  const score = scoreBoard(board)
  const scoreEarned = score - prevState.score
  const moves = prevState.moves + 1

  return { board, gameOver, score, scoreEarned, moves }
}

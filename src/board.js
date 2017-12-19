import { clone, pipe, equals, flatten } from 'ramda'
import { LEFT, UP, RIGHT, DOWN } from './directions'

const identity = board => clone(board)
const reverseRows = board => clone(board).map(row => row.reverse())
const transpose = board =>
  clone(board)[0].map((_, i) => clone(board).map(row => row[i]))

const parseInOut = {
  [LEFT]: { in: identity, out: identity },
  [UP]: { in: transpose, out: transpose },
  [RIGHT]: { in: reverseRows, out: reverseRows },
  [DOWN]: {
    in: pipe(transpose, reverseRows),
    out: pipe(reverseRows, transpose),
  },
}

export const mapTiles = fn => board =>
  clone(board).map((row, x) => row.map((tile, y) => fn(tile, x, y)))

export const eachTile = fn => board =>
  clone(board).forEach((row, x) => row.forEach((tile, y) => fn(tile, x, y)))

export const values = mapTiles(tile => tile.value)
export const flatValues = pipe(values, flatten)

export const newTile = ({ value = 0, locked = false, score = 0 } = {}) => ({
  value,
  locked,
  score,
})

export const newBoard = (size = 4) => {
  const emptyBoard = Array(size)
    .fill()
    .map(() =>
      Array(size)
        .fill()
        .map(() => newTile())
    )

  return pipe(spawn, spawn)(emptyBoard)
}

export const move = (
  direction,
  rowIdx = 0,
  tileIdx = 0,
  round = 1
) => board => {
  const parse = parseInOut[direction]
  const isFirstMove = rowIdx === 0 && tileIdx === 0 && round === 1

  // parse board if is first move
  const copy = isFirstMove ? parse.in(clone(board)) : clone(board)
  const row = clone(copy[rowIdx])
  const tile = row[tileIdx]
  const prevTile = row[tileIdx - 1]

  if (!prevTile) {
    // do not have previous tile, keep the tile intact.
  } else if (
    tile.value > 0 &&
    prevTile.value === tile.value &&
    !prevTile.locked &&
    !tile.locked
  ) {
    // tile and previous tile is same number and both unlocked
    // time to merge together in previous tile
    row[tileIdx - 1] = newTile({
      score: tile.value + prevTile.value + tile.score + prevTile.score,
      value: tile.value + prevTile.value,
      locked: true,
    })
    row[tileIdx] = newTile({})
  } else if (tile.value > 0 && prevTile.value === 0) {
    // previous tile is empty, time to move!
    row[tileIdx - 1] = newTile({ ...tile })
    row[tileIdx] = newTile({})
  } else {
    // otherwise, we can't move it, keep the tile intact.
  }

  copy[rowIdx] = row

  if (row[tileIdx + 1]) {
    // keep moving row tiles
    return move(direction, rowIdx, tileIdx + 1, round)(copy)
  } else if (round < row.length - 1) {
    // new round of row tile moving
    return move(direction, rowIdx, 0, round + 1)(copy)
  } else if (copy[rowIdx + 1]) {
    // now, lets to next row
    return move(direction, rowIdx + 1)(copy)
  }

  // parse out and unlock all tiles
  return pipe(parse.out, mapTiles(tile => ({ ...tile, locked: false })))(copy)
}

export const emptyTiles = board => {
  const positions = []

  eachTile((tile, x, y) => {
    if (tile.value === 0) positions.push({ x, y })
  })(board)

  return positions
}

export const randomEmptyTile = board => {
  const positions = emptyTiles(board)
  const chosen = positions[Math.floor(Math.random() * positions.length)]

  return typeof chosen === 'undefined' ? false : chosen
}

export const canMoveTo = direction => board => {
  const moved = move(direction)(clone(board))
  return !equals(flatValues(board), flatValues(moved))
}

export const isGameOver = board => {
  const directions = Object.values({ LEFT, UP, RIGHT, DOWN })
  return !directions.some(dir => canMoveTo(dir)(board))
}

export const score = board => {
  return flatten(clone(board)).reduce((sum, tile) => sum + tile.score, 0)
}

export const spawn = board => {
  const cloned = clone(board)
  const position = randomEmptyTile(cloned)
  const value = Math.random() <= 0.1 ? 4 : 2

  if (position) {
    const { x, y } = position
    cloned[x][y] = newTile({ value })
  }

  return cloned
}

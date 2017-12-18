import { pipe } from 'ramda'
import { LEFT, UP, RIGHT, DOWN } from './directions'

const identity = board => [...board]
const reverseRows = board => [...board].map(row => row.reverse())
const transpose = board =>
  [...board][0].map((_, i) => [...board].map(row => row[i]))

const parseInOut = {
  [LEFT]: { in: identity, out: identity },
  [UP]: { in: transpose, out: transpose },
  [RIGHT]: { in: reverseRows, out: reverseRows },
  [DOWN]: {
    in: pipe(transpose, reverseRows),
    out: pipe(reverseRows, transpose),
  },
}

// over board
export const over = fn => board => fn([...board])

// traverse tiles
export const traverse = fn => board =>
  board.map((row, x) => row.map((tile, y) => fn(tile, x, y)))

export const newTile = (value = 0, locked = false) => ({
  value,
  locked,
})

export const move = (
  direction,
  rowIdx = 0,
  tileIdx = 0,
  round = 1
) => board => {
  const parse = parseInOut[direction]
  const isFirstMove = rowIdx === 0 && tileIdx === 0 && round === 1

  // parse board if is first move
  const copy = isFirstMove ? parse.in(board) : [...board]
  const row = [...copy[rowIdx]]
  const tile = row[tileIdx]
  const prevTile = row[tileIdx - 1]

  if (!prevTile) {
    // do not have previous tile, keep the tile intact.
    row[tileIdx] = { ...tile }
  } else if (
    tile.value > 0 &&
    prevTile.value === tile.value &&
    !prevTile.locked &&
    !tile.locked
  ) {
    // tile and previous tile is same number and both unlocked
    // time to merge together in previous tile
    row[tileIdx - 1] = newTile(tile.value + prevTile.value, true)
    row[tileIdx] = newTile()
  } else if (tile.value > 0 && prevTile.value === 0) {
    // previous tile is empty, time to move!
    row[tileIdx - 1] = { ...tile }
    row[tileIdx] = newTile()
  } else {
    // otherwise, we can't move it, keep the tile intact.
    row[tileIdx] = { ...tile }
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
  return pipe(parse.out, traverse(tile => ({ ...tile, locked: false })))(copy)
}

export const replace = (x, y, tile) => board => {
  const copy = [...board]
  copy[x][y] = tile
  return copy
}

export const emptyTiles = board => {
  const positions = []
  traverse((tile, x, y) => {
    if (tile.value === 0) positions.push({ x, y })
  })(board)

  return positions
}

export const randomEmptyTile = board => {
  const positions = emptyTiles(board)
  const chosen = positions[Math.floor(Math.random() * positions.length)]
  return typeof chosen === 'undefined' ? false : chosen
}

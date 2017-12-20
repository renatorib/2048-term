import { h } from 'ink'
import Line from './Line'

/*
  Box-drawing characters
   ┌────┬────┬────┬────┐
   │────│────│────│────│
   ├────┼────┼────┼────┤
   │────│────│────│────│
   └────┴────┴────┴────┘
*/

const top = {
  left: '╭',
  edge: '┬',
  right: '╮',
  value: '────',
}

const bottom = {
  left: '╰',
  edge: '┴',
  right: '╯',
  value: '────',
}

const middle = {
  left: '├',
  edge: '┼',
  right: '┤',
  value: '────',
}

const tiles = {
  left: '│',
  edge: '│',
  right: '│',
}

const firstIndex = i => i === 0
const lastIndex = (i, arr) => i === arr.length - 1

const Row = ({ row, value, left, edge, right, p = 3 }) => (
  <Line p={p}>
    {row.map((tile, i) => (
      <span key={i}>
        {firstIndex(i) ? left : ''}
        {value || tile}
        {lastIndex(i, row) ? right : edge}
      </span>
    ))}
  </Line>
)

const Board = ({ board, p = 3 }) => {
  const output = []
  const dummyRow = board[0]

  board.forEach((row, i) => {
    if (firstIndex(i)) {
      output.push(<Row p={p} {...top} row={dummyRow} />)
    }

    output.push(<Row p={p} {...tiles} row={row} />)

    if (!lastIndex(i, row)) {
      output.push(<Row p={p} {...middle} row={dummyRow} />)
    } else {
      output.push(<Row p={p} {...bottom} row={dummyRow} />)
    }
  })

  return output
}

export default Board

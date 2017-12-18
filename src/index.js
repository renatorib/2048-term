import { h, render, Component, Text } from 'ink'
import { LEFT, UP, RIGHT, DOWN } from './directions'
import { move, newTile } from './board'

const testBoard = [[0, 2, 2, 0], [2, 4, 0, 0], [0, 0, 0, 2], [0, 0, 2, 2]]
const newBoard = matrix => matrix.map(r => r.map(v => newTile(v)))

class Game extends Component {
  state = {
    board: newBoard(testBoard),
    lastCmd: '',
  }

  handleKeyPress = (ch, key = {}) => {
    const direction = {
      left: LEFT,
      up: UP,
      right: RIGHT,
      down: DOWN,
    }[key.name]

    if (direction) {
      this.setState(prevState => ({
        lastCmd: key.name,
        board: move(direction)(prevState.board),
      }))
    }
  }

  componentDidMount() {
    process.stdin.on('keypress', this.handleKeyPress)
  }

  render() {
    const { board } = this.state

    return (
      <div>
        {board.map(r => r.map(v => v.value).join(', ')).join('\n')}
        {`\nCommand: ${this.state.lastCmd}`}
      </div>
    )
  }
}

render(<Game />)

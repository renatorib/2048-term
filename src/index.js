import { pipe } from 'ramda'
import { h, render, Component, Text } from 'ink'
import { LEFT, UP, RIGHT, DOWN } from './directions'
import leftPad from 'left-pad'

import { move, newBoard, canMoveTo, isGameOver, score, spawn } from './board'
import { setTimeout } from 'core-js/library/web/timers'

const colors = {
  0: '#222222',
  2: '#ffffff',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67b5f',
  64: '#7986CB',
  128: '#64B5F6',
  256: '#AED581',
  512: '#DCE775',
  1024: '#FFF176',
  2048: 'purple',
  4096: '#FFD54F',
  8192: '#E57373',
}

const newGameState = () => ({
  board: newBoard(),
  score: 0,
  gameOver: false,
  moves: 0,
  scoreToast: '',
})

const Line = ({ children, p = 0 }) => (
  <div>
    {Array(p)
      .fill(' ')
      .join('')}
    {children}
  </div>
)

const Section = ({ title, children }) => (
  <div>
    <div>
      <Line p={1}>
        <Text hex="#44ff44" bold>
          {title}
        </Text>
      </Line>
    </div>
    <span>{children}</span>
  </div>
)

const Key = ({ key, children, p = 0 }) => (
  <Line p={p}>
    <Text bold>{key}</Text>: {children}
  </Line>
)

class Game extends Component {
  state = newGameState()

  newGame = () => this.setState(newGameState())

  move = direction => {
    this.setState(({ board, moves }) => {
      const update = {}

      if (canMoveTo(direction)(board)) {
        update.board = pipe(move(direction), spawn)(board)
        update.score = score(update.board)
        update.moves = moves + 1

        const scoreDiff = update.score - score(board)
        scoreDiff > 0 && this.toast('scoreToast', `+${scoreDiff}`)

        if (isGameOver(update.board)) {
          update.gameOver = true
        }
      }

      return update
    })
  }

  toasts = {}
  toast = (key, value, time = 1000) => {
    if (this.toasts[key]) {
      clearTimeout(this.toasts[key])
    }

    this.setState({ [key]: value }, () => {
      this.toasts[key] = setTimeout(() => {
        this.setState({ [key]: '' })
      }, time)
    })
  }

  handleKeyPress = (ch, key = {}) => {
    const commands = {
      left: () => this.move(LEFT),
      up: () => this.move(UP),
      right: () => this.move(RIGHT),
      down: () => this.move(DOWN),
      n: () => this.newGame(),
    }

    const command = commands[key.name]
    command && command()
  }

  componentDidMount() {
    process.stdin.on('keypress', this.handleKeyPress)
  }

  renderBoard = () =>
    this.state.board.map((r, ri) => (
      <Line key={ri} p={3}>
        {r.map((v, ti) => (
          <Text key={ti} bgHex={colors[v.value]} hex="#222222">
            [{leftPad(v.value === 0 ? '' : v.value, 5)}]
          </Text>
        ))}
      </Line>
    ))

  render() {
    const { score, gameOver, scoreToast, moves } = this.state

    return (
      <span>
        <Section title="Keys">
          <Key p={3} key="[←] [→] [↑] [↓]">
            move
          </Key>
          <Key p={3} key="[n]">
            restart / new game
          </Key>
        </Section>
        <Section title="Game State">
          <Line p={3}>
            <Text>Moves</Text>: <Text yellow>{moves}</Text>
          </Line>
          <Line p={3}>
            <Text>Score</Text>: <Text green>{score}</Text>{' '}
            <Text hex="#999999">{scoreToast}</Text>
          </Line>
          {gameOver && (
            <span>
              <br />
              <Line p={3}>
                <Text hex="#ffffff" bgHex="#ff0000">
                  Game Over
                </Text>
              </Line>
            </span>
          )}
        </Section>
        <Section title="Game">{this.renderBoard()}</Section>
      </span>
    )
  }
}

render(<Game />)

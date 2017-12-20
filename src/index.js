import { h, render, Component, Text } from 'ink'
import leftPad from 'left-pad'

import Board from './ui/Board'
import Line from './ui/Line'

import { mapTiles, directions, newGameState, move } from './2048'
const { LEFT, UP, RIGHT, DOWN } = directions

const readableColor = hex => {
  if (!hex) return ''

  return parseInt(hex.replace('#', ''), 16) > 0xffffff / 2
    ? '#000000'
    : '#ffffff'
}

const colors = {
  0: null,
  2: '#ffffff',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#fd8546',
  32: '#ff6b84',
  64: '#9CA4D4',
  128: '#96CEFB',
  256: '#AED581',
  512: '#DCE775',
  1024: '#FFF176',
  2048: '#444444',
  4096: '#222222',
  8192: '#000000',
}

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
  state = {
    game: newGameState(),
    scoreToast: '',
  }

  newGame = () => this.setState({ game: newGameState() })

  move = direction =>
    this.setState(
      prevState => ({ game: move(direction)(prevState.game) }),
      this.didMove
    )

  didMove = () => {
    const { scoreEarned } = this.state.game

    this.setState({
      scoreToast: scoreEarned > 0 ? `+${scoreEarned}` : '',
    })
  }

  handleKeyPress = (ch, key = {}) => {
    const commands = {
      left: () => this.move(LEFT),
      a: () => this.move(LEFT),
      up: () => this.move(UP),
      w: () => this.move(UP),
      right: () => this.move(RIGHT),
      d: () => this.move(RIGHT),
      down: () => this.move(DOWN),
      s: () => this.move(DOWN),
      n: () => this.newGame(),
    }

    const command = commands[key.name]
    command && command()
  }

  componentDidMount() {
    process.stdin.on('keypress', this.handleKeyPress)
  }

  render() {
    const { scoreToast } = this.state
    const { board, score, gameOver, moves } = this.state.game

    return (
      <span>
        <Section title="Keys">
          <Key p={3} key="[←] [→] [↑] [↓]">
            move
          </Key>
          <Key p={3} key="[w] [a] [s] [d]">
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
            <Text hex="#666666">{scoreToast}</Text>
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
        <Section title="Game">
          <Board
            p={3}
            board={mapTiles(tile => {
              const color = colors[tile.value]

              return (
                <Text bgHex={color} hex={color && readableColor(color)}>
                  {leftPad(tile.value === 0 ? '' : tile.value, 4)}
                </Text>
              )
            })(board)}
          />
        </Section>
      </span>
    )
  }
}

render(<Game />)

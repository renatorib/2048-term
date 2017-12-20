import { h } from 'ink'

const Line = ({ children, p = 0 }) => (
  <div>
    {Array(p)
      .fill(' ')
      .join('')}
    {children}
  </div>
)

export default Line

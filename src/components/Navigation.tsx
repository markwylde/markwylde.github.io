import { Link } from 'react-router'

function Navigation() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/about" style={{ marginRight: '1rem' }}>About</Link>
      <Link to="/projects" style={{ marginRight: '1rem' }}>Projects</Link>
      <Link to="/contact" style={{ marginRight: '1rem' }}>Contact</Link>
    </nav>
  )
}

export default Navigation
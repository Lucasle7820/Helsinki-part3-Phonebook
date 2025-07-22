import { useEffect } from 'react'

const baseStyle = {
  padding: '1rem',
  margin: '1rem 0',
  borderRadius: '5px',
  fontWeight: 'bold',
  textAlign: 'center',
}

const successStyle = {
  ...baseStyle,
  color: 'green',
  background: '#e0ffe0',
  border: '1px solid green',
}

const errorStyle = {
  ...baseStyle,
  color: 'darkred',
  background: '#ffe0e0',
  border: '1px solid red',
}

const Notification = ({ message, setMessage, type = 'success' }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage({ message: '', type })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message, setMessage])

  if (!message) return null

  const style = type === 'error' ? errorStyle : successStyle

  return <div style={style}>{message}</div>
}

export default Notification
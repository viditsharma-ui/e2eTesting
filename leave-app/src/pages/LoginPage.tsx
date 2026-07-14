import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        setError('Invalid email or password')
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.user.role)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userEmail', data.user.email)

      // Redirect based on role
      if (data.user.role === 'employee') {
        navigate('/employee/dashboard')
      } else if (data.user.role === 'manager') {
        navigate('/manager/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '5px' }}
          />
        </div>

        {error && (
          <div
            id="toast-container"
            style={{ color: 'red', marginBottom: '15px' }}
          >
            {error}
          </div>
        )}

        <button id="loginBtn" type="submit" style={{ width: '100%' }}>
          Login
        </button>
      </form>
    </div>
  )
}

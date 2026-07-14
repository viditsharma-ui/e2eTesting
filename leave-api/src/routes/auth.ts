import express, { Router, Request, Response } from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { store } from '../store/data'

const router: Router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'leave-management-secret-key'

/**
 * POST /auth/login
 * Authenticates user with email and password, returns JWT token
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id, email, role } }
 */
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  // Find user by email
  const user = store.users.find((u) => u.email === email)

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  // Compare password with hashed password
  const isPasswordValid = bcryptjs.compareSync(password, user.password)

  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  // Generate JWT token (expires in 8 hours)
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  // Return token and user info
  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  })
})

export default router

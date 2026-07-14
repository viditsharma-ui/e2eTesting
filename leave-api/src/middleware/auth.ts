import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'employee' | 'manager'
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'leave-management-secret-key'

/**
 * JWT Authentication Middleware
 * Extracts Bearer token from Authorization header, verifies it, and attaches user to req.user
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: 'employee' | 'manager'
    }
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Middleware to require employee role
 */
export const requireEmployee = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  if (req.user.role !== 'employee') {
    res.status(403).json({ error: 'Manager access only' })
    return
  }

  next()
}

/**
 * Middleware to require manager role
 */
export const requireManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  if (req.user.role !== 'manager') {
    res.status(403).json({ error: 'Employee access only' })
    return
  }

  next()
}

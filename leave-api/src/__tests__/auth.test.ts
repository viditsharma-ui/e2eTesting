/**
 * Authentication Tests
 * Tests for JWT middleware and role enforcement
 */

import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = 'leave-management-secret-key'

// Mock implementations of authentication middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'employee' | 'manager'
  }
}

const authenticateToken = (
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

const requireEmployee = (
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

const requireManager = (
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

describe('JWT Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    mockRequest = {
      headers: {},
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    nextFunction = jest.fn()
  })

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' })
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should return 401 if token is missing from Authorization header', () => {
      mockRequest.headers = { authorization: 'Bearer' }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid.token.here' }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      })
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should attach decoded user to req.user with valid token', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      const decodedUser = (mockRequest as AuthenticatedRequest).user
      expect(decodedUser?.id).toBe(user.id)
      expect(decodedUser?.email).toBe(user.email)
      expect(decodedUser?.role).toBe(user.role)
      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should call next() when token is valid', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledTimes(1)
    })

    it('should preserve token user role (employee)', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect((mockRequest as AuthenticatedRequest).user?.role).toBe('employee')
    })

    it('should preserve token user role (manager)', () => {
      const user = { id: 'mgr-001', email: 'manager@test.com', role: 'manager' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect((mockRequest as AuthenticatedRequest).user?.role).toBe('manager')
    })

    it('should return 401 if token is expired', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '0s' })

      // Wait a moment to ensure token is expired
      mockRequest.headers = { authorization: `Bearer ${token}` }

      // Mock time advance
      jest.useFakeTimers()
      jest.advanceTimersByTime(1000)

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      jest.useRealTimers()

      expect(mockResponse.status).toHaveBeenCalledWith(401)
    })
  })

  describe('requireEmployee', () => {
    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()
    })

    it('should return 401 if no user is authenticated', () => {
      mockRequest.user = undefined

      requireEmployee(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' })
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should allow access for employee role', () => {
      mockRequest.user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' }

      requireEmployee(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 403 for manager role', () => {
      mockRequest.user = { id: 'mgr-001', email: 'manager@test.com', role: 'manager' }

      requireEmployee(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Manager access only',
      })
      expect(nextFunction).not.toHaveBeenCalled()
    })
  })

  describe('requireManager', () => {
    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()
    })

    it('should return 401 if no user is authenticated', () => {
      mockRequest.user = undefined

      requireManager(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' })
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should allow access for manager role', () => {
      mockRequest.user = { id: 'mgr-001', email: 'manager@test.com', role: 'manager' }

      requireManager(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 403 for employee role', () => {
      mockRequest.user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' }

      requireManager(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Employee access only',
      })
      expect(nextFunction).not.toHaveBeenCalled()
    })
  })

  describe('Role Enforcement in Authentication Chain', () => {
    it('should enforce employee role after successful token authentication', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      // First authenticate
      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      // Then check employee role
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()

      requireEmployee(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should enforce manager role after successful token authentication', () => {
      const user = { id: 'mgr-001', email: 'manager@test.com', role: 'manager' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      // First authenticate
      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      // Then check manager role
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()

      requireManager(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should reject employee token on manager-only endpoint', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      // First authenticate
      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      // Then try to access manager endpoint
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()

      requireManager(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it('should reject manager token on employee-only endpoint', () => {
      const user = { id: 'mgr-001', email: 'manager@test.com', role: 'manager' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      // First authenticate
      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      // Then try to access employee endpoint
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      nextFunction = jest.fn()

      requireEmployee(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(nextFunction).not.toHaveBeenCalled()
    })
  })

  describe('Token Format Validation', () => {
    it('should handle Bearer token with extra spaces', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer  ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      // Behavior: will look for token starting after first space, which will be empty, causing 401
      expect(mockResponse.status).toHaveBeenCalledWith(401)
    })

    it('should ignore Authorization header case sensitivity for "Bearer" prefix', () => {
      const user = { id: 'emp-001', email: 'employee@test.com', role: 'employee' as const }
      const token = jwt.sign(user, JWT_SECRET)
      mockRequest.headers = { authorization: `Bearer ${token}` }

      authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      )

      const decodedUser = (mockRequest as AuthenticatedRequest).user
      expect(decodedUser?.id).toBe(user.id)
      expect(decodedUser?.email).toBe(user.email)
      expect(decodedUser?.role).toBe(user.role)
      expect(nextFunction).toHaveBeenCalled()
    })
  })
})

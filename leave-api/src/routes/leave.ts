import express, { Router, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { store, LeaveRequest } from '../store/data'
import {
  authenticateToken,
  AuthenticatedRequest,
  requireEmployee,
  requireManager,
} from '../middleware/auth'

const router: Router = express.Router()

/**
 * Helper: Get user name by ID
 */
const getUserName = (userId: string): string => {
  const user = store.users.find((u) => u.id === userId)
  return user ? user.email.split('@')[0] : 'Unknown'
}

/**
 * Helper: Validate leave request dates (endDate must be >= startDate)
 */
const validateLeaveRequestDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return end >= start
}

/**
 * Helper: Validate reason (non-empty, non-whitespace)
 */
const validateReason = (reason: string): boolean => {
  return Boolean(reason && reason.trim().length > 0)
}

/**
 * GET /leave/types
 * Returns array of available leave types
 * Auth: Any valid JWT
 */
router.get('/types', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json(store.leaveTypes)
})

/**
 * GET /leave/balance
 * Returns remaining leave balance for logged-in employee
 * Auth: Employee JWT only
 */
router.get(
  '/balance',
  authenticateToken,
  requireEmployee,
  (req: AuthenticatedRequest, res: Response): void => {
    const userId = req.user!.id
    const balance = store.leaveBalance[userId]

    if (!balance) {
      res.status(404).json({ error: 'Leave balance not found' })
      return
    }

    res.status(200).json(balance)
  }
)

/**
 * POST /leave/apply
 * Creates a new leave request with status "Pending"
 * Auth: Employee JWT only
 * Body: { leaveType, startDate, endDate, reason }
 */
router.post(
  '/apply',
  authenticateToken,
  requireEmployee,
  (req: AuthenticatedRequest, res: Response): void => {
    const { leaveType, startDate, endDate, reason } = req.body
    const userId = req.user!.id
    const userEmail = req.user!.email

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    // Validate dates
    if (!validateLeaveRequestDates(startDate, endDate)) {
      res.status(400).json({ error: 'End date must be on or after start date' })
      return
    }

    // Validate reason
    if (!validateReason(reason)) {
      res.status(400).json({ error: 'Reason cannot be empty' })
      return
    }

    // Validate leave type exists
    if (!store.leaveTypes.includes(leaveType)) {
      res.status(400).json({ error: 'Invalid leave type' })
      return
    }

    // Create new leave request
    const newRequest: LeaveRequest = {
      id: uuidv4(),
      employeeId: userId,
      employeeName: getUserName(userId),
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }

    store.leaveRequests.push(newRequest)

    res.status(201).json({
      message: 'Leave request created successfully',
      leaveRequest: newRequest,
    })
  }
)

/**
 * GET /leave/history
 * Returns all leave requests for logged-in employee
 * Auth: Employee JWT only
 */
router.get(
  '/history',
  authenticateToken,
  requireEmployee,
  (req: AuthenticatedRequest, res: Response): void => {
    const userId = req.user!.id
    const requests = store.leaveRequests.filter((r) => r.employeeId === userId)

    res.status(200).json(requests)
  }
)

/**
 * PUT /leave/:id/cancel
 * Cancels a Pending leave request (owner only)
 * Auth: Employee JWT only (must be request owner)
 * Returns 403 if request is not Pending or not owned by requester
 */
router.put(
  '/:id/cancel',
  authenticateToken,
  requireEmployee,
  (req: AuthenticatedRequest, res: Response): void => {
    const { id } = req.params
    const userId = req.user!.id

    const request = store.leaveRequests.find((r) => r.id === id)

    if (!request) {
      res.status(404).json({ error: 'Leave request not found' })
      return
    }

    // Check ownership
    if (request.employeeId !== userId) {
      res.status(403).json({ error: 'You can only cancel your own requests' })
      return
    }

    // Check if request is in Pending status
    if (request.status !== 'Pending') {
      res.status(403).json({ error: 'Only Pending requests can be cancelled' })
      return
    }

    // Update status to Cancelled
    request.status = 'Cancelled'

    res.status(200).json({
      message: 'Leave request cancelled successfully',
      leaveRequest: request,
    })
  }
)

/**
 * GET /leave/pending
 * Returns all Pending leave requests across all employees
 * Auth: Manager JWT only
 */
router.get(
  '/pending',
  authenticateToken,
  requireManager,
  (req: AuthenticatedRequest, res: Response): void => {
    const pendingRequests = store.leaveRequests.filter((r) => r.status === 'Pending')

    res.status(200).json(pendingRequests)
  }
)

/**
 * PUT /leave/:id/approve
 * Approves a Pending leave request
 * Auth: Manager JWT only
 * Returns 403 if request is not Pending
 */
router.put(
  '/:id/approve',
  authenticateToken,
  requireManager,
  (req: AuthenticatedRequest, res: Response): void => {
    const { id } = req.params

    const request = store.leaveRequests.find((r) => r.id === id)

    if (!request) {
      res.status(404).json({ error: 'Leave request not found' })
      return
    }

    // Check if request is in Pending status
    if (request.status !== 'Pending') {
      res.status(403).json({ error: 'Only Pending requests can be approved' })
      return
    }

    // Update status to Approved
    request.status = 'Approved'

    res.status(200).json({
      message: 'Leave request approved successfully',
      leaveRequest: request,
    })
  }
)

/**
 * PUT /leave/:id/reject
 * Rejects a Pending leave request
 * Auth: Manager JWT only
 * Returns 403 if request is not Pending
 */
router.put(
  '/:id/reject',
  authenticateToken,
  requireManager,
  (req: AuthenticatedRequest, res: Response): void => {
    const { id } = req.params

    const request = store.leaveRequests.find((r) => r.id === id)

    if (!request) {
      res.status(404).json({ error: 'Leave request not found' })
      return
    }

    // Check if request is in Pending status
    if (request.status !== 'Pending') {
      res.status(403).json({ error: 'Only Pending requests can be rejected' })
      return
    }

    // Update status to Rejected
    request.status = 'Rejected'

    res.status(200).json({
      message: 'Leave request rejected successfully',
      leaveRequest: request,
    })
  }
)

/**
 * PUT /leave/:id/edit
 * Edits a Pending leave request (owner only)
 * Auth: Employee JWT only (must be request owner)
 * Returns 403 if request is Approved/Rejected
 * Body: { leaveType?, startDate?, endDate?, reason? }
 */
router.put(
  '/:id/edit',
  authenticateToken,
  requireEmployee,
  (req: AuthenticatedRequest, res: Response): void => {
    const { id } = req.params
    const userId = req.user!.id
    const { leaveType, startDate, endDate, reason } = req.body

    const request = store.leaveRequests.find((r) => r.id === id)

    if (!request) {
      res.status(404).json({ error: 'Leave request not found' })
      return
    }

    // Check ownership
    if (request.employeeId !== userId) {
      res.status(403).json({ error: 'You can only edit your own requests' })
      return
    }

    // Check if request is terminal (Approved or Rejected)
    if (request.status === 'Approved' || request.status === 'Rejected') {
      res.status(403).json({ error: 'Cannot edit Approved or Rejected requests' })
      return
    }

    // Validate and update fields
    if (leaveType !== undefined) {
      if (!store.leaveTypes.includes(leaveType)) {
        res.status(400).json({ error: 'Invalid leave type' })
        return
      }
      request.leaveType = leaveType
    }

    if (startDate !== undefined || endDate !== undefined) {
      const newStartDate = startDate || request.startDate
      const newEndDate = endDate || request.endDate

      if (!validateLeaveRequestDates(newStartDate, newEndDate)) {
        res.status(400).json({ error: 'End date must be on or after start date' })
        return
      }

      if (startDate !== undefined) {
        request.startDate = startDate
      }
      if (endDate !== undefined) {
        request.endDate = endDate
      }
    }

    if (reason !== undefined) {
      if (!validateReason(reason)) {
        res.status(400).json({ error: 'Reason cannot be empty' })
        return
      }
      request.reason = reason
    }

    res.status(200).json({
      message: 'Leave request updated successfully',
      leaveRequest: request,
    })
  }
)

export default router

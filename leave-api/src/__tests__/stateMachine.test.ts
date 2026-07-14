/**
 * State Machine Tests
 * Tests for valid and invalid leave request state transitions
 */

// Type definitions for leave request
interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  createdAt: string
}

// State machine transition validation logic
const canTransitionToApproved = (currentStatus: LeaveRequest['status']): boolean => {
  return currentStatus === 'Pending'
}

const canTransitionToRejected = (currentStatus: LeaveRequest['status']): boolean => {
  return currentStatus === 'Pending'
}

const canTransitionToCancelled = (currentStatus: LeaveRequest['status']): boolean => {
  return currentStatus === 'Pending'
}

const canEdit = (currentStatus: LeaveRequest['status']): boolean => {
  return currentStatus !== 'Approved' && currentStatus !== 'Rejected'
}

const transitionToApproved = (request: LeaveRequest): LeaveRequest => {
  if (!canTransitionToApproved(request.status)) {
    throw new Error('Only Pending requests can be approved')
  }
  return { ...request, status: 'Approved' }
}

const transitionToRejected = (request: LeaveRequest): LeaveRequest => {
  if (!canTransitionToRejected(request.status)) {
    throw new Error('Only Pending requests can be rejected')
  }
  return { ...request, status: 'Rejected' }
}

const transitionToCancelled = (request: LeaveRequest): LeaveRequest => {
  if (!canTransitionToCancelled(request.status)) {
    throw new Error('Only Pending requests can be cancelled')
  }
  return { ...request, status: 'Cancelled' }
}

describe('Leave Request State Machine', () => {
  let leaveRequest: LeaveRequest

  beforeEach(() => {
    leaveRequest = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      employeeId: 'emp-001',
      employeeName: 'john',
      leaveType: 'Annual',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      reason: 'Annual leave',
      status: 'Pending',
      createdAt: '2024-01-01T10:00:00Z',
    }
  })

  describe('Valid Transitions from Pending Status', () => {
    it('should allow transition from Pending to Approved', () => {
      expect(canTransitionToApproved('Pending')).toBe(true)
      const updated = transitionToApproved(leaveRequest)
      expect(updated.status).toBe('Approved')
    })

    it('should allow transition from Pending to Rejected', () => {
      expect(canTransitionToRejected('Pending')).toBe(true)
      const updated = transitionToRejected(leaveRequest)
      expect(updated.status).toBe('Rejected')
    })

    it('should allow transition from Pending to Cancelled', () => {
      expect(canTransitionToCancelled('Pending')).toBe(true)
      const updated = transitionToCancelled(leaveRequest)
      expect(updated.status).toBe('Cancelled')
    })

    it('should preserve request data when transitioning to Approved', () => {
      const updated = transitionToApproved(leaveRequest)
      expect(updated.id).toBe(leaveRequest.id)
      expect(updated.employeeId).toBe(leaveRequest.employeeId)
      expect(updated.leaveType).toBe(leaveRequest.leaveType)
      expect(updated.reason).toBe(leaveRequest.reason)
    })

    it('should preserve request data when transitioning to Rejected', () => {
      const updated = transitionToRejected(leaveRequest)
      expect(updated.id).toBe(leaveRequest.id)
      expect(updated.employeeId).toBe(leaveRequest.employeeId)
      expect(updated.leaveType).toBe(leaveRequest.leaveType)
    })

    it('should preserve request data when transitioning to Cancelled', () => {
      const updated = transitionToCancelled(leaveRequest)
      expect(updated.id).toBe(leaveRequest.id)
      expect(updated.employeeId).toBe(leaveRequest.employeeId)
      expect(updated.reason).toBe(leaveRequest.reason)
    })
  })

  describe('Invalid Transitions from Approved Status', () => {
    beforeEach(() => {
      leaveRequest.status = 'Approved'
    })

    it('should not allow transition from Approved to Rejected', () => {
      expect(canTransitionToRejected('Approved')).toBe(false)
      expect(() => transitionToRejected(leaveRequest)).toThrow(
        'Only Pending requests can be rejected'
      )
    })

    it('should not allow transition from Approved to Cancelled', () => {
      expect(canTransitionToCancelled('Approved')).toBe(false)
      expect(() => transitionToCancelled(leaveRequest)).toThrow(
        'Only Pending requests can be cancelled'
      )
    })

    it('should not allow transition from Approved to Approved', () => {
      expect(canTransitionToApproved('Approved')).toBe(false)
      expect(() => transitionToApproved(leaveRequest)).toThrow(
        'Only Pending requests can be approved'
      )
    })

    it('should not allow editing an Approved request', () => {
      expect(canEdit('Approved')).toBe(false)
    })
  })

  describe('Invalid Transitions from Rejected Status', () => {
    beforeEach(() => {
      leaveRequest.status = 'Rejected'
    })

    it('should not allow transition from Rejected to Approved', () => {
      expect(canTransitionToApproved('Rejected')).toBe(false)
      expect(() => transitionToApproved(leaveRequest)).toThrow(
        'Only Pending requests can be approved'
      )
    })

    it('should not allow transition from Rejected to Cancelled', () => {
      expect(canTransitionToCancelled('Rejected')).toBe(false)
      expect(() => transitionToCancelled(leaveRequest)).toThrow(
        'Only Pending requests can be cancelled'
      )
    })

    it('should not allow transition from Rejected to Rejected', () => {
      expect(canTransitionToRejected('Rejected')).toBe(false)
      expect(() => transitionToRejected(leaveRequest)).toThrow(
        'Only Pending requests can be rejected'
      )
    })

    it('should not allow editing a Rejected request', () => {
      expect(canEdit('Rejected')).toBe(false)
    })
  })

  describe('Invalid Transitions from Cancelled Status', () => {
    beforeEach(() => {
      leaveRequest.status = 'Cancelled'
    })

    it('should not allow transition from Cancelled to Approved', () => {
      expect(canTransitionToApproved('Cancelled')).toBe(false)
      expect(() => transitionToApproved(leaveRequest)).toThrow(
        'Only Pending requests can be approved'
      )
    })

    it('should not allow transition from Cancelled to Rejected', () => {
      expect(canTransitionToRejected('Cancelled')).toBe(false)
      expect(() => transitionToRejected(leaveRequest)).toThrow(
        'Only Pending requests can be rejected'
      )
    })

    it('should not allow transition from Cancelled to Cancelled', () => {
      expect(canTransitionToCancelled('Cancelled')).toBe(false)
      expect(() => transitionToCancelled(leaveRequest)).toThrow(
        'Only Pending requests can be cancelled'
      )
    })

    it('should allow editing a Cancelled request (terminal state allows edit)', () => {
      expect(canEdit('Cancelled')).toBe(true)
    })
  })

  describe('Edit Restrictions', () => {
    it('should allow editing when status is Pending', () => {
      leaveRequest.status = 'Pending'
      expect(canEdit('Pending')).toBe(true)
    })

    it('should allow editing when status is Cancelled', () => {
      leaveRequest.status = 'Cancelled'
      expect(canEdit('Cancelled')).toBe(true)
    })

    it('should prevent editing when status is Approved', () => {
      leaveRequest.status = 'Approved'
      expect(canEdit('Approved')).toBe(false)
    })

    it('should prevent editing when status is Rejected', () => {
      leaveRequest.status = 'Rejected'
      expect(canEdit('Rejected')).toBe(false)
    })
  })

  describe('State Transition Immutability', () => {
    it('should not mutate the original request object when transitioning', () => {
      const original = { ...leaveRequest }
      transitionToApproved(leaveRequest)
      expect(leaveRequest).toEqual(original)
    })

    it('should create a new object with updated status', () => {
      const updated = transitionToApproved(leaveRequest)
      expect(updated).not.toBe(leaveRequest)
      expect(updated.status).not.toBe(leaveRequest.status)
    })

    it('should preserve all fields except status during transition', () => {
      const updated = transitionToApproved(leaveRequest)
      expect(updated.id).toBe(leaveRequest.id)
      expect(updated.employeeId).toBe(leaveRequest.employeeId)
      expect(updated.leaveType).toBe(leaveRequest.leaveType)
      expect(updated.startDate).toBe(leaveRequest.startDate)
      expect(updated.endDate).toBe(leaveRequest.endDate)
      expect(updated.reason).toBe(leaveRequest.reason)
      expect(updated.createdAt).toBe(leaveRequest.createdAt)
    })
  })

  describe('Terminal States', () => {
    it('Approved is a terminal state', () => {
      leaveRequest.status = 'Approved'
      expect(canTransitionToRejected('Approved')).toBe(false)
      expect(canTransitionToCancelled('Approved')).toBe(false)
      expect(canTransitionToApproved('Approved')).toBe(false)
    })

    it('Rejected is a terminal state', () => {
      leaveRequest.status = 'Rejected'
      expect(canTransitionToApproved('Rejected')).toBe(false)
      expect(canTransitionToCancelled('Rejected')).toBe(false)
      expect(canTransitionToRejected('Rejected')).toBe(false)
    })
  })
})

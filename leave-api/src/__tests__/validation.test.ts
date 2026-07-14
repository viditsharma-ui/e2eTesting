/**
 * Validation Tests
 * Tests for date validation and reason validation logic
 */

// Helper function to validate leave request dates (endDate must be >= startDate)
const validateLeaveRequestDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return end >= start
}

// Helper function to validate reason (non-empty, non-whitespace)
const validateReason = (reason: string): boolean => {
  return Boolean(reason && reason.trim().length > 0)
}

describe('Leave Request Validation', () => {
  describe('Date Validation (validateLeaveRequestDates)', () => {
    it('should return true when end date is after start date', () => {
      const result = validateLeaveRequestDates('2024-01-01', '2024-01-10')
      expect(result).toBe(true)
    })

    it('should return true when end date equals start date (same-day leave)', () => {
      const result = validateLeaveRequestDates('2024-01-01', '2024-01-01')
      expect(result).toBe(true)
    })

    it('should return false when end date is before start date', () => {
      const result = validateLeaveRequestDates('2024-01-10', '2024-01-01')
      expect(result).toBe(false)
    })

    it('should handle multiple day ranges correctly', () => {
      const result = validateLeaveRequestDates('2024-01-01', '2024-02-28')
      expect(result).toBe(true)
    })

    it('should return false when end date is one day before start date', () => {
      const result = validateLeaveRequestDates('2024-01-05', '2024-01-04')
      expect(result).toBe(false)
    })

    it('should handle date objects with time components', () => {
      const result = validateLeaveRequestDates(
        '2024-01-01T10:00:00Z',
        '2024-01-01T15:00:00Z'
      )
      expect(result).toBe(true)
    })

    it('should return false when end date is earlier in the same day', () => {
      const result = validateLeaveRequestDates(
        '2024-01-01T15:00:00Z',
        '2024-01-01T10:00:00Z'
      )
      expect(result).toBe(false)
    })
  })

  describe('Reason Validation (validateReason)', () => {
    it('should return true for non-empty reason', () => {
      const result = validateReason('Family emergency')
      expect(result).toBe(true)
    })

    it('should return true for reason with special characters', () => {
      const result = validateReason('Personal appointment - Doctor visit!')
      expect(result).toBe(true)
    })

    it('should return true for single character reason', () => {
      const result = validateReason('A')
      expect(result).toBe(true)
    })

    it('should return false for empty string reason', () => {
      const result = validateReason('')
      expect(result).toBe(false)
    })

    it('should return false for whitespace-only reason', () => {
      const result = validateReason('   ')
      expect(result).toBe(false)
    })

    it('should return false for reason with only tabs', () => {
      const result = validateReason('\t\t')
      expect(result).toBe(false)
    })

    it('should return false for reason with only newlines', () => {
      const result = validateReason('\n\n')
      expect(result).toBe(false)
    })

    it('should return false for reason with mixed whitespace', () => {
      const result = validateReason('  \t\n  ')
      expect(result).toBe(false)
    })

    it('should return true for reason with leading/trailing spaces but content in middle', () => {
      const result = validateReason('  Valid reason  ')
      expect(result).toBe(true)
    })

    it('should return false for empty string passed as reason', () => {
      const emptyReason = ''
      const result = validateReason(emptyReason)
      expect(result).toBe(false)
    })
  })

  describe('Combined Validation Scenarios', () => {
    it('should validate a complete leave request with valid dates and reason', () => {
      const dateValid = validateLeaveRequestDates('2024-01-01', '2024-01-10')
      const reasonValid = validateReason('Annual leave')
      expect(dateValid && reasonValid).toBe(true)
    })

    it('should reject a leave request with invalid dates but valid reason', () => {
      const dateValid = validateLeaveRequestDates('2024-01-10', '2024-01-01')
      const reasonValid = validateReason('Annual leave')
      expect(dateValid && reasonValid).toBe(false)
    })

    it('should reject a leave request with valid dates but invalid reason', () => {
      const dateValid = validateLeaveRequestDates('2024-01-01', '2024-01-10')
      const reasonValid = validateReason('   ')
      expect(dateValid && reasonValid).toBe(false)
    })

    it('should reject a leave request with both invalid dates and reason', () => {
      const dateValid = validateLeaveRequestDates('2024-01-10', '2024-01-01')
      const reasonValid = validateReason('')
      expect(dateValid && reasonValid).toBe(false)
    })
  })
})

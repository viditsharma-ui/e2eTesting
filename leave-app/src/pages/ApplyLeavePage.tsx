import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function ApplyLeavePage() {
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!leaveType) {
      newErrors.leaveType = 'Leave type is required'
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end < start) {
        newErrors.dateError = 'End date must be on or after start date'
      }
    }

    if (!reason || reason.trim() === '') {
      newErrors.reasonError = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToast(null)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await client.post('/leave/apply', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      })

      setToast({
        message: 'Leave request submitted successfully!',
        type: 'success'
      })

      // Clear form
      setLeaveType('')
      setStartDate('')
      setEndDate('')
      setReason('')
      setErrors({})

      // Redirect to history after 1.5 seconds
      setTimeout(() => {
        navigate('/employee/history')
      }, 1500)
    } catch (err: unknown) {
      const error = err as any
      const errorMessage = error.response?.data?.message || 'Failed to submit leave request'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Apply for Leave</h1>
        <button
          onClick={() => navigate('/employee/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Back
        </button>
      </div>

      {toast && (
        <div
          id="toast-container"
          style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '4px',
            color: 'white',
            backgroundColor: toast.type === 'success' ? '#4CAF50' : '#F44336'
          }}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        {/* Leave Type Dropdown */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="leaveType" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Leave Type <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={(e) => {
              setLeaveType(e.target.value)
              if (e.target.value) {
                setErrors({ ...errors, leaveType: '' })
              }
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: errors.leaveType ? '2px solid #F44336' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Select a leave type --</option>
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
          </select>
          {errors.leaveType && (
            <div style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>{errors.leaveType}</div>
          )}
        </div>

        {/* Start Date */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="startDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Start Date <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (e.target.value) {
                setErrors({ ...errors, startDate: '' })
              }
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: errors.startDate ? '2px solid #F44336' : '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          {errors.startDate && (
            <div style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>{errors.startDate}</div>
          )}
        </div>

        {/* End Date */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="endDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            End Date <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              if (e.target.value) {
                setErrors({ ...errors, endDate: '', dateError: '' })
              }
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: errors.endDate || errors.dateError ? '2px solid #F44336' : '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          {errors.endDate && (
            <div style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>{errors.endDate}</div>
          )}
          {errors.dateError && (
            <div id="dateError" style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>
              {errors.dateError}
            </div>
          )}
        </div>

        {/* Reason Textarea */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="reason" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Reason <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (e.target.value.trim()) {
                setErrors({ ...errors, reasonError: '' })
              }
            }}
            placeholder="Please provide a reason for your leave request"
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: errors.reasonError ? '2px solid #F44336' : '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              minHeight: '120px',
              fontFamily: 'Arial, sans-serif',
              resize: 'vertical'
            }}
          />
          {errors.reasonError && (
            <div id="reasonError" style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>
              {errors.reasonError}
            </div>
          )}
        </div>

        {/* Summary Preview */}
        {startDate && endDate && !errors.dateError && (
          <div
            style={{
              backgroundColor: '#e3f2fd',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#333'
            }}
          >
            <strong>Request Summary:</strong>
            <div style={{ marginTop: '10px' }}>
              {leaveType && <div>Leave Type: <strong>{leaveType}</strong></div>}
              <div>
                Duration: <strong>{formatDate(startDate)}</strong> to <strong>{formatDate(endDate)}</strong>
              </div>
              {reason && <div>Reason: <strong>{reason}</strong></div>}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          id="submitLeave"
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            backgroundColor: loading ? '#ccc' : '#1976D2',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  )
}

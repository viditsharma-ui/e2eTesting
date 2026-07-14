import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

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

export default function LeaveHistoryPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await client.get('/leave/history')
      setRequests(response.data)
    } catch (err) {
      setError('Failed to load leave history')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (requestId: string) => {
    try {
      setCancelling(requestId)
      await client.put(`/leave/${requestId}/cancel`)

      setToast({
        message: 'Leave request cancelled successfully!',
        type: 'success'
      })

      // Refresh the history
      await fetchHistory()
    } catch (err: unknown) {
      const error = err as any
      const errorMessage = error.response?.data?.message || 'Failed to cancel leave request'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setCancelling(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return '#FFC107' // yellow
      case 'Approved':
        return '#4CAF50' // green
      case 'Rejected':
        return '#F44336' // red
      case 'Cancelled':
        return '#9E9E9E' // grey
      default:
        return '#666'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Leave History</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
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
          <button
            id="logoutBtn"
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Toast Message */}
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

      {/* Error message */}
      {error && (
        <div style={{ color: '#F44336', marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* History Table */}
      {requests.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#999' }}>
          No leave requests found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            id="history-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '4px'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Leave Type</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr
                  key={request.id}
                  style={{
                    borderBottom: index < requests.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}
                >
                  <td style={{ padding: '12px', color: '#333' }}>{request.leaveType}</td>
                  <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.startDate)}</td>
                  <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.endDate)}</td>
                  <td style={{ padding: '12px', color: '#333' }}>{request.reason}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      id="status-badge"
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: getStatusBadgeColor(request.status)
                      }}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {request.status === 'Pending' ? (
                      <button
                        data-testid={`cancel-btn-${request.id}`}
                        onClick={() => handleCancel(request.id)}
                        disabled={cancelling === request.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: cancelling === request.id ? '#ccc' : '#F44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: cancelling === request.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {cancelling === request.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

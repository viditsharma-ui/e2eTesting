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

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await client.get('/leave/pending')
      setRequests(response.data)
    } catch (err) {
      setError('Failed to load pending requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId)
      await client.put(`/leave/${requestId}/approve`)

      setToast({
        message: 'Leave request approved successfully!',
        type: 'success'
      })

      // Remove the request from the list
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId))
    } catch (err: unknown) {
      const error = err as any
      const errorMessage = error.response?.data?.message || 'Failed to approve leave request'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId)
      await client.put(`/leave/${requestId}/reject`)

      setToast({
        message: 'Leave request rejected successfully!',
        type: 'success'
      })

      // Remove the request from the list
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId))
    } catch (err: unknown) {
      const error = err as any
      const errorMessage = error.response?.data?.message || 'Failed to reject leave request'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    navigate('/login')
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
        <h1>Manager Dashboard</h1>
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

      {/* Pending Requests Section */}
      <div>
        <h2>Pending Leave Requests</h2>
        {requests.length === 0 ? (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#999' }}>
            No pending leave requests
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              id="pending-requests-table"
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
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Employee Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Leave Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Start Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>End Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Actions</th>
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
                    <td style={{ padding: '12px', color: '#333' }}>{request.employeeName}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{request.leaveType}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.startDate)}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.endDate)}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        data-testid={`approve-btn-${request.id}`}
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processing === request.id ? '#ccc' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing === request.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {processing === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        data-testid={`reject-btn-${request.id}`}
                        onClick={() => handleReject(request.id)}
                        disabled={processing === request.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processing === request.id ? '#ccc' : '#F44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing === request.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {processing === request.id ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

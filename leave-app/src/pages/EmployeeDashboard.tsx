import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

interface LeaveBalance {
  [key: string]: number
}

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

export default function EmployeeDashboard() {
  const [balance, setBalance] = useState<LeaveBalance>({})
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch balance
        const balanceResponse = await client.get('/leave/balance')
        setBalance(balanceResponse.data)

        // Fetch history (last 5)
        const historyResponse = await client.get('/leave/history')
        const allRequests = historyResponse.data
        setRecentRequests(allRequests.slice(0, 5))
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
        <h1>Employee Dashboard</h1>
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

      {/* Error message */}
      {error && (
        <div style={{ color: '#F44336', marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Leave Balance Cards Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Leave Balance</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}
        >
          {['Annual', 'Sick', 'Casual'].map((leaveType) => (
            <div
              key={leaveType}
              data-testid={`balance-${leaveType}`}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>{leaveType}</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976D2' }}>
                {balance[leaveType] ?? 0}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>days remaining</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Recent Requests</h2>
        {recentRequests.length === 0 ? (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#999' }}>
            No leave requests yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              id="recent-requests-table"
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
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    style={{
                      borderBottom: index < recentRequests.length - 1 ? '1px solid #eee' : 'none',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '12px', color: '#333' }}>{request.leaveType}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.startDate)}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{formatDate(request.endDate)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          id="applyLeaveLink"
          onClick={() => navigate('/employee/apply')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Apply for Leave
        </button>
        <button
          id="historyLink"
          onClick={() => navigate('/employee/history')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          View Full History
        </button>
      </div>
    </div>
  )
}

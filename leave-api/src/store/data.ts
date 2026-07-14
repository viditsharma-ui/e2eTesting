import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  email: string
  password: string // hashed
  role: 'employee' | 'manager'
}

export interface LeaveRequest {
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

export interface LeaveBalance {
  [leaveType: string]: number
}

export interface StoreData {
  users: User[]
  leaveRequests: LeaveRequest[]
  leaveBalance: { [employeeId: string]: LeaveBalance }
  leaveTypes: string[]
}

// Hash passwords synchronously using bcryptjs
const hashPassword = (password: string): string => {
  const salt = bcryptjs.genSaltSync(10)
  return bcryptjs.hashSync(password, salt)
}

// Initialize in-memory store with seed data
export const initializeStore = (): StoreData => {
  return {
    users: [
      {
        id: uuidv4(),
        email: 'employee@test.com',
        password: hashPassword('Employee@1234'),
        role: 'employee',
      },
      {
        id: uuidv4(),
        email: 'manager@test.com',
        password: hashPassword('Manager@1234'),
        role: 'manager',
      },
    ],
    leaveRequests: [],
    leaveBalance: {
      // Each employee gets the same balance on initialization
      // This will be populated as employees are added
    },
    leaveTypes: ['Annual', 'Sick', 'Casual'],
  }
}

// Create the global store instance
export const store = initializeStore()

// Initialize leave balances for seeded users
store.users.forEach((user) => {
  if (user.role === 'employee') {
    store.leaveBalance[user.id] = {
      Annual: 15,
      Sick: 10,
      Casual: 5,
    }
  }
})

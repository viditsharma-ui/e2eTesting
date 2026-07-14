import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import leaveRoutes from './routes/leave'

// Load environment variables
dotenv.config()

// Initialize Express app
const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Leave Management API is running' })
})

// Routes
app.use('/auth', authRoutes)
app.use('/leave', leaveRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./routes/authRouter'))
app.use('/api/projects', require('./routes/projectRouter'))
app.use('/api/files', require('./routes/fileRouter'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})


const express = require('express')
const { 
  upload, 
  uploadFile, 
  getProjectFiles, 
  deleteFile, 
  handleUploadError 
} = require('../controllers/fileController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// File routes
router.post('/upload', upload.single('file'), handleUploadError, uploadFile)
router.get('/project/:projectId', getProjectFiles)
router.delete('/:fileId', deleteFile)

module.exports = router

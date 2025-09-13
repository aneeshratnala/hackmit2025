const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { body, validationResult } = require('express-validator')
const prisma = require('../lib/db')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, PPTX, JPG, PNG files are allowed.'))
    }
  }
})

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { projectId } = req.body

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: req.userId 
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Save file info to database
    const fileRecord = await prisma.projectFile.create({
      data: {
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl: `/uploads/${req.file.filename}`,
        projectId,
        userId: req.userId
      }
    })

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        fileType: fileRecord.fileType,
        fileSize: fileRecord.fileSize,
        fileUrl: fileRecord.fileUrl,
        createdAt: fileRecord.createdAt
      }
    })
  } catch (error) {
    console.error('Upload file error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get files for project
const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: req.userId 
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const files = await prisma.projectFile.findMany({
      where: { 
        projectId,
        userId: req.userId 
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ files })
  } catch (error) {
    console.error('Get files error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params

    // Find file and verify ownership
    const file = await prisma.projectFile.findFirst({
      where: { 
        id: fileId,
        userId: req.userId 
      }
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '..', file.fileUrl)
      await fs.unlink(filePath)
    } catch (error) {
      console.warn('Could not delete file from filesystem:', error.message)
    }

    // Delete file record from database
    await prisma.projectFile.delete({
      where: { id: fileId }
    })

    res.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
    }
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  upload,
  uploadFile,
  getProjectFiles,
  deleteFile,
  handleUploadError
}

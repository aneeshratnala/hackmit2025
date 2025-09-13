const { body, validationResult } = require('express-validator')
const prisma = require('../lib/db')

// Get all projects for user
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            fileType: true,
            fileSize: true,
            createdAt: true
          }
        },
        video: {
          select: {
            id: true,
            status: true,
            videoUrl: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
      include: {
        files: true,
        video: true
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Create project
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, subject } = req.body

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        subject: subject || null,
        userId: req.userId
      },
      include: {
        files: true,
        video: true
      }
    })

    res.status(201).json({
      message: 'Project created successfully',
      project
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update project
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { title, description, subject } = req.body

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { 
        id,
        userId: req.userId 
      }
    })

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description: description || null,
        subject: subject || null
      },
      include: {
        files: true,
        video: true
      }
    })

    res.json({
      message: 'Project updated successfully',
      project
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { 
        id,
        userId: req.userId 
      }
    })

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' })
    }

    await prisma.project.delete({
      where: { id }
    })

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Validation rules
const createProjectValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('subject').optional().trim()
]

const updateProjectValidation = [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('subject').optional().trim()
]

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  createProjectValidation,
  updateProjectValidation
}

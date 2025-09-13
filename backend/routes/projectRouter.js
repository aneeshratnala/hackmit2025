const express = require('express')
const { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject,
  createProjectValidation,
  updateProjectValidation
} = require('../controllers/indexController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Project routes
router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/', createProjectValidation, createProject)
router.put('/:id', updateProjectValidation, updateProject)
router.delete('/:id', deleteProject)

module.exports = router

import express from 'express'
import { askAssistant } from '../controllers/assistant.controller.js'

const router = express.Router()

// POST /api/assistant/ask
router.post('/ask', askAssistant)

export default router

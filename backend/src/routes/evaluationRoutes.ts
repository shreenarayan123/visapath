import { Router } from 'express';
import {
  createEvaluation,
  getEvaluation,
  emailResults,
  downloadPDF,
  getUserEvaluations
} from '../controllers/evaluationController';
import { upload } from '../middleware/upload';
import { validateApiKey } from '../middleware/validateApiKey';

const router = Router();

// Public routes (with optional API key)
router.post('/', validateApiKey, upload.any(), createEvaluation);
router.get('/:id', getEvaluation);
router.post('/:id/email-results', emailResults);
router.get('/:id/download-pdf', downloadPDF);
router.get('/user/:email', getUserEvaluations);

export default router;

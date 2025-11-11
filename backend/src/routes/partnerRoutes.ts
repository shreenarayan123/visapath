import { Router } from 'express';
import {
  getPartnerEvaluations,
  getPartnerStats,
  exportEvaluations,
  createPartner
} from '../controllers/partnerController';
import { requireApiKey } from '../middleware/validateApiKey';

const router = Router();

// All partner routes require API key
router.get('/evaluations', requireApiKey, getPartnerEvaluations);
router.get('/stats', requireApiKey, getPartnerStats);
router.get('/evaluations/export', requireApiKey, exportEvaluations);

// Partner creation (in production, add admin authentication)
router.post('/create', createPartner);

export default router;

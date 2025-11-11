import { Router } from 'express';
import evaluationRoutes from './evaluationRoutes';
import visaRoutes from './visaRoutes';
import partnerRoutes from './partnerRoutes';

const router = Router();

// API info endpoint
router.get('/', (req, res) => {
  // reference req to avoid TS6133 unused parameter error when running ts-node
  void req;
  res.json({
    success: true,
    message: 'Visa Evaluation API',
    version: '1.0.0',
    endpoints: {
      countries: '/api/countries',
      evaluations: '/api/evaluations',
      partner: '/api/partner',
      health: '/health'
    },
    documentation: 'See README.md for full API documentation'
  });
});

// Mount routes
router.use('/evaluations', evaluationRoutes);
router.use('/', visaRoutes);
router.use('/partner', partnerRoutes);

export default router;

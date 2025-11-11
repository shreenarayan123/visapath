import { Router } from 'express';
import {
  getAllCountries,
  getCountryVisaTypes,
  getVisaTypeDetails,
  searchVisaTypes
} from '../controllers/visaController';

const router = Router();

// Public routes
router.get('/countries', getAllCountries);
router.get('/countries/:countryCode', getCountryVisaTypes);
router.get('/countries/:countryCode/visa-types/:visaTypeId', getVisaTypeDetails);
router.get('/visa-types/search', searchVisaTypes);

export default router;

import { Router } from 'express';
import { CardController } from '../controllers/cardController.js';
import { validateCardCreation } from '../middleware/validator.js';

const router = Router();

router.post('/creator-cards', validateCardCreation, CardController.create);
router.get('/creator-cards/:slug', CardController.get);
router.delete('/creator-cards/:slug', CardController.remove);

export default router;
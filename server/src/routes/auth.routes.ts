import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.schema.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in a minute.' },
});

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(authController.login));
router.get('/verify', requireAuth, asyncHandler(authController.verify));
router.put('/password', requireAuth, validate(changePasswordSchema), asyncHandler(authController.changePassword));

export default router;

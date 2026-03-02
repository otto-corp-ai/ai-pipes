import { Router, Response } from 'express';
import { getAvailableModels } from '../lib/costs';
import { authMiddleware, AuthRequest } from '../lib/auth';

const router = Router();

router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json(getAvailableModels());
});

export default router;

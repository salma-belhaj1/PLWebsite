import { Router, Request, Response } from 'express';

const authRouter = Router();

// TODO: Implement auth routes
// POST /api/auth/register - Register new user
// POST /api/auth/login - Login user
// POST /api/auth/logout - Logout user
// GET /api/auth/me - Get current user

authRouter.post('/register', (req: Request, res: Response) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

authRouter.post('/login', (req: Request, res: Response) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

export default authRouter;

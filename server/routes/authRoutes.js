import express from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/authController.js';
import { createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('manager', 'teamlead'), getAllUsers);

//user management routes for managers
router.post('/users', protect, authorize('manager',), createUser);
router.put('/users/:id', protect, authorize('manager'), updateUser);
router.delete('/users/:id', protect, authorize('manager',), deleteUser);

export default router;





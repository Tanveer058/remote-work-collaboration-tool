import express from 'express';
import {
  createTask,
  getTeamTasks,
  getMyTasks,
  updateTaskStatus,
  submitTask,
  updateTask,
  deleteTask,
  upload
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', protect, authorize('teamlead'), createTask);
router.get('/team', protect, authorize('teamlead'), getTeamTasks);
router.get('/my-tasks', protect, authorize('member'), getMyTasks);
router.put('/:id/status', protect, authorize('member'), updateTaskStatus);

// Keeping POST for submission to handle file uploads
router.post('/:id/submit', protect, authorize('member'), upload.array('files', 5), submitTask);

router.put('/:id', protect, authorize('teamlead'), updateTask);
router.delete('/:id', protect, authorize('teamlead'), deleteTask);

export default router;
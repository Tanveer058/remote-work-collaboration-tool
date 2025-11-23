import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  getMyTeam,
  updateTeam,
  deleteTeam
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', protect, authorize('manager'), createTeam);
router.get('/', protect, authorize('manager'), getAllTeams);
router.get('/my-team', protect, authorize('teamlead'), getMyTeam);
router.get('/:id', protect, getTeamById);
router.put('/:id', protect, authorize('manager'), updateTeam);
router.delete('/:id', protect, authorize('manager'), deleteTeam);

export default router;
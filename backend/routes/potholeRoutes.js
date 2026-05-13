import { Router } from 'express';
import multer from 'multer';
import { validatePotholeReport } from '../middleware/validate.js';
import {
  reportPothole,
  listPotholes,
  getPothole,
  updateStatus,
  deletePothole,
  getStats,
} from '../controllers/potholeController.js';

const router = Router();

// Store file in memory as buffer — we'll stream to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

router.post('/', upload.single('image'), validatePotholeReport, reportPothole);
router.get('/', listPotholes);
router.get('/stats', getStats);
router.get('/:id', getPothole);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deletePothole);

export default router;

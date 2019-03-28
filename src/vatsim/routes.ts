import { Router } from 'express';
import vatsimTracker from './vatsim-tracker';

const router = Router();

router
  .route('/status')
  .get((req, res) => res.status(200).send(vatsimTracker.status));

router
  .route('/data')
  .get((req, res) => res.status(200).send(vatsimTracker.data));

export default router;

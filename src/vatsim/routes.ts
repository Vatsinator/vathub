import { Router } from 'express';
import { isAtc } from './models/atc';
import { isPilot } from './models/pilot';
import vatsimTracker from './vatsim-tracker';

const router = Router();

router
  .route('/status')
  .get((req, res) => res.status(200).send(vatsimTracker.status));

router
  .route('/data')
  .get((req, res) => res.status(200).send(vatsimTracker.data));

router
  .route('/data/pilots')
  .get((req, res) => res.status(200).send(vatsimTracker.data.clients.filter(client => isPilot(client))));

router
  .route('/data/atc')
  .get((req, res) => res.status(200).send(vatsimTracker.data.clients.filter(client => isAtc(client))));

export default router;

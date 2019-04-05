import { Router } from 'express';
import { firMap } from './fir-map';

const router = Router();

router
  .route('/')
  .get((req, res) => res.status(200).send([...firMap.values()]));

router
  .route('/:firIcao')
  .get((req, res) => {
    const icao = req.params.firIcao;
    if (firMap.has(icao)) {
      res.status(200).send(firMap.get(icao));
    } else {
      res.status(404).send({ message: `FIR ${icao} doesn\'t exist` });
    }
  });

export { router as routes };

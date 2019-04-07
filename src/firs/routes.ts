import { Router } from 'express';
import { firList } from './fir-list';

const router = Router();

router
  .route('/')
  .get((req, res) => res.status(200).send(firList));

router
  .route('/:firIcao')
  .get((req, res) => {
    const icao = req.params.firIcao;
    const fir = firList.find(f => f.icao === icao);
    if (fir) {
      res.status(200).send(fir);
    } else {
      res.status(404).send({ message: `FIR ${icao} doesn\'t exist` });
    }
  });

export { router as routes };

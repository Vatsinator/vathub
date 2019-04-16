import { Router } from 'express';
import { firList } from './fir-list';
import { uirList } from './uir-list';

const router = Router();

function findByIcao(icao: string) {
  return firList.find(f => f.icao === icao) || uirList.find(u => u.icao === icao);
}

router
  .route('/')
  .get((req, res) => {
    if (req.query.icao) {
      const icaos = req.query.icao.split(',');
      const firs = [];
      const errors = [];

      for (const icao of icaos) {
        const fir = findByIcao(icao);
        if (!fir) {
          errors.push(icao);
        } else {
          firs.push(fir);
        }
      }

      if (errors.length > 0) {
        res.status(404).send({ message: `FIR(s) ${errors.join(', ')} don't exist` });
      } else {
        res.status(200).send(firs);
      }
    } else {
      res.status(200).send(firList);
    }
  });

router
  .route('/:firIcao')
  .get((req, res) => {
    const icao = req.params.firIcao;
    const fir = findByIcao(icao);
    if (fir) {
      res.status(200).send(fir);
    } else {
      res.status(404).send({ message: `FIR ${icao} doesn't exist` });
    }
  });

export { router as routes };

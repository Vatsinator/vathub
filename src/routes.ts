import express from 'express';
import { routes as firs } from './firs';
import { routes as vatsim } from './vatsim';

// tslint:disable-next-line:no-var-requires
const { version } = require('../package.json');

export class Routes {
  public routes(app: express.Application): void {
    app.route('/').get((req, res) => res.status(200).send({ version }));
    app.use('/vatsim', vatsim);
    app.use('/firs', firs);
  }
}

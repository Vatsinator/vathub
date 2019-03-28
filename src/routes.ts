import express from 'express';
import { routes as vatsim } from './vatsim';

export class Routes {
  public routes(app: express.Application): void {
    app.use('/vatsim', vatsim);
  }
}

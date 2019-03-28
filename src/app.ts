import { json, urlencoded } from 'body-parser';
import express from 'express';
import { Routes } from './routes';

class App {
  public app: express.Application;
  private routes: Routes = new Routes();

  constructor() {
    this.app = express();
    this.configure();
    this.routes.routes(this.app);
  }

  private configure() {
    this.app.use(json());
    this.app.use(urlencoded({ extended: false }));
  }
}

export default new App().app;

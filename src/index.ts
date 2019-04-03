import 'array-flat-polyfill';
import app from './app';
import logger from './logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`running on port ${PORT}`);
});

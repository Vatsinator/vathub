import app from './app';
import logger from './logger';

const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`running on port ${PORT}`);
});

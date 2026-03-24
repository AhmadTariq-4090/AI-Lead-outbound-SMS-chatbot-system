require('dotenv').config();
const { app, connectDb } = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

start();

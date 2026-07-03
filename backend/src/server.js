require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();

    // In production, never auto-alter the live database schema — use proper
    // migrations instead. In development, alter:true is convenient.
    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter: isDev });
    console.log(`Database connected and synced (alter: ${isDev})`);


    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

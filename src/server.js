const app = require('./app');
const prisma = require('./utils/prisma');
const { execSync } = require('child_process');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // console.log('📦 Syncing Prisma schema to DB...');
    // execSync('npx prisma db push', { stdio: 'inherit' });

    await prisma.$connect();

    const url = new URL(process.env.DATABASE_URL);
    console.log('✅ Connected to Database:');
    console.log(`   ↳ Host: ${url.hostname}`);
    console.log(`   ↳ DB: ${url.pathname.replace('/', '')}`);
    console.log(`   ↳ User: ${url.username}`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error during DB init or server start:', err.message);
    process.exit(1);
  }
};

startServer();

import app from './app.js';
import { getUserGroupFromIdToken, verifyAccessToken } from './utils/cognito.js';
import migrateUsers from './utils/migrateUsers.js';
import prisma from './utils/prisma.js';
import { execSync } from 'child_process';
import { URL } from 'url';

const PORT = process.env.PORT || 5000;



const startServer = async () => {
  try {
   
    await migrateUsers();  // Call the user migration function
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

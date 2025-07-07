import prisma from "./prisma.js"; // Assuming you are using Prisma
import { registerUsersToCognito } from "./cognito.js";

const migrateUsers = async () => {
  try {
    const users = await prisma.User.findMany({
      where: {
        empMobileNo: {
          not: null,
          not: "",
        },
      },
    });

    console.log(`Migrating ${users.length} users to Cognito...`);

    for (const user of users) {
      await registerUsersToCognito(user); // Register each user to Cognito
    }

    console.log("✅ All users migrated to Cognito!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
};

export default migrateUsers;

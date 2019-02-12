import { prisma } from './generated/prisma-client';

// A `main` function so that we can use async/await
async function main() {
  // Create a new user called `Alice`
  const newUser = await prisma.createUser({ name: 'Alice' });
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`);

  // Read all users from the database and print them to the console
  const allUsers = await prisma.users();
  console.log(allUsers);
}

main().catch((e) => console.error(e));

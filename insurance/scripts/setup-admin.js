// JavaScript version of the admin setup script
const { PrismaClient } = require("../src/generated/prisma/client");
const bcrypt = require("@uswriting/bcrypt");
const readline = require("readline");

// Initialize Prisma client
const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main setup function
async function setupAdminAccount() {
  console.log("===== Insurance Application - Admin Account Setup =====");
  
  // Check if admin account already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });
  
  if (existingAdmin) {
    console.log("\nAn admin account already exists with email:", existingAdmin.email);
    const createAnother = await prompt("\nDo you want to create another admin account? (y/n): ");
    
    if (createAnother.toLowerCase() !== 'y') {
      console.log("Setup cancelled. Using existing admin account.");
      rl.close();
      await prisma.$disconnect();
      return;
    }
  }
  
  // Get admin credentials
  console.log("\nPlease provide details for the new admin account:");
  const name = await prompt("Full Name: ");
  const email = await prompt("Email: ");
  const password = await prompt("Password (min 8 characters): ");
  
  // Validate inputs
  if (!email.includes('@') || !email.includes('.')) {
    console.log("\nError: Please provide a valid email address.");
    rl.close();
    await prisma.$disconnect();
    return;
  }
  
  if (password.length < 8) {
    console.log("\nError: Password must be at least 8 characters.");
    rl.close();
    await prisma.$disconnect();
    return;
  }
  
  try {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Ask if we should update the existing user to admin role
      const updateExisting = await prompt("\nA user with this email already exists. Do you want to upgrade them to admin role? (y/n): ");
      
      if (updateExisting.toLowerCase() === 'y') {
        // Update user to admin role
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: "ADMIN" }
        });
        console.log(`\nSuccess! User ${email} has been upgraded to admin role.`);
      } else {
        console.log("\nSetup cancelled. Please try again with a different email.");
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN"
        }
      });
      console.log(`\nSuccess! Admin account created for ${email}.`);
      console.log("You can now log in to the application with these credentials.");
    }
  } catch (error) {
    console.error("\nError creating admin account:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the setup
setupAdminAccount().catch(console.error);

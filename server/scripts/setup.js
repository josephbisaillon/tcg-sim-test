import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('=== Pokemon TCG Simulator Server Setup ===');

  // Check if .env file exists
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('.env file created successfully!');
  }

  // Create database directory
  const dbDir = path.join(rootDir, 'database');
  if (!fs.existsSync(dbDir)) {
    console.log('Creating database directory...');
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Database directory created successfully!');
  }

  // Ask if user wants to customize settings
  const customize = await promptQuestion(
    'Do you want to customize server settings? (y/n): '
  );

  if (customize.toLowerCase() === 'y') {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Ask for port
    const port = await promptQuestion('Enter server port (default: 4000): ');
    if (port) {
      envContent = envContent.replace(/PORT=\d+/, `PORT=${port}`);
    }

    // Ask for admin password
    const adminPassword = await promptQuestion(
      'Enter admin password (default: defaultPassword): '
    );
    if (adminPassword) {
      envContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${adminPassword}`
      );
    }

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated with your settings!');
  }

  console.log('\nSetup complete! You can now run the server with:');
  console.log('  npm run dev     # For Unix/Mac');
  console.log('  npm run dev:win # For Windows');

  rl.close();
}

main().catch((error) => {
  console.error('Setup error:', error);
  process.exit(1);
});

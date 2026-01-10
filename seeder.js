import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Load models
import Mission from './src/models/Mission.js';
import User from './src/models/User.js'; // Import the User model

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

// Function to read all mission files from the data directory
const readMissions = () => {
  const missions = [];
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dataDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const missionData = JSON.parse(fileContent);
        if (Array.isArray(missionData)) {
          missions.push(...missionData);
        } else {
          missions.push(missionData);
        }
      } catch (err) {
        console.error(`Error reading or parsing ${file}:`.red, err);
      }
    }
  }
  return missions;
};

// Import into DB (Deletes existing data)
const importData = async () => {
  const missions = readMissions();
  if (!missions.length) {
    console.log('No missions found to import.'.yellow);
    process.exit();
  }
  try {
    await Mission.deleteMany();
    await Mission.create(missions);
    console.log('Data Imported (Collection Wiped)...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Upsert into DB (Adds/Updates data without deleting)
const upsertData = async () => {
  const missions = readMissions();
  if (!missions.length) {
    console.log('No missions found to upsert.'.yellow);
    process.exit();
  }
  try {
    for (const mission of missions) {
        if (!mission.missionId) {
            console.warn(`Skipping mission without missionId: ${JSON.stringify(mission)}`.yellow);
            continue;
        }
      await Mission.findOneAndUpdate({ missionId: mission.missionId }, mission, {
        upsert: true,
        new: true,
        runValidators: true,
      });
    }
    console.log('Data Upserted (Added/Updated)...'.cyan.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Mission.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Grant admin role to a user
const makeAdmin = async () => {
  const email = process.argv[3];
  if (!email) {
    console.error('Please provide a user email.'.red);
    process.exit(1);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email "${email}" not found.`.red);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`User ${user.username} (${email}) has been granted admin privileges.`.green.inverse);
    process.exit();
  } catch (err) {
    console.error('Error granting admin role:'.red, err);
    process.exit(1);
  }
};


if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-u') {
  upsertData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else if (process.argv[2] === '--make-admin') {
  makeAdmin();
}

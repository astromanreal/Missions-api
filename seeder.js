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
        // If the file contains an array, add its elements to the missions list
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
        upsert: true, // Creates the doc if it doesn't exist
        new: true, // Returns the new doc if created
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

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-u') {
  upsertData();
} else if (process.argv[2] === '-d') {
  deleteData();
}


import fs from 'fs';
import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
import Mission from './src/models/Mission.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const generateManifest = async () => {
  try {
    // Fetch all missions from the database
    const missions = await Mission.find().lean(); // .lean() gives us plain JS objects

    if (missions.length === 0) {
      console.log('No missions found in the database.'.yellow);
      process.exit();
    }

    // Prepare the data for the manifest file
    const manifestData = {
      generatedAt: new Date().toISOString(),
      missionCount: missions.length,
      missions: missions.map(m => ({
        missionId: m.missionId,
        missionName: m.missionName,
        missionStatus: m.missionStatus,
        _id: m._id
      }))
    };

    // Write the data to a manifest file
    fs.writeFileSync(
      './database_manifest.json',
      JSON.stringify(manifestData, null, 2), // Pretty-print JSON
      'utf-8'
    );

    console.log(`Successfully generated manifest for ${missions.length} missions.`.green.inverse);
    console.log('Manifest file created at database_manifest.json');
    process.exit();
  } catch (err) {
    console.error('Error generating manifest:'.red, err);
    process.exit(1);
  }
};

generateManifest();

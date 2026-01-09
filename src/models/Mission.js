
import mongoose from 'mongoose';

// Function to generate a URL-friendly slug
const generateSlug = (name) => {
  return name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

const AgencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String },
  organizationType: { 
    type: String, 
    enum: ['government', 'private', 'international'] 
  }
}, { _id: false });

const LaunchSchema = new mongoose.Schema({
  launchDate: { type: Date },
  launchVehicle: { type: String },
  launchSite: { type: String },
  launchProvider: { type: String }
}, { _id: false });

const MissionTimelineSchema = new mongoose.Schema({
  startDate: { type: Date },
  endDate: { type: Date }
}, { _id: false });

const SpacecraftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['satellite', 'rover', 'lander', 'probe', 'crewed'] 
  },
  manufacturer: { type: String },
  massKg: { type: Number },
  powerSource: { 
    type: String, 
    enum: ['solar', 'nuclear', 'battery'] 
  }
}, { _id: false });

const CrewMemberSchema = new mongoose.Schema({
  name: { type: String },
  role: { type: String },
  nationality: { type: String }
}, { _id: false });

const CrewSchema = new mongoose.Schema({
  isCrewed: { type: Boolean, default: false },
  members: [CrewMemberSchema]
}, { _id: false });

const PayloadSchema = new mongoose.Schema({
  name: { type: String },
  type: { 
    type: String, 
    enum: ['instrument', 'satellite', 'cargo'] 
  },
  purpose: { type: String }
}, { _id: false });

const OrbitDetailsSchema = new mongoose.Schema({
  orbitType: { 
    type: String, 
    enum: ['LEO', 'MEO', 'GEO', 'HEO', 'interplanetary'] 
  },
  apoapsisKm: { type: Number },
  periapsisKm: { type: Number },
  inclinationDeg: { type: Number }
}, { _id: false });

const BudgetSchema = new mongoose.Schema({
  amount: { type: Number },
  currency: { type: String }
}, { _id: false });

const OutcomeSchema = new mongoose.Schema({
  success: { type: Boolean },
  summary: { type: String }
}, { _id: false });

const MediaSchema = new mongoose.Schema({
  images: [String],
  videos: [String],
  officialWebsite: { type: String }
}, { _id: false });

const MissionSchema = new mongoose.Schema({
  missionId: { 
    type: String, 
    required: true, 
    unique: true,
  },
  missionName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  missionType: String,
  category: [String],
  agency: AgencySchema,
  launch: LaunchSchema,
  missionStatus: {
    type: String,
    required: true,
    enum: ['planned', 'ongoing', 'completed', 'failed', 'cancelled']
  },
  missionTimeline: MissionTimelineSchema,
  destination: {
    type: String,
    required: true,
    enum: [
      'Suborbital',
      'Low Earth Orbit (LEO)',
      'Medium Earth Orbit (MEO)',
      'Geostationary Orbit (GEO)',
      'Highly Elliptical Orbit (HEO)',
      'Earth–Moon System',
      'Moon',
      'Cislunar Space',
      'Lagrange Points (L1–L5)',
      'Mars',
      'Venus',
      'Mercury',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Asteroid',
      'Comet',
      'Interplanetary Space',
      'Heliosphere',
      'Deep Space',
      'Interstellar Space',
      'Space Station'
    ]
  },
  spacecraft: SpacecraftSchema,
  crew: CrewSchema,
  objectives: [String],
  payloads: [PayloadSchema],
  orbitDetails: OrbitDetailsSchema,
  budget: BudgetSchema,
  outcome: OutcomeSchema,
  media: MediaSchema,
  lastUpdated: { type: Date, default: Date.now },
  createdByUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  trackedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate a unique slug
MissionSchema.pre('save', async function() {
  if (this.isModified('missionName') || this.isNew) {
    let baseSlug = generateSlug(this.missionName);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique by appending a number if necessary
    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
});

const Mission = mongoose.model('Mission', MissionSchema);

export default Mission;

const mongoose = require('mongoose');

const ConstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  detections: { type: Number, required: true, default: 0 },
  percentage: { type: Number, default: 0 },
  color: { type: String, default: '#E10600' }
}, { _id: false });

const TrackedObjectSchema = new mongoose.Schema({
  track_id: { type: Number, required: true },
  team: { type: String, default: 'Unknown' },
  constructor_name: { type: String, default: 'Unknown' },
  frames_detected: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  first_detected: { type: String, default: '00:00' },
  last_detected: { type: String, default: '00:00' }
}, { _id: false });

const FlagEventSchema = new mongoose.Schema({
  event_type: { type: String, required: true }, // e.g. 'VSC', 'Yellow Flag', 'Green Flag', 'Red Flag', 'Safety Car'
  start_time: { type: Number, required: true }, // in seconds
  end_time: { type: Number, required: true },   // in seconds
  start_timestamp: { type: String, required: true }, // '00:18'
  end_timestamp: { type: String, required: true },   // '00:31'
  duration: { type: Number, required: true },        // seconds (e.g. 13)
  confidence: { type: Number, default: 0.90 },
  description: { type: String }
}, { _id: false });

const TimelineItemSchema = new mongoose.Schema({
  timestamp: { type: String, required: true }, // '00:12'
  time: { type: Number, required: true },      // seconds
  label: { type: String, required: true },     // 'Ferrari detected'
  type: { type: String, default: 'detection' }  // 'detection' | 'flag_event' | 'system'
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  videoName: {
    type: String,
    required: true,
    trim: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  duration: {
    type: Number,
    default: 0
  },
  totalDetections: {
    type: Number,
    default: 0
  },
  totalCars: {
    type: Number,
    default: 0
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  averageConfidence: {
    type: Number,
    default: 0
  },
  framesProcessed: {
    type: Number,
    default: 0
  },
  statistics: {
    total_detections: { type: Number, default: 0 },
    total_cars: { type: Number, default: 0 },
    total_events: { type: Number, default: 0 },
    average_confidence: { type: Number, default: 0 },
    frames_processed: { type: Number, default: 0 }
  },
  constructors: [ConstructorSchema],
  trackedObjects: [TrackedObjectSchema],
  events: [FlagEventSchema],
  timeline: [TimelineItemSchema],
  heatmapPath: {
    type: String,
    default: ''
  },
  analyzedVideoPath: {
    type: String,
    default: ''
  },
  originalVideoPath: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', AnalysisSchema);

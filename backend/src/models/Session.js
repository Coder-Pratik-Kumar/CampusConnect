import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider ID is required'],
    },
    skill: {
      type: String,
      required: [true, 'Skill is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Session date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Session time is required'],
      trim: true,
    },
    duration: {
      type: String,
      default: '60 min',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    // ─── Zoom Meeting ──────────────────────────────────────────────────────────
    // Populated automatically when the provider accepts the session.
    // start_url is intentionally never stored; participants use joinUrl only.
    zoom: {
      meetingId: { type: String, default: null },
      joinUrl: { type: String, default: null },
      password: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model('Session', sessionSchema);
export default Session;


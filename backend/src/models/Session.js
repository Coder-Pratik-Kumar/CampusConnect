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
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model('Session', sessionSchema);
export default Session;

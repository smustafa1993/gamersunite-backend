import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', index: true },
    levelNumber: { type: Number, default: 0 }
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    roles: { type: [String], default: ['user'] },
    prefs: {
      spoilerMode: {
        type: String,
        enum: ['auto', 'always_hide', 'always_show'],
        default: 'auto'
      }
    },
    progress: { type: [progressSchema], default: [] }
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)

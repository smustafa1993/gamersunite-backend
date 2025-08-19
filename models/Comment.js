import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', index: true, required: true },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', index: true, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },

    // Aggregate score
    votes: { type: Number, default: 0, index: true },

    // One vote per user: -1, 0, 1
    voteMap: {
      type: Map,
      of: Number, // store as number strings: { "<userId>": -1|0|1 }
      default: {}
    },
  },
  { timestamps: true }
)

// Helpful index for listing by level
commentSchema.index({ level: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)

import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverUrl: String,
    genres: [String],
    platforms: [String],
    rawgId: String
  },
  { timestamps: true }
)

gameSchema.index({ title: 'text' })

export default mongoose.model('Game', gameSchema)

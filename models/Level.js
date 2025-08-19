import mongoose from 'mongoose'

const levelSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    summary: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

levelSchema.index({ game: 1, number: 1 }, { unique: true })

export default mongoose.model('Level', levelSchema)

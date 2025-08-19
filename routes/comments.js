import { Router } from 'express'
import { listComments, createComment, voteComment, reportComment } from '../controllers/commentController.js'
import { requireAuth, attachUser } from '../middleware/auth.js'
import { moderateText } from '../middleware/perspective.js'

const r = Router()
r.get('/level/:levelId', attachUser, listComments)
r.post('/level/:levelId', requireAuth, moderateText, createComment)
r.post('/:id/vote', requireAuth, voteComment)
r.post('/:id/report', requireAuth, reportComment)
export default r

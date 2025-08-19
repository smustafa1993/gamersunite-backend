/* seeds/seed_comments.js
 * Add baseline comments to every Level in the database.
 * - Creates a "Seed Bot" user if not existing.
 * - Skips any level that already has comments (idempotent-ish).
 * Run: node seeds/seed_comments.js
 */

require('dotenv').config()
const mongoose = require('mongoose')

let Game   = require('../models/Game');   Game   = Game.default   || Game
let Level  = require('../models/Level');  Level  = Level.default  || Level
let User   = require('../models/User');   User   = User.default   || User
let Comment= require('../models/Comment');Comment= Comment.default|| Comment

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamersunite'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { autoIndex: true })
  console.log('[seed-comments] connected:', uri)
}

async function getSeedUser() {
  const email = 'seedbot@gamersunite.local'
  let u = await User.findOne({ email })
  if (!u) {
    u = await User.create({
      email,
      passwordHash: 'seeded-no-login',
      displayName: 'Seed Bot',
      roles: ['admin'],
      prefs: { spoilerMode: 'auto' },
      progress: []
    })
    console.log('[seed-comments] created seed user:', u._id)
  }
  return u
}

/** Small helper to identify a game quickly */
function gameKey(g) {
  const s = (g.slug || '').toLowerCase()
  if (s.includes('resident-evil-4')) return 're4'
  if (s.includes('sekiro')) return 'sekiro'
  if (s === 'elden-ring') return 'elden'
  if (s.includes('god-of-war')) return 'gow2018'
  if (s.includes('last-of-us')) return 'tlou1'
  if (s.includes('ghost-of-tsushima')) return 'tsushima'
  if (s.includes('hollow-knight')) return 'hk'
  if (s.includes('dark-souls-iii')) return 'ds3'
  if (s === 'bloodborne') return 'bb'
  if (s.includes('baldurs-gate-3')) return 'bg3'
  return 'generic'
}

/** Mildly game-aware comment generator.
 * We keep these spoiler-light and genuinely useful.
 */
function makeCommentsForLevel(game, level) {
  const key = gameKey(game)
  const t = (level.title || '').toLowerCase()

  // Useful, non-spoilery overview for any level
  const overview = `Overview: “${level.title}” is a key step in ${game.title}. Expect the usual pacing for this section and use the level layout to your advantage. Managing resources and scouting ahead makes this part much smoother.`

  // A practical tip, tuned per game when we can infer from the title
  let tip = null

  switch (key) {
    case 're4': {
      if (t.includes('chapter 1')) tip = 'Tip: Save handgun ammo for crowd control and rely on melee follow-ups after stagger. Crates and barrels near the village help with quick stuns.'
      else if (t.includes('chapter')) tip = 'Tip: Prioritize upgrades on the handgun/shotgun early. Shoot leg/face to trigger melee; it’s the best ammo economy throughout the chapter.'
      break
    }
    case 'sekiro': {
      if (t.includes('ashina outskirts')) tip = 'Tip: Practice deflect timing on basic ashigaru — perfect deflects build posture damage fast and are safer than dodging.'
      else if (t.includes('hirata')) tip = 'Tip: Oil + Flame Vent is great on shielded foes. Scout with grapples; many fights are trivial if you isolate targets.'
      else tip = 'Tip: If a boss walls you, step in and deflect — aggression stabilizes posture damage and opens quick deathblows.'
      break
    }
    case 'elden': {
      if (t.includes('stormveil')) tip = 'Tip: Use the side path to thin groups before main courtyards. Guard-counters stagger knights quickly; craft fire pots for birds.'
      else if (t.includes('liurnia') || t.includes('academy')) tip = 'Tip: Magic resistance helps in the academy. Bring blunt options for crystalians; spirit summons can buy you posture windows.'
      else tip = 'Tip: Don’t over-level a single weapon early; pick one ashes-of-war affinity that fits your stats and commit until midgame.'
      break
    }
    case 'gow2018': {
      if (t.includes('alfheim')) tip = 'Tip: Light arrows remove dark crystals — clear lines of sight to control arenas. Leviathan throws interrupt many ranged threats.'
      else tip = 'Tip: Use parries into R1/R2 finishers; runic cooldown reduction pays off more than raw stat stacking in midgame.'
      break
    }
    case 'tlou1': {
      if (t.includes('pittsburgh') || t.includes('suburbs')) tip = 'Tip: Bricks/bottles are crowd control. Craft smoke bombs for human ambushes; shift clickers only when the path is narrow.'
      else tip = 'Tip: Stealth saves ammo. Use listen mode to plan routes; keep at least one shiv for doors and emergencies.'
      break
    }
    case 'tsushima': {
      if (t.includes('yarikawa')) tip = 'Tip: The Longbow changes the siege dynamic — prioritize archers and ignore shieldmen until you’ve got space.'
      else tip = 'Tip: Swap stances often; Stone vs swords, Water vs shields, Wind vs spears, Moon vs brutes. Resolve is your safety net.'
      break
    }
    case 'hk': {
      if (t.includes('city of tears')) tip = 'Tip: Prioritize movement upgrades — Monarch Wings and nail upgrades dramatically reduce backtracking pain.'
      else tip = 'Tip: Charms like Quick Focus and Shaman Stone can carry tough fights; build around your playstyle, not just raw damage.'
      break
    }
    case 'ds3': {
      if (t.includes('irithyll')) tip = 'Tip: Frost builds stack fast here. Fire infusions or pyromancies trivialize many local enemies.'
      else tip = 'Tip: Learn enemy spacing and quickstep windows — roll into swings, not away; punish recovery, then back off.'
      break
    }
    case 'bb': {
      if (t.includes('forbidden woods')) tip = 'Tip: Antidotes and fire are king here. Pull enemies one by one and avoid getting encircled on slopes.'
      else tip = 'Tip: Rally system rewards aggression — trade safely and immediately reclaim health with a few quick hits.'
      break
    }
    case 'bg3': {
      if (t.includes('goblin') || t.includes('emirald') || t.includes('grove')) tip = 'Tip: Talk solutions first — faction outcomes open/close vendors and quests. Elevation and darkness matter a lot in early fights.'
      else tip = 'Tip: Pre-buff before combat and use shove/jump/elevation every turn. Control spells win fights more than raw damage.'
      break
    }
    default: {
      tip = 'Tip: Learn enemy patterns in this section and pull small groups instead of rushing. Upgrade the tool that solves the level’s main threat.'
    }
  }

  return [
    { kind: 'overview', text: overview },
    { kind: 'tip', text: tip }
  ]
}

async function seedComments() {
  const seedUser = await getSeedUser()
  const games = await Game.find({}).select('_id title slug').lean()
  let total = 0, skipped = 0

  for (const g of games) {
    const levels = await Level.find({ game: g._id }).sort({ number: 1 }).lean()
    console.log(`[seed-comments] ${g.title}: ${levels.length} levels`)
    for (const lv of levels) {
      const existing = await Comment.countDocuments({ level: lv._id })
      if (existing > 0) {
        skipped++
        continue
      }
      const entries = makeCommentsForLevel(g, lv)
      const docs = entries.map((e) => ({
        game: g._id,
        level: lv._id,
        author: seedUser._id,
        body: e.text,
        votes: 0,
        status: 'visible'
      }))
      await Comment.insertMany(docs)
      total += docs.length
    }
  }
  console.log(`[seed-comments] inserted ${total} comments, skipped ${skipped} levels (already had comments).`)
}

async function main() {
  await connect()
  await seedComments()
  await mongoose.disconnect()
  console.log('[seed-comments] Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

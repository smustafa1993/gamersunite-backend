/* seeds/seed.js
 * Bulk seed for GamersUnite
 * - Upserts Games by slug
 * - Replaces their Levels
 * Run: node seeds/seed.js
 */

require('dotenv').config()
const mongoose = require('mongoose')

// Models (CommonJS + ESM compatibility)
let Game = require('../models/Game');      Game = Game.default || Game
let Level = require('../models/Level');    Level = Level.default || Level
let User  = require('../models/User');     User  = User.default  || User

// ---- connection ----
async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamersunite'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { autoIndex: true })
  console.log('[seed] connected:', uri)
}

// ---- helper: seed owner user (required for Level.createdBy) ----
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
    console.log('[seed] created seed user:', u._id)
  }
  return u
}

// ---- data builders (levels) ----

function re4Levels() {
  const titles = Array.from({ length: 16 }, (_, i) => `Chapter ${i + 1}`)
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Resident Evil 4 Remake – ${t}.` }))
}

function sekiroLevels() {
  const titles = [
    'Ashina Outskirts',
    'Hirata Estate (Flashback)',
    'Ashina Castle',
    'Abandoned Dungeon',
    'Senpou Temple, Mt. Kongo',
    'Sunken Valley',
    'Ashina Depths',
    'Fountainhead Palace',
    'Endgame: Return to Ashina'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Sekiro – ${t}.` }))
}

function eldenRingLevels() {
  const titles = [
    'Limgrave: Gatefront & Stormgate',
    'Stormveil Castle',
    'Liurnia of the Lakes',
    'Academy of Raya Lucaria',
    'Altus Plateau',
    'Leyndell, Royal Capital',
    'Mountaintops of the Giants',
    'Fire Giant & Forge',
    'Crumbling Farum Azula',
    'Leyndell, Ashen Capital',
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Elden Ring – ${t}.` }))
}

function gow2018Levels() {
  const titles = [
    'The Marked Trees',
    'Path to the Mountain',
    'A Realm Beyond',
    'The Light of Alfheim',
    'Inside the Mountain',
    'A New Destination',
    'The Magic Chisel',
    'Behind the Lock',
    'The Sickness',
    'The Black Rune',
    'Return to the Summit',
    'Jötunheim in Reach',
    'Mother’s Ashes'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `God of War (2018) – ${t}.` }))
}

function tlou1Levels() {
  const titles = [
    'Hometown',
    '20 Years Later',
    'The Outskirts',
    'Bill’s Town',
    'Pittsburgh',
    'The Suburbs',
    'Tommy’s Dam',
    'The University',
    'Lakeside Resort',
    'Bus Depot',
    'The Firefly Lab',
    'Jackson'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `The Last of Us Part I – ${t}.` }))
}

function tsushimaLevels() {
  const titles = [
    'Act 1: Rescue Lord Shimura',
    'Act 1: The Broken Blacksmith',
    'Act 1: Blood on the Grass',
    'Act 2: Siege of Yarikawa',
    'Act 2: Ghosts from the Past',
    'Act 2: From the Darkness',
    'Act 3: Wolves at the Gates',
    'Act 3: The Fate of Tsushima',
    'Act 3: The Tale of Lord Shimura'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Ghost of Tsushima – ${t}.` }))
}

function hollowKnightLevels() {
  const titles = [
    'Forgotten Crossroads',
    'Greenpath',
    'Fungal Wastes',
    'City of Tears',
    'Crystal Peak',
    'Resting Grounds',
    'Deepnest',
    'Ancient Basin',
    'Kingdom’s Edge',
    'Queen’s Gardens'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Hollow Knight – ${t}.` }))
}

function ds3Levels() {
  const titles = [
    'Cemetery of Ash',
    'High Wall of Lothric',
    'Undead Settlement',
    'Road of Sacrifices',
    'Farron Keep',
    'Cathedral of the Deep',
    'Irithyll of the Boreal Valley',
    'Anor Londo',
    'Lothric Castle',
    'Grand Archives',
    'Kiln of the First Flame'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Dark Souls III – ${t}.` }))
}

function bloodborneLevels() {
  const titles = [
    'Central Yharnam',
    'Cathedral Ward',
    'Old Yharnam',
    'Hemwick Charnel Lane',
    'Forbidden Woods',
    'Byrgenwerth',
    'Yahar’gul, Unseen Village',
    'Lecture Building',
    'Nightmare of Mensis',
    'Mergo’s Loft'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Bloodborne – ${t}.` }))
}

function bg3Levels() {
  const titles = [
    'Act I: Nautiloid',
    'Act I: Emerald Grove',
    'Act I: Underdark',
    'Act I: Goblin Camp',
    'Act II: Last Light Inn',
    'Act II: Moonrise Towers',
    'Act III: Rivington',
    'Act III: Lower City',
    'Act III: The Elder Brain'
  ]
  return titles.map((t, i) => ({ number: i + 1, title: t, summary: `Baldur’s Gate 3 – ${t}.` }))
}

// ---- games ----
/** coverUrl left empty intentionally; we can auto-fetch later via RAWG */
const GAMES = [
  {
    slug: 'resident-evil-4-remake',
    title: 'Resident Evil 4 (Remake)',
    coverUrl: '',
    genres: ['Survival Horror', 'Action'],
    platforms: ['PC', 'PS5', 'Xbox Series'],
    rawgId: 'resident-evil-4-remake',
    levels: re4Levels()
  },
  {
    slug: 'sekiro-shadows-die-twice',
    title: 'Sekiro: Shadows Die Twice',
    coverUrl: '',
    genres: ['Action', 'Soulslike'],
    platforms: ['PC', 'PS4', 'Xbox One'],
    rawgId: 'sekiro-shadows-die-twice',
    levels: sekiroLevels()
  },
  {
    slug: 'elden-ring',
    title: 'Elden Ring',
    coverUrl: '',
    genres: ['Action RPG', 'Soulslike'],
    platforms: ['PC', 'PS5', 'Xbox Series', 'PS4', 'Xbox One'],
    rawgId: 'elden-ring',
    levels: eldenRingLevels()
  },
  {
    slug: 'god-of-war-2018',
    title: 'God of War (2018)',
    coverUrl: '',
    genres: ['Action', 'Adventure'],
    platforms: ['PS4', 'PS5', 'PC'],
    rawgId: 'god-of-war-2', // RAWG slug for 2018 is "god-of-war" (string allowed)
    levels: gow2018Levels()
  },
  {
    slug: 'the-last-of-us-part-i',
    title: 'The Last of Us Part I',
    coverUrl: '',
    genres: ['Action', 'Adventure'],
    platforms: ['PS5', 'PC'],
    rawgId: 'the-last-of-us-part-i',
    levels: tlou1Levels()
  },
  {
    slug: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima',
    coverUrl: '',
    genres: ['Action', 'Adventure'],
    platforms: ['PS5', 'PS4', 'PC'],
    rawgId: 'ghost-of-tsushima',
    levels: tsushimaLevels()
  },
  {
    slug: 'hollow-knight',
    title: 'Hollow Knight',
    coverUrl: '',
    genres: ['Metroidvania', 'Action'],
    platforms: ['PC', 'Switch', 'PS4', 'Xbox One'],
    rawgId: 'hollow-knight',
    levels: hollowKnightLevels()
  },
  {
    slug: 'dark-souls-iii',
    title: 'Dark Souls III',
    coverUrl: '',
    genres: ['Action RPG', 'Soulslike'],
    platforms: ['PC', 'PS4', 'Xbox One'],
    rawgId: 'dark-souls-iii',
    levels: ds3Levels()
  },
  {
    slug: 'bloodborne',
    title: 'Bloodborne',
    coverUrl: '',
    genres: ['Action', 'Soulslike'],
    platforms: ['PS4'],
    rawgId: 'bloodborne',
    levels: bloodborneLevels()
  },
  {
    slug: 'baldurs-gate-3',
    title: 'Baldur’s Gate 3',
    coverUrl: '',
    genres: ['CRPG'],
    platforms: ['PC', 'PS5', 'Xbox Series'],
    rawgId: 'baldurs-gate-3',
    levels: bg3Levels()
  }
]

// ---- upsert logic ----
async function upsertGameWithLevels(spec, createdById) {
  const { slug, title, coverUrl, genres, platforms, rawgId, levels } = spec

  let game = await Game.findOne({ slug })
  if (!game) {
    game = await Game.create({ slug, title, coverUrl, genres, platforms, rawgId })
    console.log(`[seed] created game: ${title}`)
  } else {
    game.title = title
    game.coverUrl = coverUrl
    game.genres = genres
    game.platforms = platforms
    game.rawgId = rawgId
    await game.save()
    console.log(`[seed] updated game: ${title}`)
  }

  // replace levels
  await Level.deleteMany({ game: game._id })
  const docs = levels.map(l => ({
    game: game._id,
    number: l.number,
    title: l.title,
    summary: l.summary || '',
    createdBy: createdById
  }))
  await Level.insertMany(docs)
  console.log(`[seed] inserted ${docs.length} levels for: ${title}`)
}

// ---- main ----
async function main() {
  await connect()
  const seedUser = await getSeedUser()
  for (const g of GAMES) {
    await upsertGameWithLevels(g, seedUser._id)
  }
  console.log('[seed] Done.')
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

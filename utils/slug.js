import slugify from 'slugify'
export const toSlug = (s) =>
  slugify(String(s || ''), { lower: true, strict: true, trim: true })

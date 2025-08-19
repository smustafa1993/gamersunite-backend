export function maskCommentBody({ body, masked }) {
  if (!masked) return { body, masked: false, preview: null }
  const preview = body.slice(0, 40) + (body.length > 40 ? '…' : '')
  return { body: null, masked: true, preview }
}

export function shouldMask({ userPrefsMode, userLevel, levelNumber }) {
  if (userPrefsMode === 'always_show') return false
  if (userPrefsMode === 'always_hide') return true
  // auto mode
  return Number(levelNumber) > Number(userLevel || 0)
}

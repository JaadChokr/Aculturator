export const COLLAB_BASE = '/collaborateur'
export const collabPath = (p = '') => (p ? `${COLLAB_BASE}/${p.replace(/^\//, '')}` : COLLAB_BASE)

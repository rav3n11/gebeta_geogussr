/**
 * Generate a DiceBear avatar URL using the user's name as a seed
 * Uses the 'notionists-neutra' style for consistent, professional avatars
 */

export const generateDiceBearAvatar = (name: string, size: number = 40): string => {
  // Clean the name to use as a seed (remove spaces, special chars, make lowercase)
  const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Use DiceBear's notionists-neutra style with the name as seed
  const baseUrl = 'https://api.dicebear.com/7.x/notionists-neutral/svg'
  const params = new URLSearchParams({
    seed: seed || 'default',
    size: size.toString(),
    backgroundColor: 'transparent',
    format: 'svg'
  })
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate a consistent avatar URL for a user
 * This ensures the same name always generates the same avatar
 */
export const getUserAvatarUrl = (firstName: string, lastName?: string): string => {
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`
  return generateDiceBearAvatar(fullName)
}

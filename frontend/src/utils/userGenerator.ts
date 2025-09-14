import { generateDiceBearAvatar } from './dicebearAvatar'

// Simple random name generator
const adjectives = ['Happy', 'Clever', 'Swift', 'Bright', 'Bold', 'Wise', 'Kind', 'Brave', 'Calm', 'Wild']
const nouns = ['Explorer', 'Navigator', 'Traveler', 'Wanderer', 'Seeker', 'Adventurer', 'Pioneer', 'Discoverer', 'Scout', 'Ranger']

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1
  return `${adjective}${noun}${number}`
}

export function generateAvatarUrl(name: string): string {
  return generateDiceBearAvatar(name, 40)
}

export function getStoredUserName(): string | null {
  return localStorage.getItem('gebeta_user_name')
}

export function storeUserName(name: string): void {
  localStorage.setItem('gebeta_user_name', name)
}


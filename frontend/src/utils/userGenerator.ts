import { createAvatar } from '@dicebear/core'
import { adventurer } from '@dicebear/collection'

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
  const avatar = createAvatar(adventurer, {
    seed: name,
    size: 40,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
  })
  return avatar.toDataUri()
}

export function getStoredUserName(): string | null {
  return localStorage.getItem('gebeta_user_name')
}

export function storeUserName(name: string): void {
  localStorage.setItem('gebeta_user_name', name)
}


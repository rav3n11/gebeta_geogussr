/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Calculate score based on distance using a logarithmic scale
 * This system better rewards accuracy and penalizes random guesses
 * @param distance Distance in kilometers
 * @returns Score (0-5000)
 */
export function calculateScore(distance: number): number {
  // Maximum score for perfect guess (within 1km)
  const maxScore = 5000;
  
  // Minimum score threshold (beyond 1000km gets 0 points)
  const maxDistance = 1000;
  
  // If distance is beyond threshold, return 0
  if (distance >= maxDistance) {
    return 0;
  }
  
  // For very close guesses (within 1km), give maximum score
  if (distance <= 1) {
    return maxScore;
  }
  
  // Use logarithmic scale for better distribution
  // This gives much higher scores for close guesses and rapidly decreases for far ones
  const logDistance = Math.log10(distance);
  const maxLogDistance = Math.log10(maxDistance);
  
  // Normalize the logarithmic distance to 0-1 range
  const normalizedDistance = logDistance / maxLogDistance;
  
  // Apply exponential decay for better score distribution
  // This ensures close guesses get much higher scores
  const score = maxScore * Math.pow(1 - normalizedDistance, 2.5);
  
  return Math.round(Math.max(0, score));
}

/**
 * Get score tier based on distance for display purposes
 * @param distance Distance in kilometers
 * @returns Score tier description
 */
export function getScoreTier(distance: number): { tier: string; color: string; description: string } {
  if (distance <= 0.1) {
    return { tier: "Perfect!", color: "text-green-600", description: "Incredible accuracy!" };
  } else if (distance <= 1) {
    return { tier: "Excellent", color: "text-green-500", description: "Outstanding guess!" };
  } else if (distance <= 5) {
    return { tier: "Great", color: "text-blue-500", description: "Very close!" };
  } else if (distance <= 25) {
    return { tier: "Good", color: "text-yellow-500", description: "Nice try!" };
  } else if (distance <= 100) {
    return { tier: "Fair", color: "text-orange-500", description: "Getting warmer..." };
  } else if (distance <= 500) {
    return { tier: "Poor", color: "text-red-500", description: "Not quite there" };
  } else {
    return { tier: "Miss", color: "text-red-600", description: "Better luck next time!" };
  }
} 
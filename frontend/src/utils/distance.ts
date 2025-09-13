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
 * Calculate score based on distance using a simple linear scale
 * This system provides clear differentiation between accuracy levels
 * @param distance Distance in kilometers
 * @returns Score (0-1000)
 */
export function calculateScore(distance: number): number {
  // Maximum score for perfect guess
  const maxScore = 1000;
  
  // Score drops by 20 points per kilometer
  const pointsPerKm = 20;
  
  // Calculate score: maxScore - (distance * pointsPerKm)
  const score = maxScore - (distance * pointsPerKm);
  
  // Return 0 if score would be negative
  return Math.max(0, Math.round(score));
}

/**
 * Get score tier based on distance for display purposes
 * @param distance Distance in kilometers
 * @returns Score tier description
 */
export function getScoreTier(distance: number): { tier: string; color: string; description: string } {
  if (distance <= 1) {
    return { tier: "Perfect!", color: "text-green-600", description: "Incredible accuracy!" };
  } else if (distance <= 5) {
    return { tier: "Excellent", color: "text-green-500", description: "Outstanding guess!" };
  } else if (distance <= 10) {
    return { tier: "Great", color: "text-blue-500", description: "Very close!" };
  } else if (distance <= 25) {
    return { tier: "Good", color: "text-yellow-500", description: "Nice try!" };
  } else if (distance <= 40) {
    return { tier: "Fair", color: "text-orange-500", description: "Getting warmer..." };
  } else {
    return { tier: "Miss", color: "text-red-500", description: "Better luck next time!" };
  }
} 
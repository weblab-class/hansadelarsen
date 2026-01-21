// --- CONFIGURATION ---
const ACTIVITY_TYPES = [
  { label: "Pickup Soccer", category: "sportsInterest", type: "activity", duration: [1, 2] },
  { label: "Painting Workshop", category: "artsInterest", type: "activity", duration: [2, 3] },
  { label: "Hiking Trip", category: "outdoorsVibe", type: "activity", duration: [3, 4] },
  {
    label: "Coding Hackathon",
    category: "educationalInterest",
    type: "activity",
    duration: [3, 4],
  },
  { label: "Museum Tour", category: "artsInterest", type: "activity", duration: [2, 3] },
  { label: "Yoga Session", category: "sportsInterest", type: "activity", duration: [1, 1] },
  { label: "Study Group", category: "educationalInterest", type: "activity", duration: [1, 3] },
];

const MEAL_TYPES = [
  { label: "Sushi Lunch", category: "diningPrice", type: "meal", duration: [1, 1] },
  { label: "Pizza Party", category: "diningPrice", type: "meal", duration: [1, 2] },
  { label: "Coffee Chat", category: "diningPrice", type: "meal", duration: [1, 1] },
  { label: "Fine Dining", category: "diningPrice", type: "meal", duration: [2, 3] },
];

// --- HELPER: GET MEAL NAME BY TIME ---
const getMealName = (hour) => {
  if (hour >= 8 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  if (hour >= 16 && hour < 22) return "Dinner";
  return "Late Night Snack";
};

// --- MAIN GENERATOR ---
export const generateQuests = (userPreferences) => {
  const quests = [];
  const DAYS = 7;
  const HOURS_IN_DAY = 16; // 8 AM to 11 PM

  // Generate ~50 random events throughout the week
  for (let i = 0; i < 50; i++) {
    const day = Math.floor(Math.random() * DAYS);
    const startHour = Math.floor(Math.random() * (HOURS_IN_DAY - 1));

    // Randomly decide if it's a meal or activity
    const isMeal = Math.random() < 0.3; // 30% chance of meal
    const template = isMeal
      ? MEAL_TYPES[Math.floor(Math.random() * MEAL_TYPES.length)]
      : ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];

    // Randomize Duration
    const duration =
      Math.floor(Math.random() * (template.duration[1] - template.duration[0] + 1)) +
      template.duration[0];

    // Ensure it doesn't go past 11 PM
    if (startHour + duration > HOURS_IN_DAY) continue;

    // --- SCORING ALGORITHM ---
    // 1. Base Score
    let score = 50;

    // 2. Personality Match
    // User Prefs are usually 1-3. We normalize to 0-100 impact.
    // If user has high interest (3) in 'sportsInterest', they get +30 points.
    const userInterest = userPreferences[template.category] || 1;
    score += userInterest * 15;

    // 3. Random "Vibe" Factor (to simulate real world variance)
    score += Math.floor(Math.random() * 20);

    // 4. Formatting Title for Meals
    let title = template.label;
    if (isMeal) {
      title = `${getMealName(startHour + 8)}: ${template.label}`;
    }

    quests.push({
      id: i,
      day: day, // 0-6
      startHour: startHour, // 0-15 (relative to 8 AM)
      duration: duration,
      title: title,
      type: template.type, // 'meal' or 'activity'
      score: Math.min(score, 100), // Cap at 100
      matchPercent: Math.min(score, 99), // Display value
    });
  }

  return quests;
};

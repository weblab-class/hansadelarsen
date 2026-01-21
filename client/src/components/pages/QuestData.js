/**
 * QUEST DATA GENERATOR
 * Generates quests based on User Profile preferences:
 * - diningPrice (1-3)
 * - sportsInterest (1-3)
 * - artsInterest (1-3)
 * - outdoorsVibe (1-3)
 * - educationalInterest (1-3)
 */

// --- 1. DATA TEMPLATES ---

const MEAL_TEMPLATES = [
  // Price Level 1 ($)
  { title: "Bagels & Coffee Run", type: "meal", priceLevel: 1, tags: ["morning"] },
  { title: "Street Tacos Stand", type: "meal", priceLevel: 1, tags: ["lunch", "dinner"] },
  { title: "Grab & Go Pizza Slice", type: "meal", priceLevel: 1, tags: ["lunch", "dinner"] },
  { title: "Food Court Meetup", type: "meal", priceLevel: 1, tags: ["lunch"] },
  { title: "Breakfast Burrito Spot", type: "meal", priceLevel: 1, tags: ["morning"] },
  { title: "Late Night Diner", type: "meal", priceLevel: 1, tags: ["dinner"] },
  { title: "Donut Shop Stop", type: "meal", priceLevel: 1, tags: ["morning"] },

  // Price Level 2 ($$)
  { title: "Trendy Ramen Spot", type: "meal", priceLevel: 2, tags: ["lunch", "dinner"] },
  { title: "Sunday Brunch", type: "meal", priceLevel: 2, tags: ["morning", "lunch"] },
  { title: "Korean BBQ Group", type: "meal", priceLevel: 2, tags: ["dinner"] },
  { title: "Artisan Burger Bar", type: "meal", priceLevel: 2, tags: ["lunch", "dinner"] },
  { title: "Dim Sum Cart", type: "meal", priceLevel: 2, tags: ["morning", "lunch"] },
  { title: "Italian Bistro", type: "meal", priceLevel: 2, tags: ["dinner"] },
  { title: "Sushi Lunch Special", type: "meal", priceLevel: 2, tags: ["lunch"] },

  // Price Level 3 ($$$)
  { title: "Omakase Experience", type: "meal", priceLevel: 3, tags: ["dinner"] },
  { title: "Steakhouse Dinner", type: "meal", priceLevel: 3, tags: ["dinner"] },
  { title: "French Fine Dining", type: "meal", priceLevel: 3, tags: ["dinner"] },
  { title: "Rooftop Cocktails & Apps", type: "meal", priceLevel: 3, tags: ["dinner"] },
  { title: "Seafood Tower Feast", type: "meal", priceLevel: 3, tags: ["dinner"] },
];

const ACTIVITY_TEMPLATES = [
  // --- SPORTS (sportsInterest) ---
  { title: "Pickup Basketball", type: "activity", category: "sports", duration: 2 },
  {
    title: "Morning Run Club",
    type: "activity",
    category: "sports",
    duration: 1,
    preferredTime: "morning",
  },
  { title: "Tennis Doubles", type: "activity", category: "sports", duration: 2 },
  { title: "Rock Climbing Gym", type: "activity", category: "sports", duration: 3 },
  {
    title: "Yoga in the Park",
    type: "activity",
    category: "sports",
    duration: 1,
    preferredTime: "morning",
  },
  { title: "Ultimate Frisbee", type: "activity", category: "sports", duration: 2 },
  { title: "Spikeball Tournament", type: "activity", category: "sports", duration: 2 },
  {
    title: "Lap Swimming",
    type: "activity",
    category: "sports",
    duration: 1,
    preferredTime: "morning",
  },
  { title: "Bouldering Session", type: "activity", category: "sports", duration: 2 },

  // --- ARTS & MUSIC (artsInterest) ---
  { title: "Modern Art Gallery Tour", type: "activity", category: "arts", duration: 2 },
  { title: "Pottery Workshop", type: "activity", category: "arts", duration: 3 },
  { title: "Indie Film Screening", type: "activity", category: "arts", duration: 2 },
  {
    title: "Live Jazz Night",
    type: "activity",
    category: "arts",
    duration: 3,
    preferredTime: "evening",
  },
  { title: "Sketching in the Park", type: "activity", category: "arts", duration: 2 },
  {
    title: "Open Mic Night",
    type: "activity",
    category: "arts",
    duration: 3,
    preferredTime: "evening",
  },
  { title: "Bedroom Pop Jam Session", type: "activity", category: "arts", duration: 2 },
  {
    title: "Symphony Orchestra",
    type: "activity",
    category: "arts",
    duration: 3,
    preferredTime: "evening",
  },
  {
    title: "Photography Walk",
    type: "activity",
    category: "arts",
    duration: 2,
    preferredTime: "morning",
  },
  { title: "Vinyl Record Hunting", type: "activity", category: "arts", duration: 2 },

  // --- OUTDOORS (outdoorsVibe) ---
  { title: "Hiking the Fells", type: "activity", category: "outdoors", duration: 3 },
  { title: "Charles River Kayaking", type: "activity", category: "outdoors", duration: 2 },
  {
    title: "Community Garden Help",
    type: "activity",
    category: "outdoors",
    duration: 2,
    preferredTime: "morning",
  },
  {
    title: "Sunset Beach Walk",
    type: "activity",
    category: "outdoors",
    duration: 2,
    preferredTime: "evening",
  },
  { title: "Arboretum Picnic", type: "activity", category: "outdoors", duration: 2 },
  {
    title: "Sunrise Meditation",
    type: "activity",
    category: "outdoors",
    duration: 1,
    preferredTime: "morning",
  },
  { title: "Urban Foraging Walk", type: "activity", category: "outdoors", duration: 2 },
  { title: "Bike Path Cruise", type: "activity", category: "outdoors", duration: 2 },

  // --- EDUCATIONAL (educationalInterest) ---
  { title: "History Museum Tour", type: "activity", category: "education", duration: 3 },
  { title: "Tech Startup Lecture", type: "activity", category: "education", duration: 2 },
  { title: "Book Club Meeting", type: "activity", category: "education", duration: 2 },
  { title: "Physics Study Group", type: "activity", category: "education", duration: 2 },
  { title: "Language Exchange", type: "activity", category: "education", duration: 1 },
  {
    title: "Code & Coffee",
    type: "activity",
    category: "education",
    duration: 2,
    preferredTime: "morning",
  },
  { title: "Science Museum Visit", type: "activity", category: "education", duration: 3 },
  { title: "Creative Writing Workshop", type: "activity", category: "education", duration: 2 },
];

const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

// --- 2. SCORING LOGIC ---

const calculateScore = (quest, prefs) => {
  if (!prefs) return Math.floor(Math.random() * 40) + 50;

  let score = 50; // Start neutral

  // A. SCORING FOR MEALS
  if (quest.type === "meal") {
    const userBudget = prefs.diningPrice || 2; // Default to $$
    const questPrice = quest.priceLevel || 1;

    if (questPrice === userBudget) {
      score += 35; // Perfect match
    } else if (questPrice < userBudget) {
      score += 20; // Cheaper is okay
    } else {
      score -= 30; // Too expensive!
    }
  }

  // B. SCORING FOR ACTIVITIES
  if (quest.type === "activity") {
    let interestLevel = 1; // Default low

    // Map category to user preference
    if (quest.category === "sports") interestLevel = prefs.sportsInterest;
    if (quest.category === "arts") interestLevel = prefs.artsInterest;
    if (quest.category === "outdoors") interestLevel = prefs.outdoorsVibe;
    if (quest.category === "education") interestLevel = prefs.educationalInterest;

    // Apply score based on 1-3 rating
    if (interestLevel === 3)
      score += 40; // Loves it
    else if (interestLevel === 2)
      score += 10; // Likes it
    else if (interestLevel === 1) score -= 20; // Dislikes it
  }

  // C. RANDOM JITTER
  score += Math.floor(Math.random() * 10) - 5;

  return Math.min(99, Math.max(0, score));
};

// --- 3. GENERATION LOGIC ---

export const generateQuests = (userPreferences) => {
  const quests = [];
  const DAYS_IN_WEEK = 7;

  // IMPORTANT: GRID MAPPING
  // 8 AM = Index 0
  // 9 AM = Index 1
  // ...
  // 12 PM = Index 4
  // 6 PM = Index 10
  // 11 PM = Index 15

  const createQuest = (template, day, startHour) => {
    // Add Price Symbols to Title
    let displayTitle = template.title;
    if (template.type === "meal") {
      const symbols = "$".repeat(template.priceLevel);
      displayTitle = `${template.title} (${symbols})`;
    }

    const score = calculateScore({ ...template }, userPreferences);

    return {
      id: generateId(),
      title: displayTitle,
      type: template.type,
      day: day,
      startHour: startHour, // This is now the GRID INDEX (0-15)
      duration: template.duration || 1,
      matchPercent: score,
      priceLevel: template.priceLevel,
      category: template.category,
    };
  };

  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    // --- 1. GUARANTEED MEALS (3 per day) ---

    // Breakfast (Index 0 = 8am, Index 1 = 9am)
    const breakfastTemplate = MEAL_TEMPLATES.filter((t) => t.tags.includes("morning"))[
      Math.floor(Math.random() * 2)
    ];
    if (breakfastTemplate) {
      const rSlot = Math.floor(Math.random() * 2); // 0 or 1
      quests.push(createQuest(breakfastTemplate, day, rSlot));
    }

    // Lunch (Index 4 = 12pm)
    const lunchTemplates = MEAL_TEMPLATES.filter((t) => t.tags.includes("lunch"));
    const lunchTemplate = lunchTemplates[Math.floor(Math.random() * lunchTemplates.length)];
    if (lunchTemplate) quests.push(createQuest(lunchTemplate, day, 4));

    // Dinner (Index 10 = 6pm)
    const dinnerTemplates = MEAL_TEMPLATES.filter((t) => t.tags.includes("dinner"));
    const dinnerTemplate = dinnerTemplates[Math.floor(Math.random() * dinnerTemplates.length)];
    if (dinnerTemplate) quests.push(createQuest(dinnerTemplate, day, 10));

    // --- 2. GUARANTEED TIME-BUCKETED ACTIVITIES ---

    // A. Morning Slot (8 AM - 11 AM) -> Indices 0, 1, 2
    const morningPool = ACTIVITY_TEMPLATES.filter(
      (t) => t.preferredTime === "morning" || !t.preferredTime
    );
    const mTemplate = morningPool[Math.floor(Math.random() * morningPool.length)];
    const mIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
    quests.push(createQuest(mTemplate, day, mIndex));

    // B. Afternoon Slot (1 PM - 4 PM) -> Indices 5, 6, 7, 8
    const afternoonPool = ACTIVITY_TEMPLATES.filter(
      (t) => !t.preferredTime || t.preferredTime !== "morning"
    );
    const aTemplate = afternoonPool[Math.floor(Math.random() * afternoonPool.length)];
    const aIndex = Math.floor(Math.random() * 3) + 5; // 5, 6, 7
    quests.push(createQuest(aTemplate, day, aIndex));

    // C. Evening Slot (7 PM - 10 PM) -> Indices 11, 12, 13
    const eveningPool = ACTIVITY_TEMPLATES.filter(
      (t) => t.preferredTime === "evening" || !t.preferredTime
    );
    const eTemplate = eveningPool[Math.floor(Math.random() * eveningPool.length)];
    const eIndex = Math.floor(Math.random() * 3) + 11; // 11, 12, 13
    quests.push(createQuest(eTemplate, day, eIndex));
  }

  return quests;
};

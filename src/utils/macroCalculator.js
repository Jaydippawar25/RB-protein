/**
 * Mifflin-St Jeor BMR + activity multiplier -> TDEE, then macro split
 * by goal. Pure function, unit-tested friendly, no external deps.
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUSTMENT = {
  cut: -0.2,      // 20% deficit
  maintain: 0,
  bulk: 0.15,     // 15% surplus
};

// grams-per-kg-bodyweight protein targets by goal
const PROTEIN_G_PER_KG = { cut: 2.2, maintain: 1.8, bulk: 2.0 };

export function calculateMacros({ weightKg, heightCm, age, sex, activity, goal }) {
  const w = Number(weightKg) || 75;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 25;

  const bmr = sex === 'female'
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;

  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.55);
  const targetCalories = Math.round(tdee * (1 + (GOAL_ADJUSTMENT[goal] ?? 0)));

  const proteinG = Math.round((PROTEIN_G_PER_KG[goal] ?? 1.8) * w);
  const proteinCal = proteinG * 4;

  const fatCal = targetCalories * 0.25; // 25% of calories from fat
  const fatG = Math.round(fatCal / 9);

  const remainingCal = Math.max(targetCalories - proteinCal - fatCal, 0);
  const carbsG = Math.round(remainingCal / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros: { protein: proteinG, carbs: carbsG, fat: fatG },
  };
}

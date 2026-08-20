import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { calculateMacros } from '../../utils/macroCalculator';
import { getNutritionRecommendations } from '../../services/aiService';

const COLORS = ['#FF6B00', '#FF8833', '#FFAE73'];

export default function MacroCalculator() {
  const [form, setForm] = useState({ weightKg: 75, heightCm: 175, age: 25, sex: 'male', activity: 'moderate', goal: 'maintain' });
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = (e) => {
    e.preventDefault();
    setResult(calculateMacros(form));
    setRecommendations(null);
  };

  const fetchRecommendations = async () => {
    setLoadingRec(true);
    try {
      const res = await getNutritionRecommendations({ ...form, ...result });
      setRecommendations(res.items || res);
    } catch {
      toast.error('AI recommendations unavailable right now');
    } finally {
      setLoadingRec(false);
    }
  };

  const chartData = result ? [
    { name: 'Protein', value: result.macros.protein * 4 },
    { name: 'Carbs', value: result.macros.carbs * 4 },
    { name: 'Fat', value: result.macros.fat * 9 },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center sm:text-left space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-green-500/15 text-brand-green-500 border border-brand-green-500/30">
          Smart Macro Engine
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white">
          Precision Macro Calculator
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Scientific Mifflin-St Jeor BMR & TDEE calculation tailored for your training goals.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-start">
        {/* Calculator Form */}
        <div className="card p-4 sm:p-6 space-y-4 shadow-card">
          <form onSubmit={submit} className="space-y-4">
            {/* Goal Quick Selector Tabs */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">
                Fitness Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cut', label: '🔥 Fat Loss', sub: 'Deficit' },
                  { id: 'maintain', label: '⚡ Maintain', sub: 'Recomp' },
                  { id: 'bulk', label: '💪 Gain', sub: 'Surplus' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => set('goal', g.id)}
                    className={`py-2.5 px-2 rounded-xl text-center transition-all border ${
                      form.goal === g.id
                        ? 'bg-brand-green-500 text-brand-black border-brand-green-500 font-extrabold shadow-glow'
                        : 'bg-gray-100 dark:bg-brand-charcoal text-gray-600 dark:text-gray-300 border-gray-200 dark:border-brand-border font-medium hover:border-brand-green-500/50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm leading-tight">{g.label}</div>
                    <div className="text-[10px] opacity-75">{g.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="30"
                  max="250"
                  className="input py-2.5 text-base sm:text-sm font-bold"
                  value={form.weightKg}
                  onChange={(e) => set('weightKg', +e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="230"
                  className="input py-2.5 text-base sm:text-sm font-bold"
                  value={form.heightCm}
                  onChange={(e) => set('heightCm', +e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Age</label>
                <input
                  type="number"
                  required
                  min="12"
                  max="100"
                  className="input py-2.5 text-base sm:text-sm font-bold"
                  value={form.age}
                  onChange={(e) => set('age', +e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                <select
                  className="input py-2.5 text-base sm:text-sm font-bold"
                  value={form.sex}
                  onChange={(e) => set('sex', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Weekly Activity Level</label>
              <select
                className="input py-2.5 text-xs sm:text-sm font-medium"
                value={form.activity}
                onChange={(e) => set('activity', e.target.value)}
              >
                <option value="sedentary">Desk Job / No Exercise (1.2x)</option>
                <option value="light">Light Activity (1-3 days/week) (1.375x)</option>
                <option value="moderate">Moderate Training (3-5 days/week) (1.55x)</option>
                <option value="active">Heavy Workouts (6-7 days/week) (1.725x)</option>
                <option value="athlete">Athlete / Intense 2x/day (1.9x)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base font-bold shadow-glow mt-2">
              Calculate Daily Target
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="card p-4 sm:p-6 space-y-6 shadow-card border border-brand-green-500/30">
              {/* Daily Target Summary Box */}
              <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-brand-surface via-brand-charcoal to-brand-surface border border-brand-green-500/30">
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-green-400">Target Daily Intake</span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">
                  {result.targetCalories} <span className="text-lg font-bold text-brand-green-500">kcal</span>
                </h2>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-2">
                  <span>BMR: <strong className="text-white">{result.bmr}</strong></span>
                  <span>•</span>
                  <span>TDEE: <strong className="text-white">{result.tdee}</strong></span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={4}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} kcal`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Macro Pills Breakdown */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border">
                  <p className="font-display font-extrabold text-lg sm:text-xl text-brand-green-500">{result.macros.protein}g</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">Protein</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border">
                  <p className="font-display font-extrabold text-lg sm:text-xl text-brand-green-500">{result.macros.carbs}g</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">Carbs</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border">
                  <p className="font-display font-extrabold text-lg sm:text-xl text-brand-green-500">{result.macros.fat}g</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">Fat</p>
                </div>
              </div>

              {/* AI Recommendation Button */}
              <button
                onClick={fetchRecommendations}
                disabled={loadingRec}
                className="btn-outline w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
              >
                {loadingRec ? 'Generating AI Nutrition Plan…' : '✨ Get AI Supplement Recommendations'}
              </button>

              {recommendations && (
                <div className="space-y-2 text-xs sm:text-sm pt-2">
                  <h4 className="font-bold text-xs uppercase text-gray-400">AI Nutrition Guidance</h4>
                  {Array.isArray(recommendations) ? (
                    recommendations.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border leading-relaxed">
                        {r.reason || r.name || JSON.stringify(r)}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border leading-relaxed">
                      {recommendations.summary}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 sm:p-12 text-center text-gray-500 space-y-3">
              <div className="text-3xl">📊</div>
              <p className="text-sm font-medium">
                Select your parameters & hit <strong>Calculate</strong> to view daily calories and macro targets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

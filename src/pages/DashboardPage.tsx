import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { calculateTotalFootprint } from "../lib/calculator";
import { NATIONAL_AVERAGE_TONNES, GLOBAL_AVERAGE_TONNES } from "../lib/constants";
import type { UserInputData, CalculationResult } from "../lib/types";
import { useAuth } from "../lib/firebase/auth";
import { getCarbonInput } from "../lib/firebase/db";

const COLORS = ["#4A6741", "#8DA07B", "#D8D2C1", "#B3B39D"]; // Natural tones

export default function DashboardPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCarbonInput(user.uid);
        if (data) {
          const calcResult = calculateTotalFootprint(data as UserInputData);
          setResult(calcResult);
        }
      } catch (e) {
        console.error("Failed to load calculation", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const donutData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Transport", value: result.breakdown.transport },
      { name: "Home Energy", value: result.breakdown.homeEnergy },
      { name: "Diet", value: result.breakdown.diet },
      { name: "Shopping", value: result.breakdown.shoppingWaste },
    ].filter(item => item.value > 0);
  }, [result]);

  const comparisonData = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: "Emissions Comparison",
        "Your Footprint": Number(result.score.toFixed(2)),
        "National Average": NATIONAL_AVERAGE_TONNES,
        "Global Average": GLOBAL_AVERAGE_TONNES,
      }
    ];
  }, [result]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-natural-500 font-bold uppercase tracking-widest text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-natural-800 mb-4">No data found</h2>
        <p className="text-natural-500 mb-8">Please complete the calculator to see your dashboard.</p>
        <Link to="/" className="inline-flex items-center px-4 py-2 bg-natural-700 text-white rounded-md hover:bg-natural-600 font-bold uppercase tracking-wider text-xs shadow-sm">
          Go to Calculator
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Aria-live region for accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        Your calculated carbon footprint is {result.score.toFixed(1)} tonnes per year.
      </div>

      <header className="bg-white rounded-[32px] p-10 shadow-sm border border-natural-200 text-center">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-natural-500 mb-2">Your Annual Carbon Footprint</h1>
        <div className="text-8xl font-black text-natural-700 mb-2">
          {result.score.toFixed(1)} <span className="text-xl font-medium opacity-50 text-natural-800 tracking-normal">tonnes CO₂e</span>
        </div>
        <p className="text-natural-800 opacity-60 max-w-2xl mx-auto">
          This is an estimate based on your provided lifestyle factors. Focus on reducing areas with the highest impact.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-natural-200 shadow-sm">
          <h2 className="text-lg font-bold text-natural-800 mb-6">Emissions Breakdown</h2>
          <div className="h-80" aria-label="Donut chart showing emissions by category" role="img">
            {/* Provide screen reader accessible table for chart data */}
            <table className="sr-only">
              <caption>Emissions Breakdown by Category</caption>
              <thead>
                <tr><th>Category</th><th>Tonnes CO2</th></tr>
              </thead>
              <tbody>
                {donutData.map((d) => (
                  <tr key={d.name}><td>{d.name}</td><td>{d.value.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tonnes`, 'Emissions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-natural-200 shadow-sm">
          <h2 className="text-lg font-bold text-natural-800 mb-6">How You Compare</h2>
          <div className="h-80" aria-label="Bar chart comparing your emissions to national and global averages" role="img">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Your Footprint" fill="#4A6741" radius={[4, 4, 0, 0]} />
                <Bar dataKey="National Average" fill="#D8D2C1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Global Average" fill="#8DA07B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-natural-700 rounded-[32px] p-8 text-white shadow-sm flex-1">
        <h2 className="text-lg font-bold mb-6">Personalized Action Plan</h2>
        <ul className="space-y-6">
          {result.tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-natural-600 text-white font-bold mr-4">
                0{index + 1}
              </span>
              <p className="text-sm font-medium text-white mt-1">{tip}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 pt-6 border-t border-natural-600">
          <Link to="/tracker" className="inline-flex items-center text-natural-200 font-semibold hover:text-white">
            Start tracking your actions
            <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { FormEvent, useState, useEffect } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import type { EcoAction } from "../lib/types";
import { useAuth } from "../lib/firebase/auth";
import { getEcoActions, addEcoAction, deleteEcoAction } from "../lib/firebase/db";

export default function ActionTrackerPage() {
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [newName, setNewName] = useState("");
  const [newCo2Saved, setNewCo2Saved] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActions() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const fetched = await getEcoActions(user.uid);
        setActions(fetched);
      } catch (e) {
        console.error("Failed to load actions", e);
      } finally {
        setLoading(false);
      }
    }
    fetchActions();
  }, [user]);

  const handleAddAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCo2Saved || !user) return;

    try {
      const actionData = {
        name: newName.trim(),
        co2SavedKg: parseFloat(newCo2Saved),
        date: new Date().toISOString(),
      };
      
      const newId = await addEcoAction(user.uid, actionData);
      
      setActions([{ id: newId, ...actionData }, ...actions]);
      setNewName("");
      setNewCo2Saved("");
    } catch(e) {
      console.error("Failed to add action", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEcoAction(id);
      setActions(actions.filter((a) => a.id !== id));
    } catch(e) {
      console.error("Failed to delete action", e);
    }
  };

  const totalSaved = actions.reduce((sum, action) => sum + action.co2SavedKg, 0);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-natural-500 font-bold uppercase tracking-widest text-sm">Loading actions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[32px] shadow-sm border border-natural-200 p-8 text-center flex flex-col items-center">
        <div className="bg-natural-300 p-4 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-natural-800" aria-hidden="true" />
        </div>
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-natural-500 mb-2">Total CO₂ Saved This Year</h1>
        <div className="text-6xl font-black tracking-tight text-natural-700" aria-live="polite">
          {totalSaved.toFixed(1)} <span className="text-xl text-natural-800 opacity-50 font-medium font-sans">kg</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleAddAction} className="bg-white rounded-[24px] shadow-sm border border-natural-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-natural-800 mb-4">Log New Action</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="actionName" className="block text-xs font-bold text-natural-500 uppercase tracking-widest mb-1">
                  Action Detail
                </label>
                <input
                  type="text"
                  id="actionName"
                  required
                  placeholder="e.g., Cycled to work"
                  className="w-full rounded-md border-natural-200 border px-3 py-2 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="co2Saved" className="block text-xs font-bold text-natural-500 uppercase tracking-widest mb-1">
                  CO₂ Saved (kg)
                </label>
                <input
                  type="number"
                  id="co2Saved"
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  className="w-full rounded-md border-natural-200 border px-3 py-2 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none"
                  value={newCo2Saved}
                  onChange={(e) => setNewCo2Saved(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-natural-700 hover:bg-natural-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-700 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Add Action
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-[24px] shadow-sm border border-natural-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-natural-50">
              <h3 className="text-lg font-bold text-natural-800">Recent Actions</h3>
            </div>
            
            {actions.length === 0 ? (
              <div className="p-8 text-center text-natural-500">
                <p>You haven't logged any eco-actions yet.</p>
                <p className="text-sm mt-1">Add your first action on the left to start tracking!</p>
              </div>
            ) : (
              <ul className="divide-y divide-natural-50" role="list">
                {actions.map((action) => (
                  <li key={action.id} className="px-6 py-5 flex items-center justify-between hover:bg-natural-50">
                    <div>
                      <p className="text-sm font-semibold text-natural-800">{action.name}</p>
                      <p className="text-xs text-natural-500 opacity-60">
                        {new Date(action.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center text-sm font-bold text-natural-700">
                        {action.co2SavedKg} kg
                      </span>
                      <button
                        onClick={() => handleDelete(action.id)}
                        className="text-natural-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                        aria-label={`Delete action: ${action.name}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

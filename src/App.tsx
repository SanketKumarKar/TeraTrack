import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CalculatorPage from "./pages/CalculatorPage";
import DashboardPage from "./pages/DashboardPage";
import ActionTrackerPage from "./pages/ActionTrackerPage";
import AwarenessPage from "./pages/AwarenessPage";
import { Leaf, Activity, LayoutDashboard, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AuthProvider, useAuth, signInWithGoogle, logout } from "./lib/firebase/auth";

/** Utility for Tailwind class merging */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Navigation() {
  const location = useLocation();
  const { user } = useAuth();
  const links = [
    { to: "/", label: "Calculator", icon: Settings },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tracker", label: "Action Tracker", icon: Activity },
    { to: "/awareness", label: "Awareness", icon: Leaf },
  ];

  return (
    <nav className="bg-natural-100 border-b border-natural-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center bg-natural-700 w-10 h-10 rounded-xl justify-center">
              <Leaf className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-natural-700 hidden sm:block">TerraTrack</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex items-center px-2 py-4 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-natural-700 focus:ring-offset-2 focus:ring-offset-natural-100",
                  location.pathname === link.to
                    ? "border-b-2 border-natural-700 text-natural-700"
                    : "opacity-60 hover:opacity-100 text-natural-800 border-b-2 border-transparent"
                )}
                aria-current={location.pathname === link.to ? "page" : undefined}
              >
                <link.icon className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:block">{link.label}</span>
              </Link>
            ))}
            
            <div className="flex items-center ml-2 sm:ml-4 border-l pl-4 sm:pl-8 border-natural-200">
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold uppercase opacity-40 text-natural-800">Current User</div>
                    <div className="text-sm font-bold text-natural-800 flex items-center gap-2">
                       {user.displayName || "Eco Saver"}
                       <button onClick={logout} className="text-xs font-bold text-natural-500 hover:text-natural-800 uppercase tracking-wider underline">Logout</button>
                    </div>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 bg-natural-300 rounded-full"></div>
                  )}
                  {/* Mobile logout button */}
                  <button onClick={logout} className="sm:hidden text-xs font-bold text-natural-500 hover:text-natural-800 uppercase tracking-wider">Logout</button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="px-4 py-2 bg-natural-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-natural-600 transition-colors"
                >
                  Login / Signup
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-natural-100 text-natural-800 font-sans selection:bg-natural-300">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<CalculatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tracker" element={<ActionTrackerPage />} />
              <Route path="/awareness" element={<AwarenessPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

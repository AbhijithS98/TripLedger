import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Settings, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-blue-200">
      {/* Navbar */}
      <nav className="border-b bg-white dark:bg-gray-950/50 dark:border-gray-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            TripLedger
          </div>
          <div>
            <Link href="/login">
              <Button variant="outline" className="font-medium">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide uppercase border border-blue-100 dark:border-blue-800">
          Built for Modern Travel Agencies
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
          The Ultimate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Quotation & Itinerary Builder
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
          Empower your agents to craft stunning itineraries, apply dynamic markups, and instantly generate client-ready PDF vouchers—all from one secure, centralized dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-blue-500/20 group">
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Seamless Itinerary Builder</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Browse inventory, mix and match packages, and construct day-by-day travel quotes in seconds. No more spreadsheets or manual data entry.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Dynamic Pricing & Markups</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Automatically calculate complex agent commissions and client-facing prices in real time, securely protecting base supplier costs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Role-Based Access Control</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Strictly gate data access. Admins oversee the entire enterprise pipeline, while Agents are sandboxed to their own secure quoting environment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

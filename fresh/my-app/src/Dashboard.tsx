import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AITester } from "./components";

export default function Dashboard() {
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 10 }) ?? {};
  const [showAITester, setShowAITester] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6 py-6">
        <p className="text-gray-300">Welcome to your dashboard, <span className="text-primary">{viewer ?? "User"}</span>!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card gradient-border p-6">
            <h2 className="text-xl font-medium mb-4 gradient-text">Prompt Stats</h2>
            <p className="text-gray-300">Your prompt statistics and usage will appear here.</p>
            
            {/* Placeholder stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-gray-400">Prompts Used</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-gray-400">API Calls</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card gradient-border p-6">
            <h2 className="text-xl font-medium mb-4 gradient-text">Test Prompts</h2>
            <p className="text-gray-300 mb-4">Test your prompts with OpenAI's models.</p>
            
            <button 
              onClick={() => setShowAITester(true)}
              className="btn-primary w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Open AI Tester
            </button>
          </div>
        </div>
        
        <div className="glass-card gradient-border p-6">
          <h2 className="text-xl font-medium mb-4 gradient-text">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a href="/prompts" className="glass-card p-4 text-center hover:bg-slate-800/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p className="text-white">Manage Prompts</p>
            </a>
            <button onClick={() => setShowAITester(true)} className="glass-card p-4 text-center hover:bg-slate-800/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <p className="text-white">Test with AI</p>
            </button>
            <a href="/prompts" className="glass-card p-4 text-center hover:bg-slate-800/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-primary">
                <path d="M12 10v6"></path>
                <path d="M9 13h6"></path>
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
              </svg>
              <p className="text-white">Browse Collections</p>
            </a>
          </div>
        </div>
      </div>
      
      {/* AI Tester Modal */}
      {showAITester && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl">
            <AITester 
              onClose={() => setShowAITester(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  description 
}: { 
  title: string; 
  value: string; 
  change: string; 
  isPositive: boolean; 
  description: string;
}) {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-md p-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function ActivitySection() {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      <div className="space-y-4">
        <ActivityItem title="New user signup" time="2 minutes ago" />
        <ActivityItem title="Task completed" time="15 minutes ago" />
        <ActivityItem title="Account settings updated" time="1 hour ago" />
        <ActivityItem title="New task created" time="3 hours ago" />
      </div>
    </div>
  );
}

function ActivityItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="border-b border-slate-300 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{time}</p>
    </div>
  );
}

function PerformanceSection() {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
      <div className="space-y-4">
        <ProgressBar label="Productivity" value={78} />
        <ProgressBar label="Task Completion" value={65} />
        <ProgressBar label="Time Efficiency" value={42} />
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm font-medium">{value}%</p>
      </div>
      <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-slate-600 dark:bg-slate-400 rounded-full" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
} 
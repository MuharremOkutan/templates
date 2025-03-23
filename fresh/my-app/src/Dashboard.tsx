import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Dashboard() {
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 10 }) ?? {};

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <p className="text-slate-500 dark:text-slate-400">Welcome, {viewer ?? "User"}! Here's your overview.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard 
            title="Total Users" 
            value="1,023" 
            change={"+12.5%"} 
            isPositive={true} 
            description="Active users" 
          />
          
          <DashboardCard 
            title="Sessions" 
            value="4,721" 
            change={"-2.3%"} 
            isPositive={false} 
            description="Last 7 days" 
          />
          
          <DashboardCard 
            title="Avg. Time" 
            value="3m 42s" 
            change={"+8.1%"} 
            isPositive={true} 
            description="Per session" 
          />
          
          <DashboardCard 
            title="Tasks Done" 
            value="842" 
            change={"+24.5%"} 
            isPositive={true} 
            description="Last 30 days" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivitySection />
          <PerformanceSection />
        </div>
      </div>
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
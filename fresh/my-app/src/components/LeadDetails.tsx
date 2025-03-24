import React from "react";

interface Lead {
  id: string;
  company: string;
  job: string;
  jobState: string;
  contact: string;
  email: string;
  date: string;
  status: string;
  avatar: string;
}

interface LeadDetailsProps {
  lead: Lead;
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Contact Information</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Contact Person</p>
            <p className="text-gray-300">{lead.contact}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-300">{lead.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Company</p>
            <p className="text-gray-300">{lead.company}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Added On</p>
            <p className="text-gray-300">{lead.date}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Job Details</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Project</p>
            <p className="text-gray-300">{lead.job}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full mr-2 ${
                  lead.jobState === "In Progress"
                    ? "bg-amber-500"
                    : lead.jobState === "Completed"
                    ? "bg-emerald-500"
                    : "bg-slate-500"
                }`}
              />
              <p className="text-gray-300">{lead.jobState}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border border-gray-700 p-4 bg-gray-800/20">
          <h4 className="font-medium text-gray-300 mb-2">Notes</h4>
          <p className="text-sm text-gray-400">
            Initial meeting completed on {lead.date}. {lead.contact} expressed interest in our proposal and requested a follow-up with more details about implementation timeline and cost breakdown.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Recent Activities</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-300">Email Sent</p>
                <span className="mx-2 text-gray-500">•</span>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Sent follow-up email with detailed proposal to {lead.contact}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-300">Status Updated</p>
                <span className="mx-2 text-gray-500">•</span>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Lead status changed from 'Initiated' to '{lead.status}'
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
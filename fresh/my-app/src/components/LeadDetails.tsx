import * as React from "react";
import { Card, CardContent } from "./ui/card";

interface LeadDetailsProps {
  lead: {
    id: string;
    company: string;
    job: string;
    jobState: string;
    contact: string;
    email: string;
    date: string;
    status: string;
    avatar?: string;
  }
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p className="font-medium text-gray-300">{lead.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Job</p>
                <p className="font-medium text-gray-300">{lead.job}</p>
                <p className="text-sm text-gray-500">{lead.jobState}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="font-medium text-gray-300">{lead.contact}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-medium text-gray-300">{lead.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Created Date</p>
                <p className="font-medium text-gray-300">{new Date(lead.date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="h-5 w-5 text-gray-500 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="font-medium text-gray-300">{lead.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Lead Notes</h3>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">
              Initial contact made with {lead.contact} regarding their interest in {lead.job}. 
              They expressed a need for our services and requested a follow-up meeting next week.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
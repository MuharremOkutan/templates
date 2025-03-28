// LeadDetail.tsx
// @ts-nocheck -- disable type checking to prevent auto-import of dataModel
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { LeadProgress } from "./components/LeadProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { toast } from "./components/ui/use-toast";

// Sample lead data
const leadsData = [
  {
    id: "1",
    name: "John Doe",
    company: "Acme Corp",
    position: "CTO",
    job: "Website Redesign",
    jobState: "In Progress",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    date: "2023-05-15",
    lastContact: "3 days ago",
    status: "Engaged",
    value: 75000,
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
    notes: "John expressed interest in our platform solution. Needs a proposal by the end of the month."
  },
  {
    id: "2",
    name: "Jane Smith",
    company: "Globex Inc",
    position: "Marketing Director",
    job: "Mobile App Development",
    jobState: "Planning",
    email: "jane@globex.com",
    phone: "+1 (555) 987-6543",
    location: "New York, NY",
    date: "2023-05-10",
    lastContact: "1 week ago",
    status: "Initiated",
    value: 45000,
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
    notes: "Jane is interested in our mobile app development services for a new marketing campaign."
  },
  {
    id: "3",
    name: "Tony Stark",
    company: "Stark Industries",
    position: "CEO",
    job: "AI Integration",
    jobState: "Completed",
    email: "tony@stark.com",
    phone: "+1 (555) 111-2222",
    location: "Malibu, CA",
    date: "2023-05-05",
    lastContact: "2 days ago",
    status: "Done",
    value: 150000,
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
    notes: "Project completed successfully. Tony is interested in future collaborations."
  },
  {
    id: "4",
    name: "Bruce Wayne",
    company: "Wayne Enterprises",
    position: "Security Director",
    job: "Security Audit",
    jobState: "In Progress",
    email: "bruce@wayne.com",
    phone: "+1 (555) 333-4444",
    location: "Gotham City",
    date: "2023-05-01",
    lastContact: "Yesterday",
    status: "Assigned",
    value: 60000,
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
    notes: "Bruce is concerned about security vulnerabilities in their current systems."
  },
  {
    id: "5",
    name: "Norman Osborn",
    company: "Oscorp",
    position: "Director of R&D",
    job: "Data Migration",
    jobState: "Planning",
    email: "norman@oscorp.com",
    phone: "+1 (555) 555-6666",
    location: "Boston, MA",
    date: "2023-04-28",
    lastContact: "5 days ago",
    status: "Initiated",
    value: 35000,
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5",
    notes: "Norman needs help migrating their research data to a new system."
  },
];

// Generate some demo related articles
const getRelatedArticles = (company: string, job: string) => [
  {
    title: `${company} Announces New Initiative`,
    source: "Business Weekly",
    date: "May 12, 2023",
    url: "https://example.com/article1"
  },
  {
    title: `Industry Analysis: ${job} Trends`,
    source: "Tech Today",
    date: "May 5, 2023",
    url: "https://example.com/article2"
  },
  {
    title: `${company} Quarterly Earnings Exceed Expectations`,
    source: "Financial Times",
    date: "April 28, 2023",
    url: "https://example.com/article3"
  }
];

// Generate demo recent activities
const getRecentActivities = (leadName: string) => [
  {
    type: "Call",
    description: `Discussed requirements with ${leadName}`,
    date: "May 18, 2023",
    user: {
      name: "Alex Rivera",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=alex"
    }
  },
  {
    type: "Email",
    description: "Sent follow-up email with proposal details",
    date: "May 17, 2023",
    user: {
      name: "Taylor Kim",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=taylor"
    }
  },
  {
    type: "Meeting",
    description: "Initial discovery call",
    date: "May 15, 2023",
    user: {
      name: "Alex Rivera",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=alex"
    }
  }
];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [leadData, setLeadData] = useState(leadsData.find(lead => lead.id === id));
  
  if (!leadData) {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="text-xl font-medium mb-4 text-white">Lead Not Found</h3>
        <p className="text-gray-400 mb-6">
          The lead you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/leads">
          <Button className="btn-primary">
            Back to Leads
          </Button>
        </Link>
      </div>
    );
  }
  
  const relatedArticles = getRelatedArticles(leadData.company, leadData.job);
  const recentActivities = getRecentActivities(leadData.name);
  
  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    // Update the lead data with the new status
    const updatedLead = { ...leadData, status: newStatus };
    
    // Update local state
    setLeadData(updatedLead);
    
    // In a real application, you would also update the backend here
    // For demo purposes, show a toast notification
    toast({
      title: "Lead Status Updated",
      description: `Lead status changed to ${newStatus}`,
      variant: "success",
    });
  };
  
  // Track the progress stages
  const trackingSteps = [
    {
      name: "Initiated",
      timestamp: leadData.status === "Initiated" ? "Current Stage" : leadData.status === "Assigned" || leadData.status === "Engaged" || leadData.status === "Done" ? "Completed" : "Not Started",
      isCompleted: ["Initiated", "Assigned", "Engaged", "Done"].includes(leadData.status)
    },
    {
      name: "Assigned",
      timestamp: leadData.status === "Assigned" ? "Current Stage" : leadData.status === "Engaged" || leadData.status === "Done" ? "Completed" : "Not Started",
      isCompleted: ["Assigned", "Engaged", "Done"].includes(leadData.status)
    },
    {
      name: "Engaged",
      timestamp: leadData.status === "Engaged" ? "Current Stage" : leadData.status === "Done" ? "Completed" : "Not Started",
      isCompleted: ["Engaged", "Done"].includes(leadData.status)
    },
    {
      name: "Done",
      timestamp: leadData.status === "Done" ? "Current Stage" : "Not Started",
      isCompleted: ["Done"].includes(leadData.status)
    }
  ];

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/leads" className="text-gray-400 hover:text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h2 className="text-xl font-semibold gradient-text">Lead Details</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            Edit Lead
          </Button>
          <Button className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lead Profile */}
        <Card className="glass-card md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className={`mb-2 ${
                  leadData.status === "Done" ? "bg-green-900/50 text-green-400 border-green-800" :
                  leadData.status === "Engaged" ? "bg-blue-900/50 text-blue-400 border-blue-800" :
                  leadData.status === "Assigned" ? "bg-yellow-900/50 text-yellow-400 border-yellow-800" :
                  "bg-gray-900/50 text-gray-400 border-gray-800"
                }`}>
                  {leadData.status}
                </Badge>
                <CardTitle className="text-white">{leadData.name}</CardTitle>
                <p className="text-sm text-gray-400 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  {leadData.company} • {leadData.position}
                </p>
              </div>
              <Avatar className="h-14 w-14">
                <AvatarImage src={leadData.avatar} alt={leadData.name} />
                <AvatarFallback className="bg-gray-800 text-primary">
                  {leadData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>{leadData.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>{leadData.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{leadData.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Added on {new Date(leadData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Last contacted {leadData.lastContact}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium mb-2 text-gray-300">Lead Value</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">${leadData.value.toLocaleString()}</span>
                <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                  </svg>
                  High Value
                </Badge>
              </div>
            </div>

            {leadData.notes && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium mb-2 text-gray-300">Notes</h4>
                <p className="text-sm text-gray-400">{leadData.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-700 hover:bg-gray-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Call
            </Button>
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-700 hover:bg-gray-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email
            </Button>
            <Button size="sm" className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Add Note
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Lead Status Tracker */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Lead Progress</CardTitle>
              <CardDescription className="text-gray-400">Track the current progress of this lead through the sales pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadProgress 
                currentStatus={leadData.status} 
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>

          {/* Tabs for additional information */}
          <Card className="glass-card">
            <CardHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-gray-800/50 mb-4">
                  <TabsTrigger value="details" className="data-[state=active]:bg-gray-900">Job Details</TabsTrigger>
                  <TabsTrigger value="activities" className="data-[state=active]:bg-gray-900">Recent Activities</TabsTrigger>
                  <TabsTrigger value="news" className="data-[state=active]:bg-gray-900">Related News</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card className="glass-card bg-transparent border-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Job Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 p-4 rounded-md border border-gray-700">
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Job Type</h3>
                          <p className="text-gray-300">{leadData.job}</p>
                        </div>
                        <div className="bg-gray-800/30 p-4 rounded-md border border-gray-700">
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Current State</h3>
                          <p className="text-gray-300">{leadData.jobState}</p>
                        </div>
                        <div className="bg-gray-800/30 p-4 rounded-md border border-gray-700">
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Start Date</h3>
                          <p className="text-gray-300">{new Date(leadData.date).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-gray-800/30 p-4 rounded-md border border-gray-700">
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Estimated Value</h3>
                          <p className="text-gray-300">${leadData.value.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-400">Requirements</h3>
                        <p className="text-gray-300 bg-gray-800/30 p-4 rounded-md border border-gray-700">
                          This lead requires a {leadData.job} solution. {leadData.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activities">
                  <Card className="glass-card bg-transparent border-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activity.user.image} alt={activity.user.name} />
                              <AvatarFallback className="bg-gray-800 text-primary">{activity.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-300">{activity.description}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>{activity.user.name}</span>
                                <span className="mx-1">•</span>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>{activity.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="news">
                  <Card className="glass-card bg-transparent border-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Related News</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {relatedArticles.map((article, index) => (
                          <div key={index} className="p-4 border border-gray-700 rounded-md bg-gray-800/20">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-300">{article.title}</h4>
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-light"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                              </a>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>{article.source}</span>
                              <span className="mx-1">•</span>
                              <span>{article.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-gray-300 border-gray-700 hover:bg-gray-800">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        View All Related News
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
} 
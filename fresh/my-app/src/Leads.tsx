// Leads.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { LeadProgress } from "./components/LeadProgress";
import { LeadDetails } from "./components/LeadDetails";
import { Input } from "./components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

const leadsData = [
  {
    id: "1",
    company: "Acme Corp",
    job: "Website Redesign",
    jobState: "In Progress",
    contact: "John Doe",
    email: "john@acmecorp.com",
    date: "2023-05-15",
    status: "Engaged",
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
  },
  {
    id: "2",
    company: "Globex Inc",
    job: "Mobile App Development",
    jobState: "Planning",
    contact: "Jane Smith",
    email: "jane@globex.com",
    date: "2023-05-10",
    status: "Initiated",
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
  },
  {
    id: "3",
    company: "Stark Industries",
    job: "AI Integration",
    jobState: "Completed",
    contact: "Tony Stark",
    email: "tony@stark.com",
    date: "2023-05-05",
    status: "Done",
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
  },
  {
    id: "4",
    company: "Wayne Enterprises",
    job: "Security Audit",
    jobState: "In Progress",
    contact: "Bruce Wayne",
    email: "bruce@wayne.com",
    date: "2023-05-01",
    status: "Assigned",
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
  },
  {
    id: "5",
    company: "Oscorp",
    job: "Data Migration",
    jobState: "Planning",
    contact: "Norman Osborn",
    email: "norman@oscorp.com",
    date: "2023-04-28",
    status: "Initiated",
    avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5",
  },
];

export default function Leads() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState("All Leads");

  const filteredLeads = leadsData.filter(
    (lead) => {
      // Apply text search filter
      const matchesSearch = 
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply status filter if selected
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    }
  );

  const selectedLeadData = leadsData.find((lead) => lead.id === selectedLead);

  const handleFilterChange = (status: string | null, label: string) => {
    setStatusFilter(status);
    setFilterLabel(label);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold gradient-text">Manage Leads</h2>
        <Button className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add New Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{filterLabel}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFilterChange(null, "All Leads")}>
                      All Leads
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange(null, "Recent Leads")}>
                      Recent Leads
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("Initiated", "Initiated")}>
                      Initiated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("Assigned", "Assigned")}>
                      Assigned
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("Engaged", "Engaged")}>
                      Engaged
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("Done", "Done")}>
                      Done
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative mt-2">
                <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <Input
                  placeholder="Search leads..."
                  className="pl-8 bg-gray-800/50 border-gray-700 text-gray-300"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`flex items-center justify-between rounded-md border border-gray-700 p-3 cursor-pointer ${
                        selectedLead === lead.id
                          ? "bg-gray-800"
                          : "hover:bg-gray-800/50"
                      }`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={lead.avatar} alt={lead.contact} />
                          <AvatarFallback className="bg-gray-800 text-primary">
                            {lead.contact.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none text-white">
                            {lead.company}
                          </p>
                          <p className="text-sm text-gray-400">
                            {lead.job}
                          </p>
                        </div>
                      </div>
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
                        <Link to={`/lead/${lead.id}`} className="text-gray-400 hover:text-primary">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No leads match your filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedLeadData ? (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedLeadData.avatar}
                        alt={selectedLeadData.contact}
                      />
                      <AvatarFallback className="bg-gray-800 text-primary">
                        {selectedLeadData.contact.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white">{selectedLeadData.company}</CardTitle>
                      <p className="text-sm text-gray-400">
                        {selectedLeadData.job} - {selectedLeadData.jobState}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">
                    Edit Lead
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="bg-gray-800/50 mb-4">
                    <TabsTrigger value="details" className="data-[state=active]:bg-gray-900">Details</TabsTrigger>
                    <TabsTrigger value="progress" className="data-[state=active]:bg-gray-900">Progress</TabsTrigger>
                    <TabsTrigger value="articles" className="data-[state=active]:bg-gray-900">News Articles</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <LeadDetails lead={selectedLeadData} />
                  </TabsContent>
                  <TabsContent value="progress">
                    <LeadProgress currentStatus={selectedLeadData.status} />
                  </TabsContent>
                  <TabsContent value="articles">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">
                        News Articles Related to This Lead
                      </h3>
                      <div className="space-y-3">
                        <div className="rounded-md border border-gray-700 p-4 bg-gray-800/20">
                          <h4 className="font-medium text-gray-300">
                            {selectedLeadData.company} Announces New Initiative
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Published on May 12, 2023
                          </p>
                          <p className="mt-2 text-sm text-gray-400">
                            {selectedLeadData.company} has announced a new
                            initiative that aims to revolutionize their industry
                            with innovative solutions...
                          </p>
                          <Button variant="link" className="px-0 mt-1 text-primary hover:text-primary-light">
                            Read more
                          </Button>
                        </div>
                        <div className="rounded-md border border-gray-700 p-4 bg-gray-800/20">
                          <h4 className="font-medium text-gray-300">
                            Industry Analysis: {selectedLeadData.job} Trends
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Published on May 5, 2023
                          </p>
                          <p className="mt-2 text-sm text-gray-400">
                            A recent analysis of industry trends shows growing
                            demand for {selectedLeadData.job} services, with
                            companies like {selectedLeadData.company} leading
                            the way...
                          </p>
                          <Button variant="link" className="px-0 mt-1 text-primary hover:text-primary-light">
                            Read more
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2 text-white">No Lead Selected</h3>
                <p className="text-gray-400">
                  Select a lead from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
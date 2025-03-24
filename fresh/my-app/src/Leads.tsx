// Leads.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { toast } from "./components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

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
    score: 85,
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
    score: 42,
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
    score: 100,
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
    score: 68,
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
    score: 35,
  },
];

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState("All Leads");
  const [leads, setLeads] = useState(leadsData);

  const filteredLeads = leads.filter(
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

  const handleFilterChange = (status: string | null, label: string) => {
    setStatusFilter(status);
    setFilterLabel(label);
  };

  // Mini progress component
  const MiniProgress = ({ status }: { status: string }) => {
    const stages = ["Initiated", "Assigned", "Engaged", "Done"];
    const currentIndex = stages.indexOf(status);
    const progressPercentage = ((currentIndex + 1) / stages.length) * 100;
    
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{status}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Score component
  const LeadScore = ({ score }: { score: number }) => {
    const getScoreColor = (value: number) => {
      if (value >= 80) return "text-emerald-500";
      if (value >= 60) return "text-amber-500";
      if (value >= 40) return "text-orange-500";
      return "text-red-500";
    };
    
    return (
      <div className={`font-medium ${getScoreColor(score)}`}>
        {score}%
      </div>
    );
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

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <Input
              placeholder="Search leads..."
              className="pl-8 bg-gray-800/50 border-gray-700 text-gray-300 min-w-[240px]"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 text-gray-300">
                {filterLabel}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => handleFilterChange(null, "All Leads")} className="text-gray-300 focus:bg-gray-700">
                All Leads
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Initiated", "Initiated")} className="text-gray-300 focus:bg-gray-700">
                Initiated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Assigned", "Assigned")} className="text-gray-300 focus:bg-gray-700">
                Assigned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Engaged", "Engaged")} className="text-gray-300 focus:bg-gray-700">
                Engaged
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Done", "Done")} className="text-gray-300 focus:bg-gray-700">
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-800/50">
              <TableRow className="hover:bg-transparent border-gray-700">
                <TableHead className="text-gray-300 font-medium">Company</TableHead>
                <TableHead className="text-gray-300 font-medium">Contact</TableHead>
                <TableHead className="text-gray-300 font-medium">Job</TableHead>
                <TableHead className="text-gray-300 font-medium">Progress</TableHead>
                <TableHead className="text-gray-300 font-medium">Lead Score</TableHead>
                <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={lead.avatar} alt={lead.contact} />
                          <AvatarFallback className="bg-gray-800 text-primary">
                            {lead.contact.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-none text-white">
                            {lead.company}
                          </p>
                          <p className="text-sm text-gray-400">
                            {lead.date}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{lead.contact}</p>
                        <p className="text-sm text-gray-400">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
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
                        <span className="text-gray-300">{lead.job}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{lead.jobState}</p>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <MiniProgress status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <LeadScore score={lead.score} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        to={`/lead/${lead.id}`} 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <span>View Details</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                    No leads match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
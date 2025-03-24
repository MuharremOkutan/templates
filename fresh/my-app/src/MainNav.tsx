import React from "react";
import { Link, useLocation } from "react-router-dom";

// Icons
const DashboardIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PromptIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const BookIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const links = [
  { text: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { text: "Prompts", href: "/prompts", icon: <PromptIcon /> },
  { text: "Business Context", href: "/business-context", icon: <BookIcon /> },
];

export default function MainNav() {
  const location = useLocation();
  
  return (
    <nav className="mb-8">
      <ul className="flex space-x-4">
        {links.map((link) => {
          const isActive = location.pathname === link.href || 
                          (link.href !== "/" && location.pathname.startsWith(link.href));
          
          return (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-700 text-gray-300 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const PromptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
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
"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Prompts from "./Prompts";
import BusinessContext from "./BusinessContext";
import CreateBusinessContext from "./CreateBusinessContext";
import ViewBusinessContext from "./ViewBusinessContext";
import React, { Component, ErrorInfo, ReactNode } from "react";
import News from "./News";
import NewsDetail from "./NewsDetail";
import Exploration from "./Exploration";
import Leads from "./Leads";
import LeadDetail from "./LeadDetail";

// Define a simple error boundary component
class SimpleErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error caught by boundary:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-medium mb-4 text-white">Something went wrong</h3>
          <p className="text-gray-400 mb-6">
            There was an error loading the business context page. Please try refreshing.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        {/* Keep Noise Background for texture only */}
        <div className="noise"></div>
        
        {/* Header */}
        <header className="glass-header shadow-md sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold gradient-text">Prompt Studio</h1>
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Dashboard
                </Link>
                <Link
                  to="/prompts"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Prompts
                </Link>
                <Link
                  to="/business-context"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Business Context
                </Link>
                <Link
                  to="/exploration"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Exploration
                </Link>
                <Link
                  to="/news"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  News
                </Link>
                <Link
                  to="/leads"
                  className="font-medium text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Leads
                </Link>
              </nav>
            </div>
            <div>
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/prompts" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">Prompts Manager</h1>
                <Authenticated>
                  <Prompts />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to manage your prompts</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/dashboard" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">Dashboard</h1>
                <Authenticated>
                  <Dashboard />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to view your dashboard</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/exploration" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">Exploration</h1>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <Exploration />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to access exploration tools</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/business-context" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">Business Context</h1>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <BusinessContext />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to manage your business contexts</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/business-context/create" element={
              <>
                <Authenticated>
                  <CreateBusinessContext />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to create business contexts</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/business-context/edit/:id" element={
              <>
                <Authenticated>
                  <CreateBusinessContext />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to edit business contexts</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/business-context/view/:id" element={
              <>
                <Authenticated>
                  <ViewBusinessContext />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to view business contexts</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/news" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">News Feed</h1>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <News />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to view news</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/news/:id" element={
              <>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <NewsDetail />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to view news details</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/leads" element={
              <>
                <h1 className="text-2xl font-bold mb-6 gradient-text">Lead Management</h1>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <Leads />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to manage your leads</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/lead/:id" element={
              <>
                <Authenticated>
                  <SimpleErrorBoundary>
                    <LeadDetail />
                  </SimpleErrorBoundary>
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <p className="mb-4 text-gray-300">Please sign in to view lead details</p>
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="/" element={
              <>
                <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Prompt Studio</h1>
                <p className="text-center text-gray-400 mb-8">Create, organize, and share your AI prompts</p>
                <Authenticated>
                  <Content />
                </Authenticated>
                <Unauthenticated>
                  <div className="glass-card p-8 mx-auto max-w-md">
                    <SignInForm />
                  </div>
                </Unauthenticated>
              </>
            } />
            <Route path="*" element={
              <div className="glass-card p-8 flex flex-col items-center justify-center mx-auto max-w-md">
                <h2 className="text-2xl font-bold mb-4 gradient-text">Page Not Found</h2>
                <p className="mb-4 text-gray-300">The page you're looking for doesn't exist.</p>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            } />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Prompt Studio. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return (
    <>
      {isAuthenticated && (
        <button
          className="btn-secondary"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p className="text-center text-gray-300">{flow === "signIn" ? "Sign in to access your prompts" : "Create an account to get started"}</p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="input-primary"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="input-primary"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="btn-primary"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2 justify-center text-sm text-gray-400">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-primary hover:text-primary-light cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2">
            <p className="text-red-300 font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

function Content() {
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  if (viewer === undefined || numbers === undefined) {
    return (
      <div className="mx-auto text-center">
        <div className="animate-pulse-slow inline-block w-8 h-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <p className="mt-2 text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto glass-card p-8">
      <p className="text-gray-300">Welcome <span className="text-primary font-medium">{viewer}</span>!</p>
      <p className="text-gray-400">
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <div className="flex justify-center">
        <button
          className="btn-primary"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </button>
      </div>
      <p className="text-center">
        <span className="text-gray-400">Numbers: </span>
        <span className="text-primary-light font-medium">
          {numbers?.length === 0
            ? "Click the button!"
            : (numbers?.join(", ") ?? "...")}
        </span>
      </p>
      <div className="flex flex-col">
        <p className="text-lg font-bold gradient-text mb-4">Useful resources:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResourceCard
            title="Convex docs"
            description="Read comprehensive documentation for all Convex features."
            href="https://docs.convex.dev/home"
          />
          <ResourceCard
            title="Stack articles"
            description="Learn about best practices, use cases, and more from a growing collection of articles."
            href="https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
          />
          <ResourceCard
            title="Templates"
            description="Browse our collection of templates to get started quickly."
            href="https://www.convex.dev/templates"
          />
          <ResourceCard
            title="Discord"
            description="Join our developer community to ask questions and show off your projects."
            href="https://www.convex.dev/community"
          />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="glass-card gradient-border p-4 h-auto hover-glow shimmer transition-all">
      <a href={href} className="text-primary font-medium hover:text-primary-light transition-colors">
        {title}
      </a>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  );
}

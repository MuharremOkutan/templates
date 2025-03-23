import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { AITester } from "./components";

// Types for our data
interface Prompt {
  _id: Id<"prompts">;
  _creationTime: number;
  content: string;
  example: string;
  userId: Id<"users">;
  createdAt: number;
}

interface Collection {
  _id: Id<"collections">;
  _creationTime: number;
  name: string;
  description?: string;
  promptIds: Id<"prompts">[];
  userId: Id<"users">;
  createdAt: number;
}

export default function Prompts() {
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 10 }) ?? {};
  
  // Fetch data from Convex
  const prompts = useQuery(api.promptFunctions.listPrompts) ?? [];
  const collections = useQuery(api.promptFunctions.listCollections) ?? [];
  
  // Setup mutations
  const createPromptMutation = useMutation(api.promptFunctions.createPrompt);
  const updatePromptMutation = useMutation(api.promptFunctions.updatePrompt);
  const deletePromptMutation = useMutation(api.promptFunctions.deletePrompt);
  const createCollectionMutation = useMutation(api.promptFunctions.createCollection);
  const updateCollectionMutation = useMutation(api.promptFunctions.updateCollection);
  const deleteCollectionMutation = useMutation(api.promptFunctions.deleteCollection);
  const addPromptsToCollectionMutation = useMutation(api.promptFunctions.addPromptsToCollection);
  const removePromptFromCollectionMutation = useMutation(api.promptFunctions.removePromptFromCollection);

  const [activeTab, setActiveTab] = useState<string>("prompts");
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<Id<"prompts">[]>([]);

  // Add new states for AI testing
  const [testingPrompt, setTestingPrompt] = useState<Prompt | null>(null);

  // Create handlers
  const handleCreatePrompt = async (content: string, example: string) => {
    await createPromptMutation({ content, example });
    setIsCreatingPrompt(false);
  };

  const handleUpdatePrompt = async (content: string, example: string) => {
    if (!activePrompt) return;
    await updatePromptMutation({
      id: activePrompt._id,
      content,
      example
    });
    setActivePrompt(null);
  };

  const handleDeletePrompt = async (id: Id<"prompts">) => {
    await deletePromptMutation({ id });
  };

  // CRUD operations for collections
  const handleCreateCollection = async (name: string, description: string, promptIds: Id<"prompts">[]) => {
    await createCollectionMutation({ name, description, promptIds });
    setIsCreatingCollection(false);
    setSelectedPrompts([]);
  };

  const handleUpdateCollection = async (name: string, description: string, promptIds: Id<"prompts">[]) => {
    if (!activeCollection) return;
    await updateCollectionMutation({
      id: activeCollection._id,
      name,
      description,
      promptIds
    });
    setActiveCollection(null);
  };

  const handleDeleteCollection = async (id: Id<"collections">) => {
    await deleteCollectionMutation({ id });
  };

  // Add prompts to a collection
  const handleAddPromptsToCollection = async (collectionId: Id<"collections">, promptIds: Id<"prompts">[]) => {
    await addPromptsToCollectionMutation({
      collectionId,
      promptIds
    });
  };

  // Remove prompt from a collection
  const handleRemovePromptFromCollection = async (collectionId: Id<"collections">, promptId: Id<"prompts">) => {
    await removePromptFromCollectionMutation({ 
      collectionId,
      promptId 
    });
  };

  // Toggle prompt selection
  const togglePromptSelection = (promptId: Id<"prompts">) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter(id => id !== promptId));
    } else {
      setSelectedPrompts([...selectedPrompts, promptId]);
    }
  };

  // Helper function to get prompts for a specific collection
  const getPromptsForCollection = (collection: Collection) => {
    return prompts.filter(p => collection.promptIds.includes(p._id));
  };

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => 
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prompt.example.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter collections based on search query
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handler for testing a prompt with OpenAI
  const handleTestPrompt = (prompt: Prompt) => {
    setTestingPrompt(prompt);
  };

  // Handle loading state
  if (prompts === undefined || collections === undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-10">
        <div className="flex justify-center">
          <div className="animate-pulse-slow w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent"></div>
        </div>
        <p className="text-gray-400 mt-4">Loading your prompts...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6 py-6">
        <p className="text-gray-300">Welcome, <span className="text-primary">{viewer ?? "User"}</span>! Manage your prompts and collections here.</p>
        
        {/* Search and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts or collections..."
              className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary pl-10"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setIsCreatingPrompt(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              New Prompt
            </button>
            {activeTab === "prompts" && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCreatingCollection(true);
                  setSelectedPrompts([]);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 10v6"></path>
                  <path d="M9 13h6"></path>
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
                </svg>
                Create Collection
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="glass-card inline-flex p-1 rounded-lg self-start">
          <button
            className={`py-2 px-4 rounded-md transition-colors ${
              activeTab === "prompts" 
                ? "bg-primary text-white" 
                : "text-gray-300 hover:text-white hover:bg-slate-800/50"
            }`}
            onClick={() => setActiveTab("prompts")}
          >
            All Prompts
          </button>
          <button
            className={`py-2 px-4 rounded-md transition-colors ${
              activeTab === "collections" 
                ? "bg-primary text-white" 
                : "text-gray-300 hover:text-white hover:bg-slate-800/50"
            }`}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
        </div>
        
        {/* Content */}
        {activeTab === "prompts" && !isCreatingCollection && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(prompt => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                onEdit={() => setActivePrompt(prompt)}
                onDelete={() => handleDeletePrompt(prompt._id)}
                onTest={handleTestPrompt}
              />
            ))}
          </div>
        )}
        
        {activeTab === "prompts" && isCreatingCollection && (
          <>
            <div className="glass-card p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-white">Select prompts to include in the collection</h3>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() => setIsCreatingCollection(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (selectedPrompts.length > 0) {
                        setIsCreatingCollection(true);
                      }
                    }}
                    disabled={selectedPrompts.length === 0}
                  >
                    Continue ({selectedPrompts.length} selected)
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map(prompt => (
                <PromptCard
                  key={prompt._id}
                  prompt={prompt}
                  isSelectable={true}
                  isSelected={selectedPrompts.includes(prompt._id)}
                  onSelect={() => togglePromptSelection(prompt._id)}
                  onEdit={() => setActivePrompt(prompt)}
                  onDelete={() => handleDeletePrompt(prompt._id)}
                  onTest={handleTestPrompt}
                />
              ))}
            </div>
          </>
        )}
        
        {activeTab === "collections" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map(collection => (
              <CollectionCard
                key={collection._id}
                collection={collection}
                prompts={getPromptsForCollection(collection)}
                onEdit={() => setActiveCollection(collection)}
                onDelete={() => handleDeleteCollection(collection._id)}
                onRemovePrompt={(collectionId, promptId) => handleRemovePromptFromCollection(collectionId, promptId)}
              />
            ))}
          </div>
        )}
        
        {activeTab === "prompts" && filteredPrompts.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-300 mb-4">
              {searchQuery ? "No prompts match your search." : "You don't have any prompts yet."}
            </p>
            {!searchQuery && (
              <button
                className="btn-primary"
                onClick={() => setIsCreatingPrompt(true)}
              >
                Create your first prompt
              </button>
            )}
          </div>
        )}
        
        {activeTab === "collections" && filteredCollections.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-300 mb-4">
              {searchQuery ? "No collections match your search." : "You don't have any collections yet."}
            </p>
            {!searchQuery && (
              <button
                className="btn-primary"
                onClick={() => setIsCreatingCollection(true)}
              >
                Create your first collection
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Add AI Test Modal */}
      {testingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl">
            <AITester 
              initialPrompt={testingPrompt.content}
              onClose={() => setTestingPrompt(null)}
            />
          </div>
        </div>
      )}
      
      {/* Create/Edit Prompt Modal */}
      {(isCreatingPrompt || activePrompt) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <PromptForm
              content={activePrompt?.content}
              example={activePrompt?.example}
              onSubmit={activePrompt ? handleUpdatePrompt : handleCreatePrompt}
              onCancel={() => {
                setActivePrompt(null);
                setIsCreatingPrompt(false);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Create/Edit Collection Modal */}
      {(isCreatingCollection || activeCollection) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card gradient-border p-6 max-w-md w-full">
            <h2 className="text-xl font-medium mb-4 gradient-text">
              {activeCollection ? "Edit Collection" : "Create New Collection"}
            </h2>
            <CollectionForm
              name={activeCollection?.name}
              description={activeCollection?.description}
              prompts={prompts}
              selectedPromptIds={activeCollection ? activeCollection.promptIds : selectedPrompts}
              availablePrompts={prompts}
              onSubmit={activeCollection ? handleUpdateCollection : handleCreateCollection}
              onCancel={() => {
                setActiveCollection(null);
                setIsCreatingCollection(false);
                if (!activeCollection) {
                  setSelectedPrompts([]);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Prompt Form Component
interface PromptFormProps {
  content?: string;
  example?: string;
  onSubmit: (content: string, example: string) => void;
  onCancel: () => void;
}

function PromptForm({ content = '', example = '', onSubmit, onCancel }: PromptFormProps) {
  const [promptContent, setPromptContent] = useState(content);
  const [promptExample, setPromptExample] = useState(example);
  const [showTester, setShowTester] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingMode, setIsTestingMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(promptContent, testResponse || promptExample);
  };

  const handleSaveTest = (response: string) => {
    setTestResponse(response);
    setPromptExample(response);
    setShowTester(false);
    setIsTestingMode(false);
  };

  return (
    <div className="glass-card p-6 w-full max-w-2xl">
      <h3 className="text-lg font-medium mb-4 gradient-text">
        {content ? 'Edit Prompt' : 'Create New Prompt'}
      </h3>
      
      {!isTestingMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Prompt Content
            </label>
            <textarea
              id="content"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              rows={6}
              className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your prompt content..."
              required
            />
          </div>
          
          {testResponse ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="example" className="block text-sm font-medium text-gray-300">
                  Test Result (will be saved as example)
                </label>
                <button
                  type="button"
                  onClick={() => setTestResponse(null)}
                  className="text-xs text-primary hover:text-primary-light"
                >
                  Clear
                </button>
              </div>
              <div className="glass-card p-3 bg-slate-800/30 rounded-md whitespace-pre-wrap text-gray-300 text-sm max-h-60 overflow-y-auto">
                {testResponse}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="example" className="block text-sm font-medium text-gray-300 mb-1">
                Example Output
              </label>
              <textarea
                id="example"
                value={promptExample}
                onChange={(e) => setPromptExample(e.target.value)}
                rows={6}
                className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter an example output from this prompt..."
                required
              />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setIsTestingMode(true)}
              className="btn-secondary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Test with OpenAI
            </button>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary"
              >
                {content ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-white">Test Your Prompt</h4>
              <button
                onClick={() => setIsTestingMode(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Back to Edit
              </button>
            </div>
            <AITester 
              initialPrompt={promptContent}
              onClose={() => setIsTestingMode(false)}
              onSaveResponse={handleSaveTest}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Collection Form Component
interface CollectionFormProps {
  name?: string;
  description?: string;
  prompts?: Prompt[];
  selectedPromptIds?: Id<"prompts">[];
  availablePrompts?: Prompt[];
  onSubmit: (name: string, description: string, promptIds: Id<"prompts">[]) => void;
  onCancel: () => void;
}

function CollectionForm({ 
  name = '', 
  description = '', 
  selectedPromptIds = [], 
  availablePrompts = [],
  onSubmit, 
  onCancel 
}: CollectionFormProps) {
  const [collectionName, setCollectionName] = useState(name);
  const [collectionDescription, setCollectionDescription] = useState(description);
  const [promptIds, setPromptIds] = useState<Id<"prompts">[]>(selectedPromptIds);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A collection can be created with or without prompts
    onSubmit(collectionName, collectionDescription, promptIds);
  };

  const togglePromptSelection = (promptId: Id<"prompts">) => {
    if (promptIds.includes(promptId)) {
      setPromptIds(promptIds.filter(id => id !== promptId));
    } else {
      setPromptIds([...promptIds, promptId]);
    }
  };

  const filteredPrompts = availablePrompts.filter(prompt => 
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prompt.example.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h3 className="text-lg font-medium mb-4 gradient-text">
        {name ? 'Edit Collection' : 'Create New Collection'}
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter collection name"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter collection description"
          />
        </div>
        
        {availablePrompts.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Prompts (Optional)
            </label>
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search prompts..."
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-2 bg-slate-800/30 rounded-md">
              {filteredPrompts.length > 0 ? (
                filteredPrompts.map(prompt => (
                  <div 
                    key={prompt._id} 
                    className={`
                      p-2 my-1 rounded cursor-pointer transition-colors flex items-center
                      ${promptIds.includes(prompt._id) 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'hover:bg-slate-700/50 border border-transparent'
                      }
                    `}
                    onClick={() => togglePromptSelection(prompt._id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">{prompt.content.split('\n')[0].substring(0, 25)}...</div>
                    </div>
                    <div className="ml-2">
                      {promptIds.includes(prompt._id) ? (
                        <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      ) : (
                        <svg className="text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No prompts match your search
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Selected: {promptIds.length} of {availablePrompts.length} prompts
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm py-3 px-4 bg-slate-800/30 rounded-md">
            You don't have any prompts yet. You can add prompts to this collection later.
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="btn-primary"
        >
          {name ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

// Prompt Card Component
interface PromptCardProps {
  prompt: Prompt;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTest?: (prompt: Prompt) => void;
}

function PromptCard({ prompt, isSelectable = false, isSelected = false, onSelect, onEdit, onDelete, onTest }: PromptCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExample, setShowExample] = useState(false);

  // Get first line and truncate for preview
  const contentPreview = prompt.content.split('\n')[0].substring(0, 30);

  return (
    <div className={`glass-card gradient-border p-4 flex flex-col transition-all duration-200 hover:translate-y-[-2px] ${isSelected ? 'ring-2 ring-primary' : ''} ${isSelectable ? 'hover:ring-1 hover:ring-primary/30' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-white">{contentPreview}...</h3>
          <p className="text-xs text-gray-400">
            {prompt.content.length > 60 ? prompt.content.substring(0, 60) + '...' : prompt.content}
          </p>
        </div>
        <div className="relative">
          {isSelectable && (
            <button
              onClick={onSelect}
              className="p-1 rounded-md hover:bg-slate-700/50 transition-colors mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSelected ? 'text-primary' : 'text-gray-400'}>
                {isSelected ? (
                  <>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </>
                ) : (
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                )}
              </svg>
            </button>
          )}
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 glass-card border border-card rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-red-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
                {onTest && (
                  <button
                    onClick={() => {
                      onTest(prompt);
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                  >
                    <svg className="mr-2 text-green-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    Test with AI
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowExample(!showExample);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View Example
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent mr-2"></div>
          <p className="text-sm font-medium text-gray-300">Content Length: <span className="text-primary">{prompt.content.length} chars</span></p>
        </div>
        
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-400 line-clamp-3">
            {prompt.content.split('\n').slice(0, 3).join('\n')}
          </p>
          
          {showExample && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-primary-light mb-1">Example output:</p>
              <p className="text-xs text-gray-300 line-clamp-4">{prompt.example}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        Created: {new Date(prompt.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

// Collection Card Component
interface CollectionCardProps {
  collection: Collection;
  prompts: Prompt[];
  onEdit: () => void;
  onDelete: () => void;
  onRemovePrompt: (collectionId: Id<"collections">, promptId: Id<"prompts">) => void;
}

function CollectionCard({ collection, prompts, onEdit, onDelete, onRemovePrompt }: CollectionCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  return (
    <div className="glass-card gradient-border p-4 flex flex-col transition-all duration-200 hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-white">{collection.name}</h3>
          <p className="text-xs text-gray-400">
            {collection.description}
          </p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 glass-card border border-card rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-red-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowPrompts(true);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                  </svg>
                  View Prompts
                </button>
              </div>
            </div>
          )}
          
          {showPrompts && (
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="glass-card gradient-border p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4 text-white">Prompts in <span className="text-primary">{collection.name}</span></h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {prompts.length > 0 ? (
                    prompts.map(prompt => (
                      <div key={prompt._id} className="glass-card p-2 flex justify-between items-center">
                        <div className="truncate flex-1 text-white">{prompt.content.split('\n')[0].substring(0, 25)}...</div>
                        <button
                          onClick={() => onRemovePrompt(collection._id, prompt._id)}
                          className="ml-2 p-1 rounded-md hover:bg-slate-700/50 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No prompts in this collection</p>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowPrompts(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent mr-2"></div>
          <p className="text-sm font-medium text-gray-300">Prompts: <span className="text-primary">{collection.promptIds.length}</span></p>
        </div>
        {prompts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {prompts.slice(0, 3).map(prompt => (
              <li key={prompt._id} className="text-xs text-gray-400 truncate flex items-center">
                <svg className="mr-1 text-primary-light" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {prompt.content.split('\n')[0].substring(0, 25)}...
              </li>
            ))}
            {prompts.length > 3 && (
              <li className="text-xs text-primary">
                + {prompts.length - 3} more
              </li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 mt-3">
            No prompts in this collection
          </p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        Created: {new Date(collection.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
} 
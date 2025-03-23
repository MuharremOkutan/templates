import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Types for our data
interface Prompt {
  _id: Id<"prompts">;
  _creationTime: number;
  title: string;
  content: string;
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

  const [activeTab, setActiveTab] = useState<"prompts" | "collections">("prompts");
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<Id<"prompts">[]>([]);

  // CRUD operations for prompts
  const handleCreatePrompt = async (promptData: { title: string; content: string; }) => {
    await createPromptMutation({
      title: promptData.title,
      content: promptData.content,
    });
    setIsCreatingPrompt(false);
  };

  const handleUpdatePrompt = async (updatedPrompt: Prompt) => {
    await updatePromptMutation({
      id: updatedPrompt._id,
      title: updatedPrompt.title,
      content: updatedPrompt.content,
    });
    setActivePrompt(null);
  };

  const handleDeletePrompt = async (id: Id<"prompts">) => {
    await deletePromptMutation({ id });
  };

  // CRUD operations for collections
  const handleCreateCollection = async (collectionData: { name: string; description?: string; }) => {
    await createCollectionMutation({
      name: collectionData.name,
      description: collectionData.description,
      promptIds: selectedPrompts,
    });
    setIsCreatingCollection(false);
    setSelectedPrompts([]);
  };

  const handleUpdateCollection = async (updatedCollection: Collection) => {
    await updateCollectionMutation({
      id: updatedCollection._id,
      name: updatedCollection.name,
      description: updatedCollection.description,
      promptIds: updatedCollection.promptIds,
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
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter collections based on search query
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle loading state
  if (prompts === undefined || collections === undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <p className="text-slate-500 dark:text-slate-400">Welcome, {viewer ?? "User"}! Manage your prompts and collections here.</p>
        
        {/* Search and actions */}
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts or collections..."
              className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800 pr-8"
            />
            <span className="absolute right-2 top-2.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2 flex items-center gap-1"
              onClick={() => setIsCreatingPrompt(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              New Prompt
            </button>
            {activeTab === "prompts" && filteredPrompts.length > 0 && (
              <button
                className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2 flex items-center gap-1"
                onClick={() => {
                  setIsCreatingCollection(true);
                  setSelectedPrompts([]);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "prompts" ? "border-b-2 border-slate-800 dark:border-slate-200" : "text-slate-500"
              }`}
              onClick={() => setActiveTab("prompts")}
            >
              All Prompts
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "collections" ? "border-b-2 border-slate-800 dark:border-slate-200" : "text-slate-500"
              }`}
              onClick={() => setActiveTab("collections")}
            >
              Collections
            </button>
          </div>
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
              />
            ))}
          </div>
        )}
        
        {activeTab === "prompts" && isCreatingCollection && (
          <>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Select prompts to include in the collection</h3>
                <div className="flex gap-2">
                  <button
                    className="bg-slate-200 dark:bg-slate-700 text-foreground rounded-md px-4 py-2 text-sm"
                    onClick={() => setIsCreatingCollection(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-foreground text-background rounded-md px-4 py-2 text-sm"
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
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "No prompts match your search." : "You don't have any prompts yet."}
            </p>
          </div>
        )}
        
        {activeTab === "collections" && filteredCollections.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "No collections match your search." : "You don't have any collections yet."}
            </p>
          </div>
        )}
      </div>
      
      {/* Create/Edit Prompt Modal */}
      {(isCreatingPrompt || activePrompt) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-md p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {activePrompt ? "Edit Prompt" : "Create New Prompt"}
            </h2>
            <PromptForm
              prompt={activePrompt}
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
      {(isCreatingCollection && selectedPrompts.length > 0 || activeCollection) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-md p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {activeCollection ? "Edit Collection" : "Create New Collection"}
            </h2>
            <CollectionForm
              collection={activeCollection}
              availablePrompts={prompts}
              selectedPromptIds={activeCollection ? activeCollection.promptIds : selectedPrompts}
              onPromptSelectionChange={(ids) => {
                if (activeCollection) {
                  setActiveCollection({
                    ...activeCollection,
                    promptIds: ids
                  });
                } else {
                  setSelectedPrompts(ids);
                }
              }}
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
  prompt?: Prompt | null;
  onSubmit: (prompt: any) => void;
  onCancel: () => void;
}

function PromptForm({ prompt, onSubmit, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState(prompt?.title || "");
  const [content, setContent] = useState(prompt?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt) {
      onSubmit({
        ...prompt,
        title,
        content,
      });
    } else {
      onSubmit({
        title,
        content,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter prompt title"
          className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter prompt content"
          className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800 min-h-[120px]"
          required
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-foreground text-background rounded-md px-4 py-2"
        >
          {prompt ? "Save Changes" : "Create Prompt"}
        </button>
      </div>
    </form>
  );
}

// Collection Form Component
interface CollectionFormProps {
  collection?: Collection | null;
  availablePrompts: Prompt[];
  selectedPromptIds: Id<"prompts">[];
  onPromptSelectionChange: (promptIds: Id<"prompts">[]) => void;
  onSubmit: (collection: any) => void;
  onCancel: () => void;
}

function CollectionForm({ 
  collection, 
  availablePrompts, 
  selectedPromptIds,
  onPromptSelectionChange,
  onSubmit, 
  onCancel 
}: CollectionFormProps) {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [promptSearch, setPromptSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection) {
      onSubmit({
        ...collection,
        name,
        description,
        promptIds: selectedPromptIds,
      });
    } else {
      onSubmit({
        name,
        description,
      });
    }
  };

  const togglePromptSelection = (promptId: Id<"prompts">) => {
    if (selectedPromptIds.includes(promptId)) {
      onPromptSelectionChange(selectedPromptIds.filter(id => id !== promptId));
    } else {
      onPromptSelectionChange([...selectedPromptIds, promptId]);
    }
  };

  const filteredPrompts = availablePrompts.filter(p => 
    p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
    p.content.toLowerCase().includes(promptSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter collection name"
          className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter collection description"
          className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Select Prompts</label>
        <div className="relative mb-2">
          <input
            type="text"
            value={promptSearch}
            onChange={(e) => setPromptSearch(e.target.value)}
            placeholder="Search prompts..."
            className="bg-background text-foreground w-full rounded-md p-2 border-2 border-slate-200 dark:border-slate-800 pr-8"
          />
          <span className="absolute right-2 top-2.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </span>
        </div>
        
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-md max-h-48 overflow-y-auto">
          {filteredPrompts.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPrompts.map(prompt => (
                <div 
                  key={prompt._id} 
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  onClick={() => togglePromptSelection(prompt._id)}
                >
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {selectedPromptIds.includes(prompt._id) ? (
                        <>
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                          <path d="m9 12 2 2 4-4"></path>
                        </>
                      ) : (
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{prompt.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{prompt.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center p-4 text-slate-500">
              {promptSearch ? "No prompts match your search." : "No prompts available."}
            </p>
          )}
        </div>
        
        <p className="text-xs text-slate-500 mt-1">
          Selected {selectedPromptIds.length} of {availablePrompts.length} prompts
        </p>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-foreground text-background rounded-md px-4 py-2"
        >
          {collection ? "Save Changes" : "Create Collection"}
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
}

function PromptCard({ prompt, isSelectable = false, isSelected = false, onSelect, onEdit, onDelete }: PromptCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`bg-slate-200 dark:bg-slate-800 rounded-md p-4 flex flex-col ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {isSelectable && (
            <button
              onClick={onSelect}
              className="p-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <h3 className="font-medium">{prompt.title}</h3>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-background border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
          {prompt.content}
        </p>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
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
    <div className="bg-slate-200 dark:bg-slate-800 rounded-md p-4 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{collection.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {collection.description}
          </p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-background border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-background rounded-md p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Prompts in {collection.name}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {prompts.length > 0 ? (
                    prompts.map(prompt => (
                      <div key={prompt._id} className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 flex justify-between items-center">
                        <div className="truncate flex-1">{prompt.title}</div>
                        <button
                          onClick={() => onRemovePrompt(collection._id, prompt._id)}
                          className="ml-2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500">No prompts in this collection</p>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowPrompts(false)}
                    className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-4 py-2"
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
        <p className="text-sm font-medium mt-2">Prompts: {collection.promptIds.length}</p>
        {prompts.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {prompts.slice(0, 3).map(prompt => (
              <li key={prompt._id} className="text-xs text-slate-500 dark:text-slate-400 truncate">
                • {prompt.title}
              </li>
            ))}
            {prompts.length > 3 && (
              <li className="text-xs text-slate-500 dark:text-slate-400">
                + {prompts.length - 3} more
              </li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No prompts in this collection
          </p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Created: {new Date(collection.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
} 
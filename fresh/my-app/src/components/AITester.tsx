import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface AITesterProps {
  initialPrompt?: string;
  onClose?: () => void;
  onSaveResponse?: (response: string) => void;
}

export default function AITester({ initialPrompt = '', onClose, onSaveResponse }: AITesterProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(
    localStorage.getItem('openai_api_key')
  );
  
  const testPromptAction = useAction(api.openai.testPrompt);
  
  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setSavedApiKey(apiKey);
    setApiKey('');
  };
  
  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setSavedApiKey(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setUsage(null);
    
    const keyToUse = savedApiKey || apiKey;
    
    if (!keyToUse) {
      setError("Please enter an OpenAI API key");
      setLoading(false);
      return;
    }
    
    try {
      const result = await testPromptAction({ 
        prompt, 
        model,
        apiKey: keyToUse
      });
      
      if (result.success) {
        setResponse(result.response);
        setUsage(result.usage);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = () => {
    if (response && onSaveResponse) {
      onSaveResponse(response);
    }
  };
  
  return (
    <div className="glass-card p-6 rounded-xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium gradient-text">Test Prompt with OpenAI</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-white">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="input-primary pr-12"
              placeholder="Enter your prompt here..."
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !prompt || !(savedApiKey || apiKey)}
              className={`absolute right-2 bottom-2 p-2 rounded-md ${
                loading || !prompt || !(savedApiKey || apiKey) 
                  ? 'bg-slate-700/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              } transition-colors`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20"></polyline>
                  <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {!savedApiKey ? (
          <div className="mb-6 glass-card p-4 bg-slate-800/30">
            <p className="text-sm text-white mb-3">You need to provide an OpenAI API key to test prompts.</p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="flex-1 bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey}
                className={`btn-primary ${!apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Save Key
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Your API key will be stored locally in your browser and is never sent to our servers.
            </p>
          </div>
        ) : (
          <div className="mb-6 glass-card p-4 bg-slate-800/30 flex justify-between items-center">
            <p className="text-sm text-white">
              <span className="text-primary-light">✓</span> API Key saved locally
            </p>
            <button
              onClick={handleClearApiKey}
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              Clear Key
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        {response && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-300">OpenAI Response</label>
              {onSaveResponse && (
                <button
                  onClick={handleSaveResponse}
                  className="text-xs text-primary hover:text-primary-light font-medium"
                >
                  Use as Example
                </button>
              )}
            </div>
            <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-md whitespace-pre-wrap text-gray-200 text-sm max-h-60 overflow-y-auto">
              {response}
            </div>
            {usage && (
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>Tokens used: {usage.total_tokens}</span>
                <span>Prompt: {usage.prompt_tokens}</span>
                <span>Completion: {usage.completion_tokens}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          {response && onSaveResponse && (
            <button
              onClick={handleSaveResponse}
              className="btn-primary"
            >
              Save Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
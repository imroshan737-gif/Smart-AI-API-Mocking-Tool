import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MockEndpoint, HttpMethod } from '../types';
import * as mockStore from '../services/mockStore';
import { generateMockData } from '../services/geminiService';
import { 
  Save, 
  Wand2, 
  Loader2, 
  AlertCircle, 
  Code, 
  FileJson, 
  ArrowLeft 
} from 'lucide-react';

const MockBuilder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [mock, setMock] = useState<MockEndpoint>(mockStore.createNewMock());

  // Load existing mock if editing
  useEffect(() => {
    if (id) {
      const existing = mockStore.getMockById(id);
      if (existing) setMock(existing);
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const generated = await generateMockData(aiPrompt, 'description');
      
      // Merge generated data with current state
      setMock(prev => ({
        ...prev,
        ...generated,
        responseBody: generated.responseBody || prev.responseBody
      } as MockEndpoint));

    } catch (err: any) {
      setError(err.message || 'Failed to generate mock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    mockStore.saveMock(mock);
    navigate('/');
  };

  const handleBodyChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setMock({ ...mock, responseBody: parsed });
      setError(null);
    } catch (e) {
      // Allow invalid JSON while typing, but could flag it visually
      // For this demo, strictly requiring valid JSON to save to state effectively
      // A production app would use a proper code editor component state
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {id ? 'Edit Mock Endpoint' : 'New Mock Endpoint'}
            </h2>
            <p className="text-sm text-slate-500">Configure response structure and behavior</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all"
        >
          <Save size={18} />
          Save Endpoint
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Generator Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-900">
              <Wand2 size={20} className="text-indigo-600" />
              <h3 className="font-semibold">AI Auto-Fill</h3>
            </div>
            <p className="text-sm text-indigo-700/70 mb-4">
              Paste a Swagger snippet, raw JSON, or describe the endpoint in natural language.
            </p>
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'POST /api/login that returns a JWT token and user details' OR paste OpenAPI JSON..."
                className="w-full p-4 pr-12 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] text-sm shadow-sm"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !aiPrompt}
                className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Generate with AI"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Code size={18} className="text-slate-400" /> Endpoint Config
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Method</label>
                <select
                  value={mock.method}
                  onChange={(e) => setMock({ ...mock, method: e.target.value as HttpMethod })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(HttpMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Path</label>
                <input
                  type="text"
                  value={mock.path}
                  onChange={(e) => setMock({ ...mock, path: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Friendly Name</label>
              <input
                type="text"
                value={mock.name}
                onChange={(e) => setMock({ ...mock, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Response Body Editor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[500px]">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileJson size={18} className="text-slate-400" /> Response Body
            </h3>
            <textarea
              value={JSON.stringify(mock.responseBody, null, 2)}
              onChange={(e) => handleBodyChange(e.target.value)}
              className="flex-1 w-full p-4 rounded-lg bg-slate-900 text-blue-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
            <p className="text-xs text-slate-400 mt-2 text-right">Standard JSON format</p>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
            <h3 className="font-semibold text-slate-800">Behavior Settings</h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
                Latency Simulation ({mock.delayMs}ms)
              </label>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={mock.delayMs}
                onChange={(e) => setMock({...mock, delayMs: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Fast (0ms)</span>
                <span>Slow (5s)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Status Code</label>
              <div className="grid grid-cols-3 gap-2">
                {[200, 201, 400, 401, 403, 404, 500, 503].map(code => (
                  <button
                    key={code}
                    onClick={() => setMock({...mock, statusCode: code})}
                    className={`text-sm py-2 px-3 rounded-md font-mono transition-all ${
                      mock.statusCode === code 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Tags</label>
               <input
                type="text"
                placeholder="Comma separated (e.g. users, v1)"
                value={mock.tags.join(', ')}
                onChange={(e) => setMock({...mock, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockBuilder;
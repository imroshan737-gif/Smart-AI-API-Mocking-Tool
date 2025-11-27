import React, { useState } from 'react';
import { getMocks } from '../services/mockStore';
import { HttpMethod, SimulationResult } from '../types';
import { Play, RotateCcw, Clock, ShieldCheck, Wifi } from 'lucide-react';

const ApiPlayground: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod>(HttpMethod.GET);
  const [path, setPath] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple client-side router/matcher
  const handleSend = async () => {
    setIsLoading(true);
    setResult(null);
    const startTime = performance.now();

    // Find matching mock
    const mocks = getMocks();
    
    // Naive matching logic: exact path or basic parameter logic
    // In a real backend, this would be a proper router (e.g., express)
    const matched = mocks.find(m => {
       if (m.method !== selectedMethod) return false;
       // Handle simple parameterized matching /users/:id
       const mockParts = m.path.split('/');
       const reqParts = path.split('/');
       if (mockParts.length !== reqParts.length) return false;
       
       return mockParts.every((part, i) => part.startsWith(':') || part === reqParts[i]);
    });

    if (matched) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, matched.delayMs));
      
      const endTime = performance.now();
      setResult({
        status: matched.statusCode,
        data: matched.responseBody,
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Powered-By': 'MockAI',
          'X-Simulated-Delay': `${matched.delayMs}ms`
        },
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      });
    } else {
      // 404
      await new Promise(resolve => setTimeout(resolve, 50)); // Tiny network overhead
      const endTime = performance.now();
      setResult({
        status: 404,
        data: { error: "Not Found", message: `No mock definition found for ${selectedMethod} ${path}` },
        headers: { 'Content-Type': 'application/json' },
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* URL Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value as HttpMethod)}
            className="p-3 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 min-w-[120px] outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(HttpMethod).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">http://localhost:3000</span>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/api/v1/users/123"
              className="w-full pl-44 pr-4 py-3 rounded-lg border border-slate-300 outline-none font-mono text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 min-w-[120px]"
          >
            {isLoading ? <RotateCcw className="animate-spin" size={20} /> : <Play size={20} />}
            Send
          </button>
        </div>

        {/* Response Area */}
        <div className="min-h-[400px] flex flex-col">
          {result ? (
            <div className="flex-1 flex flex-col">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                    result.status >= 400 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    <Wifi size={16} />
                    {result.status} {result.status === 200 ? 'OK' : 'Error'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Clock size={14} />
                    {result.duration}ms
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <ShieldCheck size={14} />
                    {(JSON.stringify(result.data).length / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {result.timestamp}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-0 relative">
                <textarea
                  readOnly
                  className="w-full h-full p-6 font-mono text-sm bg-slate-900 text-green-400 resize-none focus:outline-none"
                  value={JSON.stringify(result.data, null, 2)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="p-4 rounded-full bg-slate-100 mb-4">
                <Wifi size={32} className="text-slate-300" />
              </div>
              <p>Enter a path and click Send to test your mock endpoint.</p>
              <div className="mt-4 flex gap-2">
                <span className="text-xs bg-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-300" onClick={() => setPath('/api/v1/users/123')}>Try /api/v1/users/123</span>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-300" onClick={() => { setPath('/api/v1/orders'); setSelectedMethod(HttpMethod.POST); }}>Try POST /api/v1/orders</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;
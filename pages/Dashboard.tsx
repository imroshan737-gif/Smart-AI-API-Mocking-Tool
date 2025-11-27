import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MockEndpoint, HttpMethod } from '../types';
import * as mockStore from '../services/mockStore';
import { Trash2, Edit, Play, Clock, Activity, Search } from 'lucide-react';

const MethodBadge = ({ method }: { method: HttpMethod }) => {
  const colors = {
    [HttpMethod.GET]: 'bg-blue-100 text-blue-700 border-blue-200',
    [HttpMethod.POST]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [HttpMethod.PUT]: 'bg-orange-100 text-orange-700 border-orange-200',
    [HttpMethod.DELETE]: 'bg-red-100 text-red-700 border-red-200',
    [HttpMethod.PATCH]: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${colors[method] || 'bg-gray-100'}`}>
      {method}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [mocks, setMocks] = useState<MockEndpoint[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMocks(mockStore.getMocks());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this mock?')) {
      mockStore.deleteMock(id);
      setMocks(mockStore.getMocks());
    }
  };

  const filteredMocks = mocks.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">API Mocks</h2>
          <p className="text-slate-500 mt-1">Manage and monitor your simulated endpoints.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search endpoints..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => navigate('/builder')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            Create New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMocks.map(mock => (
          <div 
            key={mock.id} 
            onClick={() => navigate(`/builder?id=${mock.id}`)}
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors"></div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <MethodBadge method={mock.method} />
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    mock.statusCode >= 400 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {mock.statusCode}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(mock.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-1 truncate pr-2">{mock.name}</h3>
              <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded block mb-4 truncate font-mono">
                {mock.path}
              </code>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{mock.delayMs}ms delay</span>
                </div>
                <div className="flex gap-2">
                  {mock.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-5 py-2 flex justify-between items-center">
               <span className="text-xs text-slate-400">Last edited: {new Date(mock.createdAt).toLocaleDateString()}</span>
               <div className="text-blue-600 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 Edit Config <Edit size={12} />
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMocks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <Activity className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No mocks found</h3>
          <p className="text-slate-500 mt-1 mb-6">Get started by creating your first API simulation.</p>
          <button 
            onClick={() => navigate('/builder')}
            className="text-blue-600 font-medium hover:underline"
          >
            Create a mock
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
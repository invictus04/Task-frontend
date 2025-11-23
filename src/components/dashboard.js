import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight,
  FileText, Clock, CheckCircle, AlertCircle, Menu, LogOut
} from 'lucide-react';
import { useAuth } from '../provider/authprovider';
import { getTasks, createTask, updateTask, deleteTask, getLogs } from '../services/apiService'; // Import API functions

export default function DashboardPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('tasks');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', description: '' });
  
  // --- State for data from the backend ---
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- State for pagination ---
  const [currentPage, setCurrentPage] = useState(0); // API is 0-indexed
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10; // Aligned with apiService

  const { logout } = useAuth();

  // --- Fetch Tasks from API ---
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTasks(currentPage, itemsPerPage, searchQuery);
      setTasks(response.data.content || []);
      setTotalPages(response.data.page.totalPages || 0);
      setTotalElements(response.data.page.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
     
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getLogs();
      setAuditLogs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  
  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);
  
  useEffect(() => {
    if (activeTab === 'audit') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);


  const openModal = (mode, task = null) => {
    setModalMode(mode);
    setEditingTask(task);
    setFormData(task ? { title: task.title, description: task.description } : { title: '', description: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '' });
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        await createTask(formData);
      } else {
        await updateTask(editingTask.id, formData);
      }
      setAuditLogs([]); 
      await fetchTasks(); 
      closeModal();
    } catch (error) {
      console.error('Failed to save task:', error);
    
    }
  };

  const handleDelete = async (task) => {
    
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task.id);
        setAuditLogs([]); 
        await fetchTasks(); 
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'Create Task': return 'text-green-400 bg-green-500';
      case 'Update Task': return 'text-yellow-400 bg-yellow-500';
      case 'Delete Task': return 'text-red-400 bg-red-500';
      default: return 'text-gray-400 bg-gray-500';
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = currentPage * itemsPerPage;
  const endItem = Math.min(startIndex + itemsPerPage, totalElements);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
    
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-50"></div>
      
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 50%)`
        }}
      ></div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="relative z-10 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TaskMaster
            </h1>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all duration-300 border border-white border-opacity-20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex items-center justify-between mb-8">

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-5 text-gray-400 hover:bg-opacity-10'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-5 text-gray-400 hover:bg-opacity-10'
              }`}
            >
              Audit Logs
            </button>
          </div>

          {activeTab === 'tasks' && (
            <button
              onClick={() => openModal('create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          )}
        </div>

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-gray-400">Loading tasks...</p>
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-4 mb-2">
                           <span className="font-mono text-xs text-gray-500">ID: {task.id}</span>
                           <span className="font-mono text-xs text-gray-500">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                        <p className="text-gray-400">{task.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('edit', task)}
                          className="p-2 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-300"
                        >
                          <Edit2 className="w-5 h-5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No tasks found.</p>
              )}
            </div>

            {totalElements > 0 && <div className="flex items-center justify-between pt-4">
              <p className="text-gray-400 text-sm">
                Showing {startIndex + 1} to {endItem} of {totalElements} tasks
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPage === i
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white bg-opacity-5 hover:bg-opacity-10 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                  <p className="text-center text-gray-400 p-6">Loading logs...</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-black bg-opacity-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Log ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Task ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Updated Content</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white hover:bg-opacity-5 transition-all duration-300">
                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">{log.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(log.localDateTime).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)} bg-opacity-20`}>
                            {log.action === 'Create Task' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {log.action === 'Update Task' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {log.action === 'Delete Task' && <Trash2 className="w-3 h-3 mr-1" />}
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">#{log.taskId}</td>
                        <td className="px-6 py-4 text-sm">
                          {log.updatedContent && (log.updatedContent.title || log.updatedContent.description) ? (
                            <div className="space-y-1 font-mono text-xs">
                              {Object.entries(log.updatedContent).map(([key, value]) => (
                                value && <div key={key} className="text-gray-400">
                                  <span className="text-blue-400 font-semibold">{key}:</span> "{value}"
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">–</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-xl font-semibold transition-all duration-300 border border-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


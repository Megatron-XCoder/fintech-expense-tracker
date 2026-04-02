import React, { useState, useEffect } from 'react';
import { Plus, Tags, X, Palette } from 'lucide-react';
import api from '../lib/api-client';

const PRESET_COLORS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#EF4444', '#F97316',
  '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', newCategory);
      setCategories([...categories, res.data.data]);
      setNewCategory({ name: '', color: '#3B82F6' });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      setDeleting(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">{categories.length} categories created</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500">Loading categories...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Tags className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-base text-slate-400 mb-1">No categories yet</p>
          <p className="text-sm text-slate-600">Create your first category to start organizing transactions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all relative overflow-hidden"
            >
              {/* Color accent bar */}
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: cat.color || '#3B82F6' }} />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color || '#3B82F6'}15` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color || '#3B82F6' }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    <p className="text-[11px] text-slate-600">{cat.color || '#3B82F6'}</p>
                  </div>
                </div>
                
                {deleting === cat._id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-400 text-xs font-medium hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleting(cat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Category Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 px-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g., Groceries"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newCategory.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f172a] scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.08]" style={{ backgroundColor: newCategory.color }} />
                  <input
                    type="text"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

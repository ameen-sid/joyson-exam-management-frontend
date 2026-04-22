import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import API from '../../api';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await API.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await API.post('/categories', { name: formData.name });
            setIsAddModalOpen(false);
            setFormData({ name: '' });
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleEditClick = (cat) => {
        setSelectedCategory(cat);
        setFormData({ name: cat.name });
        setIsEditModalOpen(true);
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/categories/${selectedCategory.id}`, { name: formData.name });
            setIsEditModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleDeleteClick = (cat) => {
        setSelectedCategory(cat);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCategory = async () => {
        try {
            await API.delete(`/categories/${selectedCategory.id}`);
            setIsDeleteModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Category Management</h2>
                    <p className="text-slate-500 mt-1">Manage examination topics.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '' });
                        setIsAddModalOpen(true);
                    }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:py-2 rounded-lg flex items-center justify-center shadow-md transition-all font-semibold"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Category Name</th>
                                <th className="p-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center p-8 text-slate-400">Loading categories...</td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-sm">#{cat.id}</td>
                                        <td className="p-4 font-medium text-slate-800">
                                            {cat.name}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(cat)}
                                                className="text-blue-600 hover:text-blue-800 p-2"
                                            >
                                                <Edit2 className="h-4 w-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(cat)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 className="h-4 w-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {categories.length === 0 && !loading && (
                                <tr><td colSpan="3" className="p-8 text-center text-slate-400 border-t border-slate-200">No categories found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Category</h2>
                                <p className="text-slate-400 text-sm font-medium">Define a new exam topic.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-2xl transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mechanical Safety"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Category</h2>
                                <p className="text-slate-400 text-sm font-medium">Update the topic name.</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-300 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-2xl transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-300">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-5 text-red-500">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h2>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            Are you sure you want to delete <span className="text-slate-800 font-bold">{selectedCategory?.name}</span>? This will affect related exams.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200/50"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

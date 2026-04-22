import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, FileQuestion, Calendar, Clock, Target, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

export default function ExamManagement() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examsRes, catsRes] = await Promise.all([
                API.get('/exams'),
                API.get('/categories')
            ]);
            const fetchedCategories = catsRes.data.data;
            const fetchedExams = examsRes.data.data.map(exam => ({
                ...exam,
                categoryName: fetchedCategories.find(cat => cat.id === exam.categoryId)?.name || 'Unknown'
            }));
            setExams(fetchedExams);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (exam) => {
        setSelectedExam(exam);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteExam = async () => {
        try {
            await API.delete(`/exams/${selectedExam.id}`);
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error deleting exam:', error);
        }
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Assessment Bank</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage certification exams and question sets.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/exams/new')}
                    className="w-full md:w-auto flex items-center justify-center space-x-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[20px] transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create Assessment</span>
                </button>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FileQuestion className="h-24 w-24" />
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Assessment Info</th>
                                <th className="p-8">Category</th>
                                <th className="p-8">Target Levels</th>
                                <th className="p-8">Schedule</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mr-3"></div>
                                        <span className="text-slate-400 font-bold">Fetching Question Papers...</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredExams.map(exam => (
                                    <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                    <FileQuestion className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg">{exam.title}</div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <Clock className="h-3 w-3" /> {exam.duration}m
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                                                            <Target className="h-3 w-3" /> {exam.passMark}% Pass
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {exam.categoryName}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-wrap gap-2">
                                                {(exam.levels || []).map(lvl => (
                                                    <span key={lvl} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">
                                                        LVL {lvl}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                <Calendar className="h-4 w-4 text-slate-300" />
                                                {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                                    title="Edit Assessment"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(exam)}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                    title="Delete Assessment"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredExams.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-medium">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                        No assessments found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-300">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-5 text-red-500">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Assessment?</h2>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            Are you sure you want to remove <span className="text-slate-800 font-bold">"{selectedExam?.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExam}
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

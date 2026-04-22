import React, { useEffect, useState } from 'react';
import { Search, Calendar, ChevronRight, BookOpen, Clock, Target, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

export default function Results() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Results Explorer</h1>
                    <p className="text-slate-500 font-medium mt-1">Select an assessment to view detailed employee performance and attendance.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BookOpen className="h-24 w-24" />
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
                                        <span className="text-slate-400 font-bold">Loading Assessments...</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredExams.map(exam => (
                                    <tr key={exam.id} onClick={() => navigate(`/admin/results/${exam.id}`)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{exam.title}</div>
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
                                            <button
                                                className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl font-bold transition-all text-sm inline-flex items-center gap-2"
                                            >
                                                View Report <ChevronRight className="h-4 w-4" />
                                            </button>
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
        </div>
    );
}

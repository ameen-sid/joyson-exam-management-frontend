import React, { useEffect, useState } from 'react';
import { Search, Calendar, ChevronRight, BookOpen, Clock, Target, AlertCircle, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../api';

export default function CommonResults() {
    const navigate = useNavigate();
    const location = useLocation();
    const [exams, setExams] = useState([]);
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

    const handleRowClick = (examId) => {
        const basePath = location.pathname.includes('/admin') ? '/admin' : '/incharge';
        navigate(`${basePath}/results/${examId}`);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="bg-slate-900 rounded-[40px] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-blue-600/20 px-4 py-2 rounded-full border border-blue-500/20 mb-6">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Analytical Overview</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 italic uppercase">RESULTS EXPLORER</h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Track organizational effectiveness. Select an assessment to view granular performance metrics, 
                        attendance records, and individual success rates.
                    </p>
                </div>
                
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-600/10 blur-[60px] rounded-full translate-y-1/2" />
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm"
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
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aggregating Data...</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredExams.map(exam => (
                                    <tr key={exam.id} onClick={() => handleRowClick(exam.id)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:rotate-6">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 text-xl group-hover:text-blue-600 transition-colors italic tracking-tight uppercase leading-none">{exam.title}</div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                            <Clock className="h-3 w-3" /> {exam.duration}m
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                            <Target className="h-3 w-3" /> {exam.passMark}% Pass
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="px-5 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">
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
                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                                <Calendar className="h-4 w-4 text-slate-300" />
                                                {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button
                                                className="px-6 py-3 bg-slate-900 text-white hover:bg-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-slate-200 inline-flex items-center gap-2 transform group-hover:-translate-x-1"
                                            >
                                                Full Report <ChevronRight className="h-4 w-4" />
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

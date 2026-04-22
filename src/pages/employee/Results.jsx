import React, { useEffect, useState } from 'react';
import { Award, Calendar, BookOpen, ChevronRight, BarChart3 } from 'lucide-react';
import API from '../../api';

export default function Results() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/results/user/${user.id}`);
            setResults(res.data.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: results.length,
        passed: results.filter(r => (r.score / r.totalQuestions) >= 0.5).length,
        avgScore: results.length ? (results.reduce((acc, r) => acc + (r.score / r.totalQuestions), 0) / results.length * 100).toFixed(1) : 0
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto py-8">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Assessments Taken</p>
                        <h3 className="text-5xl font-black italic">{stats.total}</h3>
                    </div>
                    <BarChart3 className="absolute right-[-10%] bottom-[-10%] h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Passed</p>
                        <h3 className="text-5xl font-black italic">{stats.passed}</h3>
                    </div>
                    <Award className="absolute right-[-10%] bottom-[-10%] h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Average Score</p>
                        <h3 className="text-5xl font-black italic">{stats.avgScore}%</h3>
                    </div>
                    <Award className="absolute right-[-10%] bottom-[-10%] h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">Performance History</h2>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)
                    ) : results.map(res => {
                        const percentage = (res.score / res.totalQuestions) * 100;
                        const isPassed = percentage >= 50;

                        return (
                            <div key={res.id} className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    <BarChart3 className="h-8 w-8" />
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{res.examTitle}</h4>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(res.submittedAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Level 1 Assessment
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full md:w-auto items-center justify-between md:justify-center gap-4 md:gap-8 bg-slate-50 px-6 py-4 rounded-2xl mt-4 md:mt-0">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                        <p className="text-2xl font-black text-slate-800">{res.score} / {res.totalQuestions}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                                        <p className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-500'}`}>{percentage.toFixed(0)}%</p>
                                    </div>
                                    <ChevronRight className="hidden md:block h-6 w-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}

                    {results.length === 0 && !loading && (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic">No examination records found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

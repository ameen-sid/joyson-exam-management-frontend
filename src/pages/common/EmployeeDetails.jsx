import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, 
    Hash, 
    Layers, 
    ChevronLeft, 
    BarChart3, 
    Calendar, 
    CheckCircle2, 
    XCircle,
    FileText,
    Award,
    TrendingUp
} from 'lucide-react';
import API from '../../api';

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeData();
    }, [id]);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            // Need a backend endpoint for this or fetch in parallel
            const [userRes, resultsRes] = await Promise.all([
                API.get(`/users/employees`), // We'll filter for now, ideally single user endpoint
                API.get(`/results/user/${id}`) // Need to verify/create this endpoint
            ]);
            
            const emp = userRes.data.data.find(u => u.id === parseInt(id));
            setEmployee(emp);
            setResults(resultsRes.data.data);
        } catch (error) {
            console.error('Error fetching employee details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-12 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Employee record not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline">Go Back</button>
            </div>
        );
    }

    const averageScore = results.length > 0 
        ? (results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length * 100).toFixed(1)
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 font-black uppercase tracking-widest text-[10px]">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Personnel Directory
                </button>
                <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                    Live Evaluation Data
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-slate-900 flex items-center justify-center text-white text-5xl font-black italic shadow-2xl shadow-blue-900/20 rotate-3 border-4 border-white">
                            {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Employee Identity</p>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight italic uppercase">{employee.name}</h1>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <Hash className="h-3.5 w-3.5" /> {employee.employeeId || 'No ID'}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs font-bold uppercase tracking-widest">
                                    <Layers className="h-3.5 w-3.5" /> Level {employee.level}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-xs font-bold uppercase tracking-widest">
                                    <Award className="h-3.5 w-3.5" /> {employee.categoryName || 'General'}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <TrendingUp className="h-40 w-40" />
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-slate-900 rounded-[40px] p-8 md:p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">Performance Matrix</p>
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-5xl font-black italic">{averageScore}%</h4>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Average Evaluation Grade</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-2xl font-black">{results.length}</h5>
                                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Assessments</p>
                                </div>
                                <div>
                                    <h5 className="text-2xl font-black text-emerald-400">{results.filter(r => (r.score/r.totalQuestions)*100 >= 80).length}</h5>
                                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Mastery Level</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
            </div>

            {/* Detailed Assessment History */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <h3 className="text-xl font-black italic text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Examination History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/20 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Question Paper</th>
                                <th className="p-8">Evaluation Date</th>
                                <th className="p-8">Score Breakdown</th>
                                <th className="p-8 text-right">Observation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-medium">
                                        <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                        No assessment records found for this employee.
                                    </td>
                                </tr>
                            ) : results.map(res => {
                                const percentage = ((res.score / res.totalQuestions) * 100).toFixed(1);
                                const isPass = percentage >= 80; // Assuming 80% pass for now
                                return (
                                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-slate-800 uppercase tracking-tight text-sm italic">{res.examTitle || 'Unknown Exam'}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                                <Calendar className="h-3.5 w-3.5 opacity-40" />
                                                {new Date(res.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-end gap-3">
                                                <span className={`text-2xl font-black italic ${isPass ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                    {percentage}%
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pb-1">
                                                    {res.score} / {res.totalQuestions} Hits
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm transform group-hover:scale-105 transition-all ${
                                                isPass 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                                {isPass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                {isPass ? 'Certified' : 'Re-eval required'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

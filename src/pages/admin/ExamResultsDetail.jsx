import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Search, Calendar, ChevronLeft, BookOpen, UserX, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';
import API from '../../api';

export default function ExamResultsDetail() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [examDetails, setExamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Fetch the exam metadata and the absentee-aware results
                const [examRes, resultsRes] = await Promise.all([
                    API.get(`/exams/${examId}`),
                    API.get(`/results/exam/${examId}`)
                ]);
                setExamDetails(examRes.data.data);
                setResults(resultsRes.data.data);
            } catch (error) {
                console.error('Error fetching exam details:', error);
                alert('Failed to load assessment details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [examId]);

    const filteredResults = results.filter(res =>
        (res.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Dashboard Metrics
    const totalAssigned = results.length;
    const totalAttempted = results.filter(r => !r.isAbsent).length;
    const attendanceRate = totalAssigned > 0 ? Math.round((totalAttempted / totalAssigned) * 100) : 0;

    let passedCount = 0;
    let totalScoreSum = 0;

    // We only calculate pass rate/avg score based on the entire assigned pool as requested 
    // (absent = 0 score = fail). Alternatively, we could base it only on attempted.
    // Given the prompt: absent shows as fail with 0 marks, we include them in the total.

    // Ensure passMark is available
    const passMarkPercentage = examDetails?.passMark || 50;

    results.forEach(r => {
        const score = r.score || 0;
        const totalQ = r.totalQuestions || 1; // avoid division by zero
        const percentage = (score / totalQ) * 100;

        if (percentage >= passMarkPercentage) {
            passedCount++;
        }
        totalScoreSum += percentage;
    });

    const passRate = totalAssigned > 0 ? Math.round((passedCount / totalAssigned) * 100) : 0;
    const avgScore = totalAssigned > 0 ? Math.round(totalScoreSum / totalAssigned) : 0;

    const exportCSV = () => {
        const headers = ['Employee Name', 'Employee ID', 'Status', 'Submission Date', 'Score', 'Total Questions', 'Percentage', 'Result'];

        const rows = filteredResults.map(res => {
            const score = res.score || 0;
            const totalQ = res.totalQuestions || 1;
            const percentage = (score / totalQ) * 100;
            const isPassed = percentage >= passMarkPercentage;

            return [
                res.userName,
                res.username,
                res.isAbsent ? 'ABSENT' : 'ATTENDED',
                res.isAbsent ? 'N/A' : new Date(res.submittedAt).toLocaleDateString(),
                score,
                totalQ,
                percentage.toFixed(2) + '%',
                isPassed ? 'PASS' : 'FAIL'
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `exam_${examId}_results_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Generating Report...</p>
            </div>
        );
    }

    if (!examDetails) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-700">Assessment Not Found</h2>
                <button onClick={() => navigate(location.pathname.includes('/admin') ? '/admin/results' : '/incharge/results')} className="mt-4 text-blue-600 font-bold hover:underline">Return to Results</button>
            </div>
        );
    }

    const returnPath = location.pathname.includes('/admin') ? '/admin/results' : '/incharge/results';

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(returnPath)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Result Details
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> {examDetails.title}
                        </p>
                    </div>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[20px] transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 active:scale-95"
                >
                    <Download className="h-5 w-5" />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <UserCheck className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance Rate</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{attendanceRate}%</h3>
                            <p className="text-sm font-bold text-slate-400 mb-1.5">{totalAttempted} / {totalAssigned} Users</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Rate</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{passRate}%</h3>
                            <p className="text-sm font-bold text-slate-400 mb-1.5">{passedCount} Passed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <UserX className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{avgScore}%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Filter by employee name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Passed (&gt;={examDetails.passMark}%)</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Failed</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Absent</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Employee</th>
                                <th className="p-8">Status</th>
                                <th className="p-8">Submission Date</th>
                                <th className="p-8">Score</th>
                                <th className="p-8 text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResults.map(res => {
                                const score = res.score || 0;
                                const totalQ = res.totalQuestions || 1;
                                const percentage = (score / totalQ) * 100;
                                const isPassed = percentage >= passMarkPercentage;

                                return (
                                    <tr key={res.userId} className={`hover:bg-slate-50/50 transition-colors group ${res.isAbsent ? 'opacity-70 bg-slate-50/30' : ''}`}>
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-lg ${res.isAbsent ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {(res.userName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg">{res.userName || 'Unknown'}</div>
                                                    <div className="text-xs font-bold text-slate-400 mt-0.5">ID: {res.username || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            {res.isAbsent ? (
                                                <span className="px-4 py-1.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 w-max">
                                                    <UserX className="h-3 w-3" /> Absent
                                                </span>
                                            ) : (
                                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 w-max">
                                                    <UserCheck className="h-3 w-3" /> Attended
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                {res.isAbsent ? (
                                                    <span className="text-slate-300">-</span>
                                                ) : (
                                                    <>
                                                        <Calendar className="h-4 w-4 text-slate-300" />
                                                        {new Date(res.submittedAt).toLocaleDateString()}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-2 w-32">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xl font-black ${res.isAbsent ? 'text-slate-300' : isPassed ? 'text-emerald-600' : 'text-red-500'
                                                        }`}>{score} <span className="text-sm text-slate-400">/ {totalQ}</span></span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${res.isAbsent ? 'bg-slate-300' : isPassed ? 'bg-emerald-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <span className={`px-5 py-2 rounded-[14px] text-[10px] font-black tracking-widest uppercase shadow-sm ${res.isAbsent
                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                    : isPassed
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-100'
                                                        : 'bg-red-50 text-red-600 border border-red-100 shadow-red-100'
                                                    }`}>
                                                    {isPassed ? 'Passed' : 'Failed'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredResults.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-medium">
                                        <UserX className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                        No employees found matching your search.
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

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, ChevronLeft, ChevronRight, Send, AlertCircle, User, Loader2, FileQuestion } from 'lucide-react';
import API from '../../api';

export default function ExamAttempt() {
    const { examId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeExam, setActiveExam] = useState(null);
    const [examLoading, setExamLoading] = useState(false);

    // Exam State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Identify the test taker: prioritized from location state (Incharge flow), otherwise localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const employeeFromState = location.state?.employee;
    
    // CRITICAL: If we have an employee from state, they ARE the test taker.
    // Otherwise, we fall back to the logged in user (legacy employee role support)
    const testTaker = employeeFromState || loggedInUser;
    const isFacilitatorMode = !!employeeFromState;

    useEffect(() => {
        if (examId) {
            fetchExamDetails(examId);
        } else if (!isFacilitatorMode) {
            fetchAssignedExams();
        }
    }, [examId, isFacilitatorMode]);

    useEffect(() => {
        let timer;
        if (activeExam && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (activeExam && timeLeft === 0 && !isSubmitting) {
            handleSubmitExam();
        }
        return () => clearInterval(timer);
    }, [activeExam, timeLeft]);

    const fetchAssignedExams = async () => {
        if (isFacilitatorMode) return; // Facilitators don't use the standard assignment list

        setLoading(true);
        try {
            const res = await API.get(`/exams/assigned?categoryId=${testTaker.categoryId}&level=${testTaker.level}`);
            setExams(res.data.data);
        } catch (error) {
            console.error('Error fetching assigned exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExamDetails = async (id) => {
        setExamLoading(true);
        try {
            const res = await API.get(`/exams/${id}`);
            const fullExam = res.data.data;
            setActiveExam(fullExam);
            setTimeLeft(fullExam.duration * 60);
            setAnswers({});
            setCurrentQuestionIndex(0);
        } catch (error) {
            console.error('Error loading exam:', error);
            alert('Failed to load exam. Redirecting...');
            navigate(-1);
        } finally {
            setExamLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmitExam = async () => {
        if (!activeExam || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                optionId: answers[qId]
            }));

            await API.post('/results', {
                userId: testTaker.id, // The ID of the employee taking the test
                examId: activeExam.id,
                answers: formattedAnswers
            });

            alert('Assessment submitted successfully!');
            setActiveExam(null);
            
            // Redirect based on facilitation mode or role
            if (isFacilitatorMode || loggedInUser.role === 'incharge') {
                navigate('/incharge');
            } else {
                fetchAssignedExams();
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit assessment. Please contact support.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    if (examLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Assessment Data...</p>
            </div>
        );
    }

    if (activeExam) {
        const questions = activeExam.questions || [];
        const currentQ = questions[currentQuestionIndex];

        return (
            <div className="max-w-5xl mx-auto py-4 px-4 h-full flex flex-col">
                {/* Facilitator Mode Banner */}
                {employeeFromState && (
                    <div className="bg-blue-600 text-white px-8 py-3 rounded-t-[32px] flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-50">Facilitating for: {testTaker.name}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Employee ID: {testTaker.employeeId}</span>
                    </div>
                )}

                <div className={`bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col flex-1 ${employeeFromState ? 'rounded-b-[32px]' : 'rounded-[32px]'}`}>
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <FileQuestion className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Induction Examination</span>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tight">{activeExam.title}</h2>
                            <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        </div>
                        <div className={`flex flex-col items-center gap-1 px-8 py-4 rounded-3xl border-2 transition-all ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-blue-500/10 border-blue-500 text-blue-400'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Time Remaining</span>
                            <span className="text-3xl font-mono font-black tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-slate-100 w-full shrink-0">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white">
                        {currentQ ? (
                            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="space-y-4">
                                    <span className="text-blue-600 font-black text-4xl opacity-20 italic">0{currentQuestionIndex + 1}.</span>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight italic uppercase">
                                        {currentQ.questionText}
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {(currentQ.options || []).map((opt, idx) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                                            className={`group relative text-left p-6 rounded-[24px] border-2 transition-all duration-500 ${answers[currentQ.id] === opt.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xl shadow-blue-100 translate-x-2'
                                                : 'border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-500 hover:bg-white hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500 transform ${answers[currentQ.id] === opt.id ? 'bg-blue-600 text-white rotate-6 scale-110 shadow-lg' : 'bg-white text-slate-400 group-hover:scale-105'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="flex-1 font-bold text-lg tracking-tight group-hover:text-slate-800 transition-colors uppercase">{opt.optionText}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-400 mb-4"></div>
                                <span className="font-black tracking-widest text-[10px] uppercase">Retrieving Sequence...</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-white hover:shadow-lg disabled:opacity-20 transition-all border border-transparent hover:border-slate-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isSubmitting}
                                className="flex items-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                <Send className="h-4 w-4" />
                                {isSubmitting ? 'Finalizing...' : 'Complete Assessment'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex items-center gap-3 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:translate-x-1"
                            >
                                Next Step
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Confirm Modal */}
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsConfirmModalOpen(false)} />
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm p-10 text-center relative animate-in zoom-in-95 duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 mb-6 text-blue-600 shadow-inner">
                                <Send className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 italic tracking-tight">SUBMIT ASSESSMENT?</h2>
                            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                                You have answered <span className="text-blue-600 font-black">{Object.keys(answers).length}</span> out of <span className="text-slate-800 font-bold">{questions.length}</span> questions. Ensure all responses are final.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="flex-1 px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"
                                >
                                    Review
                                </button>
                                <button
                                    onClick={() => {
                                        setIsConfirmModalOpen(false);
                                        handleSubmitExam();
                                    }}
                                    className="flex-1 px-6 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default view (legacy) - only shown if no activeExam
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-8">
            <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight mb-4 italic uppercase">ASSESSMENT PORTAL</h1>
                    <p className="text-slate-400 max-w-2xl text-lg font-medium">
                        Welcome, facilitator <span className="text-blue-400">{loggedInUser.name}</span>.
                    </p>
                </div>
            </div>
            
            {!loading && exams.length === 0 && (
                <div className="py-20 bg-white rounded-[40px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <AlertCircle className="h-16 w-16 mb-4 text-slate-100" />
                    <p className="text-xl font-black text-slate-800 italic uppercase">Sequence Empty</p>
                    <p className="text-slate-400 font-medium max-w-sm mt-2 leading-relaxed">No assessments are currently available for this selection.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">Go Back</button>
                </div>
            )}
        </div>
    );
}

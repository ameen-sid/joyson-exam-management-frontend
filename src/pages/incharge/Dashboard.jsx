import React, { useState, useEffect } from 'react';
import { 
    PlayCircle, 
    Search, 
    UserPlus, 
    UserCheck, 
    X, 
    FileQuestion, 
    Clock, 
    Target, 
    Calendar,
    ArrowRight,
    Loader2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

export default function InchargeDashboard() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Flow State
    const [selectedExam, setSelectedExam] = useState(null);
    const [flowStep, setFlowStep] = useState('list'); // 'list', 'selection', 'search', 'register'
    
    // Search State
    const [employeeIdSearch, setEmployeeIdSearch] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    // Register State
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        employeeId: '',
        categoryId: '',
        level: ''
    });
    const [categories, setCategories] = useState([]);
    const [registerLoading, setRegisterLoading] = useState(false);

    useEffect(() => {
        fetchExams();
        fetchCategories();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await API.get('/exams');
            setExams(res.data.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleStartClick = (exam) => {
        setSelectedExam(exam);
        setFlowStep('selection');
    };

    const handleSearchEmployee = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        setSearchError('');
        try {
            const res = await API.get(`/users/employees/search/${employeeIdSearch}`);
            if (res.data.success) {
                // Check if employee matches exam criteria (optional but good)
                const employee = res.data.data;
                startExam(employee);
            }
        } catch (error) {
            setSearchError(error.response?.data?.message || 'Employee not found');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRegisterEmployee = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
            const res = await API.post('/users', {
                ...newEmployee,
                role: 'employee',
                password: 'password123' // Default password as discussed
            });
            if (res.data.success) {
                const employee = res.data.data;
                // Add a small delay or a simple "Registered" state if desired, 
                // but direct start is the primary requirement.
                startExam(employee);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.response?.data?.message || 'Failed to register employee');
        } finally {
            setRegisterLoading(false);
        }
    };

    const startExam = (employee) => {
        // We pass the employee info to the exam attempt page via state
        navigate(`/incharge/exam/${selectedExam.id}`, { 
            state: { employee } 
        });
    };

    const resetFlow = () => {
        setFlowStep('list');
        setSelectedExam(null);
        setEmployeeIdSearch('');
        setSearchError('');
        setNewEmployee({ name: '', employeeId: '', categoryId: '', level: '' });
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Initializing Portal...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="bg-slate-900 rounded-[40px] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-blue-600/20 px-4 py-2 rounded-full border border-blue-500/20 mb-6">
                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Secure Examination Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 italic">FACILITATOR DASHBOARD</h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Welcome, Incharge. You have the authority to manage and start assessments for personnel. 
                        Please select an active question paper to begin the induction process.
                    </p>
                </div>
                
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-600/10 blur-[60px] rounded-full translate-y-1/2" />
            </div>

            {/* Exam List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExams.map(exam => {
                    const isToday = new Date(exam.examDate).toLocaleDateString() === new Date().toLocaleDateString();
                    return (
                        <div key={exam.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                        <FileQuestion className="h-7 w-7" />
                                    </div>
                                    <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 ${isToday ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                        {isToday ? 'Available' : 'Scheduled'}
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800 mb-6 group-hover:text-blue-600 transition-colors tracking-tight italic uppercase leading-none">
                                    {exam.title}
                                </h3>
                                
                                <div className="space-y-3 mb-10">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{new Date(exam.examDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{exam.duration} Minutes</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Target className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Pass</span>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">{exam.passMark}%</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStartClick(exam)}
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20"
                            >
                                <PlayCircle className="h-5 w-5" />
                                Start Facilitation
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* FLOW RE-ENGINEEDED MODAL SYSTEM */}
            {flowStep !== 'list' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetFlow} />
                    
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">FACILITATION FLOW</p>
                                <h2 className="text-2xl font-black italic">{selectedExam?.title}</h2>
                            </div>
                            <button onClick={resetFlow} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-10">
                            {/* STEP 1: Selection */}
                            {flowStep === 'selection' && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-slate-800">Assign Assessment</h3>
                                        <p className="text-slate-500">How would you like to identify the test taker?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setFlowStep('search')}
                                            className="p-8 border-2 border-slate-100 rounded-[32px] hover:border-blue-600 hover:bg-blue-50/50 transition-all group flex flex-col items-center space-y-4"
                                        >
                                            <div className="p-4 bg-slate-100 rounded-[20px] text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <UserCheck className="h-8 w-8" />
                                            </div>
                                            <span className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Existing Employee</span>
                                        </button>
                                        <button 
                                            onClick={() => setFlowStep('register')}
                                            className="p-8 border-2 border-slate-100 rounded-[32px] hover:border-blue-600 hover:bg-blue-50/50 transition-all group flex flex-col items-center space-y-4"
                                        >
                                            <div className="p-4 bg-slate-100 rounded-[20px] text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <UserPlus className="h-8 w-8" />
                                            </div>
                                            <span className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Add New Employee</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2A: Search */}
                            {flowStep === 'search' && (
                                <form onSubmit={handleSearchEmployee} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee Identification Number</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={employeeIdSearch}
                                                onChange={(e) => setEmployeeIdSearch(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                                placeholder="Enter Employee ID (e.g. JSS-001)"
                                                required
                                            />
                                        </div>
                                        {searchError && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {searchError}</p>}
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setFlowStep('selection')} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                                        <button 
                                            type="submit" 
                                            disabled={searchLoading}
                                            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700"
                                        >
                                            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & Proceed <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 2B: Register */}
                            {flowStep === 'register' && (
                                <form onSubmit={handleRegisterEmployee} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-blue-600"
                                                value={newEmployee.name}
                                                onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee ID</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-blue-600"
                                                value={newEmployee.employeeId}
                                                onChange={e => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</label>
                                            <select 
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-blue-600"
                                                value={newEmployee.level}
                                                onChange={e => setNewEmployee({...newEmployee, level: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Level</option>
                                                {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category / Department</label>
                                            <select 
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-blue-600"
                                                value={newEmployee.categoryId}
                                                onChange={e => setNewEmployee({...newEmployee, categoryId: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setFlowStep('selection')} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                                        <button 
                                            type="submit" 
                                            disabled={registerLoading}
                                            className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700"
                                        >
                                            {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Register & Start <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

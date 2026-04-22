import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, Save, FileChartLine, Clock, Target, Calendar, ListChecks } from 'lucide-react';
import API from '../../api';

export default function ExamEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        duration: 30,
        passMark: 50,
        examDate: '',
        levels: [],
        questions: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catsRes = await API.get('/categories');
                setCategories(catsRes.data.data);

                if (isEditMode) {
                    const examRes = await API.get(`/exams/${id}`);
                    const exam = examRes.data.data;
                    setFormData({
                        title: exam.title,
                        categoryId: exam.categoryId,
                        duration: exam.duration,
                        passMark: exam.passMark,
                        examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
                        levels: exam.levels || [],
                        questions: (exam.questions || []).map(q => ({
                            text: q.questionText,
                            options: q.options.map(o => o.optionText),
                            correctOptionIndex: q.options.findIndex(o => o.isCorrect)
                        }))
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to load assessment data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }
            ]
        });
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...formData.questions];
        newQuestions.splice(index, 1);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleLevelToggle = (level) => {
        const newLevels = formData.levels.includes(level)
            ? formData.levels.filter(l => l !== level)
            : [...formData.levels, level];
        setFormData({ ...formData, levels: newLevels });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.levels.length === 0) {
            alert('Please select at least one target level');
            return;
        }
        if (formData.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        setSaving(true);
        try {
            if (isEditMode) {
                await API.put(`/exams/${id}`, formData);
            } else {
                await API.post('/exams', formData);
            }
            navigate('/admin/exams');
        } catch (error) {
            console.error('Error saving assessment:', error);
            alert('Failed to save assessment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Loading Assessment Configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/exams')}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            {isEditMode ? 'Edit Assessment' : 'New Assessment'}
                        </h1>
                        <p className="text-slate-500 font-medium">Configure rules, levels and question bank.</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            <form className="space-y-10">
                {/* Section 1: Core Configuration */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FileChartLine className="h-32 w-32" />
                    </div>
                    <div className="relative z-10 space-y-10">
                        <div>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Section 01</span>
                            <h2 className="text-2xl font-black text-slate-800 mt-4 mb-1">Core Configuration</h2>
                            <p className="text-slate-400 text-sm font-medium">Basic assessment rules and scheduling.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-left">Assessment Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Q1 Final Safety Audit"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-left">Department / Category</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-left">Schedule Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                                        <input
                                            type="date"
                                            required
                                            value={formData.examDate}
                                            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-left">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                        <input
                                            type="number"
                                            required
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">Time in minutes</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-left">Pass Criteria</label>
                                    <div className="relative">
                                        <Target className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                        <input
                                            type="number"
                                            required
                                            value={formData.passMark}
                                            onChange={(e) => setFormData({ ...formData, passMark: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">Percentage (%)</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 text-left">Target Employee Levels</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(level => {
                                    const active = formData.levels.includes(String(level)) || formData.levels.includes(Number(level));
                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleLevelToggle(String(level))}
                                            className={`py-5 rounded-3xl border-2 font-black transition-all duration-300 ${active
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                                                : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                                                }`}
                                        >
                                            Level {level}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Questions Bank */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                                Question Bank
                                <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full shadow-lg">
                                    {formData.questions.length} TOTAL
                                </span>
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Design your assessment logic below.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="w-full md:w-auto justify-center px-8 py-3.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
                        >
                            <Plus className="h-5 w-5" /> Add New Question
                        </button>
                    </div>

                    <div className="space-y-10">
                        {formData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                                <div className="p-8 md:p-12 space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200">
                                                    {qIndex + 1}
                                                </span>
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Question Content</span>
                                            </div>
                                            <textarea
                                                required
                                                placeholder="Enter the question prompt..."
                                                value={q.text}
                                                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                                className="w-full px-0 bg-transparent border-none text-2xl font-bold text-slate-800 focus:outline-none focus:ring-0 placeholder:text-slate-200 min-h-[80px] resize-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIndex)}
                                            className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[18px] transition-all ml-6"
                                        >
                                            <Trash2 className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="relative group/opt">
                                                <div className={`p-5 rounded-[24px] border-2 transition-all duration-300 flex items-center gap-6 ${q.correctOptionIndex === oIndex
                                                    ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100'
                                                    : 'border-slate-50 bg-slate-50/50 group-hover/opt:border-slate-200'
                                                    }`}>
                                                    <div
                                                        onClick={() => handleQuestionChange(qIndex, 'correctOptionIndex', oIndex)}
                                                        className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${q.correctOptionIndex === oIndex
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                            : 'bg-white border-slate-200 text-transparent group-hover/opt:border-blue-400'
                                                            }`}
                                                    >
                                                        <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold text-slate-700 placeholder:text-slate-300 px-0"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.questions.length === 0 && (
                            <div className="bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-100 py-32 flex flex-col items-center justify-center text-center px-10">
                                <div className="p-8 bg-white rounded-full shadow-2xl shadow-slate-200 mb-8">
                                    <ListChecks className="h-16 w-16 text-blue-600 opacity-20" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Question Bank is Empty</h4>
                                <p className="text-slate-400 font-medium max-w-sm">Every assessment needs a set of challenges. Start by adding your first question.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-10 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/exams')}
                        className="w-full md:w-auto px-10 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 hover:bg-slate-50 rounded-[20px] transition-all"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Processing...' : 'Deploy Assessment'}
                    </button>
                </div>
            </form>
        </div>
    );
}

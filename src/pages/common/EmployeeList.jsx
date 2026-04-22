import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Users, ShieldCheck, Mail, Hash, Layers, ArrowUpRight, AlertCircle } from 'lucide-react';
import API from '../../api';

export default function EmployeeList() {
    const navigate = useNavigate();
    const location = useLocation();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await API.get('/users/employees');
            setEmployees(res.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
                <div className="relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-400/20 mb-4">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Personnel Registry</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase">EMPLOYEE ROSTER</h1>
                    <p className="text-slate-400 font-medium mt-2 max-w-md">Comprehensive database of registered personnel and induction levels.</p>
                </div>
                
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Hash className="h-40 w-40" />
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total: {filteredEmployees.length} Personnel</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Identification</th>
                                <th className="p-8">Employment Context</th>
                                <th className="p-8">Certification Level</th>
                                <th className="p-8 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mr-3"></div>
                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Secure Records...</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map(emp => (
                                    <tr key={emp.id} onClick={() => navigate(location.pathname.includes('/admin') ? `/admin/employees/${emp.id}` : `/incharge/employees/${emp.id}`)} className="hover:bg-slate-50/50 transition-all duration-300 group cursor-pointer">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500 flex items-center justify-center text-slate-400 group-hover:text-white font-black text-xl italic shadow-sm group-hover:rotate-3">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <ShieldCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-emerald-500 bg-white rounded-full p-0.5 shadow-sm" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 text-lg uppercase tracking-tight italic leading-none truncate max-w-[200px]">{emp.name}</div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Hash className="h-3 w-3 text-slate-300" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {emp.employeeId || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-sm">
                                                    <Mail className="h-3.5 w-3.5 text-slate-300" />
                                                    {emp.username}
                                                </div>
                                                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50/50 px-2.5 py-1 rounded-md inline-block">
                                                    {emp.categoryName || 'General Staff'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black italic shadow-lg group-hover:bg-blue-600 transition-colors">
                                                <Layers className="h-3.5 w-3.5 opacity-50" />
                                                Level {emp.level || '0'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Registered
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-24 text-center">
                                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-slate-100" />
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No records found matching search</p>
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

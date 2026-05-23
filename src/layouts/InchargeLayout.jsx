import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Users, LayoutDashboard, BarChart3, Menu, X } from 'lucide-react';

export default function InchargeLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token || !user || user?.role !== 'incharge') {
            navigate('/login');
        }
    }, [token, user, navigate]);

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const userMenuRef = useRef(null);

    const navItems = [
        { to: '/incharge', icon: LayoutDashboard, label: 'Exam Portal' },
        { to: '/incharge/employees', icon: Users, label: 'Employees' },
        { to: '/incharge/results', icon: BarChart3, label: 'Results' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    if (!token || !user || user?.role !== 'incharge') return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative">
            {/* Top Header */}
            <header className="sticky top-0 h-20 bg-slate-900 shadow-xl z-50 px-4 md:px-8 flex items-center justify-between shrink-0">

                {/* Left Side: Logo & Mobile Toggle */}
                <div className="flex items-center space-x-3 md:space-x-4 z-10 shrink-0">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white transition-colors"
                    >
                        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center justify-center h-9 w-9 md:h-10 md:w-10 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/50">
                        <img src="../public/logo.png" alt="Joyson logo" className='w-12 h-12' />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg md:text-xl font-bold text-white tracking-wide leading-none">
                            JOYSON
                        </h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-widest uppercase">Incharge Portal</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700 mx-4 hidden lg:block"></div>
                </div>

                {/* Middle: Desktop Navigation Links */}
                <div className="flex-1 hidden md:flex flex-row items-center justify-start space-x-2 z-10 px-4">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/incharge'}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* Right Side: User Profile with Dropdown */}
                <div className="relative z-10 shrink-0" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 sm:pl-4 md:pl-6 sm:border-l border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-sm text-right hidden sm:block">
                            <div className="text-white font-semibold">{user.name}</div>
                            <div className="text-slate-400 text-xs text-right opacity-80 capitalize">Facilitator</div>
                        </div>
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-slate-800 shrink-0">
                            {user.name ? user.name.charAt(0) : 'I'}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2 z-[9999]">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-700 transition-colors flex items-center space-x-3 group"
                            >
                                <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                                <span className="font-medium group-hover:text-red-400 transition-colors">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            {showMobileMenu && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800 shadow-xl z-40">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/incharge'}
                                onClick={() => setShowMobileMenu(false)}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 w-full relative">
                <div className="w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, LogOut, Shield, Users } from 'lucide-react';
import { supabase } from '../services/supabase';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: '대시보드' },
        { path: '/admin/contents', icon: <MessageSquare size={20} />, label: '콘텐츠 관리' },
        { path: '/admin/users', icon: <Users size={20} />, label: '유저 관리' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: '사이트 설정' },
    ];

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Admin</h1>
                            <span className="text-xs text-slate-400 font-medium">Control Center</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">Menu</div>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium text-sm">로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-slate-800 shadow-sm lg:hidden flex items-center p-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-600 dark:text-slate-300"
                    >
                        <span className="material-icons-round">menu</span>
                    </button>
                    <span className="ml-2 font-bold text-slate-900 dark:text-white">Admin Dashboard</span>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

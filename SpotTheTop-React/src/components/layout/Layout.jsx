import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // НОВО: Импортваме Navbar-а

export default function Layout() {
    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
            
            {/* ГЛОБАЛНИ СТИЛОВЕ */}
            <style dangerouslySetInnerHTML={{__html: `
                body, html { background-color: #0f172a !important; margin: 0; padding: 0; }
                .placeholder-gray::placeholder { color: #64748b !important; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-bg-dark:hover { background-color: #1e293b !important; }
                
                /* Скролбарове за dropdown-и */
                .dropdown-menu::-webkit-scrollbar { width: 6px; }
                .dropdown-menu::-webkit-scrollbar-track { background: transparent; }
                .dropdown-menu::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .dropdown-menu::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />

            {/* ИЗВИКВАМЕ ИЗНЕСЕНИЯ NAVBAR */}
            <Navbar />

            {/* СЪДЪРЖАНИЕТО НА СТРАНИЦИТЕ */}
            <main className="container mt-4 mb-5 pb-5 flex-grow-1">
                <Outlet /> 
            </main>
            
        </div>
    );
}
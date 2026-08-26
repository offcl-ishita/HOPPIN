'use client';
import React, { useState, useEffect } from 'react';

export default function HoppinEvents() {
  // Initializing with mock data so it renders beautifully even before connecting the backend
  const [events, setEvents] = useState([
    { id: 'e1', title: 'Milan - Annual Cultural Fest', category: 'Fest', location: 'TP Ganesan Auditorium', date: 'Oct 12, 2026', time: '10:00 AM', is_rsvpd: false },
    { id: 'e2', title: 'ACM SIGAI Hackathon', category: 'Hackathon', location: 'Tech Park, 4th Floor', date: 'Oct 15, 2026', time: '08:00 AM', is_rsvpd: true },
    { id: 'e3', title: 'Robotics Club Recruitment', category: 'Club Workshop', location: 'University Building (UB)', date: 'Oct 18, 2026', time: '04:30 PM', is_rsvpd: false },
  ]);

  const [activeTab, setActiveTab] = useState('ALL');

  const toggleRSVP = (id) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, is_rsvpd: !event.is_rsvpd } : event))
    );
    // In a full app, you would make a POST request here to /api/events/{id}/rsvp
  };

  const visibleEvents = activeTab === 'RSVP' ? events.filter((e) => e.is_rsvpd) : events;

  // Dynamic badge colors for different event types
  const getBadgeStyle = (category) => {
    switch(category) {
      case 'Fest': return 'bg-[#FF4A4A]/20 text-[#FF4A4A] border-[#FF4A4A]/30';
      case 'Hackathon': return 'bg-[#00D1FF]/20 text-[#00D1FF] border-[#00D1FF]/30';
      case 'Club Workshop': return 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0b1f28] via-[#020b0e] to-[#010608] text-white p-6 flex justify-center font-sans">
      <div className="w-full max-w-lg mt-10">
        
        {/* Header */}
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-wide mb-3 flex items-center gap-2">
            Campus <span className="text-[#00FF9D]">Radar</span> 📡
          </h1>
          <p className="text-slate-300 text-sm font-medium px-4">
            Don't miss out. Live updates for fests, hackathons, and club workshops.
          </p>
        </header>

        {/* Pill-shaped Navigation Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
              activeTab === 'ALL' 
                ? 'border-[#00D1FF] text-[#00D1FF] bg-[#00D1FF]/10 shadow-[0_0_15px_rgba(0,209,255,0.2)]' 
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('RSVP')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
              activeTab === 'RSVP' 
                ? 'border-[#00FF9D] text-[#00FF9D] bg-[#00FF9D]/10 shadow-[0_0_15px_rgba(0,255,157,0.2)]' 
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            My Reminders
          </button>
        </div>

        {/* Event List */}
        <div className="flex flex-col gap-5">
          {visibleEvents.length === 0 ? (
            <div className="text-center py-12 px-6 bg-[#0B1521]/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <p className="text-slate-300 font-medium">Your schedule is clear.</p>
              <p className="text-slate-500 text-sm mt-2">RSVP to events to see them here.</p>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <div 
                key={event.id} 
                className={`flex flex-col bg-[#0B1521]/80 backdrop-blur-md border p-5 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  event.is_rsvpd ? 'border-[#00FF9D]/40 shadow-[0_4px_20px_rgba(0,255,157,0.1)]' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Event Top Row: Category Badge & Date */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getBadgeStyle(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="text-[#00FF9D] text-xs font-bold tracking-wider">{event.date}</span>
                </div>

                {/* Event Info */}
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                
                <div className="flex flex-col gap-1 mb-5 text-sm text-slate-400">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-500">📍</span> {event.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-500">⏰</span> {event.time}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => toggleRSVP(event.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    event.is_rsvpd 
                      ? 'bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/50 hover:bg-[#00FF9D]/20' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {event.is_rsvpd ? '✓ Reminder Set' : 'Remind Me'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

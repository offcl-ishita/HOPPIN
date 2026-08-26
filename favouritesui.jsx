'use client';
import React, { useState } from 'react';

export default function HoppinFavourites() {
  const [eateries, setEateries] = useState([
    { id: '1', name: 'Tech Park Canteen', location: 'Tech Park', liveCrowd: '92% (High Queue)', density: 'high', isFavorite: false },
    { id: '2', name: 'Java Green Food Court', location: 'Java Green Area', liveCrowd: '78% (Moderate)', density: 'moderate', isFavorite: false },
    { id: '3', name: 'UB Ground Canteen', location: 'University Building', liveCrowd: '65% (Brisk Movement)', density: 'brisk', isFavorite: false },
    { id: '4', name: 'SubWay', location: 'Main Food Court', liveCrowd: '40% (Quiet Zone)', density: 'quiet', isFavorite: false },
  ]);
  const [activeTab, setActiveTab] = useState('ALL');

  const toggleFavorite = (id) => {
    setEateries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const visibleEateries = activeTab === 'FAV' ? eateries.filter((e) => e.isFavorite) : eateries;

  const getDensityColor = (level) => {
    const colors = { high: 'bg-[#FF4A4A]', moderate: 'bg-[#FFB800]', brisk: 'bg-[#00D1FF]', quiet: 'bg-[#00FF9D]' };
    return colors[level] || 'bg-gray-400';
  };

  return (
    {/* Dark radial gradient background matching the title slide */}
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0b1f28] via-[#020b0e] to-[#010608] text-white p-6 flex justify-center font-sans">
      <div className="w-full max-w-md mt-10">
        
        {/* Header matching the presentation title */}
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-wide mb-3 flex items-center gap-1">
            HOPP<span className="text-[#00FF9D] relative">i<span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">📍</span></span>N
          </h1>
          <p className="text-slate-300 text-sm font-medium px-4">
            Smart crowd radar, accessible route planner, and live event tracker for 50,000+ SRM students.
          </p>
        </header>

        {/* Pill-shaped Navigation Tabs matching the slide buttons */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
              activeTab === 'ALL' 
                ? 'border-[#00D1FF] text-[#00D1FF] bg-[#00D1FF]/10 shadow-[0_0_15px_rgba(0,209,255,0.2)]' 
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            All Eateries
          </button>
          <button
            onClick={() => setActiveTab('FAV')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
              activeTab === 'FAV' 
                ? 'border-[#00FF9D] text-[#00FF9D] bg-[#00FF9D]/10 shadow-[0_0_15px_rgba(0,255,157,0.2)]' 
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            ★ Favorites
          </button>
        </div>

        {/* Eatery List Section */}
        <div className="flex flex-col gap-4">
          {visibleEateries.length === 0 ? (
            <div className="text-center py-12 px-6 bg-[#0B1521]/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <p className="text-slate-300 font-medium">No favorites added yet.</p>
              <p className="text-slate-500 text-sm mt-2">Tap the star to add an eatery to your quick-access list.</p>
            </div>
          ) : (
            visibleEateries.map((eatery) => (
              <div 
                key={eatery.id} 
                className={`flex justify-between items-center bg-[#0B1521]/80 backdrop-blur-md border p-5 rounded-xl shadow-lg transition-all duration-300 ${
                  eatery.isFavorite ? 'border-[#00FF9D]/50 bg-[#00FF9D]/5' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 tracking-wide">{eatery.name}</h3>
                  <p className="text-slate-400 text-xs mb-4 tracking-wider uppercase">{eatery.location}</p>
                  
                  {/* Density Indicator */}
                  <div className="flex items-center gap-2 bg-black/40 w-fit px-3 py-1.5 rounded-md border border-slate-800/50">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${getDensityColor(eatery.density)}`}></span>
                    <span className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">{eatery.liveCrowd}</span>
                  </div>
                </div>
                
                {/* Star Button */}
                <button
                  onClick={() => toggleFavorite(eatery.id)}
                  className={`text-4xl p-2 transition-all duration-200 active:scale-75 ${
                    eatery.isFavorite 
                      ? 'text-[#00FF9D] drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]' 
                      : 'text-slate-700 hover:text-slate-500'
                  }`}
                >
                  {eatery.isFavorite ? '★' : '☆'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';

export default function HoppinApp() {
  const [eateries, setEateries] = useState([
    { id: '1', name: 'Tech Park Canteen', location: 'Tech Park', liveCrowd: '92% (High Queue)', densityLevel: 'high', isFavorite: false },
    { id: '2', name: 'Java Green Food Court', location: 'Java Green Area', liveCrowd: '78% (Moderate)', densityLevel: 'moderate', isFavorite: false },
    { id: '3', name: 'UB Ground Canteen', location: 'University Building', liveCrowd: '65% (Brisk Movement)', densityLevel: 'brisk', isFavorite: false },
    { id: '4', name: 'SubWay', location: 'Main Food Court', liveCrowd: '40% (Quiet Zone)', densityLevel: 'quiet', isFavorite: false },
    { id: '5', name: 'Campus Food Trucks', location: 'Near Hostels / TP', liveCrowd: '50% (Moderate)', densityLevel: 'moderate', isFavorite: false }
  ]);

  const [activeTab, setActiveTab] = useState('ALL');

  const toggleFavorite = (id) => {
    setEateries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const visibleEateries = activeTab === 'FAV' ? eateries.filter((e) => e.isFavorite) : eateries;

  const getDensityColor = (level) => {
    switch(level) {
      case 'high': return '#FF6B6B'; // Red
      case 'moderate': return '#FFC107'; // Yellow
      case 'brisk': return '#00BFFF'; // Blue
      case 'quiet': return '#00FF9D'; // Mint Green
      default: return '#94A3B8';
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoContainer}>
            {/* Compass Icon Placeholder */}
            <div style={styles.logo}>🧭</div>
            <h1 style={styles.title}>HOPPIN</h1>
          </div>
          <p style={styles.subtitle}>SRM KTR Campus Navigator</p>
        </header>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <button
            style={activeTab === 'ALL' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setActiveTab('ALL')}
          >
            All Eateries
          </button>
          <button
            style={activeTab === 'FAV' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setActiveTab('FAV')}
          >
            ★ FAV List
          </button>
        </div>

        {/* Dynamic Eatery List */}
        <div style={styles.list}>
          {visibleEateries.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No favorites yet.</p>
              <span style={{ fontSize: '14px' }}>Tap the star to build your custom route.</span>
            </div>
          ) : (
            visibleEateries.map((eatery) => (
              <div key={eatery.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <h3 style={styles.eateryName}>{eatery.name}</h3>
                  <p style={styles.metaText}>{eatery.location}</p>
                  
                  {/* Density Indicator Badge */}
                  <div style={styles.densityWrapper}>
                    <span style={{
                      ...styles.densityDot,
                      backgroundColor: getDensityColor(eatery.densityLevel)
                    }}></span>
                    <span style={{ color: getDensityColor(eatery.densityLevel), fontSize: '13px', fontWeight: 'bold' }}>
                      {eatery.liveCrowd}
                    </span>
                  </div>
                </div>

                <button
                  style={styles.starButton}
                  onClick={() => toggleFavorite(eatery.id)}
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

// Styling Object matching the HOPPIN presentation
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#041014', // Very dark deep blue/teal
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'left',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  logo: {
    backgroundColor: '#00FF9D',
    color: '#041014',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '18px',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '1px',
  },
  subtitle: {
    color: '#00BFFF', // Cyan blue subtitle
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '25px',
  },
  activeTab: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#00FF9D', // HOPPIN Mint Green
    color: '#041014', // Dark Text
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  inactiveTab: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#13232A', // Dark panel color
    color: '#94A3B8', // Slate gray
    border: '1px solid #1C333D',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#13232A', // Dark panel matching presentation cards
    border: '1px solid #1C333D',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eateryName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaText: {
    margin: 0,
    fontSize: '13px',
    color: '#94A3B8',
  },
  densityWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  densityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  starButton: {
    background: 'none',
    border: 'none',
    color: '#00FF9D', // Use the brand green for the star
    fontSize: '32px',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s ease',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94A3B8',
    padding: '40px 20px',
    backgroundColor: '#13232A',
    borderRadius: '12px',
    border: '1px dashed #1C333D',
  }
};

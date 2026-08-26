import React, { useState, useEffect } from 'react';

export default function HoppinFavourites() {
  const [eateries, setEateries] = useState([
    { id: '1', name: 'Tech Park Canteen', location: 'Tech Park', liveCrowd: '92% (High Queue)', isFavorite: false },
    { id: '2', name: 'Java Green Food Court', location: 'Java Green Area', liveCrowd: '78% (Moderate)', isFavorite: false },
    { id: '3', name: 'UB Ground Canteen', location: 'University Building', liveCrowd: '65% (Brisk Movement)', isFavorite: false },
    { id: '4', name: 'SubWay', location: 'Main Food Court', liveCrowd: '40% (Low Queue)', isFavorite: false },
    { id: '5', name: 'Campus Food Trucks', location: 'Near Hostels / TP', liveCrowd: '50% (Moderate)', isFavorite: false }
  ]);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'FAV'

  // Toggle favorite locally and sync with backend API
  const handleToggleFavorite = async (id) => {
    // Optimistic UI update
    setEateries((prevEateries) =>
      prevEateries.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );

    try {
      await fetch(`/api/eateries/${id}/favorite`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to update favorite status on server:', error);
    }
  };

  // Filter list based on selected view
  const visibleEateries = activeTab === 'FAV' 
    ? eateries.filter((e) => e.isFavorite) 
    : eateries;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>HOPPIN · SRM KTR Eateries</h1>
        <p style={styles.subtitle}>Discover food spots & save your favorites</p>
      </header>

      {/* Filter Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'ALL' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('ALL')}
        >
          All Eateries ({eateries.length})
        </button>
        <button
          style={activeTab === 'FAV' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('FAV')}
        >
          ★ FAV List ({eateries.filter((e) => e.isFavorite).length})
        </button>
      </div>

      {/* Eateries List */}
      <div style={styles.list}>
        {visibleEateries.length === 0 ? (
          <p style={styles.emptyText}>No favorites added yet. Star an eatery to add it to your FAV list!</p>
        ) : (
          visibleEateries.map((eatery) => (
            <div key={eatery.id} style={styles.card}>
              <div>
                <h3 style={styles.eateryName}>{eatery.name}</h3>
                <p style={styles.metaText}>📍 {eatery.location}</p>
                <p style={styles.metaText}>👥 Density: <strong>{eatery.liveCrowd}</strong></p>
              </div>

              {/* Star / Favorite Toggle Button */}
              <button
                style={styles.starButton}
                onClick={() => handleToggleFavorite(eatery.id)}
                aria-label="Star Eatery"
              >
                {eatery.isFavorite ? '★' : '☆'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// HOPPIN Dark Mode Theme Styles
const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#0B132B',
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '12px',
  },
  header: { marginBottom: '20px', textAlign: 'center' },
  title: { color: '#00FF9D', fontSize: '22px', margin: '0 0 5px 0' },
  subtitle: { color: '#A0AABF', fontSize: '14px', margin: 0 },
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#1C2541',
    color: '#A0AABF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  activeTab: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#00FF9D',
    color: '#0B132B',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C2541',
    padding: '15px',
    borderRadius: '8px',
  },
  eateryName: { margin: '0 0 5px 0', fontSize: '16px', color: '#FFF' },
  metaText: { margin: '2px 0', fontSize: '13px', color: '#A0AABF' },
  starButton: {
    background: 'none',
    border: 'none',
    color: '#FFD700',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0 10px',
  },
  emptyText: { textAlign: 'center', color: '#A0AABF', padding: '20px 0' },
};
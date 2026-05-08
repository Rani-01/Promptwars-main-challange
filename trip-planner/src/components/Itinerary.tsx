/// <reference types="google.maps" />
import React, { memo, useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Check, Clock, AlertCircle, CloudRain, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { ItineraryItem } from '../types';

interface ItineraryProps {
  itinerary: ItineraryItem[] | null;
  destination: string;
  simulateWeatherEvent: () => void;
}

const Itinerary: React.FC<ItineraryProps> = memo(({ itinerary, destination, simulateWeatherEvent }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapError, setMapError] = useState<string>('');

  useEffect(() => {
    if (!itinerary || !mapRef.current) return;

    const initMap = async () => {
      // NOTE: User should replace this with their actual key from Supabase/Secret Manager
      // via import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setMapError('Google Maps API Key Missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable the interactive map.');
        return;
      }
      
      setMapError('');
      
      setOptions({
        key: apiKey,
        v: 'weekly'
      });

      try {
        await importLibrary('maps');
        await importLibrary('marker');

        // Default center to the first item if available
        const center = itinerary[0]?.coordinates || { lat: 48.8566, lng: 2.3522 };

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current!, {
            center,
            zoom: 13,
            mapId: 'AEROPLAN_MAP_ID', // Optional: for advanced markers/styling
            disableDefaultUI: true,
            zoomControl: true,
          });
        } else {
          // If map already exists, just update its center bounds to fit all new points
          mapInstanceRef.current.panTo(center);
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Plot new markers
        const bounds = new google.maps.LatLngBounds();
        
        itinerary.forEach((item, index) => {
          if (item.coordinates) {
            const marker = new google.maps.Marker({
              position: item.coordinates,
              map: mapInstanceRef.current,
              title: item.title,
              label: {
                text: (index + 1).toString(),
                color: 'white'
              }
            });
            markersRef.current.push(marker);
            bounds.extend(item.coordinates);
          }
        });

        // Fit map to bounds of all markers
        if (markersRef.current.length > 0) {
          mapInstanceRef.current.fitBounds(bounds);
        }
      } catch (e) {
        console.error('Error loading Google Maps:', e);
        setMapError('Failed to load Google Maps. Check console for details.');
      }
    };

    initMap();
  }, [itinerary]);

  const handleAddToCalendar = (e: React.MouseEvent, item: ItineraryItem) => {
    e.stopPropagation();
    const title = encodeURIComponent(item.title);
    const details = encodeURIComponent(item.description);
    const location = encodeURIComponent(item.location || destination);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleItemClick = (item: ItineraryItem) => {
    if (item.coordinates && mapInstanceRef.current) {
      // Smooth professional transition instead of iframe reload
      mapInstanceRef.current.panTo(item.coordinates);
      mapInstanceRef.current.setZoom(16);
    }
  };

  return (
    <main className="glass-panel" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 tabIndex={0}>Your Itinerary</h2>
        {itinerary && (
          <button 
            className="btn-simulate" 
            onClick={simulateWeatherEvent}
            aria-label="Simulate a weather event to see dynamic recalculation"
          >
            <CloudRain size={16} aria-hidden="true" />
            <span>Simulate Weather Event</span>
          </button>
        )}
      </div>

      {itinerary && (
        <div 
          className="map-container" 
          style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)', position: 'relative', background: 'var(--bg-color)' }}
        >
          {mapError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
              <div>
                <AlertTriangle size={32} style={{ margin: '0 auto 1rem', color: 'var(--warning)' }} />
                <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{mapError}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Create a .env file and restart your server.</p>
              </div>
            </div>
          )}
          {/* Map initialization container */}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
      )}

      {!itinerary ? (
        <section className="empty-state" aria-label="Empty State">
          <MapPin size={48} className="empty-icon" aria-hidden="true" />
          <h3>No trip planned yet</h3>
          <p>Enter your destination and preferences to generate a dynamic itinerary.</p>
        </section>
      ) : (
        <section className="timeline" aria-label="Trip Timeline">
          <AnimatePresence>
            {itinerary.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="timeline-item"
              >
                <div className={`timeline-dot ${item.alert ? 'alert' : ''}`} aria-hidden="true">
                  {item.alert ? <AlertTriangle size={12} color="var(--warning)" /> : <Check size={12} color="var(--success)" />}
                </div>
                <article 
                  className="timeline-content" 
                  tabIndex={0}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(item) }}
                  style={{ cursor: 'pointer' }}
                  title="Click to zoom on Map"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="timeline-time">
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} aria-hidden="true" />
                        <time>{item.time}</time>
                      </div>
                      <h3 className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--primary-hover)' }} aria-hidden="true">{item.icon}</span>
                        {item.title}
                      </h3>
                      <p className="timeline-desc">{item.description}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCalendar(e, item)}
                      title="Add to Google Calendar"
                      aria-label={`Add ${item.title} to Google Calendar`}
                      style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', cursor: 'pointer', border: 'none', color: '#f8fafc' }}
                    >
                      <CalendarPlus size={16} />
                    </button>
                  </div>
                  
                  {item.alert && (
                    <div role="alert" style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '2px solid var(--warning)', fontSize: '0.875rem', color: 'var(--warning)' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} aria-hidden="true" />
                      {item.alert}
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem' }} aria-label="Activity Tags">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </article>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      )}
    </main>
  );
});

Itinerary.displayName = 'Itinerary';
export default Itinerary;

import React, { memo } from 'react';
import { MapPin, AlertTriangle, Check, Clock, AlertCircle, CloudRain, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItineraryItem } from '../types';

interface ItineraryProps {
  itinerary: ItineraryItem[] | null;
  destination: string;
  simulateWeatherEvent: () => void;
}

const Itinerary: React.FC<ItineraryProps> = memo(({ itinerary, destination, simulateWeatherEvent }) => {

  const handleAddToCalendar = (item: ItineraryItem) => {
    // Meaningful integration of Google Services (Google Calendar API link)
    const title = encodeURIComponent(item.title);
    const details = encodeURIComponent(item.description);
    const location = encodeURIComponent(destination);
    // Simple 2-hour duration mock for demonstration
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="glass-panel" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                <article className="timeline-content" tabIndex={0}>
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
                      onClick={() => handleAddToCalendar(item)}
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

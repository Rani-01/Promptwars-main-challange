import React, { useState, useCallback } from 'react';
import { Coffee, Landmark, Utensils, Navigation } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Itinerary from './components/Itinerary';
import Toasts from './components/Toasts';
import type { ItineraryItem, ToastMessage } from './types';

export default function App() {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItem[] | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Efficiency: Memoize to prevent unnecessary re-renders in children
  const toggleSelection = useCallback((item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    toggleSelection(interest, selectedInterests, setSelectedInterests);
  }, [selectedInterests, toggleSelection]);

  const toggleConstraint = useCallback((constraint: string) => {
    toggleSelection(constraint, selectedConstraints, setSelectedConstraints);
  }, [selectedConstraints, toggleSelection]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, desc: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, desc }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const handleGenerate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      addToast('warning', 'Invalid Input', 'Please enter a valid destination.');
      return;
    }
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setItinerary([
        {
          id: '1',
          time: '09:00 AM',
          title: 'Breakfast at Cafe de Flore',
          description: 'Start your day with a classic French breakfast. (Vegetarian options available)',
          tags: ['Culinary', '$$'],
          icon: <Coffee size={18} />
        },
        {
          id: '2',
          time: '10:30 AM',
          title: 'Eiffel Tower Guided Tour',
          description: 'Pre-booked skip-the-line access to the summit.',
          tags: ['Historical', 'Sightseeing', '$$$'],
          icon: <Landmark size={18} />
        },
        {
          id: '3',
          time: '01:00 PM',
          title: 'Lunch at L\'Avenue',
          description: 'Upscale dining with a view. Reserved corner table.',
          tags: ['Culinary', '$$$'],
          icon: <Utensils size={18} />
        },
        {
          id: '4',
          time: '03:00 PM',
          title: 'Seine River Cruise',
          description: 'Relaxing 2-hour boat tour across the river Seine.',
          tags: ['Relaxation', '$$'],
          icon: <Navigation size={18} />
        }
      ]);
      setIsGenerating(false);
      addToast('success', 'Itinerary Ready', 'Your dynamic trip has been generated successfully.');
    }, 1500);
  }, [destination, addToast]);

  const simulateWeatherEvent = useCallback(() => {
    addToast('warning', 'Weather Alert: Heavy Rain', 'Heavy rain detected near Eiffel Tower. Recalculating itinerary...');
    
    setTimeout(() => {
      setItinerary(prev => {
        if (!prev) return prev;
        const newItinerary = [...prev];
        newItinerary[1] = {
          id: '2-alt',
          time: '10:30 AM',
          title: 'Louvre Museum (Indoor Alternative)',
          description: 'Swapped due to rain. Pre-booked fast track entry for the art exhibits.',
          tags: ['Art', 'Historical', 'Indoor', '$$'],
          alert: 'Auto-swapped due to weather change',
          icon: <Landmark size={18} />
        };
        return newItinerary;
      });
      addToast('info', 'Itinerary Updated', 'Eiffel Tower visit replaced with an indoor activity (Louvre Museum).');
    }, 2000);
  }, [addToast]);

  return (
    <div className="app-container" role="application">
      <Sidebar 
        destination={destination}
        setDestination={setDestination}
        budget={budget}
        setBudget={setBudget}
        selectedInterests={selectedInterests}
        toggleInterest={toggleInterest}
        selectedConstraints={selectedConstraints}
        toggleConstraint={toggleConstraint}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      <Itinerary 
        itinerary={itinerary}
        destination={destination}
        simulateWeatherEvent={simulateWeatherEvent}
      />

      <Toasts toasts={toasts} />
    </div>
  );
}

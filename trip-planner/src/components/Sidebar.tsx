import React, { memo } from 'react';
import { Sparkles } from 'lucide-react';

const INTERESTS = ['Adventure', 'Culinary', 'Historical', 'Relaxation', 'Nature', 'Art'];
const CONSTRAINTS = ['Vegetarian', 'Vegan', 'Wheelchair Accessible', 'No Heavy Walking'];

interface SidebarProps {
  destination: string;
  setDestination: (val: string) => void;
  budget: string;
  setBudget: (val: string) => void;
  selectedInterests: string[];
  toggleInterest: (interest: string) => void;
  selectedConstraints: string[];
  toggleConstraint: (constraint: string) => void;
  handleGenerate: (e: React.FormEvent) => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = memo(({
  destination, setDestination, budget, setBudget,
  selectedInterests, toggleInterest, selectedConstraints, toggleConstraint,
  handleGenerate, isGenerating
}) => {
  return (
    <aside className="glass-panel" style={{ height: 'fit-content' }} aria-label="Trip Configuration">
      <header className="app-header">
        <h1 className="app-title gradient-text" tabIndex={0}>AeroPlan</h1>
        <p className="app-subtitle" tabIndex={0}>Dynamic Trip Architect</p>
      </header>

      <form onSubmit={handleGenerate} aria-label="Generate Itinerary Form">
        <div className="form-group">
          <label htmlFor="destination" className="form-label">Destination</label>
          <input 
            id="destination"
            type="text" 
            className="form-input" 
            placeholder="e.g. Paris, France" 
            value={destination}
            onChange={e => setDestination(e.target.value.replace(/<[^>]*>?/gm, ''))} // Security: Basic strip of HTML tags
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget" className="form-label">Budget constraints</label>
          <select 
            id="budget" 
            className="form-input" 
            value={budget} 
            onChange={e => setBudget(e.target.value)}
            aria-label="Select your budget"
          >
            <option value="budget">Budget-Friendly</option>
            <option value="moderate">Moderate</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
          <legend className="form-label">Interests</legend>
          <div className="checkbox-group" role="group" aria-label="Select interests">
            {INTERESTS.map(interest => {
              const isActive = selectedInterests.includes(interest);
              return (
                <button 
                  key={interest} 
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  className={`checkbox-pill ${isActive ? 'active' : ''}`}
                  onClick={() => toggleInterest(interest)}
                  onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') toggleInterest(interest) }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
          <legend className="form-label">Special Constraints</legend>
          <div className="checkbox-group" role="group" aria-label="Select constraints">
            {CONSTRAINTS.map(constraint => {
              const isActive = selectedConstraints.includes(constraint);
              return (
                <button 
                  key={constraint} 
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  className={`checkbox-pill ${isActive ? 'active' : ''}`}
                  onClick={() => toggleConstraint(constraint)}
                >
                  {constraint}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isGenerating}
          aria-busy={isGenerating}
        >
          {isGenerating ? 'Planning Trip...' : (
            <>
              <Sparkles size={18} aria-hidden="true" />
              <span>Generate Itinerary</span>
            </>
          )}
        </button>
      </form>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;

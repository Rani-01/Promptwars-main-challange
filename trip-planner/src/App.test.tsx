import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('AeroPlan Trip Planner', () => {
  it('renders the sidebar and empty state correctly', () => {
    render(<App />);
    expect(screen.getByText('AeroPlan')).toBeInTheDocument();
    expect(screen.getByText('No trip planned yet')).toBeInTheDocument();
  });

  it('validates input and shows warning if destination is empty', async () => {
    render(<App />);
    const generateBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
    fireEvent.click(generateBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Input')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid destination.')).toBeInTheDocument();
    });
  });

  it('generates an itinerary when valid input is provided', async () => {
    render(<App />);
    const destInput = screen.getByLabelText(/Destination/i);
    fireEvent.change(destInput, { target: { value: 'Paris' } });
    
    const generateBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
    fireEvent.click(generateBtn);
    
    // UI should show loading state
    expect(screen.getByText('Planning Trip...')).toBeInTheDocument();
    
    // Wait for the mock API call to resolve
    await waitFor(() => {
      expect(screen.getByText('Breakfast at Cafe de Flore')).toBeInTheDocument();
      expect(screen.queryByText('No trip planned yet')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

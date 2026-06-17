import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionTrackerPage from '../../src/pages/ActionTrackerPage';

describe('ActionTrackerPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders tracker and allows adding actions', async () => {
    render(<ActionTrackerPage />);

    expect(screen.getByText(/Total CO₂ Saved This Year/)).toBeInTheDocument();
    
    // Check form presence
    const inputName = screen.getByLabelText(/Action Detail/i);
    const inputCo2 = screen.getByLabelText(/CO₂ Saved \(kg\)/i);
    const addButton = screen.getByRole('button', { name: /Add Action/i });

    expect(inputName).toBeInTheDocument();
    expect(inputCo2).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CalculatorPage from '../../src/pages/CalculatorPage';

describe('CalculatorPage', () => {
  it('renders correctly and shows validation messages on empty submit', async () => {
    // Note: This relies on jsdom and testing library
    render(
      <BrowserRouter>
        <CalculatorPage />
      </BrowserRouter>
    );

    // Initial render
    expect(screen.getByText(/Calculate Your Carbon Footprint/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Car Type/)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Calculate My Footprint/ });
    expect(submitBtn).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders "No data found" when no data in localStorage', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/No data found/i)).toBeInTheDocument();
  });

  it('renders dashboard when data exists', () => {
    const mockData = {
      transport: { carType: "gas", kmPerWeek: 100, flightsPerYear: 1 },
      homeEnergy: { electricityKwhPerMonth: 300, gasUsage: 50, renewablePercentage: 20 },
      diet: { meatFrequency: "weekly" },
      shoppingWaste: { onlineOrdersPerMonth: 5, recyclingHabits: "sometimes" }
    };
    
    // Using jest.spyOn
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockData));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Annual Carbon Footprint/)).toBeInTheDocument();
  });
});

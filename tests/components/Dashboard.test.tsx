import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';

const mockCarbonInput = {
  transport: { carType: "gas" as const, kmPerWeek: 100, flightsPerYear: 1 },
  homeEnergy: { electricityKwhPerMonth: 300, gasUsage: 50, renewablePercentage: 20 },
  diet: { meatFrequency: "weekly" as const },
  shoppingWaste: { onlineOrdersPerMonth: 5, recyclingHabits: "sometimes" as const },
};

// Provide a fake authenticated user so DashboardPage doesn't exit early
jest.mock('../../src/lib/firebase/auth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' }, loading: false }),
}));

// Mock the db module to control getCarbonInput return values
jest.mock('../../src/lib/firebase/db', () => ({
  getCarbonInput: jest.fn(),
  saveCarbonInput: jest.fn(),
  addEcoAction: jest.fn(),
  getEcoActions: jest.fn(() => Promise.resolve([])),
  deleteEcoAction: jest.fn(),
}));

// Import after the mock is set up
import { getCarbonInput } from '../../src/lib/firebase/db';
const mockGetCarbonInput = getCarbonInput as jest.MockedFunction<typeof getCarbonInput>;

describe('DashboardPage', () => {
  beforeEach(() => {
    mockGetCarbonInput.mockReset();
  });

  it('renders "No data found" when Firebase has no data', async () => {
    mockGetCarbonInput.mockResolvedValueOnce(null);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No data found/i)).toBeInTheDocument();
  });

  it('renders dashboard when Firebase returns carbon input data', async () => {
    mockGetCarbonInput.mockResolvedValueOnce(mockCarbonInput);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Your Annual Carbon Footprint/)).toBeInTheDocument();
  });
});


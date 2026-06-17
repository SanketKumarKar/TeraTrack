import { test, expect } from '@playwright/test';

test('Full flow: Calculate footprint and view dashboard', async ({ page }) => {
  await page.goto('/');

  // Expect to be on the calculator page
  await expect(page.locator('h1')).toContainText('Calculate Your Carbon Footprint');

  // Fill out the form
  await page.selectOption('#carType', 'gas');
  await page.fill('#kmPerWeek', '150');
  await page.fill('#flightsPerYear', '2');
  
  await page.fill('#electricityKwh', '400');
  await page.fill('#gasUsage', '100');
  await page.fill('#renewable', '50');

  await page.selectOption('#meatFrequency', 'weekly');
  
  await page.fill('#onlineOrders', '10');
  await page.selectOption('#recyclingHabits', 'sometimes');

  // Submit the form
  await page.click('button[type="submit"]');

  // Check valid redirection to dashboard and values
  await expect(page.locator('h1')).toContainText('Your Annual Carbon Footprint');
  
  // Dashboard is visible
  await expect(page.locator('text=Personalized Action Plan')).toBeVisible();

  // Navigate to tracker
  await page.click('text=Action Tracker');
  await expect(page.locator('h1')).toContainText('Total CO₂ Saved This Year');
});

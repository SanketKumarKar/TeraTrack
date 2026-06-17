# Carbon Footprint Awareness Platform

A fullstack web application to help individuals understand, track, and reduce their personal carbon footprint through actionable intelligence and simple tracking.

## Challenge Pillars

### Understand
The platform addresses the **Understand** pillar by providing a detailed, interactive Carbon Calculator that asks clear questions across four lifestyle categories. The Dashboard visualizes these emissions using a donut chart breakdown and a bar chart comparing the user's footprint against national and global averages, instantly conceptualizing the scale of their impact. An in-depth Awareness page explains critical concepts and statistics directly.

### Track
To tackle the **Track** pillar, the application includes a dedicated Action Tracker without requiring a user login (utilizing persistent local storage). Users can log daily eco-actions—like cycling instead of driving or eating a plant-based meal—and immediately see cumulative CO₂ savings calculated over the year. This gamified tracking emphasizes positive reinforcement and continuous engagement.

### Reduce
We address the **Reduce** pillar by taking the specific metrics generated from the user's form submission to synthesize personalized actionable tips. The reduction recommendations are dynamically ranked, heavily weighting the categories where the user's proportional footprint is largest. This targeted approach prevents choice paralysis and highlights exactly where their behavioral changes will have the highest ROI.

## Setup & Running Tests

1. Start the development server
\`\`\`bash
npm run dev
\`\`\`

2. Run Unit & Component Tests
\`\`\`bash
npm run test
\`\`\`

3. Run Tests with Coverage Report
\`\`\`bash
npm run test:coverage
\`\`\`

4. Run Playwright End-to-End Tests
\`\`\`bash
npm run test:e2e
\`\`\`

## Emission Factors & Sources
- **Transport**: US EPA Greenhouse Gas Equivalencies (approx 0.000192 tonnes/km).
- **Home Energy**: Grid averages derived from EIA/IPCC estimates.
- **Diet**: Based on research from the Oxford Martin School and IPCC reports (vegan diet 0.5t vs daily meat 3.3t/yr).
- **Shopping & Waste**: Approximations on packaging material decay and last-mile delivery outputs based on UNEP reports.

*Note: Calculations are educational approximations designed to drive awareness.*

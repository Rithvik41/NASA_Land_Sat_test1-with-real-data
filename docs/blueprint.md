# **App Name**: Earth Insights Dashboard

## Core Features:

- Coordinate Input: Input fields for latitude and longitude coordinates.
- CSV Upload: Upload functionality for ground truth CSV files.
- Metric Computation: Backend computation of environmental metrics including NDVI, NDBI, NDWI, NBR, MNDWI and derived metrics using Google Earth Engine.
- Numeric Summary Tables: Display computed metrics in sortable tables (metric name, first value, last value, percentage change).
- Data Visualization: Optional: Interactive time-series plots for metrics and scatter plots for satellite vs. ground truth data, on user request. Tool may avoid plotting low-information graphs.
- Export to CSV: Option to export data in CSV format.
- Error Handling: Provide clear error messages for issues like missing satellite bands or incorrect CSV format.
- Date range selection: Date range selection for fetching satellite data.
- Include additional metrics: Include Yield Index, Soil Moisture Percent, Water Percent, and SWIR Ratio in metrics.
- Number of valid points: Number of valid points (n) for each metric in summary tables.
- Interactive tooltips and plots: Interactive hover tooltips and combined plots.
- Ground vs satellite comparison: Ground vs satellite comparison panel explicitly.
- Enhanced export options: Export options for plots/images and summary report.
- Enhanced error handling: Extra error handling for NaNs, missing satellite data, or low-information plots.
- Mobile responsiveness and dark/light mode: Mobile responsiveness and dark/light mode toggle.

## Style Guidelines:

- Primary color: Medium green (#77DD77), symbolizing healthy vegetation, environmental awareness, and a vibrant ecosystem.
- Background color: Very light green (#F0FFF0), almost white, creates a clean and spacious feel, ensuring comfortable readability and focus on data presentation.
- Accent color: Soft blue (#ADD8E6) to represent water bodies and hydrological data, used for highlights and interactive elements, providing visual cues without overwhelming the interface.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, offering a modern and neutral appearance suitable for data-heavy dashboards; ensure clear legibility and a clean presentation.
- Dashboard layout with input section at the top, followed by summary cards, numeric tables, and expandable sections for plots; ensures a logical information flow and user-friendly interaction.
- Use simple, clear icons related to environmental monitoring, data analytics, and geographical locations; icons enhance usability and visual communication without cluttering the interface.
- Subtle animations for data loading and updates, maintaining a smooth and engaging user experience; animations are unobtrusive, ensuring quick loading of environmental data metrics, providing seamless experience and real-time performance feedback.
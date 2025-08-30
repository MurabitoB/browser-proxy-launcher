# General Code Style & Formatting

- Follow the Airbnb Style Guide for code formatting.
- Use PascalCase for React component file names (e.g., UserCard.tsx, not user-card.tsx).
  - For shadcn components which located in `src/components/ui`, use kebab-case (e.g., button.tsx, card.tsx).
- Prefer named exports for components.

## Project Structure & Architecture

- Follow Next.js patterns and use the App Router.
- Only support client components in Next.js.

## Styling & UI

- Use Tailwind CSS for styling.
- Use Daisy UI for components.

## Data Fetching & Forms

- Use React Query for data fetching.
- Use axios for making HTTP requests.
- Use React Hook Form for form management.
- Use Zod for schema validation.

## Backend & Database

- Use JSON config file for application settings.

## Data format

- DateTime: Use ISO 8601 format (e.g., "2023-10-01T12:00:00Z").
- Currency: Use lowercase strings (e.g., "meso", "snow").

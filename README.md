## Project Overview

This application allows users to search for YouTube videos and create clips by setting custom start and end points. The key features include:

- **Video Fetch**: Get and paginate for YouTube videos using an API route operating on videos.json
- **Video Search**: Search for YouTube videos using the search input
- **Video Playback**: Watch selected videos, and live videos with custom player controls, or open channels in a new tab
- **Clip Creation**: Set custom start and end points to create video clips
- **Persistent Settings**: Trim settings are saved per video in local storage

## Tech Stack

- **Framework**: Next.js 
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **APIs**: YouTube iFrame Player API

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture & Design Decisions

- **Component Structure**: Focused on modular, reusable components with clear separation of concerns
- **Custom Hooks**: Created dedicated hooks for YouTube player integration and state management
- **Accessibility**: Implemented ARIA attributes and keyboard navigation
- **Responsive Design**: Tailwind CSS for fully responsive layout
- **Error Handling**: Graceful fallbacks for API failures and loading states

## Future Improvements

With more time, I would add:

- Unit tests for components and hooks
- Optimizations to the VideoPlayer state management
- More advanced search
- Dark mode
- Advanced polishing

Thank you for reviewing my submission! I look forward to discussing the implementation details and any questions you might have.
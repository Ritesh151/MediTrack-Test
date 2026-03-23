# MediTrack Pro - Next.js Web Application

A pixel-perfect conversion of the MediTrack HelpDesk Flutter application to Next.js (React).

## Features

- **Patient Dashboard**: View tickets, create new support tickets
- **Admin Dashboard**: Manage hospital tickets, update status, view analytics
- **Super User Dashboard**: Hospital management, admin assignment, statistics
- **Ticket Details**: Real-time chat functionality
- **Settings**: Profile management, role-based preferences
- **Responsive Design**: Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see backend folder)

### Installation

1. Navigate to the website folder:
```bash
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the website root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Splash screen
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── dashboard/         # Patient dashboard
│   │   ├── admin/             # Admin dashboard
│   │   ├── super/             # Super user dashboard
│   │   ├── settings/          # Settings page
│   │   ├── ticket/            # Ticket details with chat
│   │   └── ticket-history/    # Ticket history
│   ├── components/            # Reusable UI components
│   ├── context/               # React Context providers
│   └── lib/                   # Types and utilities
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Dependencies
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: SVG icons
- **State Management**: React Context API

## Role-Based Access

- **Patient**: Can create tickets, view own tickets, chat
- **Admin**: Can manage hospital tickets, update status
- **Super User**: Can manage hospitals, assign admins

## API Endpoints

The application expects the following API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update user
- `GET /api/hospitals` - List hospitals
- `POST /api/hospitals` - Create hospital
- `DELETE /api/hospitals/:id` - Delete hospital
- `GET /api/tickets` - List tickets
- `GET /api/tickets/user` - User's tickets
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/chat/:ticketId` - Get messages
- `POST /api/chat/:ticketId` - Send message

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Build and Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## License

Private project - All rights reserved

# Pokémon TCG Simulator

A web-based simulator for the Pokémon Trading Card Game that allows players to play the game online with an authentic experience.

## Features

- Authentic Pokémon TCG board layout
- Drag-and-drop card interactions
- Support for custom cards
- Real-time multiplayer gameplay
- Game state saving and restoration
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **State Management**: Redux
- **Real-time Communication**: Socket.IO
- **Styling**: CSS Variables, Responsive Design
- **Database**: SQLite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pokemon-tcg-simulator.git
   cd pokemon-tcg-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
pokemon-tcg-simulator/
├── src/                  # Source files
│   ├── assets/           # Static assets (images, fonts)
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Redux store configuration
│   ├── styles/           # CSS styles
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── public/               # Public static files
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production-ready app
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format code with Prettier

## Game Board Layout

The game board follows the standard Pokémon TCG layout:

- Prize Cards (6 cards in a 2×3 grid)
- Active Pokémon area
- Bench (up to 5 Pokémon)
- Deck and Discard Pile
- Hand area
- Stadium zone
- VSTAR/GX markers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgements

- The Pokémon Company for creating the Pokémon Trading Card Game
- The open-source community for the amazing tools and libraries

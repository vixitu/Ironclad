# Ironclad Discord Bot

A feature-rich Discord bot with music playback, games, and utility commands.

## Features

### Music Commands
- `/play [searchterm]` - Play a song from YouTube or Spotify
  - Supports direct YouTube/Spotify links
  - Supports playlists from both platforms
  - Autocomplete search functionality
  - Option to insert song at front of queue
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/skip` - Skip the current song
- `/skipto [position]` - Skip to a specific position in the queue
- `/queue` - View the current music queue
- `/clear` - Clear the music queue
- `/shuffle` - Shuffle the current queue
- `/lyrics [song]` - Get lyrics for a song
- `/info` - Get information about the current song

### Games
- `/hitster` - Play Hitster, a music guessing game
  - Guess the song title, artist, and release year
  - Leaderboard tracking
  - Multiple difficulty levels
  - Voice channel integration
- `/trivia` - Play a trivia game
  - Customizable number of questions (1-50)
  - Multiple difficulty levels (Easy, Medium, Hard)
  - Various categories including:
    - General Knowledge
    - History
    - Geography
    - Politics
    - Mythology
    - Video Games
    - Board Games
    - Music
    - Film
    - Books
    - Sports
    - Art
    - Anime
    - Animals
    - Vehicles
    - Science & Nature
  - Multiple choice or free answer modes

### Utility Commands
- `/setstatus [status]` - Set the bot's status
- `/website` - Get the bot's website link
- `/bugreport` - Report a bug
- `/image` - Get a random image
- `/quote` - Get a random quote
- `/today` - Get today's historical events
- `/list` - List available commands
- `/config` - Configure bot settings
- `/signup` - Sign up for the bot's services

### Hosting Features
- `/host` - Start a hosting session
- `/stophost` - Stop the current hosting session
- `/unreserve` - Unreserve a previously reserved item
- `/coop` - Start a cooperative session

## Technical Details

### Dependencies
- Discord.js
- Discord Player
- Sequelize
- MongoDB
- Express
- Socket.io
- Puppeteer
- Axios
- Cheerio

### Database
- Uses both SQLite (via Sequelize) and MongoDB
- Stores user data, game scores, and music preferences
- Maintains separate collections per server

### Architecture
- Modular command structure
- Web dashboard integration
- Real-time updates via Socket.io
- RESTful API endpoints
- Autocomplete support for commands

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with the following variables:
```
TOKEN=your_discord_bot_token
DATABASETOKEN=your_mongodb_connection_string
```
4. Start the bot:
```bash
node main.js
```

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

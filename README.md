# TNETC Trading Bot

A Telegram bot for TNETC trading services, allowing users to explore and purchase various trading services.

## Features

- Welcome flow with introduction to available services
- Service selection with detailed information
- Purchase flow with payment and verification
- Follow-up scheduling for users who do not immediately purchase
- Testimonials showcasing satisfied customers
- Trading results display
- Admin commands for management

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Configure the environment:
   - Update `.env` file with your Telegram Bot Token
   - Set `ADMIN_USER_ID` to your Telegram user ID
4. Add images to asset folders:
   - `assets/testimonials/` - Customer testimonial images
   - `assets/results/` - Trading result screenshots
   - `assets/service-info/` - Service information images

## Usage

### Development mode

```bash
npm run dev
```

This will start the bot in development mode with hot-reloading.

### Production mode

```bash
npm run build
npm start
```

This will compile TypeScript code and start the bot in production mode.

## Project Structure

- `src/` - Source code
  - `bot.ts` - Main bot setup and command registration
  - `config/` - Configuration files
  - `handlers/` - Command and callback handlers
  - `services/` - Business logic services
  - `types/` - TypeScript type definitions
  - `utils/` - Helper functions

## Command Reference

- `/start` - Start the bot and see the welcome message
- `/help` - Display help information and available commands
- `/services` - View available trading services
- `/testimonials` - View customer testimonials
- `/results` - View trading results
- `/contact` - Contact information

## Troubleshooting

If the bot isn't responding properly, check:
1. Bot token is correctly set in `.env`
2. The bot has been started with `/start` command in Telegram
3. Check logs for any errors
4. Make sure the bot has adequate permissions in Telegram

## License

ISC 
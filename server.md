# Server Backend Instructions

## Overview
This backend is structured using Node.js with Express.js, designed to support an uptime monitoring platform.

## Framework and Libraries
- **Express.js** for building RESTful APIs.
- **Prisma ORM** for database interactions.
- **Passport.js** for OAuth2 authentication, crucial for secure user management.
- **Socket.io** for managing real-time event-driven data flows.
- **Bull** for robust queue management and background processing.

## Database Structure
- Utilize **Prisma** to define the data models and ensure seamless database integrations.
- Implement migrations and seeding strategies to maintain data integrity.

## API Endpoints
- Design REST API endpoints to support monitor CRUD operations, user authentication, and real-time notification updates.
- Ensure APIs follow REST best practices, enabling scalable client interactions.

## Middleware
- Implement middleware for logging (`morgan`), security (`helmet`), and CORS handling.

## Real-Time Features
- Integrate `Socket.io` to provide real-time updates for clients, especially for incident notification and dashboard updates.

## Deployment and Scaling
- Use **PM2** or a similar process manager for production deployment.
- Implement environment-based configuration with `dotenv`.

## Testing
- Ensure robust testing of all layers: unit, integration, and endpoint testing using tools like Jest or Mocha.

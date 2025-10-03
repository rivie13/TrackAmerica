# TrackAmerica API

Backend API server for TrackAmerica application.

## Structure

```
api/
├── controllers/    # Business logic (to be implemented)
├── routes/         # API route definitions (to be implemented)
├── services/       # External API clients, database access (to be implemented)
├── middleware/     # Custom middleware (to be implemented)
├── server.ts       # Express server entry point
└── tsconfig.json   # TypeScript configuration
```

## Development

### Start the API server
```bash
npm run api
```

The server will run on `http://localhost:3000` by default.

### Health Check
```bash
curl http://localhost:3000/health
```

## Environment Variables

See `.env.example` in the root directory for required environment variables.

## Next Steps

- Set up database with Prisma
- Implement controllers and routes
- Add Congress.gov API integration
- Add Azure OpenAI integration for chatbot
- CHANGE THE PACKAGE.JSON TO WORK WITH PROD STUFF WHEN READY!!!!!!!!!!!!!

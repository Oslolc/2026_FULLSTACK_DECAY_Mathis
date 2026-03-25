import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import './config/passport';
dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(passport.initialize());

import authRouter from './routes/auth';
import sitesRouter from './routes/sites';
import routesRouter from './routes/routes';
import logbookRouter from './routes/logbook';

app.use('/api/auth', authRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/climbing-routes', routesRouter);
app.use('/api/logbook', logbookRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger UI — /api/docs
const openapiPath = path.join(__dirname, '../../docs/openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const swaggerDoc = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as object;
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

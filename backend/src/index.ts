import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

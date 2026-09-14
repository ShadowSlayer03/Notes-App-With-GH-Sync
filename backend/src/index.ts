import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { logger } from 'hono/logger';

import authRouter from "./routes/auth.route";
import validateSession from './middleware';
import repositoryConsumer from './queues/repository/consumer';
import mediaConsumer from './queues/media/consumer';
import aiConsumer from './queues/ai/consumer';
import { AIJob, MediaJob, RepositoryJob } from './queues/types';
import userAPIRouter from './routes/api/user.route';
import folderAPIRouter from './routes/api/folders.route';
import notesAPIRouter from './routes/api/notes.route';
import versionsAPIRouter from './routes/api/versions.route';

const app = new Hono();

app.use(etag(), logger());

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173'],
    credentials: true // frontend can send cookies
  })
);

app.use('/api/*', validateSession);

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.route('/auth', authRouter);

app.route('/api/user', userAPIRouter);
app.route('/api/folders', folderAPIRouter);
app.route('/api/notes', notesAPIRouter);
app.route('/api/versions', versionsAPIRouter);

export default {
  fetch: app.fetch,
  async queue(
    batch: 
    | MessageBatch<RepositoryJob>
    | MessageBatch<AIJob>
    | MessageBatch<MediaJob>, env: Env) {
    if (batch.queue === 'repository-queue') {
      return repositoryConsumer(batch as MessageBatch<RepositoryJob>, env);
    }
    else if (batch.queue === 'media-queue') {
      return mediaConsumer(batch as MessageBatch<MediaJob>, env);
    }
    else if (batch.queue === 'ai-queue') {
      return aiConsumer(batch as MessageBatch<AIJob>, env);
    }
  },
}

import { beforeAll, afterAll, afterEach } from 'vitest';
import { worker } from './browser';

beforeAll(async () => {
    await worker.start({
        onUnhandledRequest: 'warn'
    });
});

afterEach(() => {
    worker.resetHandlers();
});

afterAll(() => {
    worker.stop();
});
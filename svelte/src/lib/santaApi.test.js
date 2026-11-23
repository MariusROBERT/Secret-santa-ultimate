// @ts-nocheck
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/utils/secretSanta.js', () => ({
  createSecretSanta: vi.fn(async () => ({ id: 'test-room' })),
}));

import { createSecretSanta } from '$lib/db/utils/secretSanta.js';
import { POST } from '../routes/api/v1/santa/+server.js';

const submit = (date) =>
  POST({
    request: new Request('http://localhost/api/v1/santa', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test group', date }),
    }),
  });

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('POST /api/v1/santa scheduled date validation', () => {
  it('accepts today at 7:59 AM when its 8:00 AM drawing is still future', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-03T12:59:00.000Z'));

    const response = await submit(new Date('2025-02-03T13:00:00.000Z').getTime());

    expect(response.status).toBe(200);
    expect(createSecretSanta).toHaveBeenCalledOnce();
  });

  it('rejects today at exactly 8:00 AM', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-03T13:00:00.000Z'));

    await expect(submit(new Date('2025-02-03T13:00:00.000Z').getTime())).rejects.toMatchObject({
      status: 400,
    });
    expect(createSecretSanta).not.toHaveBeenCalled();
  });

  it('rejects today at 3:00 PM', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-03T20:00:00.000Z'));

    await expect(submit(new Date('2025-02-03T13:00:00.000Z').getTime())).rejects.toMatchObject({
      status: 400,
    });
  });

  it('accepts tomorrow and rejects past timestamps sent directly to the API', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-03T20:00:00.000Z'));

    expect((await submit(new Date('2025-02-04T13:00:00.000Z').getTime())).status).toBe(200);
    await expect(submit(new Date('2025-02-02T13:00:00.000Z').getTime())).rejects.toMatchObject({
      status: 400,
    });
  });
});

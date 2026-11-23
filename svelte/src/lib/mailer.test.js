import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }));

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: sendMailMock }) },
}));

import { escapeHtml, sendMail } from './mailer.js';

describe('email HTML escaping', () => {
  beforeEach(() => sendMailMock.mockReset());

  it('escapes all HTML-significant characters while preserving ordinary text', () => {
    expect(escapeHtml(`Máría & O'Neil <3 "hello">`)).toBe(
      'Máría &amp; O&#39;Neil &lt;3 &quot;hello&quot;&gt;',
    );
  });

  it('renders names as escaped HTML and readable plain text', async () => {
    const gifter = { name: `<script>alert('XSS')</script>`, email: 'giver@example.com' };
    const giftee = { name: 'Zoë 李 & Co.' };

    await sendMail('Fête & Friends', gifter, giftee);

    const message = sendMailMock.mock.calls[0][0];
    expect(message.html).toContain('&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;');
    expect(message.html).toContain('Zoë 李 &amp; Co.');
    expect(message.html).toContain('Fête &amp; Friends');
    expect(message.html).not.toContain('<script>');
    expect(message.text).toContain(`<script>alert('XSS')</script>`);
    expect(message.text).toContain('Zoë 李 & Co.');
    expect(message.text).toContain('Fête & Friends');
  });

  it('escapes existing entity-like input once so it remains literal text', () => {
    expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
  });
});

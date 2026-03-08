import type { APIRoute } from 'astro';

const REQUIRED_FIELDS_ERROR = 'Missing required fields';
const INVALID_EMAIL_ERROR = 'Invalid email address';
const INVALID_MESSAGE_ERROR = 'Message is too short or too long';
const RATE_LIMIT_ERROR = 'Too many requests. Please try again later.';
const DELIVERY_CONFIG_ERROR = 'Contact delivery is not configured on the server.';

const SUBJECT_LABELS: Record<string, string> = {
    inquiry: 'Job Inquiry',
    collab: 'Collaboration',
    general: 'General',
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const globalRateLimitStore =
    (globalThis as typeof globalThis & {
        __portfolioContactRateLimit?: Map<string, RateLimitEntry>;
    }).__portfolioContactRateLimit ??
    new Map<string, RateLimitEntry>();

(globalThis as typeof globalThis & {
    __portfolioContactRateLimit?: Map<string, RateLimitEntry>;
}).__portfolioContactRateLimit = globalRateLimitStore;

const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const normalizeField = (value: unknown, maxLength: number) =>
    typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const extractClientIp = (request: Request) => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return request.headers.get('x-real-ip') || 'unknown';
};

const checkRateLimit = (key: string) => {
    const now = Date.now();
    const current = globalRateLimitStore.get(key);

    if (!current || current.resetAt <= now) {
        globalRateLimitStore.set(key, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS,
        });
        return true;
    }

    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    current.count += 1;
    globalRateLimitStore.set(key, current);
    return true;
};

const buildTextEmail = ({
    name,
    email,
    subjectLabel,
    message,
    sourceUrl,
}: {
    name: string;
    email: string;
    subjectLabel: string;
    message: string;
    sourceUrl: string;
}) =>
    [
        'New portfolio contact submission',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Category: ${subjectLabel}`,
        `Source: ${sourceUrl}`,
        '',
        'Message:',
        message,
    ].join('\n');

const buildHtmlEmail = ({
    name,
    email,
    subjectLabel,
    message,
    sourceUrl,
}: {
    name: string;
    email: string;
    subjectLabel: string;
    message: string;
    sourceUrl: string;
}) => {
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');

    return `
      <div style="font-family: Arial, sans-serif; color: #191724; line-height: 1.6;">
        <h2 style="margin-bottom: 16px;">New portfolio contact submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Category:</strong> ${escapeHtml(subjectLabel)}</p>
        <p><strong>Source:</strong> ${escapeHtml(sourceUrl)}</p>
        <hr style="margin: 24px 0; border: 0; border-top: 1px solid #cecacd;" />
        <p style="white-space: normal;">${safeMessage}</p>
      </div>
    `;
};

const sendViaResend = async ({
    apiKey,
    from,
    to,
    subject,
    text,
    html,
}: {
    apiKey: string;
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}) => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            text,
            html,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error: ${response.status} ${errorText}`);
    }

    return response.json();
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        if (data?.bot_field) {
            return json(200, { success: true, delivered: false, mode: 'honeypot' });
        }

        const name = normalizeField(data?.name, 120);
        const email = normalizeField(data?.email, 320).toLowerCase();
        const message = normalizeField(data?.message, 5000);
        const subjectKey = normalizeField(data?.subject, 32);

        if (!name || !email || !message) {
            return json(400, { error: REQUIRED_FIELDS_ERROR });
        }

        if (!EMAIL_PATTERN.test(email)) {
            return json(400, { error: INVALID_EMAIL_ERROR });
        }

        if (message.length < 10 || message.length > 5000) {
            return json(400, { error: INVALID_MESSAGE_ERROR });
        }

        const clientIp = extractClientIp(request);
        if (!checkRateLimit(clientIp)) {
            return json(429, { error: RATE_LIMIT_ERROR });
        }

        const subjectLabel = SUBJECT_LABELS[subjectKey] ?? SUBJECT_LABELS.general;
        const sourceUrl = request.headers.get('origin') || 'malmqvist.dev';
        const emailSubject = `[malmqvist.dev] ${subjectLabel} from ${name}`;
        const text = buildTextEmail({
            name,
            email,
            subjectLabel,
            message,
            sourceUrl,
        });
        const html = buildHtmlEmail({
            name,
            email,
            subjectLabel,
            message,
            sourceUrl,
        });

        const resendApiKey = import.meta.env.RESEND_API_KEY;
        const toEmail = import.meta.env.CONTACT_TO_EMAIL || 'daniel@malmqvist.dev';
        const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;

        if (resendApiKey) {
            if (!fromEmail) {
                console.error('Contact Form Error: CONTACT_FROM_EMAIL is required when RESEND_API_KEY is set.');
                return json(500, { error: DELIVERY_CONFIG_ERROR });
            }

            const result = await sendViaResend({
                apiKey: resendApiKey,
                from: fromEmail,
                to: toEmail,
                subject: emailSubject,
                text,
                html,
            });

            return json(200, { success: true, delivered: true, provider: 'resend', result });
        }

        if (import.meta.env.DEV) {
            console.info('Contact form submission (dev log mode):', {
                name,
                email,
                subject: subjectLabel,
                message,
                sourceUrl,
            });
            return json(200, { success: true, delivered: false, mode: 'dev-log' });
        }

        return json(503, { error: DELIVERY_CONFIG_ERROR });
    } catch (error) {
        console.error('Contact Form Error:', error);
        return json(500, { error: 'Internal server error' });
    }
};

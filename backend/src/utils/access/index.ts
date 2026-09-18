import { Context } from "hono";
import { env } from "hono/adapter";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(c: Context): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;

    const { GITHUB_TOKEN_ENCRYPTION_KEY } = env(c);

     if (!GITHUB_TOKEN_ENCRYPTION_KEY) {
        throw new Error('Missing GITHUB_TOKEN_ENCRYPTION_KEY');
    }

    const secret = GITHUB_TOKEN_ENCRYPTION_KEY;

    const rawKey = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));

    cachedKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        {
            name: 'AES-GCM'
        },
        false,
        ['encrypt', 'decrypt']
    );

    return cachedKey;
}

function bytesToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export async function encryptGithubToken(
    token: string,
    c: Context
): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await getEncryptionKey(c);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv
        },
        key,
        encoder.encode(token)
    );

    const cipher = new Uint8Array(encrypted);

    const combined = new Uint8Array(iv.length + cipher.length);

    combined.set(iv);
    combined.set(cipher, iv.length);

    return bytesToBase64(combined);
}

export async function decryptGithubToken(
    ciphertext: string,
    c: Context
): Promise<string> {
    const bytes = base64ToBytes(ciphertext);

    const iv = bytes.slice(0, 12);

    const cipher = bytes.slice(12);

    const key = await getEncryptionKey(c);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv
        },
        key,
        cipher
    );

    return decoder.decode(decrypted);
}
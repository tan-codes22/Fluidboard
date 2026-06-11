import type { Board, WBElement } from '@/types';
import { getBaseUrl } from './env';

/** Minimal payload embedded in a share link — just name + elements. */
interface SharePayload {
  v: 1;
  name: string;
  elements: WBElement[];
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encodes a board into a URL-safe string for sharing via a link. */
export function encodeBoard(board: Pick<Board, 'name' | 'elements'>): string {
  const payload: SharePayload = { v: 1, name: board.name, elements: board.elements };
  return toBase64Url(JSON.stringify(payload));
}

/** Decodes a share payload. Returns null on any malformed input. */
export function decodeBoard(encoded: string): Pick<Board, 'name' | 'elements'> | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SharePayload;
    if (parsed?.v !== 1 || !Array.isArray(parsed.elements)) return null;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : 'Shared board',
      elements: parsed.elements,
    };
  } catch {
    return null;
  }
}

/** Builds a full shareable URL. Data lives in the hash so no server is needed. */
export function buildShareUrl(board: Pick<Board, 'name' | 'elements'>): string {
  return `${getBaseUrl()}/share#${encodeBoard(board)}`;
}

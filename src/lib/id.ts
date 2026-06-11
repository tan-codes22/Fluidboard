import { nanoid } from 'nanoid';

/** Generates a short, URL-safe unique id used for boards and elements. */
export const createId = (): string => nanoid(10);

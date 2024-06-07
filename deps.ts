import { parse5 as _parse5, WebC as _WebC } from 'jsr:@esroyo/webc-lax@1.0.1';

export const parse5 = _parse5 as unknown as typeof import('npm:parse5@7.1.2');
export const WebC = _WebC as unknown as typeof import('npm:@11ty/webc@0.11.2');

export { type Context as HonoContext, type ContextRenderer, Hono } from 'jsr:@hono/hono@4.4.4';
export { createMiddleware } from 'jsr:@hono/hono@4.4.4/factory';
export { type MiddlewareHandler } from 'jsr:@hono/hono@4.4.4/types';
export type { DefaultTreeAdapterMap } from 'npm:parse5@7.1.2';
export { default as kebabCase } from 'npm:lodash-es@4.17.21/kebabCase.js';

import * as parse5 from 'parse5';

// parse5 monkeypatch
const INSERTION_MODE_IN_HEAD = 3;
const _startTagOutsideForeignContent =
    parse5.Parser.prototype._startTagOutsideForeignContent;
parse5.Parser.prototype._startTagOutsideForeignContent =
    function __startTagOutsideForeignContent(token) {
        if (
            this.insertionMode === INSERTION_MODE_IN_HEAD &&
            token.tagID === parse5.html.TAG_ID.UNKNOWN &&
            token.tagName === 'slot'
        ) {
            this._appendElement(token, parse5.html.NS.HTML);
            token.ackSelfClosing = true;
            return;
        }
        return _startTagOutsideForeignContent.call(this, token);
    };

export { parse5 };
export { type Context as HonoContext, type ContextRenderer, Hono } from 'hono';
export { createMiddleware } from 'hono/factory';
export { WebC } from '@11ty/webc';
export type { DefaultTreeAdapterMap } from 'parse5';
export { default as kebabCase } from 'lodash-es/kebabCase.js';

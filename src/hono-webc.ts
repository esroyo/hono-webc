import path from 'node:path';
import process from 'node:process';
import { createMiddleware, kebabCase, WebC } from '../deps.ts';
import type { HonoContext, HonoEnv, HonoInput, HonoMiddlewareHandler } from '../deps.ts';
import type { HonoWebcOptions } from './types.ts';
import {
    buildScriptAstNode,
    buildStyleAstNode,
    keepAssetsSlots,
    readFile,
    tmpComponentName,
    tmpFile,
} from './utils.ts';
import { writeFile } from './utils.ts';

const defaultOptions = () => ({
    defineComponents: path.join(process.cwd(), 'src/components/**/*.webc'),
    bundle: false,
    data: null,
} as HonoWebcOptions);

const isFilePath = (input?: string): input is string =>
    !!input?.endsWith('.webc');

const createHtmlResponse = (content: string): Response =>
    new Response(content, { headers: { 'content-type': 'text/html' } });

export const honoWebc = <E extends HonoEnv = any, P extends string = string, I extends HonoInput = {}>(options: HonoWebcOptions = defaultOptions()): HonoMiddlewareHandler<E, P, I> => {
    const defineComponents = options?.defineComponents ||
        defaultOptions().defineComponents;
    const shouldBundle = options.bundle ?? defaultOptions().bundle;
    const hasLayout = !!(options.input);
    const setupPromise = (async () => {
        let layoutContent: string = '';
        let layoutComponentName: string = '';
        let layoutComponentPath: string = '';
        if (hasLayout) {
            layoutComponentName = tmpComponentName();
            layoutComponentPath = tmpFile(layoutComponentName);
            if (hasLayout && isFilePath(options.input)) {
                layoutContent = await readFile(options.input);
            } else if (options.input) {
                layoutContent = options.input;
            }
            if (options.bundle) {
                layoutContent = keepAssetsSlots(layoutContent);
            }
            await writeFile(layoutComponentPath, layoutContent);
        }
        return {
            layoutContent,
            layoutComponentName,
            layoutComponentPath,
        };
    })();
    const withLayout = async (
        contentOrInputPath: string | Promise<string>,
        extraData: HonoWebcOptions['data'] = null,
    ) => {
        const page = new WebC();
        page.setBundlerMode(shouldBundle);
        if (defineComponents) {
            page.defineComponents(defineComponents);
        }
        const data = {
            ...structuredClone(options.data),
            ...structuredClone(extraData),
        };

        const buckets: Record<'css' | 'js', Record<string, string[]>> = {
            css: {},
            js: {},
        };
        const css: string[] = [];
        const js: string[] = [];

        const contentOrPath = await Promise.resolve(contentOrInputPath);
        const isDirectContent = !isFilePath(contentOrPath);

        const fragmentContent = isDirectContent
            ? contentOrPath
            : await readFile(contentOrPath);
        const {
            layoutComponentName,
            layoutComponentPath,
        } = await setupPromise;
        page.defineComponents(layoutComponentPath);
        const props = Object.keys(data).map((key) =>
            `:@${kebabCase(key)}="${key}"`
        ).join(' ');
        page.setContent(
            `<${layoutComponentName} ${props} webc:nokeep>${fragmentContent}</${layoutComponentName}>`,
        );

        const compiled = await page.compile({ data });
        css.push(...compiled.css);
        js.push(...compiled.js);
        for (const assetKind of ['css', 'js'] as const) {
            if (compiled.buckets?.[assetKind]) {
                for (
                    const [key, value] of Object.entries(
                        compiled.buckets[assetKind],
                    )
                ) {
                    if (!buckets[assetKind][key]) {
                        buckets[assetKind][key] = [];
                    }
                    if (Array.isArray(value)) {
                        buckets[assetKind][key].push(...value);
                    }
                }
            }
        }

        if (!page.bundlerMode) {
            return createHtmlResponse(compiled.html);
        } else {
            const styles = [
                ['css', css] as const,
                ...Object.entries(buckets.css || {}).map((
                    pair,
                ) => [`bucket.css.${pair[0]}`, pair[1]] as const),
            ].map((pair) => [pair[0], buildStyleAstNode(pair[1])]);
            const scripts = [
                ['js', js] as const,
                ...Object.entries(buckets.js || {}).map((
                    pair,
                ) => [`bucket.js.${pair[0]}`, pair[1]] as const),
            ].map((pair) => [pair[0], buildScriptAstNode(pair[1])]);
            const pageBundle = new WebC();
            pageBundle.setContent(compiled.html);
            const slots = Object.fromEntries([...styles, ...scripts]);
            const compiledBundle = await pageBundle.compile({
                data,
                slots,
            });
            return createHtmlResponse(compiledBundle.html);
        }
    };
    const withoutLayout = async (
        contentOrInputPath: string | Promise<string>,
        extraData: HonoWebcOptions['data'] = null,
    ) => {
        const page = new WebC();
        page.setBundlerMode(shouldBundle);
        if (defineComponents) {
            page.defineComponents(defineComponents);
        }
        const data = {
            ...structuredClone(options.data),
            ...structuredClone(extraData),
        };
        const buckets: Record<'css' | 'js', Record<string, string[]>> = {
            css: {},
            js: {},
        };
        const css: string[] = [];
        const js: string[] = [];

        const contentOrPath = await Promise.resolve(contentOrInputPath);
        const isDirectContent = !isFilePath(contentOrPath);
        let content = isDirectContent
            ? contentOrPath
            : await readFile(contentOrPath);
        if (shouldBundle) {
            content = keepAssetsSlots(content);
        }
        page.setContent(content);

        const compiled = await page.compile({ data });
        css.push(...compiled.css);
        js.push(...compiled.js);
        for (const assetKind of ['css', 'js'] as const) {
            if (compiled.buckets?.[assetKind]) {
                for (
                    const [key, value] of Object.entries(
                        compiled.buckets[assetKind],
                    )
                ) {
                    if (!buckets[assetKind][key]) {
                        buckets[assetKind][key] = [];
                    }
                    if (Array.isArray(value)) {
                        buckets[assetKind][key].push(...value);
                    }
                }
            }
        }
        if (!page.bundlerMode) {
            return createHtmlResponse(compiled.html);
        } else {
            const styles = [
                ['css', css] as const,
                ...Object.entries(buckets.css || {}).map((
                    pair,
                ) => [`bucket.css.${pair[0]}`, pair[1]] as const),
            ].map((pair) => [pair[0], buildStyleAstNode(pair[1])]);
            const scripts = [
                ['js', js] as const,
                ...Object.entries(buckets.js || {}).map((
                    pair,
                ) => [`bucket.js.${pair[0]}`, pair[1]] as const),
            ].map((pair) => [pair[0], buildScriptAstNode(pair[1])]);
            const slots = Object.fromEntries([...styles, ...scripts]);
            const pageBundle = new WebC();
            pageBundle.setContent(compiled.html);
            const compiledBundle = await pageBundle.compile({
                data,
                slots,
            });
            return createHtmlResponse(compiledBundle.html);
        }
    };
    const handler = async (ctx: HonoContext, next: () => Promise<void>) => {
        ctx.setRenderer(hasLayout ? withLayout : withoutLayout);
        await next();
    };

    return createMiddleware(handler);
};

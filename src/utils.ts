import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parse5 } from '../deps.ts';
import type { DefaultTreeAdapterMap } from '../deps.ts';

export function tmpComponentName(prefix: string = 'root-'): string {
    return prefix + crypto.randomUUID();
}

export function readFile(filePath: string): Promise<string> {
    return fs.readFile(
        filePath.startsWith('/')
            ? filePath
            : path.join(process.cwd(), filePath),
        'utf8',
    );
}

export function getDescendantsByTag<
    T extends DefaultTreeAdapterMap['node'] = DefaultTreeAdapterMap['node'],
>(node: DefaultTreeAdapterMap['document'], tag: string): T[];
export function getDescendantsByTag(
    node: DefaultTreeAdapterMap['childNode'],
    tag: string,
    results: DefaultTreeAdapterMap['node'][],
): undefined;
export function getDescendantsByTag(
    node:
        | DefaultTreeAdapterMap['document']
        | DefaultTreeAdapterMap['childNode'],
    tag: string,
    result: DefaultTreeAdapterMap['node'][] = [],
): DefaultTreeAdapterMap['node'][] | undefined {
    if (!('childNodes' in node)) {
        return;
    }
    for (const childNode of node.childNodes) {
        if ('tagName' in childNode && childNode.tagName === tag) {
            result.push(childNode);
        }
        getDescendantsByTag(childNode, tag, result);
    }
    return result;
}

export const buildAstNode = (
    tag: string,
    content: string[],
): DefaultTreeAdapterMap['documentFragment'] => {
    const htmlContent = content.length
        ? `<${tag}>${content.join('\n\n')}</${tag}>`
        : '';
    return parse5.parseFragment(htmlContent);
};

export const buildStyleAstNode: (
    content: string[],
) => DefaultTreeAdapterMap['documentFragment'] = buildAstNode.bind(
    null,
    'style',
);
export const buildScriptAstNode: (
    content: string[],
) => DefaultTreeAdapterMap['documentFragment'] = buildAstNode.bind(
    null,
    'script',
);

export const keepAssetsSlots = (htmlContent: string): string => {
    const ast = parse5.parse(htmlContent);
    for (const slotTag of getDescendantsByTag(ast, 'slot')) {
        if (!('attrs' in slotTag)) {
            continue;
        }
        if (
            slotTag.attrs.some((attr) =>
                attr.name === 'webc:keep' || attr.name === 'webc:nokeep'
            )
        ) {
            // if a layout slot has an explicit keep|nokeep attr
            // leave the slot alone
            continue;
        }
        if (
            slotTag.attrs.find((attr) =>
                attr.name === 'name' &&
                attr.value.match(/^(css|js)\.?/)
            )
        ) {
            slotTag.attrs.push({ name: 'webc:keep', value: '' });
        }
    }
    return parse5.serialize(ast);
};

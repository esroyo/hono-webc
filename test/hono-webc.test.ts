import { Hono } from '../deps.ts';
import { honoWebc } from '../src/hono-webc.ts';
//import { honoWebc } from '../dist/hono-webc.js';
import { assertSnapshot } from '../dev_deps.ts';

// declare module '../deps.ts' {
//     interface ContextRenderer {
//         (
//             content: string | Promise<string>,
//             data?: Record<string | number | symbol, unknown>,
//         ): Response | Promise<Response>;
//     }
// }

const baseData = {
    head: {
        title: 'Cool',
    },
    initial: 100,
    friends: [
        { name: 'Joe' },
        { name: 'Monica' },
        { name: 'Chandler' },
        { name: 'Rachel' },
        { name: 'Phoebe' },
        { name: 'Ross' },
    ],
};

Deno.test('When middleware was created with a "*.webc" file as input', async (t) => {
    const honoWebcMiddleware = honoWebc({
        // @ts-ignore
        data: baseData,
        defineComponents: 'test/components/**/*.webc',
        input: 'test/pages/layout.webc',
    });

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(`
    <my-counter :data-initial="initial"></my-counter>
    <my-card webc:for="friend of friends" :@person="friend"></my-card>
`);
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );

    await t.step(
        'should render correctly if ctx.render is invoked with a "*.webc" file as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render('test/pages/section.webc');
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

Deno.test('When middleware was created with an html string as input', async (t) => {
    const honoWebcMiddleware = honoWebc({
        defineComponents: 'test/components/**/*.webc',
        // @ts-ignore
        data: baseData,
        input: `<html>
  <head>
    <title @raw="head?.title">My website</title>
  </head>
  <body><slot></slot></body>
</html>
`,
    });

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(`
    <my-counter :data-initial="initial"></my-counter>
    <my-card webc:for="friend of friends" :@person="friend"></my-card>
`);
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );

    await t.step(
        'should render correctly if ctx.render is invoked with a "*.webc" file as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render('test/pages/section.webc');
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

Deno.test('When middleware was created without an input', async (t) => {
    // @ts-ignore
    const honoWebcMiddleware = honoWebc({
        defineComponents: 'test/components/**/*.webc',
    });

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    `<html>
  <head>
    <title @raw="head?.title">My website</title>
  </head>
  <body>
    <my-counter :data-initial="initial"></my-counter>
    <my-card webc:for="friend of friends" :@person="friend"></my-card>
  </body>
</html>`,
                    baseData,
                );
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );

    await t.step(
        'should render correctly if ctx.render is invoked with a "*.webc" file as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render('test/pages/standalone.webc', baseData);
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

Deno.test('When middleware was created with bundler mode', async (t) => {
    const honoWebcMiddleware = honoWebc({
        bundle: true,
        // @ts-ignore
        data: {
            head: baseData.head,
        },
        defineComponents: 'test/components/**/*.webc',
        input: `<html>
  <head>
    <title @raw="head?.title">My website</title>
    <style>* { color: green; }</style>
    <slot name="css"></slot>
  </head>
  <body>
    <slot>My default content</slot>
    <slot name="js"></slot>
  </body>
</html>
`,
    });

    const { head: _, ...extraData } = baseData;

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    `
    <my-counter :data-initial="initial"></my-counter>
    <my-card webc:for="friend of friends" :@person="friend"></my-card>
`,
                    extraData,
                );
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );

    await t.step(
        'should render correctly if ctx.render is invoked with an empty string',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    '',
                    extraData,
                );
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );

    await t.step(
        'should render correctly if ctx.render is invoked with a "*.webc" file as content',
        async (t) => {
            const app = new Hono();
            app.use(honoWebcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    'test/pages/section.webc',
                    extraData,
                );
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

import { createMiddleware, Hono } from '../deps.ts';
import { createWebcMiddleware } from '../src/create-webc-middleware.ts';
import { assertSnapshot } from '../dev_deps.ts';

declare module '../deps.ts' {
    interface ContextRenderer {
        (
            content: string | Promise<string>,
            data?: Record<string | number | symbol, unknown>,
        ): Response | Promise<Response>;
    }
}

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

Deno.test('Should make "ctx.var" available to WebC as data', async (t) => {
    type Env = {
        Variables: {
            secret: string;
        };
    };
    const app = new Hono();
    const webcMiddleware = createWebcMiddleware({
        defineComponents: 'test/components/**/*.webc',
    });
    const injectMsgMiddleware = createMiddleware<Env>(async (ctx, next) => {
        ctx.set('secret', 'Hello, 42!');
        await next();
    });
    app.use(injectMsgMiddleware);
    app.use(webcMiddleware);

    app.get('/echo', (ctx) => {
        return ctx.render(`<echo-msg :msg="secret"></echo-msg>`);
    });

    const res = await app.request('/echo');
    const html = await res.text();

    await assertSnapshot(t, html);
});

Deno.test('When middleware was created with a "*.webc" file as input', async (t) => {
    const webcMiddleware = createWebcMiddleware({
        data: baseData,
        defineComponents: 'test/components/**/*.webc',
        input: 'test/pages/layout.webc',
    });

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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
    const webcMiddleware = createWebcMiddleware({
        defineComponents: 'test/components/**/*.webc',
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
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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
    const webcMiddleware = createWebcMiddleware({
        defineComponents: 'test/components/**/*.webc',
    });

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render('test/pages/standalone.webc', baseData);
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

Deno.test('[Bundler mode] When middleware was created with an html string as input', async (t) => {
    const webcMiddleware = createWebcMiddleware({
        bundle: true,
        data: {
            head: baseData.head,
        },
        defineComponents: 'test/components/**/*.webc',
        input: `<html>
  <head>
    <title @raw="head?.title">My website</title>
    <style>* { color: green; }</style>
    <meta name="description" content="WebC is cool">
    <slot name="css"></slot>
  </head>
  <body>
    <slot>My default content</slot>
    <slot name="js"></slot>
    <footer>The End: deferred assets follow</footer>
    <slot name="js.defer"></slot>
    <slot name="css.defer"></slot>
  </body>
</html>
`,
    });

    const { head: _, ...extraData } = baseData;

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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

Deno.test('[Bundler mode] When middleware was created with a "*.webc" file as input', async (t) => {
    const webcMiddleware = createWebcMiddleware({
        bundle: true,
        data: {
            head: baseData.head,
        },
        defineComponents: 'test/components/**/*.webc',
        input: 'test/pages/layout-bundler.webc',
    });

    const { head: _, ...extraData } = baseData;

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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
            app.use(webcMiddleware);
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

Deno.test('[Bundler mode] When middleware was created without an input', async (t) => {
    const webcMiddleware = createWebcMiddleware({
        bundle: true,
        data: {
            head: baseData.head,
        },
        defineComponents: 'test/components/**/*.webc',
    });

    const { head: _, ...extraData } = baseData;

    await t.step(
        'should render correctly if ctx.render is invoked with and html string as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    `
<html>
  <head>
    <title @raw="head?.title">My website</title>
    <style>* { color: green; }</style>
    <meta name="description" content="WebC is cool">
    <slot name="css"></slot>
  </head>
  <body>
    <my-counter :data-initial="initial"></my-counter>
    <my-card webc:for="friend of friends" :@person="friend"></my-card>
    <slot name="js"></slot>
    <footer>The End: deferred assets follow</footer>
    <slot name="js.defer"></slot>
    <slot name="css.defer"></slot>
  </body>
</html>
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
        'should render correctly if ctx.render is invoked with a "*.webc" file as content',
        async (t) => {
            const app = new Hono();
            app.use(webcMiddleware);
            app.get('/', async (ctx) => {
                return ctx.render(
                    'test/pages/standalone-bundler.webc',
                    extraData,
                );
            });
            const res = await app.request('/');
            const html = await res.text();
            await assertSnapshot(t, html);
        },
    );
});

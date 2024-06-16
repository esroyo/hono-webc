import { Hono } from 'jsr:@hono/hono';
import { serve } from '../dev_deps.ts';
import { honoWebc } from '../src/hono-webc.ts';

const app = new Hono();
app.use(honoWebc({
    input: 'test/pages/layout.webc',
    defineComponents: 'test/components/**/*.webc',
}));

app.get('/', async (ctx) => {
    return ctx.render(
        `
  <my-counter :data-initial="initial"></my-counter>
  <my-card webc:for="friend of friends" :@person="friend">Hi!</my-card>
`,
        {
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
        },
    );
});

const app2 = new Hono();
app2.use(honoWebc({
    defineComponents: 'test/components/**/*.webc',
}));
app2.get('/', async (ctx) => {
    return ctx.render('test/pages/standalone.webc', {
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
    });
});

const app3 = new Hono();
app3.use(honoWebc({
    bundle: true,
    defineComponents: 'test/components/**/*.webc',
    input: `
<html>
  <head>
    <title @text="$data.head.title ?? undefined">My Website</title>
<style>* { color: green; }</style>
<slot name="css"></slot>
  </head>
  <body>
    <slot></slot>
    <aside>
      <slot name="aside"></slot>
    </aside>
    <slot name="js"></slot>
  </body>
</html>
`,
}));

app3.get('/', async (ctx) => {
    return ctx.render(
        `
  <my-counter :data-initial="initial" slot="aside"></my-counter>
  <my-card webc:for="friend of friends" :@person="friend">Hi!</my-card>
`,
        {
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
        },
    );
});

serve(app2.fetch, { port: 8000 });

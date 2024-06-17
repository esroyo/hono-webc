import { Hono } from 'jsr:@hono/hono';
import { createWebcMiddleware } from 'jsr:@esroyo/hono-webc';

const app = new Hono();
app.use(createWebcMiddleware({
    data: { title: 'My Website' },
    input: `
      <!doctype html>
      <html>
        <head><title @text="title"></title></head>
        <body><slot></slot></body>
      </html>
    `,
    defineComponents: {
        'hello-world': '<h1><slot>No slotted content</slot></h1>',
    },
}));

app.get('/', async (ctx) => {
  return ctx.render('<hello-world>Hello, WebC!</hello-world>');
});

Deno.serve(app.fetch, { port: 8000 });

/** output:

<!doctype html>
<html>
  <head><title>My Website</title></head>
  <body><h1>Hello, WebC!</h1></body>
</html>

*/

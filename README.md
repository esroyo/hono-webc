# Hono WebC middleware

Enables usage of 🔧 [WebC](https://11ty.rocks/posts/introduction-webc/) in 🔥 [Hono](https://hono.dev/).

# Basic usage

```ts
app.use(honoWebc({
  input: `
      <html>
        <body>
          <slot></slot>
        </body>
      </html>
  `,
});

app.get('/', (c) => {
  return c.render('<hello-world>Hi!</hello-world>');
});
```

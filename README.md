# Hono WebC middleware
[![JSR](https://jsr.io/badges/@esroyo/otel-batch-traced-span-processor)](https://jsr.io/@esroyo/hono-webc) [![JSR Score](https://jsr.io/badges/@esroyo/hono-webc/score)](https://jsr.io/@esroyo/hono-webc) [![codecov](https://codecov.io/gh/esroyo/hono-webc/graph/badge.svg?token=6TD9BUCUDP)](https://codecov.io/gh/esroyo/hono-webc)

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

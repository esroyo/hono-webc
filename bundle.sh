#!/usr/bin/env bash

rm dist/hono-webc.js
npx rollup -c rollup.config.js
sed -i "s/\([ ({=,]\)process\([ .]\)/\1eo\2/g" dist/hono-webc.js
sed -i '1s@^@import { Buffer } from "node:buffer";@' dist/hono-webc.js

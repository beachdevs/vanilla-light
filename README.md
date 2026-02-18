![vanilla-light](assets/vl.jpg)
[![npm version](https://img.shields.io/npm/v/vanilla-light.svg)](https://www.npmjs.com/package/vanilla-light) [![runtime](https://img.shields.io/badge/runtime-bun-black.svg)](https://bun.sh/) [![npm downloads](https://img.shields.io/npm/dm/enigmatic.svg)](https://www.npmjs.com/package/enigmatic)

Vanilla-light is a no-build, dependency-free full-stack framework with a reactive browser client and an HTTPS Bun server.

###### Why I built this
This is the culmination of 20 years of writing, rewriting, imagining, and re-imagining what is the minimal core framework and best abstraction of the web client/server model.

Web standards give us all the tools we need to create applications. Removing complexity and the sheer number of things you have to learn makes them easier to build. 

Sophisticated server and client rendering schemes, bloated thousand-dependency builds, and quirky frame dependent abstractions do not belong here.

Most apps are really not that complex. They consist of a front-end, back-end server, auth, storage, and (lately) communication with llms.

Vanilla light is an easy to adopt minimal core for humans to build things, to more quickly go from imagination to application.

###### Features
- Standalone front and back-ends
- Can be hosted separately
- No frontend build step
- No runtime npm dependencies
- Reactive `window.state` + custom web components
- Plugin-driven backend (`src/plugins`)
- Auth (auth0, bearer) | Db (jsonl) | llm (openrouter)

## Quick Start
```bash
npx vanilla-light
```
Or clone this repo:
```
$ bun start.
```

###### CLI
Manage server with:
```bash
npx vanilla-light <command>
-- or --
vlserver <command>
```

Common commands:
```bash
vlserver start
vlserver config
vlserver port 3000
vlserver insecure true
vlserver insecure false
vlserver certsdir certs
vlserver +plugin auth/bearer.js
vlserver -plugin auth/bearer.js
```
###### Configuration 
~/.vanilla-light/config.json
```json
{
  "use_plugins": [
    "always/logging.js",
    "auth/auth0.js",
    "auth/bearer.js",
    "storage/s3.js",
    "storage/kvfile.js",
    "llm/llmchat.js"
  ],
  "port": 3000,
  "disable_ssl": true,
  "certs_dir": "certs"
}
```
Https should generally be used.
Enable SSL, except when behind a reverse-proxy.

###### Frontend
The front-end consists of a client.js file, which contains
helper functions to send/get key vals stored on the server.

Client import:
```js
import { $, $$, get, set, del, me } from 'client.js'
-- or --
import { $, $$, get, set, del, me } from 'https://unpkg.com/vanilla-light'
```

Web components are defined and used in the simplest way. A components.js file which contains their definitions.

All components are assigned to window.custom, and defined in a single components.js.
A component is simply a function that returns (or renders html) and run at page load

```
window.custom = 
{
  "simple-hello": ()=>`Hello world!`,
  "hello-world": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  }
}
```
Included in your HTML
```
<script src='components.js></script>
```

###### Client server architecture

![Client/server architecture](https://i.ibb.co/hJL6dMqn/clientserver.png)

###### Server secrets
Plugins get their secrets (api keys, etc..) from env

```bash
AUTH0_DOMAIN=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_PUBLIC_URL=...
OPENROUTER_API_KEY=...
```

###### API Definition

Main routes:
`POST /register`, 
`POST /login`
`GET /me`
`POST/GET/DELETE /{key}`
`PUT /{key}`
`PROPFIND /`
`PATCH /{key}`
`POST /llm/chat`

###### Writing a Server Plugin
File: `src/plugins/<group>/<name>.js`

```js
import { json, redir } from '../src/server.js'

export default function plugin(app) {
  app.routes = {
    ...app.routes,
    'GET /hello': async (req) => json({ hello: 'world', user: req.user?.sub || null }),
    'GET /go-home': async () => redir('/')
  }
}
```

###### Writing Custom Web Components
Define in `public/components.js`:
```js
export const components = {
  'hello-card': (data) => `<div>Hello ${data || 'world'}</div>`,
  'user-badge': {
    render: async () => {
      const u = await window.me()
      return `<b>${u?.name || 'guest'}</b>`
    }
  }
}
```

Use in HTML:
```html
<hello-card data="name"></hello-card>
<user-badge></user-badge>
<script>window.state.name = 'Chris'</script>
```

## `window.state` Reactivity
`window.state` is a `Proxy`.

```text
window.state.count = 1
-> proxy set(...)
-> find [data="count"]
-> render matching window.components[tag]
```

###### Tests
Run with server up:
```bash
bash test/server.sh
# optional
BASE=https://localhost:3000 bash test/server.sh
```

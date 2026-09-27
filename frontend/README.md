# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.16.1 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" vitest="usages:component" --install bun frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying to Cloudflare Pages

Create a **Pages** project with its root directory set to `frontend` (this repository also contains a separate backend). Set the build command to `bun run build` and the output directory to `build`, as configured in `wrangler.json`. In the Pages project's build environment, set `PUBLIC_BACKEND_URI` to the deployed backend's public URL; the local `.env` points to localhost and is not committed.

The build script sets `CF_PAGES=1` so `@sveltejs/adapter-auto` detects Pages. During a Pages build, adapter-auto installs/loads the Cloudflare adapter automatically; no direct adapter-cloudflare dependency is needed in this project's package.json.

For a manual deployment from this directory, run `bun --bun run build` followed by `bunx wrangler pages deploy build --project-name frontend` (after creating the Pages project). Running the build with Bun's runtime also avoids an adapter-auto dynamic-import path error on Windows. In the Git-connected Pages integration, Cloudflare handles the deployment after the build. `wrangler deploy` deploys a Workers project and does not deploy this Pages output.

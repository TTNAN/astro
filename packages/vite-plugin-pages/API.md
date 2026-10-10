# `@astrojs/vite-plugin-pages` API

```js
// vite.config.js
import astro from '@astrojs/vite-plugin-astro';
import pages from '@astrojs/vite-plugin-pages';

export default { plugins: [pages(), astro()] }; // order does not matter
```

`pages(options?: PagesPluginOptions): Plugin[]`. In its `configResolved` hook it calls `getAstroApi(config)`, which throws an error naming the missing plugin when `astro()` is absent. Shared config (`root`, `srcDir`, `base`, `site`, `trailingSlash`, …) is read from `api.astro.config`, never duplicated as a pages option.

`PagesPluginOptions` is empty. Pages-owned options (output shape, redirects, build format, server entry, …) are added here, with their zod schemas, as the pages layer moves in.

## `api.astroPages`

Read it with `getPagesApi(config: ResolvedConfig): PagesPluginApi`, which throws if `pages()` is not in `plugins`. Call registration methods from your plugin's `configResolved` hook.

Every member currently throws a "not implemented" error.

| Member                                         | Contract                                                                                                                                                                                                                                                                | Replaces                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `injectRoute(route: InjectedRoute)`            | Adds a route; same pipeline as `src/pages/` files.                                                                                                                                                                                                                      | integration `injectRoute`                                           |
| `addMiddleware(entrypoint, order)`             | `entrypoint: string \| URL` exporting `onRequest`; `order: 'pre' \| 'post'` relative to user middleware.                                                                                                                                                                | integration `addMiddleware`                                         |
| `addFetchHandler(name, { entrypoint, order })` | Pipeline step. Module default-exports a `FetchPipelineHandler`. `'pre'` wraps user middleware + dispatch; `'post'` runs after user middleware, before dispatch. Duplicate `name` throws. A custom `src/fetch.ts` that skips a registered handler warns with its `name`. | hard-coded steps in `core/routing/handler.ts`, `FetchFeatures` bits |
| `extendManifest(key, moduleId)`                | Manifest gets `key: () => Promise<Module>`. `key` must be declared in `SSRManifestExtensions`.                                                                                                                                                                          | `SSRManifest.actions?`, `sessionDriver?`, …                         |
| `extendRenderContext(key, entrypoint)`         | Module default-exports a `RenderContextExtension`; its provider value appears as `Astro[key]` and `context[key]`. `key` must be declared in `AstroGlobalExtensions` (from `@astrojs/vite-plugin-astro`).                                                                | `FetchState.provide()` / `defineProviderGetters()` call sites       |
| `onRoutesResolved(cb)`                         | `cb(routes: readonly RouteData[])` at build start and after each dev route-table change.                                                                                                                                                                                | `astro:routes:resolved`                                             |
| `onBuildDone(cb)`                              | `cb({ dir, routes, pages })` once after the production build writes output.                                                                                                                                                                                             | `astro:build:done`                                                  |
| `routes`                                       | `readonly RouteData[]`; throws before the route table is resolved.                                                                                                                                                                                                      | —                                                                   |

Build-time registrations take module entrypoints, not functions: runtime code runs in the server environment, not in the Vite plugin process. Entrypoints are resolved by Vite in that environment.

## Runtime module contracts

```ts
type FetchPipelineHandler = (
  state: RequestState,
  next: (state: RequestState) => Promise<Response>,
) => Promise<Response>;

type RenderContextExtension<T = unknown> = (state: RequestState) => ContextProvider<T>;

interface ContextProvider<T> {
  create: () => T; // lazy, once per request
  finalize?: (value: T) => Promise<void> | void; // after the response
}
```

`RequestState` comes from the `PagesRuntimeTypes` registry (`unknown` when unregistered). `astro` registers `requestState: FetchState` in `core/fetch/fetch-state.ts`. When `FetchState` moves into this package, reference it directly and delete the registry.

## Type seams

- `SSRManifestExtensions`: `{ [manifestKey]: ModuleNamespaceType }`, merged by each feature that calls `extendManifest`.
- `AstroGlobalExtensions` / `SSRResultExtensions`: see `@astrojs/vite-plugin-astro` `API.md`. A feature calling `extendRenderContext('session', …)` also declares `session` in `AstroGlobalExtensions`.

```ts
declare module '@astrojs/vite-plugin-pages' {
  interface SSRManifestExtensions {
    actions: typeof import('./runtime/actions.js');
  }
}
```

## Types

Exported from the package root and re-exported unchanged from `astro`: `RouteData`, `RoutePart`, `RouteType`, `RedirectConfig`, `ValidRedirectStatus`, `InjectedRoute`. `ContextProvider` is used by `astro`'s `FetchState`. `astro`'s `REDIRECT_STATUS_CODES` is checked against `ValidRedirectStatus` with `satisfies`.

import { getAstroApi } from '@astrojs/vite-plugin-astro';
import type { AstroGlobalExtensions } from '@astrojs/vite-plugin-astro';
import type { Plugin, ResolvedConfig } from 'vite';
import type { InjectedRoute, RouteData, SSRManifestExtensions } from './types.js';

/**
 * Options of `pages()`.
 */
export interface PagesPluginOptions {}

/**
 * A fetch handler registered with `PagesPluginApi.addFetchHandler()`.
 */
export interface FetchHandlerDefinition {
	/**
	 * Module whose default export is a `FetchPipelineHandler`. Bare specifiers and relative paths
	 * are resolved by Vite in the server environment.
	 */
	entrypoint: string | URL;
	/**
	 * Position relative to user middleware:
	 * - `'pre'`: wraps user middleware and route dispatch.
	 * - `'post'`: runs after user middleware, right before route dispatch.
	 */
	order: 'pre' | 'post';
}

/**
 * Passed to `PagesPluginApi.onBuildDone()` callbacks.
 */
export interface BuildDoneResult {
	/** Directory of the client build output, with a trailing slash. */
	dir: URL;
	/** The final route table. */
	routes: readonly RouteData[];
	/** Pathnames of the prerendered pages. */
	pages: readonly { pathname: string }[];
}

/**
 * The API exposed by `pages()` as `plugin.api.astroPages`. Read it with `getPagesApi()`.
 *
 * Registration methods (`injectRoute`, `addMiddleware`, `addFetchHandler`, `extendManifest`,
 * `extendRenderContext`, `onRoutesResolved`, `onBuildDone`) must be called from a
 * `configResolved` hook.
 */
export interface PagesPluginApi {
	/**
	 * Adds a route to the route table. Injected routes go through the same pipeline as routes
	 * created from files in `src/pages/`.
	 */
	injectRoute(route: InjectedRoute): void;
	/**
	 * Adds a middleware module whose `onRequest` export runs with the user's middleware.
	 *
	 * @param entrypoint Module exporting `onRequest`. Resolved by Vite in the server environment.
	 * @param order `'pre'` runs before the user's middleware, `'post'` after.
	 */
	addMiddleware(entrypoint: string | URL, order: 'pre' | 'post'): void;
	/**
	 * Adds a step to the server request pipeline.
	 *
	 * @param name Unique handler name. Registering the same name twice throws. A custom
	 *   `src/fetch.ts` that does not run a registered handler triggers a warning naming it.
	 */
	addFetchHandler(name: string, handler: FetchHandlerDefinition): void;
	/**
	 * Adds a lazily-loaded entry to the server manifest, exposed as
	 * `manifest[key]: () => Promise<Module>`. `key` must be declared in `SSRManifestExtensions`.
	 *
	 * @param moduleId Module to load. Resolved by Vite in the server environment.
	 */
	extendManifest<K extends keyof SSRManifestExtensions>(key: K, moduleId: string): void;
	/**
	 * Adds a lazily-created value to the `Astro` global and to the endpoint context, as
	 * `Astro[key]` and `context[key]`. `key` must be declared in `AstroGlobalExtensions`.
	 *
	 * @param entrypoint Module whose default export is a `RenderContextExtension`. Resolved by Vite
	 *   in the server environment.
	 */
	extendRenderContext<K extends keyof AstroGlobalExtensions>(
		key: K,
		entrypoint: string | URL,
	): void;
	/**
	 * Calls `callback` with the route table whenever it is resolved: once at build start, and in
	 * dev after every change to the route table.
	 */
	onRoutesResolved(callback: (routes: readonly RouteData[]) => void | Promise<void>): void;
	/**
	 * Calls `callback` once after the production build has written all output.
	 */
	onBuildDone(callback: (result: BuildDoneResult) => void | Promise<void>): void;
	/**
	 * The current route table.
	 *
	 * @throws {Error} When read before the route table is resolved.
	 */
	readonly routes: readonly RouteData[];
}

const PLUGIN_NAME = '@astrojs/vite-plugin-pages';

function notImplemented(member: string): never {
	throw new Error(`${PLUGIN_NAME}: \`${member}\` is not implemented.`);
}

/**
 * Serves and builds the pages in `src/pages/`. Requires `astro()` from
 * `@astrojs/vite-plugin-astro`, in any position of Vite's `plugins`.
 */
export default function pages(_options: PagesPluginOptions = {}): Plugin[] {
	const api: PagesPluginApi = {
		injectRoute: () => notImplemented('injectRoute'),
		addMiddleware: () => notImplemented('addMiddleware'),
		addFetchHandler: () => notImplemented('addFetchHandler'),
		extendManifest: () => notImplemented('extendManifest'),
		extendRenderContext: () => notImplemented('extendRenderContext'),
		onRoutesResolved: () => notImplemented('onRoutesResolved'),
		onBuildDone: () => notImplemented('onBuildDone'),
		get routes(): readonly RouteData[] {
			return notImplemented('routes');
		},
	};

	return [
		{
			name: PLUGIN_NAME,
			api: { astroPages: api },
			configResolved(config) {
				getAstroApi(config);
			},
		},
	];
}

/**
 * Returns the API of the `pages()` plugin registered in `config`.
 *
 * @throws {Error} When `pages()` is not in Vite's `plugins`.
 */
export function getPagesApi(config: ResolvedConfig): PagesPluginApi {
	const api = config.plugins.find((plugin) => plugin.name === PLUGIN_NAME)?.api?.astroPages;
	if (!api) {
		throw new Error(`\`pages()\` from ${PLUGIN_NAME} is missing from the Vite \`plugins\` array.`);
	}
	return api;
}

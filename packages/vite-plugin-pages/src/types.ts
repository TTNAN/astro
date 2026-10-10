/**
 * Types of the route table and of the runtime modules registered through `PagesPluginApi`.
 *
 * Registered runtime modules run in the server environment, not in the Vite plugin process, so
 * build-time registrations reference them by entrypoint and this module types their default
 * exports.
 */

export type ValidRedirectStatus = 300 | 301 | 302 | 303 | 304 | 307 | 308;

export type RedirectConfig =
	| string
	| {
			status: ValidRedirectStatus;
			destination: string;
	  };

/**
 * It contains the information about a route
 */
export interface RouteData {
	/**
	 * The current **pattern** of the route. For example:
	 * - `src/pages/index.astro` has a pattern of `/`
	 * - `src/pages/blog/[...slug].astro` has a pattern of `/blog/[...slug]`
	 * - `src/pages/site/[blog]/[...slug].astro` has a pattern of `/site/[blog]/[...slug]`
	 */
	route: string;
	/**
	 *  Source component URL
	 */
	component: string;
	/**
	 * Dynamic and spread route params
	 * ex. "/pages/[lang]/[...slug].astro" will output the params ['lang', '...slug']
	 */
	params: string[];
	/**
	 * Output URL pathname where this route will be served
	 * note: will be undefined for [dynamic] and [...spread] routes
	 */
	pathname?: string;
	/**
	 * The paths of the physical files emitted by this route. When a route **isn't** prerendered, the value is either `undefined` or an empty array.
	 */
	distURL: URL[];
	/**
	 *
	 * regex used for matching an input URL against a requested route
	 * ex. "[fruit]/about.astro" will generate the pattern: /^\/([^/]+?)\/about\/?$/
	 * where pattern.test("banana/about") is "true"
	 *
	 * ## Example
	 *
	 * ```js
	 * if (route.pattern.test('/blog')) {
	 *  // do something
	 * }
	 * ```
	 */
	pattern: RegExp;
	/**
	 * Similar to the "params" field, but with more associated metadata. For example, for `/site/[blog]/[...slug].astro`, the segments are:
	 *
	 * 1. `{ content: 'site', dynamic: false, spread: false }`
	 * 2. `{ content: 'blog', dynamic: true, spread: false }`
	 * 3. `{ content: '...slug', dynamic: true, spread: true }`
	 */
	segments: RoutePart[][];
	/**
	 *
	 * The type of the route. It can be:
	 * - `page`: a route that lives in the file system, usually an Astro component
	 * - `endpoint`: a route that lives in the file system, usually a JS file that exposes endpoints methods
	 * - `redirect`: a route points to another route that lives in the file system
	 * - `fallback`: a route that doesn't exist in the file system that needs to be handled with other means, usually the middleware
	 */
	type: RouteType;
	/**
	 * Whether the route is prerendered or not
	 */
	prerender: boolean;
	/**
	 * The route to redirect to. It holds information regarding the status code and its destination.
	 */
	redirect?: RedirectConfig;
	/**
	 * The {@link RouteData} to redirect to. It's present when `RouteData.type` is `redirect`.
	 */
	redirectRoute?: RouteData;
	/**
	 * A list of {@link RouteData} to fall back to. They are present when `i18n.fallback` has a list of locales.
	 */
	fallbackRoutes: RouteData[];

	/**
	 * If this route is a directory index
	 * For example:
	 * - src/pages/index.astro
	 * - src/pages/blog/index.astro
	 */
	isIndex: boolean;

	/**
	 * Whether the route comes from Astro core, an integration or the user's project
	 */
	origin: 'internal' | 'external' | 'project';
}

/**
 * - page: a route that lives in the file system, usually an Astro component
 * - endpoint: a route that lives in the file system, usually a JS file that exposes endpoints methods
 * - redirect: a route points to another route that lives in the file system
 * - fallback: a route that doesn't exist in the file system that needs to be handled with other means, usually the middleware
 */
export type RouteType = 'page' | 'endpoint' | 'redirect' | 'fallback';

export interface RoutePart {
	content: string;
	dynamic: boolean;
	spread: boolean;
}

export interface InjectedRoute {
	pattern: string;
	entrypoint: string | URL;
	prerender?: boolean;
}

/**
 * Describes a lazily-created value that handlers can contribute to the
 * request context. `create` is called at most once (on first `resolve`);
 * `finalize` runs during `finalizeAll` to clean up / persist.
 *
 * @internal Not for use by 3rd-party code. May change without notice.
 */
export interface ContextProvider<T> {
	/** Factory called lazily on the first `resolve(key)`. */
	create: () => T;
	/** Optional cleanup / persist callback. Receives the created value. */
	finalize?: (value: T) => Promise<void> | void;
}

/**
 * Registry of request-runtime class types that the types in this module reference but that are
 * implemented outside this package. The implementing package registers them through declaration
 * merging; unregistered keys resolve to `unknown`.
 *
 * - `requestState`: the per-request state passed to fetch handlers and render context extensions.
 */
export interface PagesRuntimeTypes {}

type PagesRuntimeType<K extends string> = PagesRuntimeTypes extends { [P in K]: infer T }
	? T
	: unknown;

/** The per-request state passed to fetch handlers and render context extensions. */
export type RequestState = PagesRuntimeType<'requestState'>;

/**
 * Default export of a module registered with `PagesPluginApi.addFetchHandler()`.
 *
 * Receives the request state and `next`, which runs the rest of the pipeline, and returns the
 * response. A handler may return without calling `next` to short-circuit the pipeline.
 */
export type FetchPipelineHandler = (
	state: RequestState,
	next: (state: RequestState) => Promise<Response>,
) => Promise<Response>;

/**
 * Default export of a module registered with `PagesPluginApi.extendRenderContext()`.
 *
 * Called once per request. The provider's value is created on first access of the registered key
 * on the `Astro` global or the endpoint context, and finalized after the response is produced.
 */
export type RenderContextExtension<T = unknown> = (state: RequestState) => ContextProvider<T>;

/**
 * Lazily-loaded manifest entries registered with `PagesPluginApi.extendManifest()`, keyed by
 * manifest field. Each value is the type of the module's namespace object; the manifest exposes the
 * field as `() => Promise<Module>`. Extend through declaration merging.
 */
export interface SSRManifestExtensions {}

// TODO: Should the types here really be public?

import type { ErrorPayload as ViteErrorPayload } from 'vite';
import type { InjectedRoute, RouteData } from '@astrojs/vite-plugin-pages';
import type { SSRManifestCSP } from '../../core/app/types.js';
import type { AstroCookies } from '../../core/cookies/cookies.js';
import type { Slots } from '../../core/render/slots.js';
import type { AstroComponentInstance, ServerIslandComponent } from '../../runtime/server/index.js';
import type {
	HeadAndContent,
	ThinHead,
} from '../../runtime/server/render/astro/head-and-content.js';
import type { RenderTemplateResult } from '../../runtime/server/render/astro/render-template.js';
import type { Params } from './common.js';
import type { AstroConfig } from './config.js';
import type { AstroGlobal } from './context.js';

export type { SSRActions, SSRManifest, SSRManifestCSP } from '../../core/app/types.js';
export type {
	AstroComponentMetadata,
	AsyncRendererComponentFn,
	NamedSSRLoadedRendererValue,
	PropagationHint,
	SSRComponentMetadata,
	SSRElement,
	SSRLoadedRenderer,
	SSRLoadedRendererValue,
	SSRMetadata,
	SSRResult,
} from '@astrojs/vite-plugin-astro';
export type { RouteData, RoutePart, RouteType } from '@astrojs/vite-plugin-pages';

declare module '@astrojs/vite-plugin-astro' {
	interface RenderRuntimeTypes {
		factoryReturnValue: RenderTemplateResult | HeadAndContent | ThinHead;
		headPropagator: AstroComponentInstance | ServerIslandComponent;
		slots: Slots;
	}

	interface SSRResultExtensions {
		params: Params;
		response: AstroGlobal['response'];
		request: AstroGlobal['request'];
		actionResult?: ReturnType<AstroGlobal['getActionResult']>;
		/**
		 * Only used for logging
		 */
		pathname: string;
		cookies: AstroCookies | undefined;
		getServerIslandNameMap: () => Promise<Map<string, string>>;
		trailingSlash: AstroConfig['trailingSlash'];
		key: Promise<CryptoKey>;
		/**
		 * `cspDestination`:
		 * - `header`: `<meta>` for static pages, response header for dynamic pages
		 * - `meta`: `<meta>` for all pages
		 * - `adapter`: nothing for static pages (the adapter does this), response header for dynamic pages
		 */
		// NOTE: we use a different type here because at runtime we must provide a value, which is
		// eventually computed from RouteData.prerender
		cspDestination: NonNullable<SSRManifestCSP['cspDestination']>;
		shouldInjectCspMetaTags: boolean;
		cspAlgorithm: SSRManifestCSP['algorithm'];
		directives: SSRManifestCSP['directives'];
		/** @deprecated Use {@linkcode scriptDirective} instead. Holds the `default`-kind `script-src` hashes. */
		scriptHashes: SSRManifestCSP['scriptHashes'];
		/** @deprecated Use {@linkcode scriptDirective} instead. Holds the `default`-kind `script-src` resources. */
		scriptResources: SSRManifestCSP['scriptResources'];
		/** @deprecated Use {@linkcode styleDirective} instead. Holds the `default`-kind `style-src` hashes. */
		styleHashes: SSRManifestCSP['styleHashes'];
		/** @deprecated Use {@linkcode styleDirective} instead. Holds the `default`-kind `style-src` resources. */
		styleResources: SSRManifestCSP['styleResources'];
		/** @deprecated Use {@linkcode scriptDirective}'s `strictDynamic` instead. */
		isStrictDynamic: SSRManifestCSP['isStrictDynamic'];
		scriptDirective: SSRManifestCSP['scriptDirective'];
		styleDirective: SSRManifestCSP['styleDirective'];
		/** Static speculation rules JSON to inject in the head when CSP + clientPrerender are both enabled. */
		speculationRulesContent?: string;
		internalFetchHeaders?: Record<string, string>;
	}
}

export type SSRError = Error & ViteErrorPayload['err'];

// `origin` is set within the hook, but the user doesn't have access to this property. That's why
// we need an intermediary interface
export interface InternalInjectedRoute extends InjectedRoute {
	origin: RouteData['origin'];
}

export interface ResolvedInjectedRoute extends InternalInjectedRoute {
	resolvedEntryPoint?: URL;
}

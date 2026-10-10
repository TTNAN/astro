// TODO: Should the types here really be public?

import type { ErrorPayload as ViteErrorPayload } from 'vite';
import type { InjectedRoute, RouteData } from '@astrojs/vite-plugin-pages';
import type { SSRManifestCSP } from '../../core/app/types.js';
import type { AstroCookies } from '../../core/cookies/cookies.js';
import type { Params } from './common.js';
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
	interface SSRResultExtensions {
		params: Params;
		request: AstroGlobal['request'];
		actionResult?: ReturnType<AstroGlobal['getActionResult']>;
		cookies: AstroCookies | undefined;
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

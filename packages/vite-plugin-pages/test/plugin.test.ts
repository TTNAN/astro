import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import astro from '@astrojs/vite-plugin-astro';
import { resolveConfig } from 'vite';
import pages, { getPagesApi } from '../dist/index.js';

describe('pages()', () => {
	it('throws a clear error when astro() is missing', async () => {
		await assert.rejects(
			resolveConfig({ configFile: false, logLevel: 'silent', plugins: [pages()] }, 'serve'),
			/`astro\(\)` from @astrojs\/vite-plugin-astro is missing from the Vite `plugins` array/,
		);
	});

	it('finds astro() regardless of plugin order', async () => {
		for (const plugins of [
			[astro(), pages()],
			[pages(), astro()],
		]) {
			const config = await resolveConfig(
				{ configFile: false, logLevel: 'silent', plugins },
				'serve',
			);
			assert.ok(getPagesApi(config));
		}
	});
});

describe('getPagesApi()', () => {
	it('throws when pages() is not registered', async () => {
		const config = await resolveConfig(
			{ configFile: false, logLevel: 'silent', plugins: [astro()] },
			'serve',
		);
		assert.throws(
			() => getPagesApi(config),
			/`pages\(\)` from @astrojs\/vite-plugin-pages is missing/,
		);
	});
});

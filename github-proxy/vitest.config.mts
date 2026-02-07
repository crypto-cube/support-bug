import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
				miniflare: {
					bindings: {
						PROXY_TOKEN: 'test-proxy-token',
						GITHUB_TOKEN: 'test-github-token',
					},
				},
			},
		},
	},
});

import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('GitHub proxy worker', () => {
	it('returns 401 on missing Authorization header', async () => {
		const request = new IncomingRequest('http://localhost/repos/owner/repo/issues');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});

	it('returns 401 on wrong proxy token', async () => {
		const request = new IncomingRequest('http://localhost/repos/owner/repo/issues', {
			headers: { Authorization: 'Bearer wrong-token' },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});

	it('returns 403 on disallowed route', async () => {
		const request = new IncomingRequest('http://localhost/repos/owner/repo/pulls', {
			headers: { Authorization: `Bearer ${env.PROXY_TOKEN}` },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({ error: 'Forbidden' });
	});

	it('returns 204 with CORS headers on OPTIONS preflight', async () => {
		const request = new IncomingRequest('http://localhost/repos/owner/repo/issues', {
			method: 'OPTIONS',
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, OPTIONS');
		expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Authorization, Content-Type, Accept');
		expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
	});
});

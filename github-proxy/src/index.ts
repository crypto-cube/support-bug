const CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
	"Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
	"Access-Control-Max-Age": "86400",
};

const ALLOWED_ROUTES: Array<{ method: string; pattern: RegExp }> = [
	{ method: "GET", pattern: /^\/repos\/[^/]+\/[^/]+\/issues(?:\?.*)?$/ },
	{ method: "POST", pattern: /^\/repos\/[^/]+\/[^/]+\/issues$/ },
	{ method: "PUT", pattern: /^\/repos\/[^/]+\/[^/]+\/contents\/.+$/ },
];

function corsResponse(body: string | null, status: number, extra?: Record<string, string>): Response {
	return new Response(body, {
		status,
		headers: { ...CORS_HEADERS, ...extra },
	});
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return corsResponse(null, 204);
		}

		// Validate proxy token
		const auth = request.headers.get("Authorization");
		if (!auth || auth !== `Bearer ${env.PROXY_TOKEN}`) {
			return corsResponse(JSON.stringify({ error: "Unauthorized" }), 401, {
				"Content-Type": "application/json",
			});
		}

		// Check route allowlist
		const url = new URL(request.url);
		const allowed = ALLOWED_ROUTES.some(
			(r) => r.method === request.method && r.pattern.test(url.pathname),
		);
		if (!allowed) {
			return corsResponse(JSON.stringify({ error: "Forbidden" }), 403, {
				"Content-Type": "application/json",
			});
		}

		// Forward to GitHub API
		const ghUrl = `https://api.github.com${url.pathname}${url.search}`;
		const ghHeaders = new Headers(request.headers);
		ghHeaders.set("Authorization", `Bearer ${env.GITHUB_TOKEN}`);
		ghHeaders.set("Accept", "application/vnd.github+json");
		ghHeaders.set("User-Agent", "github-proxy-worker");

		const ghResponse = await fetch(ghUrl, {
			method: request.method,
			headers: ghHeaders,
			body: request.method !== "GET" ? request.body : undefined,
		});

		const responseHeaders = new Headers(ghResponse.headers);
		for (const [k, v] of Object.entries(CORS_HEADERS)) {
			responseHeaders.set(k, v);
		}

		return new Response(ghResponse.body, {
			status: ghResponse.status,
			headers: responseHeaders,
		});
	},
} satisfies ExportedHandler<Env>;

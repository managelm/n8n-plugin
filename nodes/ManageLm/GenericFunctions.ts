import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an authenticated request to the ManageLM portal API.
 */
export async function manageLmApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object = {},
	qs: Record<string, string | number | boolean> = {},
): Promise<any> {
	const credentials = await this.getCredentials('manageLmApi');
	if (!credentials?.portalUrl) {
		throw new NodeApiError(this.getNode(), {
			message: 'ManageLM credentials not configured. Add Portal URL and API Key in credentials.',
		} as JsonObject);
	}
	const portalUrl = (credentials.portalUrl as string).replace(/\/+$/, '');

	const options: IRequestOptions = {
		method,
		uri: `${portalUrl}/api${endpoint}`,
		headers: { 'Content-Type': 'application/json' },
		qs,
		body,
		json: true,
	};

	// Don't send empty body on GET/DELETE
	if (method === 'GET' || method === 'DELETE') {
		delete options.body;
	}

	try {
		return await this.helpers.requestWithAuthentication.call(
			this,
			'manageLmApi',
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Fetch all results from a paginated ManageLM endpoint.
 * Expects the response to have a data array and total count.
 */
export async function manageLmApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	dataKey: string,
	body: object = {},
	qs: Record<string, string | number | boolean> = {},
): Promise<any[]> {
	const results: any[] = [];
	let offset = 0;
	const limit = 100;

	let response: any;
	do {
		response = await manageLmApiRequest.call(
			this,
			method,
			endpoint,
			body,
			{ ...qs, limit, offset },
		);
		const items = response[dataKey] ?? response;
		if (Array.isArray(items)) {
			results.push(...items);
		} else {
			break;
		}
		offset += limit;
	// Stop when: no total provided (single page), page was partial, or we have all items
	} while (
		response.total !== undefined &&
		results.length < response.total &&
		Array.isArray(response[dataKey]) &&
		response[dataKey].length === limit
	);

	return results;
}

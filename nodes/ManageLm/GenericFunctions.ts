import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an authenticated request to the ManageLM portal API.
 */
export async function manageLmApiRequest(
	this: IExecuteFunctions,
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

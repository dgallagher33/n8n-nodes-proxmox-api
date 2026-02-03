import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as https from 'https';

interface ProxmoxCredentials {
	baseUrl: string;
	apiTokenId: string;
	apiTokenSecret: string;
	allowSelfSignedCerts?: boolean;
}

function normalizeBaseUrl(baseUrl: string): string {
	const trimmed = baseUrl.trim().replace(/\/+$/, '');
	if (trimmed.endsWith('/api2/json')) {
		return trimmed;
	}
	return `${trimmed}/api2/json`;
}

function ensureLeadingSlash(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

function buildAuthorizationHeader(tokenId: string, tokenSecret: string): string {
	return `PVEAPIToken=${tokenId}=${tokenSecret}`;
}

export async function proxmoxApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject | undefined = undefined,
): Promise<unknown> {
	const credentials = await this.getCredentials<ProxmoxCredentials>('proxmoxApi');
	const baseUrl = normalizeBaseUrl(credentials.baseUrl);
	const uri = `${baseUrl}${ensureLeadingSlash(endpoint)}`;
	const agent = new https.Agent({
		rejectUnauthorized: !credentials.allowSelfSignedCerts,
	});

	if (this.logger) {
		this.logger.debug('Proxmox API request', {
			method,
			uri,
		});
	}

	try {
		const response = await this.helpers.request({
			method,
			uri,
			body,
			qs,
			json: true,
			agent,
			headers: {
				Authorization: buildAuthorizationHeader(
					credentials.apiTokenId,
					credentials.apiTokenSecret,
				),
			},
		});

		return response?.data ?? response;
	} catch (error) {
		const errorContext = error as {
			statusCode?: number;
			response?: { statusCode?: number; body?: { message?: string; errors?: unknown } };
			message?: string;
		};
		const statusCode = errorContext.statusCode ?? errorContext.response?.statusCode;
		const errorBody = errorContext.response?.body;
		let message = errorContext.message ?? 'Proxmox API request failed';

		if (errorBody?.message) {
			message = errorBody.message;
		} else if (errorBody?.errors) {
			message = JSON.stringify(errorBody.errors);
		}

		throw new NodeApiError(this.getNode(), error as IDataObject, {
			message,
			description: statusCode ? `HTTP status code: ${statusCode}` : undefined,
		});
	}
}

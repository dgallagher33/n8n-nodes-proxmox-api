"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxmoxApiRequest = proxmoxApiRequest;
const n8n_workflow_1 = require("n8n-workflow");
const https_1 = require("https");
function normalizeBaseUrl(baseUrl) {
	const trimmed = baseUrl.trim().replace(/\/+$/, '');
	if (trimmed.endsWith('/api2/json')) {
		return trimmed;
	}
	return `${trimmed}/api2/json`;
}
function ensureLeadingSlash(path) {
	return path.startsWith('/') ? path : `/${path}`;
}
function buildAuthorizationHeader(tokenId, tokenSecret) {
	return `PVEAPIToken=${tokenId}=${tokenSecret}`;
}
async function proxmoxApiRequest(method, endpoint, body = undefined, qs = undefined) {
	const credentials = await this.getCredentials('proxmoxApi');
	const baseUrl = normalizeBaseUrl(credentials.baseUrl);
	const uri = `${baseUrl}${ensureLeadingSlash(endpoint)}`;
	const agent = new https_1.Agent({
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
		const statusCode = error?.statusCode ?? error?.response?.statusCode;
		const errorBody = error?.response?.body;
		let message = error?.message ?? 'Proxmox API request failed';
		if (errorBody?.message) {
			message = errorBody.message;
		} else if (errorBody?.errors) {
			message = JSON.stringify(errorBody.errors);
		}
		throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
			message,
			description: statusCode ? `HTTP status code: ${statusCode}` : undefined,
		});
	}
}

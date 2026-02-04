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
    var _a, _b, _c, _d, _e;
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
        const requestOptions = {
            method,
            uri,
            body,
            qs,
            json: true,
            headers: {
                Authorization: buildAuthorizationHeader(credentials.apiTokenId, credentials.apiTokenSecret),
            },
        };
        requestOptions.agent = agent;
        const response = await this.helpers.request(requestOptions);
        return (_a = response === null || response === void 0 ? void 0 : response.data) !== null && _a !== void 0 ? _a : response;
    }
    catch (error) {
        const errorContext = error;
        const statusCode = (_b = errorContext.statusCode) !== null && _b !== void 0 ? _b : (_c = errorContext.response) === null || _c === void 0 ? void 0 : _c.statusCode;
        const errorBody = (_d = errorContext.response) === null || _d === void 0 ? void 0 : _d.body;
        let message = (_e = errorContext.message) !== null && _e !== void 0 ? _e : 'Proxmox API request failed';
        if (errorBody === null || errorBody === void 0 ? void 0 : errorBody.message) {
            message = errorBody.message;
        }
        else if (errorBody === null || errorBody === void 0 ? void 0 : errorBody.errors) {
            message = JSON.stringify(errorBody.errors);
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
            message,
            description: statusCode ? `HTTP status code: ${statusCode}` : undefined,
        });
    }
}

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
export declare function proxmoxApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body?: Record<string, unknown> | undefined,
	qs?: Record<string, unknown> | undefined,
): Promise<unknown>;

import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ProxmoxApi implements ICredentialType {
	name = 'proxmoxApi';
	displayName = 'Proxmox API';
	documentationUrl = 'https://pve.proxmox.com/pve-docs/api-viewer/index.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://pve1.example.com:8006',
			required: true,
			description:
				'Base URL of the Proxmox server or reverse proxy. The node will automatically normalize /api2/json.',
		},
		{
			displayName: 'API Token ID',
			name: 'apiTokenId',
			type: 'string',
			default: '',
			placeholder: 'user@pve!tokenname',
			required: true,
			description: 'Proxmox API token ID (format: user@realm!token).',
		},
		{
			displayName: 'API Token Secret',
			name: 'apiTokenSecret',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
			description: 'Secret value for the API token.',
		},
		{
			displayName: 'Allow Self-signed Certificates',
			name: 'allowSelfSignedCerts',
			type: 'boolean',
			default: false,
			description:
				'Enable only if your Proxmox instance uses a self-signed certificate. TLS verification is otherwise strict.',
		},
	];
}

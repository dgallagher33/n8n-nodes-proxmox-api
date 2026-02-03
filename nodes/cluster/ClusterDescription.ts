import type { INodeProperties } from 'n8n-workflow';

export const clusterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['cluster'],
			},
		},
		options: [
			{
				name: 'Get Version',
				value: 'getVersion',
				description: 'Get the Proxmox API version',
			},
			{
				name: 'Get Nodes',
				value: 'getNodes',
				description: 'List nodes in the cluster',
			},
			{
				name: 'Get Resources',
				value: 'getResources',
				description: 'List resources across the cluster',
			},
			{
				name: 'Get Tasks',
				value: 'getTasks',
				description: 'List recent cluster tasks',
			},
			{
				name: 'Get HA Status',
				value: 'getHaStatus',
				description: 'Get current HA status information',
			},
		],
		default: 'getVersion',
	},
];

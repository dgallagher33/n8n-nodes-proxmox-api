import type { INodeProperties } from 'n8n-workflow';

export const storageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['storage'],
			},
		},
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get storage status',
			},
			{
				name: 'Get RRD Data',
				value: 'getRrdData',
				description: 'Get storage RRD data',
			},
		],
		default: 'getStatus',
	},
	{
		displayName: 'Node Name',
		name: 'nodeName',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getNodeOptions',
		},
		displayOptions: {
			show: {
				resource: ['storage'],
			},
		},
		default: '',
		description: 'Proxmox node name',
	},
	{
		displayName: 'Storage ID',
		name: 'storageId',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getStorageOptions',
		},
		displayOptions: {
			show: {
				resource: ['storage'],
			},
		},
		default: '',
		description: 'Storage identifier',
	},
	{
		displayName: 'Timeframe',
		name: 'timeframe',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['getRrdData'],
			},
		},
		default: '',
		description: 'RRD timeframe (e.g. hour, day, week, month, year)',
	},
	{
		displayName: 'Consolidation Function',
		name: 'cf',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['getRrdData'],
			},
		},
		default: '',
		description: 'RRD consolidation function (e.g. AVERAGE or MAX)',
	},
];

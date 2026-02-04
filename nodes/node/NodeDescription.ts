import type { INodeProperties } from 'n8n-workflow';

export const nodeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['node'],
			},
		},
		options: [
			{
				name: 'List VMs & Containers',
				value: 'listGuests',
				description: 'List QEMU VMs and LXC containers on a node',
			},
			{
				name: 'Get LXC Status',
				value: 'getLxcStatus',
				description: 'Get current status information for an LXC container',
			},
			{
				name: 'Get Node Status',
				value: 'getStatus',
				description: 'Get status information for a node',
			},
			{
				name: 'Get Node Config',
				value: 'getConfig',
				description: 'Get configuration for a node',
			},
		],
		default: 'listGuests',
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
				resource: ['node'],
			},
		},
		default: '',
		description: 'Proxmox node name',
	},
	{
		displayName: 'VMID',
		name: 'vmid',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getLxcVmidOptions',
		},
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['getLxcStatus'],
			},
		},
		default: '',
		description: 'VMID of the LXC container',
	},
];

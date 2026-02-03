"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeOperations = void 0;
exports.nodeOperations = [
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
				name: 'Get Node Status',
				value: 'getStatus',
				description: 'Get status information for a node',
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
];

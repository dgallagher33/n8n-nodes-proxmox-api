import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { proxmoxApiRequest } from '../helpers/apiRequest';
import { clusterOperations } from './cluster/ClusterDescription';
import { nodeOperations } from './node/NodeDescription';

export class Proxmox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Proxmox VE',
		name: 'proxmox',
		icon: 'file:proxmox.svg',
		group: ['input'],
		version: 1,
		description: 'Consume the Proxmox VE API',
		defaults: {
			name: 'Proxmox VE',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'proxmoxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Cluster',
						value: 'cluster',
					},
					{
						name: 'Node',
						value: 'node',
					},
				],
				default: 'cluster',
			},
			...clusterOperations,
			...nodeOperations,
		],
	};

	methods = {
		loadOptions: {
			async getNodeOptions(this: ILoadOptionsFunctions) {
				const nodes = (await proxmoxApiRequest.call(this, 'GET', '/nodes')) as Array<{
					node: string;
				}>;

				return nodes.map((node) => ({
					name: node.node,
					value: node.node,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const resource = this.getNodeParameter('resource', itemIndex) as string;
			const operation = this.getNodeParameter('operation', itemIndex) as string;

			if (resource === 'cluster') {
				if (operation === 'getVersion') {
					const data = await proxmoxApiRequest.call(this, 'GET', '/version');
					returnData.push({ json: data as Record<string, unknown> });
				}

				if (operation === 'getNodes') {
					const data = await proxmoxApiRequest.call(this, 'GET', '/nodes');
					returnData.push({ json: { nodes: data } });
				}

				if (operation === 'getResources') {
					const data = await proxmoxApiRequest.call(this, 'GET', '/cluster/resources');
					returnData.push({ json: { resources: data } });
				}
			}

			if (resource === 'node') {
				const nodeName = this.getNodeParameter('nodeName', itemIndex) as string;

				if (operation === 'listGuests') {
					const [qemu, lxc] = (await Promise.all([
						proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/qemu`),
						proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/lxc`),
					])) as [unknown[], unknown[]];

					returnData.push({
						json: {
							qemu,
							lxc,
						},
					});
				}

				if (operation === 'getStatus') {
					const data = await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/status`,
					);
					returnData.push({ json: data as Record<string, unknown> });
				}
			}
		}

		return [returnData];
	}
}

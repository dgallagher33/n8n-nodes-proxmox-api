import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { proxmoxApiRequest } from '../helpers/apiRequest';
import { buildLxcVmidOptions, LxcSummary } from '../helpers/lxc';
import { clusterOperations } from './cluster/ClusterDescription';
import { guestOperations } from './guest/GuestDescription';
import { nodeOperations } from './node/NodeDescription';
import { storageOperations } from './storage/StorageDescription';

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
						name: 'Guest',
						value: 'guest',
					},
					{
						name: 'Node',
						value: 'node',
					},
					{
						name: 'Storage',
						value: 'storage',
					},
				],
				default: 'cluster',
			},
			...clusterOperations,
			...guestOperations,
			...nodeOperations,
			...storageOperations,
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
			async getLxcVmidOptions(this: ILoadOptionsFunctions) {
				const nodeName = this.getCurrentNodeParameter('nodeName') as string;

				if (!nodeName) {
					return [];
				}

				const lxcs = (await proxmoxApiRequest.call(
					this,
					'GET',
					`/nodes/${nodeName}/lxc`,
				)) as LxcSummary[];

				return buildLxcVmidOptions(lxcs);
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
					const data = (await proxmoxApiRequest.call(this, 'GET', '/version')) as IDataObject;
					returnData.push({ json: data });
				}

				if (operation === 'getNodes') {
					const data = (await proxmoxApiRequest.call(this, 'GET', '/nodes')) as IDataObject[];
					returnData.push({ json: { nodes: data } });
				}

				if (operation === 'getResources') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						'/cluster/resources',
					)) as IDataObject[];
					returnData.push({ json: { resources: data } });
				}

				if (operation === 'getTasks') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						'/cluster/tasks',
					)) as IDataObject[];
					returnData.push({ json: { tasks: data } });
				}

				if (operation === 'getHaStatus') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						'/cluster/ha/status/current',
					)) as IDataObject;
					returnData.push({ json: data });
				}
			}

			if (resource === 'guest') {
				const guestType = this.getNodeParameter('guestType', itemIndex) as string;
				const nodeName = this.getNodeParameter('nodeName', itemIndex) as string;
				const vmid = String(this.getNodeParameter('vmid', itemIndex));
				const basePath = `/nodes/${nodeName}/${guestType}/${vmid}`;

				if (operation === 'getConfig') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`${basePath}/config`,
					)) as IDataObject;
					returnData.push({ json: data });
				}

				if (operation === 'getStatus') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`${basePath}/status/current`,
					)) as IDataObject;
					returnData.push({ json: data });
				}

				if (operation === 'listSnapshots') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`${basePath}/snapshot`,
					)) as IDataObject[];
					const snapshotName = this.getNodeParameter('snapshotName', itemIndex, '') as string;
					const snapshots = snapshotName
						? data.filter((snapshot) => snapshot.name === snapshotName)
						: data;

					returnData.push({ json: { snapshots } });
				}
			}

			if (resource === 'node') {
				const nodeName = this.getNodeParameter('nodeName', itemIndex) as string;

				if (operation === 'listGuests') {
					const [qemu, lxc] = (await Promise.all([
						proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/qemu`),
						proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/lxc`),
					])) as [IDataObject[], IDataObject[]];

					returnData.push({
						json: {
							qemu,
							lxc,
						},
					});
				}

				if (operation === 'getStatus') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/status`,
					)) as IDataObject;
					returnData.push({ json: data });
				}

				if (operation === 'getLxcStatus') {
					const vmid = this.getNodeParameter('vmid', itemIndex) as string;
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/lxc/${vmid}/status/current`,
					)) as IDataObject;
					returnData.push({ json: data });
				}
			}
		}

		return [returnData];
	}
}

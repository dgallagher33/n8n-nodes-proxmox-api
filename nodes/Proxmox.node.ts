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
			async getGuestOptions(this: ILoadOptionsFunctions) {
				let guestType: string | undefined;
				let nodeName: string | undefined;

				try {
					guestType = this.getCurrentNodeParameter('guestType') as string;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
						message: 'Select a guest type before choosing a VMID.',
					});
				}

				try {
					nodeName = this.getCurrentNodeParameter('nodeName') as string;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
						message: 'Select a node before choosing a VMID.',
					});
				}

				if (!guestType) {
					throw new NodeApiError(this.getNode(), new Error('Guest type is required.') as unknown as JsonObject, {
						message: 'Select a guest type before choosing a VMID.',
					});
				}

				if (!nodeName) {
					throw new NodeApiError(this.getNode(), new Error('Node name is required.') as unknown as JsonObject, {
						message: 'Select a node before choosing a VMID.',
					});
				}

				const guests = (await proxmoxApiRequest.call(
					this,
					'GET',
					`/nodes/${nodeName}/${guestType}`,
				)) as Array<{ vmid: number; name?: string }>;

				return guests.map((guest) => ({
					name: guest.name ? `${guest.name} (${guest.vmid})` : String(guest.vmid),
					value: guest.vmid,
				}));
			},
			async getStorageOptions(this: ILoadOptionsFunctions) {
				let nodeName: string | undefined;

				try {
					nodeName = this.getCurrentNodeParameter('nodeName') as string;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
						message: 'Select a node before choosing a storage ID.',
					});
				}

				if (!nodeName) {
					throw new NodeApiError(this.getNode(), new Error('Node name is required.') as unknown as JsonObject, {
						message: 'Select a node before choosing a storage ID.',
					});
				}

				const storages = (await proxmoxApiRequest.call(
					this,
					'GET',
					`/nodes/${nodeName}/storage`,
				)) as Array<{ storage: string; type?: string }>;

				return storages.map((storage) => ({
					name: storage.type ? `${storage.storage} (${storage.type})` : storage.storage,
					value: storage.storage,
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

				if (operation === 'getConfig') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/config`,
					)) as IDataObject;
					returnData.push({ json: data });
				}
			}

			if (resource === 'storage') {
				const nodeName = this.getNodeParameter('nodeName', itemIndex) as string;
				const storageId = this.getNodeParameter('storageId', itemIndex) as string;

				if (operation === 'getStatus') {
					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/storage/${storageId}/status`,
					)) as IDataObject;
					returnData.push({ json: { status: data } });
				}

				if (operation === 'getRrdData') {
					const timeframe = this.getNodeParameter('timeframe', itemIndex, '') as string;
					const cf = this.getNodeParameter('cf', itemIndex, '') as string;
					const qs: IDataObject = {};

					if (timeframe) {
						qs.timeframe = timeframe;
					}

					if (cf) {
						qs.cf = cf;
					}

					const data = (await proxmoxApiRequest.call(
						this,
						'GET',
						`/nodes/${nodeName}/storage/${storageId}/rrddata`,
						undefined,
						Object.keys(qs).length ? qs : undefined,
					)) as IDataObject[];
					returnData.push({ json: { rrddata: data } });
				}
			}
		}

		return [returnData];
	}
}

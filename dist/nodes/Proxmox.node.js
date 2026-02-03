"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxmox = void 0;
const apiRequest_1 = require("../helpers/apiRequest");
const ClusterDescription_1 = require("./cluster/ClusterDescription");
const NodeDescription_1 = require("./node/NodeDescription");
class Proxmox {
	constructor() {
		this.description = {
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
				...ClusterDescription_1.clusterOperations,
				...NodeDescription_1.nodeOperations,
			],
		};
		this.methods = {
			loadOptions: {
				async getNodeOptions() {
					const nodes = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/nodes'));
					return nodes.map((node) => ({
						name: node.node,
						value: node.node,
					}));
				},
			},
		};
	}
	async execute() {
		const items = this.getInputData();
		const returnData = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const resource = this.getNodeParameter('resource', itemIndex);
			const operation = this.getNodeParameter('operation', itemIndex);
			if (resource === 'cluster') {
				if (operation === 'getVersion') {
					const data = await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/version');
					returnData.push({ json: data });
				}
				if (operation === 'getNodes') {
					const data = await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/nodes');
					returnData.push({ json: { nodes: data } });
				}
				if (operation === 'getResources') {
					const data = await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/cluster/resources');
					returnData.push({ json: { resources: data } });
				}
			}
			if (resource === 'node') {
				const nodeName = this.getNodeParameter('nodeName', itemIndex);
				if (operation === 'listGuests') {
					const [qemu, lxc] = (await Promise.all([
						apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/qemu`),
						apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/lxc`),
					]));
					returnData.push({
						json: {
							qemu,
							lxc,
						},
					});
				}
				if (operation === 'getStatus') {
					const data = await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/status`);
					returnData.push({ json: data });
				}
			}
		}
		return [returnData];
	}
}
exports.Proxmox = Proxmox;

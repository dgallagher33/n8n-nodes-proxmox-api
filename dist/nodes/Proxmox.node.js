"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxmox = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const apiRequest_1 = require("../helpers/apiRequest");
const ClusterDescription_1 = require("./cluster/ClusterDescription");
const GuestDescription_1 = require("./guest/GuestDescription");
const NodeDescription_1 = require("./node/NodeDescription");
const StorageDescription_1 = require("./storage/StorageDescription");
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
                ...ClusterDescription_1.clusterOperations,
                ...GuestDescription_1.guestOperations,
                ...NodeDescription_1.nodeOperations,
                ...StorageDescription_1.storageOperations,
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
                async getGuestOptions() {
                    let guestType;
                    let nodeName;
                    try {
                        guestType = this.getNodeParameter('guestType', 0);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                            message: 'Select a guest type before choosing a VMID.',
                        });
                    }
                    try {
                        nodeName = this.getNodeParameter('nodeName', 0);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                            message: 'Select a node before choosing a VMID.',
                        });
                    }
                    if (!guestType) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), new Error('Guest type is required.'), {
                            message: 'Select a guest type before choosing a VMID.',
                        });
                    }
                    if (!nodeName) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), new Error('Node name is required.'), {
                            message: 'Select a node before choosing a VMID.',
                        });
                    }
                    const guests = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/${guestType}`));
                    return guests.map((guest) => ({
                        name: guest.name ? `${guest.name} (${guest.vmid})` : String(guest.vmid),
                        value: guest.vmid,
                    }));
                },
                async getStorageOptions() {
                    let nodeName;
                    try {
                        nodeName = this.getNodeParameter('nodeName', 0);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                            message: 'Select a node before choosing a storage ID.',
                        });
                    }
                    if (!nodeName) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), new Error('Node name is required.'), {
                            message: 'Select a node before choosing a storage ID.',
                        });
                    }
                    const storages = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/storage`));
                    return storages.map((storage) => ({
                        name: storage.type ? `${storage.storage} (${storage.type})` : storage.storage,
                        value: storage.storage,
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
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/version'));
                    returnData.push({ json: data });
                }
                if (operation === 'getNodes') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/nodes'));
                    returnData.push({ json: { nodes: data } });
                }
                if (operation === 'getResources') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/cluster/resources'));
                    returnData.push({ json: { resources: data } });
                }
                if (operation === 'getTasks') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/cluster/tasks'));
                    returnData.push({ json: { tasks: data } });
                }
                if (operation === 'getHaStatus') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', '/cluster/ha/status/current'));
                    returnData.push({ json: data });
                }
            }
            if (resource === 'guest') {
                const guestType = this.getNodeParameter('guestType', itemIndex);
                const nodeName = this.getNodeParameter('nodeName', itemIndex);
                const vmid = String(this.getNodeParameter('vmid', itemIndex));
                const basePath = `/nodes/${nodeName}/${guestType}/${vmid}`;
                if (operation === 'getConfig') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `${basePath}/config`));
                    returnData.push({ json: data });
                }
                if (operation === 'getStatus') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `${basePath}/status/current`));
                    returnData.push({ json: data });
                }
                if (operation === 'listSnapshots') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `${basePath}/snapshot`));
                    const snapshotName = this.getNodeParameter('snapshotName', itemIndex, '');
                    const snapshots = snapshotName
                        ? data.filter((snapshot) => snapshot.name === snapshotName)
                        : data;
                    returnData.push({ json: { snapshots } });
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
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/status`));
                    returnData.push({ json: data });
                }
                if (operation === 'getConfig') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/config`));
                    returnData.push({ json: data });
                }
            }
            if (resource === 'storage') {
                const nodeName = this.getNodeParameter('nodeName', itemIndex);
                const storageId = this.getNodeParameter('storageId', itemIndex);
                if (operation === 'getStatus') {
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/storage/${storageId}/status`));
                    returnData.push({ json: { status: data } });
                }
                if (operation === 'getRrdData') {
                    const timeframe = this.getNodeParameter('timeframe', itemIndex, '');
                    const cf = this.getNodeParameter('cf', itemIndex, '');
                    const qs = {};
                    if (timeframe) {
                        qs.timeframe = timeframe;
                    }
                    if (cf) {
                        qs.cf = cf;
                    }
                    const data = (await apiRequest_1.proxmoxApiRequest.call(this, 'GET', `/nodes/${nodeName}/storage/${storageId}/rrddata`, undefined, Object.keys(qs).length ? qs : undefined));
                    returnData.push({ json: { rrddata: data } });
                }
            }
        }
        return [returnData];
    }
}
exports.Proxmox = Proxmox;

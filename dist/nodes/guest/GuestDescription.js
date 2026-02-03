"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestOperations = void 0;
exports.guestOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['guest'],
            },
        },
        options: [
            {
                name: 'Get Config',
                value: 'getConfig',
                description: 'Get guest configuration',
            },
            {
                name: 'Get Status',
                value: 'getStatus',
                description: 'Get current guest status',
            },
            {
                name: 'List Snapshots',
                value: 'listSnapshots',
                description: 'List guest snapshots',
            },
        ],
        default: 'getConfig',
    },
    {
        displayName: 'Guest Type',
        name: 'guestType',
        type: 'options',
        options: [
            {
                name: 'QEMU VM',
                value: 'qemu',
            },
            {
                name: 'LXC Container',
                value: 'lxc',
            },
        ],
        default: 'qemu',
        displayOptions: {
            show: {
                resource: ['guest'],
            },
        },
        description: 'Select the type of guest',
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
                resource: ['guest'],
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
            loadOptionsMethod: 'getGuestOptions',
        },
        displayOptions: {
            show: {
                resource: ['guest'],
            },
        },
        default: '',
        description: 'Guest VMID',
    },
    {
        displayName: 'Snapshot Name',
        name: 'snapshotName',
        type: 'string',
        required: false,
        displayOptions: {
            show: {
                resource: ['guest'],
                operation: ['listSnapshots'],
            },
        },
        default: '',
        description: 'Optional: filter snapshot list by name',
    },
];

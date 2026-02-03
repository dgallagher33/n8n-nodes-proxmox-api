"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const Proxmox_node_1 = require("./nodes/Proxmox.node");
const ProxmoxApi_credentials_1 = require("./credentials/ProxmoxApi.credentials");
exports.nodes = [Proxmox_node_1.Proxmox];
exports.credentials = [ProxmoxApi_credentials_1.ProxmoxApi];

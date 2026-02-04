"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLxcVmidOptions = buildLxcVmidOptions;
function buildLxcVmidOptions(lxcs) {
    return lxcs
        .filter((lxc) => lxc.vmid !== undefined && lxc.vmid !== null && lxc.vmid !== '')
        .map((lxc) => {
        var _a, _b;
        const label = (_b = (_a = lxc.name) !== null && _a !== void 0 ? _a : lxc.hostname) !== null && _b !== void 0 ? _b : `LXC ${lxc.vmid}`;
        return {
            name: label,
            value: lxc.vmid,
        };
    });
}

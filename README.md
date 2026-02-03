# n8n-nodes-proxmox-api

Production-grade n8n community node for the Proxmox VE REST API.

## ✅ Base URL behavior

This node **always** targets the Proxmox REST API under `/api2/json`.

Provide either:

- **Direct access**: `https://pve1.example.com:8006`
- **Reverse proxy**: `https://proxy.example.com/api2/json`

The node normalizes the base URL automatically, so you never need to guess whether to include `/api2/json`.

## 🔐 Authentication (API Token)

1. In the Proxmox UI, go to **Datacenter → Permissions → API Tokens**.
2. Create a token for a user, e.g. `user@pve!n8n`.
3. Copy the token secret.

In n8n credentials:

- **API Token ID**: `user@pve!n8n`
- **API Token Secret**: `<secret>`

## 🔒 TLS behavior

- **Strict TLS by default**.
- Enable **Allow Self-signed Certificates** only if your Proxmox instance uses self-signed certs.
- TLS verification is never disabled globally.

## ✅ Supported operations (read-only)

### Cluster

- **Get Version** → `/version`
- **Get Nodes** → `/nodes`
- **Get Resources** → `/cluster/resources`
- **Get Tasks** → `/cluster/tasks`
- **Get HA Status** → `/cluster/ha/status/current`

### Node

- **List VMs & Containers** → `/nodes/{node}/qemu` and `/nodes/{node}/lxc`
- **Get Node Status** → `/nodes/{node}/status`
- **Get Node Config** → `/nodes/{node}/config`

### Guest

- **Get Config** → `/nodes/{node}/qemu/{vmid}/config` and `/nodes/{node}/lxc/{vmid}/config`
- **Get Status** → `/nodes/{node}/qemu/{vmid}/status/current` and `/nodes/{node}/lxc/{vmid}/status/current`
- **List Snapshots** → `/nodes/{node}/qemu/{vmid}/snapshot` and `/nodes/{node}/lxc/{vmid}/snapshot`

### Storage

- **Get Status** → `/nodes/{node}/storage/{storage}/status`
- **Get RRD Data** → `/nodes/{node}/storage/{storage}/rrddata`

## 🧪 Curl equivalents

> Replace values with your own server and token.

### Cluster → Get Version

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/version
```

### Cluster → Get Nodes

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes
```

### Cluster → Get Resources

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/cluster/resources
```

### Cluster → Get Tasks

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/cluster/tasks
```

### Cluster → Get HA Status

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/cluster/ha/status/current
```

### Node → List VMs & Containers

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/qemu

curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/lxc
```

### Node → Get Node Status

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/status
```

### Node → Get Node Config

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/config
```

### Guest → Get Config (QEMU)

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/qemu/100/config
```

### Guest → Get Status (LXC)

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/lxc/101/status/current
```

### Guest → List Snapshots (QEMU)

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/qemu/100/snapshot
```

### Storage → Get Status

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://pve1.example.com:8006/api2/json/nodes/pve1/storage/local/status
```

### Storage → Get RRD Data

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  "https://pve1.example.com:8006/api2/json/nodes/pve1/storage/local/rrddata?timeframe=hour&cf=AVERAGE"
```

### Reverse proxy example

```bash
curl -k -H "Authorization: PVEAPIToken=user@pve!token=secret" \
  https://proxy.example.com/api2/json/nodes
```

## ✅ Validation checklist

- ✅ Direct Proxmox endpoint
- ✅ Reverse proxy endpoint
- ✅ API token authentication
- ✅ Invalid token (401)
- ✅ Wrong path (404)
- ✅ TLS failure / self-signed cert handling

## ⚠️ Known limitations

- Read-only operations only (no VM creation, deletion, or mutations).
- Username/password authentication not implemented yet.

## 📦 Build

```bash
npm run build
```

The compiled output is published from `dist/`.

## 📚 References

- Proxmox VE API Viewer: https://pve.proxmox.com/pve-docs/api-viewer/index.html
- n8n Custom Node documentation: https://docs.n8n.io/integrations/creating-nodes/

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

## ✅ Supported operations (MVP)

### Cluster

- **Get Version** → `/version`
- **Get Nodes** → `/nodes`
- **Get Resources** → `/cluster/resources`

### Node

- **List VMs & Containers** → `/nodes/{node}/qemu` and `/nodes/{node}/lxc`
- **Get Node Status** → `/nodes/{node}/status`

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

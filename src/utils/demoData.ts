import type { Device } from "../api/generated/schemas/device";
import type { Firmware } from "../api/generated/schemas/firmware";
import type { DeploymentGroup } from "../api/generated/schemas/deploymentGroup";
import type { Script } from "../api/generated/schemas/script";
import type { User } from "../api/generated/schemas/user";

const DEMO_ORG = "acme";
const DEMO_PRODUCT = "smart-sensor";

const now = new Date().toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

// ── User ────────────────────────────────────────────────────────

const demoUser: User = {
  id: 1,
  name: "demo_user",
  email: "demo@nerveshub.org",
  inserted_at: daysAgo(90),
  updated_at: now,
};

// ── Devices ─────────────────────────────────────────────────────

const demoDevices: Device[] = [
  {
    id: 1,
    identifier: "sensor-gateway-01",
    description: "Main gateway — warehouse floor",
    version: "1.4.2",
    connection_status: "connected",
    online: true,
    tags: "gateway,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi4",
      architecture: "aarch64",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0001-4000-8000-000000000001",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0001-4000-8000-000000000001",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi4",
    },
  },
  {
    id: 2,
    identifier: "sensor-node-alpha",
    description: "Temperature sensor — cold storage",
    version: "1.4.2",
    connection_status: "connected",
    online: true,
    tags: "sensor,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0002-4000-8000-000000000002",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0002-4000-8000-000000000002",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi0",
    },
  },
  {
    id: 3,
    identifier: "sensor-node-bravo",
    description: "Humidity sensor — greenhouse A",
    version: "1.4.1",
    connection_status: "connected",
    online: true,
    tags: "sensor,staging",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.4.1",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0003-4000-8000-000000000003",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "staging",
      firmware_uuid: "a1b2c3d4-0003-4000-8000-000000000003",
      firmware_version: "1.4.1",
      is_active: true,
      platform: "rpi0",
    },
  },
  {
    id: 4,
    identifier: "sensor-node-charlie",
    description: "Pressure sensor — lab",
    version: "1.3.0",
    connection_status: "disconnected",
    online: false,
    tags: "sensor,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.3.0",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0004-4000-8000-000000000004",
      fwup_version: "1.10.0",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0004-4000-8000-000000000004",
      firmware_version: "1.3.0",
      is_active: true,
      platform: "rpi0",
    },
  },
  {
    id: 5,
    identifier: "sensor-gateway-02",
    description: "Backup gateway — warehouse floor",
    version: "1.4.2",
    connection_status: "connected",
    online: true,
    tags: "gateway,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi4",
      architecture: "aarch64",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0005-4000-8000-000000000005",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0005-4000-8000-000000000005",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi4",
    },
  },
  {
    id: 6,
    identifier: "sensor-node-delta",
    description: "Motion sensor — loading dock",
    version: "1.4.2",
    connection_status: "connected",
    online: true,
    tags: "sensor,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0006-4000-8000-000000000006",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0006-4000-8000-000000000006",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi0",
    },
  },
  {
    id: 7,
    identifier: "sensor-node-echo",
    description: "Light sensor — greenhouse B",
    version: "1.4.2",
    connection_status: "disconnected",
    online: false,
    tags: "sensor,staging",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: false,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0007-4000-8000-000000000007",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "staging",
      firmware_uuid: "a1b2c3d4-0007-4000-8000-000000000007",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi0",
    },
  },
  {
    id: 8,
    identifier: "sensor-node-foxtrot",
    description: "Vibration sensor — machine room",
    version: "1.4.2",
    connection_status: "connected",
    online: true,
    tags: "sensor,production",
    org_name: DEMO_ORG,
    product_name: DEMO_PRODUCT,
    updates_enabled: true,
    firmware_metadata: {
      platform: "rpi0",
      architecture: "arm",
      version: "1.4.2",
      author: "ci",
      product: DEMO_PRODUCT,
      uuid: "a1b2c3d4-0008-4000-8000-000000000008",
      fwup_version: "1.10.1",
    },
    deployment_group: {
      name: "production",
      firmware_uuid: "a1b2c3d4-0008-4000-8000-000000000008",
      firmware_version: "1.4.2",
      is_active: true,
      platform: "rpi0",
    },
  },
];

// ── Firmware ────────────────────────────────────────────────────

const demoFirmwares: Firmware[] = [
  {
    uuid: "fw-uuid-0001",
    version: "1.4.2",
    platform: "rpi0",
    architecture: "arm",
    author: "ci",
    description: "Stability improvements and sensor calibration fixes",
    inserted_at: daysAgo(2),
    updated_at: daysAgo(2),
    product: DEMO_PRODUCT,
    size: 14_680_064,
    signed: true,
    fwup_version: "1.10.1",
    vcs_identifier: "abc1234",
  },
  {
    uuid: "fw-uuid-0002",
    version: "1.4.1",
    platform: "rpi0",
    architecture: "arm",
    author: "ci",
    description: "Added OTA progress reporting",
    inserted_at: daysAgo(14),
    updated_at: daysAgo(14),
    product: DEMO_PRODUCT,
    size: 14_548_992,
    signed: true,
    fwup_version: "1.10.1",
    vcs_identifier: "def5678",
  },
  {
    uuid: "fw-uuid-0003",
    version: "1.3.0",
    platform: "rpi0",
    architecture: "arm",
    author: "ci",
    description: "Initial multi-sensor support",
    inserted_at: daysAgo(45),
    updated_at: daysAgo(45),
    product: DEMO_PRODUCT,
    size: 13_893_632,
    signed: true,
    fwup_version: "1.10.0",
    vcs_identifier: "ghi9012",
  },
  {
    uuid: "fw-uuid-0004",
    version: "1.4.2",
    platform: "rpi4",
    architecture: "aarch64",
    author: "ci",
    description: "Gateway firmware — stability improvements",
    inserted_at: daysAgo(2),
    updated_at: daysAgo(2),
    product: DEMO_PRODUCT,
    size: 18_874_368,
    signed: true,
    fwup_version: "1.10.1",
    vcs_identifier: "abc1234",
  },
];

// ── Deployment Groups ───────────────────────────────────────────

const demoDeployments: DeploymentGroup[] = [
  {
    id: 1,
    name: "production",
    is_active: true,
    state: "on",
    device_count: 6,
    firmware: {
      uuid: "fw-uuid-0001",
      version: "1.4.2",
      platform: "rpi0",
      architecture: "arm",
      author: "ci",
      fwup_version: "1.10.1",
      vcs_identifier: "abc1234",
      signed: true,
    },
    conditions: {
      version: ">= 1.0.0",
      tags: ["production"],
    },
    inserted_at: daysAgo(60),
    updated_at: daysAgo(2),
  },
  {
    id: 2,
    name: "staging",
    is_active: true,
    state: "on",
    device_count: 2,
    firmware: {
      uuid: "fw-uuid-0002",
      version: "1.4.1",
      platform: "rpi0",
      architecture: "arm",
      author: "ci",
      fwup_version: "1.10.1",
      vcs_identifier: "def5678",
      signed: true,
    },
    conditions: {
      version: ">= 1.0.0",
      tags: ["staging"],
    },
    inserted_at: daysAgo(60),
    updated_at: daysAgo(14),
  },
  {
    id: 3,
    name: "canary",
    is_active: false,
    state: "off",
    device_count: 0,
    firmware: {
      uuid: "fw-uuid-0003",
      version: "1.3.0",
      platform: "rpi0",
      architecture: "arm",
      author: "ci",
      fwup_version: "1.10.0",
      vcs_identifier: "ghi9012",
      signed: true,
    },
    conditions: {
      version: ">= 1.0.0",
      tags: ["canary"],
    },
    inserted_at: daysAgo(90),
    updated_at: daysAgo(50),
  },
];

// ── Scripts ─────────────────────────────────────────────────────

const demoScripts: Script[] = [
  {
    id: 1,
    name: "Health Check",
    text: ':os.cmd(~c"uname -a")\n|> to_string()\n|> String.trim()',
    inserted_at: daysAgo(30),
    updated_at: daysAgo(5),
  },
  {
    id: 2,
    name: "Disk Usage",
    text: ':os.cmd(~c"df -h")\n|> to_string()\n|> String.trim()',
    inserted_at: daysAgo(28),
    updated_at: daysAgo(10),
  },
  {
    id: 3,
    name: "Sensor Status",
    text: "Sensor.read_all()\n|> Enum.map(& {&1.name, &1.value})\n|> Enum.into(%{})",
    inserted_at: daysAgo(20),
    updated_at: daysAgo(3),
  },
  {
    id: 4,
    name: "Restart Application",
    text: "Application.stop(:smart_sensor)\nProcess.sleep(1000)\nApplication.start(:smart_sensor)",
    inserted_at: daysAgo(15),
    updated_at: daysAgo(15),
  },
];

// ── Route matcher ───────────────────────────────────────────────

type DemoRoute = {
  pattern: RegExp;
  data: unknown;
};

const routes: DemoRoute[] = [
  {
    pattern: /^\/orgs$/,
    data: { data: [{ name: DEMO_ORG }] },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products$/,
    data: { data: [{ id: 1, name: DEMO_PRODUCT }] },
  },
  {
    pattern: /^\/users\/me$/,
    data: { data: demoUser },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products\/[^/]+\/devices\/[^/]+$/,
    data: { data: demoDevices[0] },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products\/[^/]+\/devices$/,
    data: {
      data: demoDevices,
      pagination: {
        page_number: 1,
        page_size: 25,
        total_entries: demoDevices.length,
        total_pages: 1,
      },
    },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products\/[^/]+\/firmwares$/,
    data: { data: demoFirmwares },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products\/[^/]+\/deployments$/,
    data: { data: demoDeployments },
  },
  {
    pattern: /^\/orgs\/[^/]+\/products\/[^/]+\/scripts$/,
    data: { data: demoScripts },
  },
];

export function getDemoResponse(url: string): unknown | undefined {
  for (const route of routes) {
    if (route.pattern.test(url)) {
      return route.data;
    }
  }
  return undefined;
}

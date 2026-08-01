import { writeFile } from "node:fs/promises";

const source =
  process.env.NERVESHUB_OPENAPI_URL ??
  "https://manage.nervescloud.com/api/openapi";
const destination = new URL("../openapi/nerveshub.json", import.meta.url);

const response = await fetch(source);
if (!response.ok) {
  throw new Error(`Failed to download ${source}: ${response.status}`);
}

const spec = await response.json();

// OpenApiSpex currently emits `required: false` on the nested device-filter
// property schemas. OpenAPI 3 only permits `required` arrays on the containing
// object, while parameter objects still need their boolean `required` field.
const deviceList =
  spec.paths["/api/orgs/{org_name}/products/{product_name}/devices"]?.get;
const filterParameter = deviceList?.parameters?.find(
  (parameter) => parameter.name === "filters",
);
for (const property of Object.values(
  filterParameter?.schema?.properties ?? {},
)) {
  if (typeof property.required === "boolean") delete property.required;
}

// The Axios client is configured with an `/api` base URL. Keep generated
// operation paths relative to that base so requests do not become `/api/api`.
spec.paths = Object.fromEntries(
  Object.entries(spec.paths).map(([path, operations]) => [
    path.startsWith("/api/") ? path.slice(4) : path,
    operations,
  ]),
);

// Drop operations the mobile client intentionally does not expose, including
// legacy short-URL duplicates and bulk manifest import.
for (const path of Object.keys(spec.paths)) {
  if (path.startsWith("/devices/")) delete spec.paths[path];
  if (path.startsWith("/auth/cli_session")) delete spec.paths[path];
  if (
    path ===
    "/orgs/{org_name}/products/{product_name}/devices/import"
  ) {
    delete spec.paths[path];
  }
  // This route lives outside the API base URL and is not used by the app.
  if (path === "/status/alive") delete spec.paths[path];
}
for (const schemaName of Object.keys(spec.components.schemas)) {
  if (schemaName.includes("CLISession")) delete spec.components.schemas[schemaName];
}
delete spec.components.schemas.DeviceBulkImport;

const operationNames = {
  "OrgController.index": "listOrgs",
  "ProductController.index": "listProducts",
  "ProductController.show": "getProduct",
  "ProductController.create": "createProduct",
  "ProductController.update": "updateProduct",
  "ProductController.delete": "deleteProduct",
  "DevicesController.index": "listDevices",
  "DevicesController.show": "getDevice",
  "DevicesController.create": "createDevice",
  "DevicesController.update": "updateDevice",
  "DevicesController.delete": "deleteDevice",
  "DevicesController.reboot": "rebootDevice",
  "DevicesController.reconnect": "reconnectDevice",
  "DevicesController.penalty": "clearDevicePenalty",
  "DevicesController.upgrade": "upgradeDevice",
  "DevicesController.move": "moveDevice",
  "DevicesController.code": "executeDeviceCode",
  "DevicesController.auth": "authenticateDevice",
  "DeviceCertificateController.index": "listDeviceCertificates",
  "DeviceCertificateController.show": "getDeviceCertificate",
  "DeviceCertificateController.create": "createDeviceCertificate",
  "DeviceCertificateController.delete": "deleteDeviceCertificate",
  "FirmwareController.index": "listFirmwares",
  "FirmwareController.show": "getFirmware",
  "FirmwareController.create": "createFirmware",
  "FirmwareController.delete": "deleteFirmware",
  "FirmwareController.download": "downloadFirmware",
  "DeploymentGroupController.index": "listDeploymentGroups",
  "DeploymentGroupController.show": "getDeploymentGroup",
  "DeploymentGroupController.create": "createDeploymentGroup",
  "DeploymentGroupController.update": "updateDeploymentGroup",
  "DeploymentGroupController.delete": "deleteDeploymentGroup",
  "KeyController.index": "listSigningKeys",
  "KeyController.show": "getSigningKey",
  "KeyController.create": "createSigningKey",
  "KeyController.delete": "deleteSigningKey",
  "ScriptController.index": "listScripts",
  "ScriptController.show": "getScript",
  "ScriptController.create": "createScript",
  "ScriptController.update": "updateScript",
  "ScriptController.delete": "deleteScript",
  "ScriptController.send": "sendScriptToDevice",
  "CACertificateController.index": "listCACertificates",
  "CACertificateController.show": "getCACertificate",
  "CACertificateController.create": "createCACertificate",
  "CACertificateController.delete": "deleteCACertificate",
  "CACertificateController.verification_token": "getCACertificateVerificationToken",
  "OrgUserController.index": "listOrgUsers",
  "OrgUserController.show": "getOrgUser",
  "OrgUserController.add": "addOrgUser",
  "OrgUserController.invite": "inviteOrgUser",
  "OrgUserController.update": "updateOrgUser",
  "OrgUserController.delete": "deleteOrgUser",
  "OrgUserController.remove": "removeOrgUser",
  "UserController.me": "getMe",
  "UserController.login": "loginUser",
  "UserController.auth": "authUser",
  "StatusController.alive": "healthCheck",
};

for (const operations of Object.values(spec.paths)) {
  for (const operation of Object.values(operations)) {
    if (!operation || typeof operation !== "object" || !operation.operationId)
      continue;
    const suffix = operation.operationId.split("NervesHubWeb.API.").at(-1);
    operation.operationId = operationNames[suffix] ?? operation.operationId;
    if (operation.tags?.includes("Support Scripts")) {
      operation.tags = operation.tags.map((tag) =>
        tag === "Support Scripts" ? "Scripts" : tag,
      );
    }
    if (suffix?.startsWith("OrgUserController.")) {
      operation.tags = ["Org Users"];
    }
    if (suffix?.startsWith("UserController.")) {
      operation.tags = ["Users"];
    }
  }
}

// The server routes device creation on the collection. The published spec
// currently attaches POST to the member route and incorrectly requires an
// identifier path parameter.
const devicesPath = "/orgs/{org_name}/products/{product_name}/devices";
const devicePath = `${devicesPath}/{identifier}`;
if (spec.paths[devicePath]?.post) {
  const create = spec.paths[devicePath].post;
  create.parameters = (create.parameters ?? []).filter(
    (parameter) => parameter.name !== "identifier",
  );
  spec.paths[devicesPath] ??= {};
  spec.paths[devicesPath].post = create;
  delete spec.paths[devicePath].post;
}

// The current controller forwards the top-level request params directly to
// Device.changeset/2. Reflect that real contract instead of generating the
// obsolete `{ device: ... }` wrapper from the published schema.
spec.components.schemas.DeviceUpdateRequest = {
  title: "DeviceUpdateRequest",
  description: "PUT body for updating a Device",
  type: "object",
  properties: {
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    updates_enabled: { type: "boolean" },
    deployment_id: { type: "integer", nullable: true },
  },
};
spec.components.schemas.DeviceCreationRequest = {
  title: "DeviceCreationRequest",
  description: "POST body for creating a Device",
  type: "object",
  required: ["identifier"],
  properties: {
    identifier: { type: "string" },
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    updates_enabled: { type: "boolean" },
    deployment_id: { type: "integer", nullable: true },
  },
};

// Credential login remains unchanged in this pass. Preserve the response
// shape used by AuthContext even though the hosted schema omits its API token.
spec.components.schemas.AuthRequest = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
};
spec.components.schemas.AuthResponseData = {
  type: "object",
  properties: {
    token: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
  },
};
spec.components.schemas.AuthResponse = {
  type: "object",
  properties: {
    data: { $ref: "#/components/schemas/AuthResponseData" },
  },
};

// DeviceJSON serializes the custom Tag type as a string array and can emit
// `not_seen`. These corrections remove casts throughout the mobile UI.
const device = spec.components.schemas.Device;
if (device?.properties) {
  device.properties.id = { type: "integer", nullable: true };
  device.properties.tags = { type: "array", items: { type: "string" } };
  device.properties.connection_status = {
    type: "string",
    enum: ["connected", "disconnected", "not_seen"],
  };
  device.properties.deleted = { type: "boolean" };
}

// The latest web main branch adds deployment notes and tag matching semantics.
// Hosted OpenAPI can lag a deployment, so carry these additive fields here.
const conditions = spec.components.schemas.Conditions;
if (conditions?.properties) {
  conditions.properties.tag_operator = {
    type: "string",
    enum: ["and", "or"],
    default: "and",
  };
}

const deployment = spec.components.schemas.DeploymentGroup;
if (deployment?.properties) {
  deployment.properties.id = { type: "integer", nullable: true };
  deployment.properties.notes = { type: "string", nullable: true };
  deployment.properties.archive_uuid = { type: "string", nullable: true };
}

const deploymentCreate = spec.components.schemas.DeploymentGroupCreationRequest;
if (deploymentCreate?.properties) {
  deploymentCreate.properties.notes = { type: "string" };
}

const deploymentUpdate = spec.components.schemas.DeploymentGroupUpdateRequest;
if (deploymentUpdate?.properties?.deployment?.properties) {
  deploymentUpdate.properties.deployment.properties.notes = { type: "string" };
}

await writeFile(destination, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`Synced and normalized OpenAPI from ${source}`);

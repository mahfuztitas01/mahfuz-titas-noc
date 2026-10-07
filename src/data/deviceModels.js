// ---------------------------------------------------------------------------
// Device models + their physical ports.
// A cable connection is described as PORT -> PORT
// (e.g. BDCOM OLT PON1  ->  switch SFP1).
// Curated for equipment commonly used in Bangladesh ISPs.
// ---------------------------------------------------------------------------

const eth = (n, prefix = 'ether', start = 1) =>
  Array.from({ length: n }, (_, i) => ({ label: `${prefix}${i + start}`, kind: 'ethernet' }))
const sfp = (n, prefix = 'sfp', start = 1) =>
  Array.from({ length: n }, (_, i) => ({ label: `${prefix}${i + start}`, kind: 'sfp' }))
const gpon = (n, prefix = 'GPON0/1/') =>
  Array.from({ length: n }, (_, i) => ({ label: `${prefix}${i + 1}`, kind: 'gpon' }))
const epon = (n, prefix = 'PON') =>
  Array.from({ length: n }, (_, i) => ({ label: `${prefix}${i + 1}`, kind: 'epon' }))

export const KINDS = {
  ethernet: { label: 'Ethernet (RJ45)', color: '#10b981' },
  sfp: { label: 'SFP / SFP+', color: '#2563eb' },
  gpon: { label: 'GPON', color: '#8b5cf6' },
  epon: { label: 'EPON', color: '#ec4899' },
  console: { label: 'Console', color: '#64748b' },
}

// [id, vendor, name, category, ports]
const M = (id, vendor, name, category, ports) => ({ id, vendor, name, category, ports })

export const MODELS = [
  // ---------------- OLT (GPON / EPON) ----------------
  M('bdcom-p3310', 'bdcom', 'BDCOM P3310C (EPON)', 'OLT', [...epon(4, 'EPON0/1:'), ...sfp(4, 'GE', 1)]),
  M('bdcom-3600', 'bdcom', 'BDCOM 3600-04 (GPON)', 'OLT', [...gpon(4, 'GPON0/1/'), ...sfp(4, 'GE', 1)]),
  M('bdcom-3616', 'bdcom', 'BDCOM 3616-16 (GPON)', 'OLT', [...gpon(16, 'GPON0/'), ...sfp(4, 'GE', 1)]),
  M('cdata-fd1104', 'cdata', 'C-Data FD1104S (EPON)', 'OLT', [...epon(4, 'PON'), ...sfp(4, 'GE', 1)]),
  M('cdata-fd1208', 'cdata', 'C-Data FD1208S (GPON)', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(2, 'XGE', 1)]),
  M('cdata-fd1216', 'cdata', 'C-Data FD1216S (GPON)', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(4, 'XGE', 1)]),
  M('vsol-v1600g', 'vsol', 'V-SOL V1600G1 (GPON)', 'OLT', [...gpon(1, 'GPON0/1/'), ...sfp(2, 'GE', 1)]),
  M('vsol-v1600d', 'vsol', 'V-SOL V1600D (EPON)', 'OLT', [...epon(4, 'PON'), ...sfp(2, 'GE', 1)]),
  M('vsol-v2802', 'vsol', 'V-SOL V2802GW', 'OLT', [...gpon(2, 'GPON0/1/'), ...sfp(2, 'GE', 1)]),
  M('fh-an5516', 'fiberhome', 'FiberHome AN5516-01', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(4, 'GE', 1)]),
  M('fh-an5000', 'fiberhome', 'FiberHome AN5000-08', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(4, 'GE', 1)]),
  M('hw-ma5608', 'huawei', 'Huawei MA5608T', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(4, 'GE', 1)]),
  M('ma5800', 'huawei', 'Huawei MA5800-X7', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(2, 'XGE0/1/')]),
  M('zte-c300', 'zte', 'ZTE ZXA10 C300', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(2, 'XGE0/1/')]),
  M('c320', 'zte', 'ZTE ZXA10 C320', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(2, 'XGE0/1/')]),
  M('zte-c600', 'zte', 'ZTE ZXA10 C600', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(4, 'XGE0/1/')]),
  M('raisecom-5508', 'raisecom', 'Raisecom ISCOM5508', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(2, 'GE', 1)]),
  M('ut-bbs1000', 'utstarcom', 'UTStarcom BBS1000', 'OLT', [...gpon(8, 'GPON0/1/'), ...sfp(2, 'GE', 1)]),
  M('alcatel-7360', 'alcatel', 'Alcatel 7360 ISAM', 'OLT', [...gpon(16, 'GPON0/1/'), ...sfp(4, 'GE', 1)]),

  // ---------------- Routers ----------------
  M('rb750gr3', 'mikrotik', 'MikroTik hEX (RB750Gr3)', 'Router', eth(5)),
  M('hexs', 'mikrotik', 'MikroTik hEX S', 'Router', [...eth(5), ...sfp(1)]),
  M('rb3011', 'mikrotik', 'MikroTik RB3011UiAS', 'Router', [...eth(10), ...sfp(1)]),
  M('rb4011', 'mikrotik', 'MikroTik RB4011iGS+', 'Router', [...eth(10), ...sfp(1, 'sfp-sfpplus')]),
  M('ccr1009', 'mikrotik', 'MikroTik CCR1009-7G-1C-1S+', 'Router', [...eth(7), ...sfp(1)]),
  M('ccr1036', 'mikrotik', 'MikroTik CCR1036-8G-2S+', 'Router', [...eth(8), ...sfp(2, 'sfp-sfpplus')]),
  M('ccr2004', 'mikrotik', 'MikroTik CCR2004-1G-12S+2XS', 'Router', [...eth(1), ...sfp(12, 'sfp-sfpplus'), ...sfp(2, 'sfp28-')]),
  M('hap-ac2', 'mikrotik', 'MikroTik hAP ac²', 'Router', eth(5)),
  M('cap-ac', 'mikrotik', 'MikroTik cAP ac', 'Access Point', eth(2)),
  M('isr4331', 'cisco', 'Cisco ISR 4331', 'Router', eth(3, 'GigabitEthernet0/0/', 0)),
  M('cisco2911', 'cisco', 'Cisco 2911', 'Router', eth(3, 'GigabitEthernet0/', 0)),
  M('cisco-rv340', 'cisco', 'Cisco RV340', 'Router', [{ label: 'WAN', kind: 'ethernet' }, ...eth(4, 'LAN', 1)]),
  M('juniper-srx300', 'juniper', 'Juniper SRX300', 'Firewall', eth(8, 'ge-0/0/', 0)),
  M('fortigate-60f', 'fortinet', 'FortiGate 60F', 'Firewall', [{ label: 'wan1', kind: 'ethernet' }, { label: 'wan2', kind: 'ethernet' }, ...eth(7, 'internal', 1)]),
  M('gen-router', 'generic', 'Generic Router', 'Router', [...eth(4), ...sfp(1)]),

  // ---------------- Switches ----------------
  M('crs328', 'mikrotik', 'MikroTik CRS328-24P-4S+', 'Switch', [...eth(24), ...sfp(4, 'sfp-sfpplus')]),
  M('crs326', 'mikrotik', 'MikroTik CRS326-24G-2S+', 'Switch', [...eth(24), ...sfp(2, 'sfp-sfpplus')]),
  M('cisco2960', 'cisco', 'Cisco Catalyst 2960-24TT', 'Switch', [...eth(24, 'Fa0/', 1), ...eth(2, 'Gi0/', 1)]),
  M('cisco3560', 'cisco', 'Cisco Catalyst 3560-24TS', 'Switch', [...eth(24, 'Fa0/', 1), ...eth(2, 'Gi0/', 1)]),
  M('c9300', 'cisco', 'Cisco Catalyst 9300-24T', 'Switch', [...eth(24, 'Gi1/0/', 1), ...sfp(4, 'Te1/1/', 1)]),
  M('uswpro24', 'ubiquiti', 'UniFi USW-Pro-24-PoE', 'Switch', [...eth(24, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('uswlite16', 'ubiquiti', 'UniFi USW-Lite-16-PoE', 'Switch', [...eth(16, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('edgeswitch24', 'ubiquiti', 'EdgeSwitch 24', 'Switch', [...eth(24, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('gs724t', 'netgear', 'Netgear GS724T', 'Switch', [...eth(24, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('gs308', 'netgear', 'Netgear GS308', 'Switch', eth(8, 'Port ', 1)),
  M('tlsg1024', 'tplink', 'TP-Link TL-SG1024', 'Switch', eth(24, 'Port ', 1)),
  M('tlsg1016', 'tplink', 'TP-Link TL-SG1016', 'Switch', eth(16, 'Port ', 1)),
  M('tl-er605', 'tplink', 'TP-Link ER605', 'Router', [{ label: 'WAN', kind: 'ethernet' }, ...eth(4, 'LAN', 1)]),
  M('teg1024', 'tenda', 'Tenda TEG1024', 'Switch', eth(24, 'Port ', 1)),
  M('des1210', 'dlink', 'D-Link DES-1210-28', 'Switch', [...eth(24, 'Port ', 1), ...sfp(4, 'SFP')]),
  M('dgs1210', 'dlink', 'D-Link DGS-1210-24', 'Switch', [...eth(24, 'Port ', 1), ...sfp(4, 'SFP')]),
  M('ruijie-nbs3100', 'ruijie', 'Ruijie NBS3100-24GT4SFP', 'Switch', [...eth(24, 'Port ', 1), ...sfp(4, 'SFP')]),
  M('s5731', 'huawei', 'Huawei S5731-S24T4X', 'Switch', [...eth(24, 'GE0/0/', 1), ...sfp(4, '10GE0/0/', 1)]),
  M('s5700', 'huawei', 'Huawei S5700-28C', 'Switch', [...eth(24, 'GE0/0/', 1), ...sfp(4, 'XGE0/0/', 1)]),
  M('raisecom-2600', 'raisecom', 'Raisecom ISCOM2600', 'Switch', [...eth(24, 'GE', 1), ...sfp(4, 'SFP')]),
  M('netonix-ws12', 'netonix', 'Netonix WS-12-250', 'Switch', [...eth(12, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('hk-switch-0326', 'hikvision', 'Hikvision DS-3E0326P', 'Switch', [...eth(24, 'Port ', 1), ...sfp(2, 'SFP')]),
  M('aruba-2930f', 'aruba', 'Aruba 2930F-24G', 'Switch', [...eth(24, 'Port ', 1), ...sfp(4, 'SFP+')]),
  M('gen-switch', 'generic', 'Generic 8-Port Switch', 'Switch', [...eth(8, 'Port ', 1), ...sfp(2, 'SFP')]),

  // ---------------- Access Point / Radio ----------------
  M('u6pro', 'ubiquiti', 'UniFi U6-Pro', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('u6lr', 'ubiquiti', 'UniFi U6-LR', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('uapac-lite', 'ubiquiti', 'UniFi UAP-AC-Lite', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('powerbeam', 'ubiquiti', 'Ubiquiti PowerBeam AC', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('litebeam', 'ubiquiti', 'Ubiquiti LiteBeam AC', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('airfiber5xhd', 'ubiquiti', 'Ubiquiti AirFiber 5XHD', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('eap225', 'tplink', 'TP-Link EAP225', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('eap245', 'tplink', 'TP-Link EAP245', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('tenda-o3', 'tenda', 'Tenda O3 CPE', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('epmp1000', 'cambium', 'Cambium ePMP 1000', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('epmp3000', 'cambium', 'Cambium ePMP 3000', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('pmp450', 'cambium', 'Cambium PMP 450', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('mimosa-c5c', 'mimosa', 'Mimosa C5c', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('mimosa-a5c', 'mimosa', 'Mimosa A5c', 'Radio', [{ label: 'eth0', kind: 'ethernet' }]),
  M('gwn7600', 'grandstream', 'Grandstream GWN7600', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('aruba-ap535', 'aruba', 'Aruba AP-535', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),
  M('gen-ap', 'generic', 'Generic AP', 'Access Point', [{ label: 'eth0', kind: 'ethernet' }]),

  // ---------------- NVR / Camera / Server ----------------
  M('hk-nvr7616', 'hikvision', 'Hikvision DS-7616NI NVR', 'NVR', [...eth(2, 'eth', 1)]),
  M('hk-nvr7732', 'hikvision', 'Hikvision DS-7732NI NVR', 'NVR', [...eth(2, 'eth', 1)]),
  M('dahua-nvr4108', 'dahua', 'Dahua NVR4108', 'NVR', [{ label: 'eth0', kind: 'ethernet' }]),
  M('dahua-nvr5216', 'dahua', 'Dahua NVR5216', 'NVR', [...eth(2, 'eth', 1)]),
  M('unv-nvr302', 'uniview', 'Uniview NVR302-16', 'NVR', [{ label: 'eth0', kind: 'ethernet' }]),
  M('hk-ipc', 'hikvision', 'Hikvision IP Camera', 'IP Camera', [{ label: 'eth0', kind: 'ethernet' }]),
  M('dahua-ipc', 'dahua', 'Dahua IP Camera', 'IP Camera', [{ label: 'eth0', kind: 'ethernet' }]),
  M('gen-server', 'generic', 'Generic Server', 'Server', [...eth(2, 'nic', 0)]),
  M('gen-ont', 'generic', 'Generic ONU/ONT', 'ONU/ONT', [{ label: 'PON', kind: 'gpon' }, { label: 'LAN1', kind: 'ethernet' }]),
]

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]))
export const getModel = (id) => MODEL_MAP[id] || null
export const getModelsForVendor = (vendorId) => MODELS.filter((m) => m.vendor === vendorId)
export const getPorts = (modelId) => getModel(modelId)?.ports || []

// ---------------------------------------------------------------------------
// Vendors + device categories.
// Vendor "badges" are OUR OWN monogram marks (brand colour + short label) —
// not the official/copyrighted vendor logos.
// ---------------------------------------------------------------------------
import {
  Router, Network, Shield, Antenna, Boxes, Wifi, Cpu, Camera, Server, Shuffle, Cable, HardDrive,
} from 'lucide-react'

export const VENDORS = [
  { id: 'mikrotik', name: 'MikroTik', short: 'MK', color: '#293239' },
  { id: 'cisco', name: 'Cisco', short: 'CS', color: '#1BA0D7' },
  { id: 'ubiquiti', name: 'Ubiquiti / UniFi', short: 'UF', color: '#0559C9' },
  { id: 'netgear', name: 'Netgear', short: 'NG', color: '#6D28D9' },
  { id: 'tplink', name: 'TP-Link', short: 'TP', color: '#0EA5A4' },
  { id: 'tenda', name: 'Tenda', short: 'TD', color: '#16A34A' },
  { id: 'dlink', name: 'D-Link', short: 'DL', color: '#0369A1' },
  { id: 'ruijie', name: 'Ruijie', short: 'RJ', color: '#0B5FA5' },
  { id: 'huawei', name: 'Huawei', short: 'HW', color: '#C8102E' },
  { id: 'zte', name: 'ZTE', short: 'ZT', color: '#0057A8' },
  { id: 'bdcom', name: 'BDCOM', short: 'BD', color: '#E11D48' },
  { id: 'cdata', name: 'C-Data', short: 'CD', color: '#DC2626' },
  { id: 'vsol', name: 'V-SOL', short: 'VS', color: '#0EA5E9' },
  { id: 'fiberhome', name: 'FiberHome', short: 'FH', color: '#1D4ED8' },
  { id: 'raisecom', name: 'Raisecom', short: 'RC', color: '#1D4ED8' },
  { id: 'utstarcom', name: 'UTStarcom', short: 'UT', color: '#7C3AED' },
  { id: 'alcatel', name: 'Alcatel/Nokia', short: 'AL', color: '#FF6D00' },
  { id: 'juniper', name: 'Juniper', short: 'JN', color: '#84B135' },
  { id: 'aruba', name: 'Aruba', short: 'AR', color: '#F59E0B' },
  { id: 'fortinet', name: 'Fortinet', short: 'FT', color: '#DA291C' },
  { id: 'cambium', name: 'Cambium', short: 'CB', color: '#E4002B' },
  { id: 'mimosa', name: 'Mimosa', short: 'MM', color: '#0EA5E9' },
  { id: 'grandstream', name: 'Grandstream', short: 'GS', color: '#DC2626' },
  { id: 'hikvision', name: 'Hikvision', short: 'HK', color: '#E11D48' },
  { id: 'dahua', name: 'Dahua', short: 'DH', color: '#1E40AF' },
  { id: 'uniview', name: 'Uniview', short: 'UV', color: '#0891B2' },
  { id: 'netonix', name: 'Netonix', short: 'NX', color: '#334155' },
  { id: 'generic', name: 'Generic', short: 'GN', color: '#64748B' },
]

const VENDOR_MAP = Object.fromEntries(VENDORS.map((v) => [v.id, v]))
export const getVendor = (id) => VENDOR_MAP[id] || VENDOR_MAP.generic

export const CATEGORIES = [
  'Router', 'Switch', 'Firewall', 'OLT', 'ONU/ONT', 'Access Point', 'Radio',
  'Controller', 'NVR', 'IP Camera', 'Server', 'Load Balancer', 'Media Converter', 'Modem/NAS',
]

export const CATEGORY_ICONS = {
  Router,
  Switch: Network,
  Firewall: Shield,
  OLT: Antenna,
  'ONU/ONT': Boxes,
  'Access Point': Wifi,
  Radio: Wifi,
  Controller: Cpu,
  NVR: Camera,
  'IP Camera': Camera,
  Server: Server,
  'Load Balancer': Shuffle,
  'Media Converter': Cable,
  'Modem/NAS': HardDrive,
}

export const getCategoryIcon = (cat) => CATEGORY_ICONS[cat] || Server

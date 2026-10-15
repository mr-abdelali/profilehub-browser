#!/usr/bin/env node
// Puts a tested build at the top of manifest.json and makes it "latest". Keeps the newest
// KEEP versions (the app needs older ones only for Roll back).
//
//   node ci/add-version.mjs --version <v> --file <name.zip> --sha256 <hex> --size <bytes> --upstream <url>
import { readFileSync, writeFileSync } from 'node:fs'

const KEEP = 3
const REPO = 'mr-abdelali/profilehub-browser'
const args = process.argv.slice(2)
const option = (name) => {
  const index = args.indexOf(`--${name}`)
  const value = index >= 0 ? args[index + 1] : undefined
  if (!value) {
    console.error(`add-version: --${name} is missing`)
    process.exit(2)
  }
  return value
}

const version = option('version')
const file = option('file')
const sha256 = option('sha256').toLowerCase()
const size = Number(option('size'))
const upstream = option('upstream')
if (!/^\d{1,5}(\.\d{1,6}){1,3}$/.test(version)) throw new Error(`Bad version ${version}`)
if (!/^[\w.+-]+\.zip$/.test(file)) throw new Error(`Bad file name ${file}`)
if (!/^[0-9a-f]{64}$/.test(sha256)) throw new Error('Bad SHA-256')
if (!Number.isInteger(size) || size <= 0) throw new Error('Bad size')

const compare = (a, b) => {
  const x = a.split('.').map(Number)
  const y = b.split('.').map(Number)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0)
  }
  return 0
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
const entry = {
  version,
  date: new Date().toISOString().slice(0, 10),
  notes: `fingerprint-chromium ${version} (Chromium ${version.split('.')[0]}). Passed the automatic browser check.`,
  assets: [
    {
      platform: 'win32-x64',
      file,
      url: `https://github.com/${REPO}/releases/download/${version}/${file}`,
      mirrors: [upstream],
      sha256,
      size
    }
  ]
}
manifest.versions = [entry, ...manifest.versions.filter((item) => item.version !== version)]
  .sort((a, b) => compare(b.version, a.version))
  .slice(0, KEEP)
manifest.latest = manifest.versions[0].version
writeFileSync('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`manifest.json: latest ${manifest.latest}, versions ${manifest.versions.map((item) => item.version).join(', ')}`)

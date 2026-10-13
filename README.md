# ProfileHub Browser

Windows builds of [fingerprint-chromium](https://github.com/adryfish/fingerprint-chromium)
(ungoogled-chromium with fingerprint flags such as `--fingerprint=<seed>`), mirrored for the
ProfileHub desktop app. The app reads `manifest.json` from this repository, downloads the build
of the latest version, checks its SHA-256, and installs it to
`%APPDATA%\ProfileHub\browsers\<version>`.

The files are the upstream release files, unchanged. Nothing is rebuilt here.

## manifest.json

| Field                       | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `schema`                    | Format version. The app refuses a manifest with a newer schema.         |
| `latest`                    | The version new installs get. Must be one of `versions`.                |
| `versions[].version`        | Chromium version, e.g. `150.0.7871.186`. Also the release tag here.    |
| `versions[].assets[]`       | One file per platform (`win32-x64`).                                    |
| `assets[].url`              | The release file of this repository (tried first).                      |
| `assets[].mirrors`          | Other copies, tried in order. The first one is the upstream release.    |
| `assets[].sha256`, `size`   | Checked before anything is installed. A mismatch is never installed.    |

## Adding a version

1. Download the Windows ZIP of the new upstream release and compute its SHA-256
   (`certutil -hashfile file.zip SHA256` on Windows, `sha256sum file.zip` on Linux).
2. Add an entry to `versions` (newest first) with the upstream link as the first mirror, and
   point `latest` at it once the version has been tested on the fingerprint checking sites.
3. Push. The `Mirror browser builds` workflow downloads the file, checks the SHA-256 and attaches
   it to a release named after the version.

Until a version is mirrored here, the app downloads it from the upstream link in `mirrors` (the
SHA-256 check is the same).

### Turning on the mirror workflow (one time)

The workflow is stored as `ci/mirror.yml`, because the access token used by ProfileHub's
assistant may not create workflow files. To turn it on, open `ci/mirror.yml` on GitHub, click the
pencil (Edit), change the file name to `.github/workflows/mirror.yml`, and commit. GitHub then
runs it and publishes the release.

## License

fingerprint-chromium and ungoogled-chromium are BSD-3-Clause licensed (see [LICENSE](LICENSE)).
Chromium itself is BSD-3-Clause licensed by The Chromium Authors and includes third-party code
under other licenses; see `chrome://credits` in the browser.

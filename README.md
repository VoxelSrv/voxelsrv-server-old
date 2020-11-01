Official server software for VoxelSrv.

For game client, check this repo: https://github.com/VoxelSrv/voxelsrv

If you are interested with the project check out our [Discord server](https://discord.gg/K9PdsDh)!

## Requirements
- NodeJS 12+, npm and npx
- Some free disk space

## Instalation
* Create new directory
* Setup local npm package with `npm init`
* Install server with `npm i voxelsrv-server`
* Start it with `npx voxelsrv-server`

## Plugins
To install plugins you need to can them to `plugins` folder or just use `npm i pluginname`.
After it, add their name to config/config.json in to `plugins` array. If it is in `plugins` folder,
you need to prefix it with `local:`.
You can find plugins here: https://github.com/VoxelSrv/server-plugins
Hovewer most stuff you will need probably write your own.

## [Information about API can be found here](https://voxelsrv.github.io/voxelsrv-server/)

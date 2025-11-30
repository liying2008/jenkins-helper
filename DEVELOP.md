# Development Guide

## Environment requirements

- Windows 10 (Linux or macOS might work too, not tested).
- node v24.11.1 or higher.
- pnpm 10.24.0 or higher.

## Install dependencies

`pnpm install`

## Development and debugging

`pnpm dev`

and the generators are stored in the `dist` directory.

## Package Release

- for Chrome: `pnpm build`
- for Firefox: `pnpm build:firefox`

and manufactured products are stored in the `dist` directory.

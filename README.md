# CropYield AI

Weather-Based Crop Yield Prediction System built with React, TypeScript, Vite, Tailwind CSS, and a trained weighted K-Nearest Neighbors regression model.

## Requirements

- Node.js 20 or newer
- pnpm

## Run locally in VS Code

Open the extracted project folder in VS Code, open a terminal, and run:

```bash
corepack enable
pnpm install
pnpm dev
```

Open the local URL displayed by Vite, normally `http://localhost:5173`.

## Production build

```bash
pnpm build
pnpm preview
```

## Machine-learning files

- `public/crop-model.json` contains the trained model artifact used for live predictions.
- `src/data/modelData.ts` contains calculated model metrics, dataset metadata, chart data, feature encodings, and feature influence results.

The application performs real model inference in the browser. It does not return hard-coded prediction values.

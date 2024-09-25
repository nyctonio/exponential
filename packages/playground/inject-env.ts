import { Octokit, App } from 'octokit';
import sodium from 'libsodium-wrappers';
import { env } from 'env';
import fs from 'fs';

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: env.GH_TOKEN,
});

const owner = 'lifeasesolutions';
const repo = 'Alpen.Exponential';

let secrets = [];
for (const [key, value] of Object.entries(env)) {
  secrets.push({
    name: key,
    value,
  });
}

function generateEnvYAML() {
  let yamlString = `
---
name: Production CI
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  cache-and-install:
    runs-on: self-hosted
    env:
      TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: pnpm/action-setup@v2.0.1
        name: Install pnpm
        id: pnpm-install
        with:
          version: 7
          run_install: false
      - name: Get pnpm store directory
        id: pnpm-cache
        run: |
          echo "::set-output name=pnpm_cache_dir::$(pnpm store path)"
      - uses: actions/cache@v3
        name: Setup pnpm cache
        with:
          path: \${{ steps.pnpm-cache.outputs.pnpm_cache_dir }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
      - name: Install dependencies
        run: pnpm install
      - name: Create .env File
        run: >`;

  // Add each environment variable from the array to the YAML string
  secrets.forEach(({ name, value }) => {
    yamlString += `
          echo "${name}=\${{ secrets.${name} }}" >> .env
          `;
  });

  yamlString += `
      - name: Typescript Build
        run: pnpm build
      - name: Install pm2
        run: npm i pm2 -g
      - name: Start Pm2
        run: pm2 restart main
    `;
  return yamlString;
}

const getCurrentSecrets = async () => {
  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/secrets',
    {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  console.log('done', data);
};

const getPublicKey = async () => {
  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/secrets/public-key',
    {
      owner,
      repo,
    }
  );
  return data;
};

const setOrUpdateSecrets = async () => {
  console.log(secrets);
  const key = await getPublicKey();
  await Promise.all(
    secrets.map(async ({ name, value }) => {
      const encryptedVal = await encryptSecret(key, value);
      await octokit.request(
        'PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}',
        {
          owner,
          repo,
          secret_name: name,
          encrypted_value: encryptedVal,
          key_id: key.key_id,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
    })
  );
};

const encryptSecret = async (publicKey, value) => {
  const secret = value;
  const key = publicKey.key;
  //Check if libsodium is ready and then proceed.
  await sodium.ready;
  try {
    // Convert the secret and key to a Uint8Array.
    let binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    let binsec = sodium.from_string(secret);
    // Encrypt the secret using libsodium
    let encBytes = sodium.crypto_box_seal(binsec, binkey);
    // Convert the encrypted Uint8Array to Base64
    let output = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
    // Print the output
    return output;
  } catch (e) {
    // console.log('e',e)
    return null;
  }
};

fs.writeFileSync('../../.github/workflows/deployment.yml', generateEnvYAML());
setOrUpdateSecrets();

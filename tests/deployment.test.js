const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadModule(relativePath, dependencies, env = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const context = {
    exports: {},
    module: { exports: {} },
    process: { env },
    console: { log() {}, error() {}, warn() {} },
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  return context;
}

test('Thai Post token acquisition uses GET and reuses the returned token', async () => {
  let calls = 0;
  const axios = {
    async get(url, options) {
      calls++;
      assert.equal(url, 'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token');
      assert.equal(options.headers.Authorization, 'Token test-static-key');
      assert.ok(options.timeout > 0);
      return { data: { token: 'test-access-token' } };
    },
    async post() { assert.fail('Token endpoint rejects POST; use GET'); },
  };
  const context = loadModule('Backend/src/Controllers/shippingController.js', {
    axios,
    '../../prisma/prisma': {},
    cloudinary: { v2: {} },
    multer: () => ({}),
    'multer-storage-cloudinary': { CloudinaryStorage: class {} },
    '../utils/emailNotify': {},
  }, { TH_POST_API_KEY: 'test-static-key' });
  assert.equal(await context.exports.getThaiPostToken(), 'test-access-token');
  assert.equal(await context.exports.getThaiPostToken(), 'test-access-token');
  assert.equal(calls, 1);
});

test('Firebase can start with an environment credential without a local JSON file', () => {
  let initialized = false;
  const db = {};
  const serviceAccount = { project_id: 'demo-project', client_email: 'demo@example.test', private_key: 'test-key' };
  loadModule('Backend/src/utils/firebase.js', {
    'firebase-admin': {
      credential: {
        cert(account) {
          assert.equal(account.project_id, serviceAccount.project_id);
          assert.equal(account.private_key, serviceAccount.private_key);
          return 'test-credential';
        },
      },
      initializeApp(options) {
        assert.equal(options.credential, 'test-credential');
        initialized = true;
      },
      firestore() { assert.ok(initialized); return db; },
    },
  }, { FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify(serviceAccount) });
  assert.ok(initialized);
});

/* Behaviour tests for the site's JavaScript.
   No browser in this sandbox, so jsdom stands in for the DOM. It covers the
   widget logic and the three stats states; it cannot cover layout or fonts.

   node --test tests/
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
const app = readFileSync(join(here, '..', 'assets', 'app.js'), 'utf8');

function boot(fetchImpl) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://wuzzynizzy.github.io/' });
  const { window } = dom;
  window.fetch = fetchImpl;
  window.Intl = Intl;
  window.eval(app);
  return window;
}

const user = {
  public_repos: 2,
  followers: 0,
  created_at: '2026-10-24T01:52:57Z',
};
const repos = [
  { name: 'jAgent', html_url: 'https://github.com/wuzzynizzy/jAgent', language: 'Python', stargazers_count: 0, pushed_at: '2026-10-24T03:02:51Z', fork: false },
  { name: 'wuzzynizzy', html_url: 'https://github.com/wuzzynizzy/wuzzynizzy', language: null, stargazers_count: 0, pushed_at: '2026-10-24T03:13:20Z', fork: false },
];

const okFetch = async (url) => ({
  ok: true,
  status: 200,
  json: async () => (String(url).includes('/repos') ? repos : user),
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 25));

test('stars must be pressed in order, and the first one is accepted', async () => {
  const window = boot(okFetch);
  const buttons = [...window.document.querySelectorAll('.star')];
  const status = window.document.getElementById('star-status');

  buttons[0].click();
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  assert.match(status.textContent, /spec done/);
  window.close();
});

test('an out of order star resets the whole widget and says so', async () => {
  const window = boot(okFetch);
  const buttons = [...window.document.querySelectorAll('.star')];
  const status = window.document.getElementById('star-status');

  buttons[0].click();
  buttons[3].click();
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
  assert.match(status.textContent, /out of order/i);
  assert.equal(status.dataset.tone, 'bad');
  window.close();
});

test('all five in order finish the loop', async () => {
  const window = boot(okFetch);
  const buttons = [...window.document.querySelectorAll('.star')];
  buttons.forEach((button) => button.click());

  assert.ok(buttons.every((b) => b.getAttribute('aria-pressed') === 'true'));
  assert.equal(window.document.querySelector('.constellation').dataset.done, 'true');
  assert.match(window.document.getElementById('star-status').textContent, /ship/i);

  window.document.getElementById('star-reset').click();
  assert.ok(buttons.every((b) => b.getAttribute('aria-pressed') === 'false'));
  window.close();
});

test('stats render real numbers from the API payload', async () => {
  const window = boot(okFetch);
  await flush();
  const doc = window.document;

  assert.equal(doc.getElementById('stats').hidden, false);
  assert.equal(doc.getElementById('stat-repos').textContent, '2');
  assert.equal(doc.getElementById('stat-stars').textContent, '0');
  assert.equal(doc.getElementById('recent').children.length, 2);
  assert.match(doc.getElementById('recent').textContent, /jAgent/);
  assert.match(doc.getElementById('recent').textContent, /no language listed/);
  window.close();
});

test('a failed request shows an error and does not pretend to have data', async () => {
  const window = boot(async () => {
    throw new Error('network down');
  });
  await flush();
  const doc = window.document;

  assert.equal(doc.getElementById('stats').hidden, true);
  assert.match(doc.getElementById('stats-message').textContent, /network down/);
  assert.equal(doc.getElementById('stats-message').dataset.tone, 'bad');
  assert.equal(doc.getElementById('refresh').disabled, false);
  window.close();
});

test('rate limiting gets its own honest message', async () => {
  const window = boot(async () => ({ ok: false, status: 403, json: async () => ({}) }));
  await flush();
  assert.match(window.document.getElementById('stats-message').textContent, /rate limiting/i);
  window.close();
});

test('an empty repo list is handled without a blank page', async () => {
  const window = boot(async (url) => ({
    ok: true,
    status: 200,
    json: async () => (String(url).includes('/repos') ? [] : user),
  }));
  await flush();
  assert.match(window.document.getElementById('stats-message').textContent, /no public repos/i);
  assert.equal(window.document.getElementById('recent').hidden, true);
  window.close();
});

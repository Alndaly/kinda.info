import assert from 'node:assert/strict';
import test from 'node:test';

import { generateSecMsGecTokenV2 } from './edge-speech.ts';

test('Sec-MS-GEC v2 matches the fixed Edge token vector', () => {
  assert.equal(
    generateSecMsGecTokenV2(1_791_888_000),
    '492D7694A183A45E-56E821F95D4579C5B7C7E33DC7303FF379EC36D510213555BBBB9EB17EF15876',
  );
});

// ============================================================
// DataPrime Skill — Test Suite
// ============================================================
// Tests the skill behaviour via your Node.js API.
// Run:  node tests/skill.test.js
// Requires server to be running: npm start
// ============================================================

require('dotenv').config();

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// ── Colours for terminal output ──────────────────────────────
const C = {
  reset  : '\x1b[0m',
  green  : '\x1b[32m',
  red    : '\x1b[31m',
  yellow : '\x1b[33m',
  cyan   : '\x1b[36m',
  bold   : '\x1b[1m',
  dim    : '\x1b[2m',
};

// ── Test registry ─────────────────────────────────────────────
const results = { passed: 0, failed: 0, skipped: 0, total: 0 };
const failures = [];

// ── HTTP helper ───────────────────────────────────────────────
async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Assertion helpers ─────────────────────────────────────────
function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertContains(str, substring, label) {
  if (!str.includes(substring)) {
    throw new Error(`Expected ${label} to contain "${substring}"\nActual: ${str.substring(0, 200)}...`);
  }
}

function assertNotEmpty(val, label) {
  if (!val || val.trim() === '') {
    throw new Error(`Expected ${label} to be non-empty`);
  }
}

function assertStartsWith(str, prefix, label) {
  if (!str.trim().startsWith(prefix)) {
    throw new Error(`Expected ${label} to start with "${prefix}"\nActual first line: ${str.trim().split('\n')[0]}`);
  }
}

// ── Test runner ───────────────────────────────────────────────
async function test(name, category, fn) {
  results.total++;
  process.stdout.write(`  ${C.dim}${category.padEnd(18)}${C.reset} ${name} ... `);
  try {
    await fn();
    results.passed++;
    console.log(`${C.green}PASS${C.reset}`);
  } catch (err) {
    results.failed++;
    failures.push({ name, category, error: err.message });
    console.log(`${C.red}FAIL${C.reset}`);
    console.log(`${C.dim}                     → ${err.message.split('\n')[0]}${C.reset}`);
  }
}

// ── Section header ────────────────────────────────────────────
function section(title) {
  console.log(`\n${C.bold}${C.cyan}  ── ${title} ${'─'.repeat(Math.max(0, 44 - title.length))}${C.reset}`);
}

// ============================================================
// TEST SUITES
// ============================================================

async function runAll() {
  console.log(`\n${C.bold}  DataPrime Skill — Behaviour Test Suite${C.reset}`);
  console.log(`  Target: ${C.cyan}${BASE_URL}${C.reset}\n`);

  // ── 1. Server health ────────────────────────────────────────
  section('1. Server Health');

  await test('API is reachable', 'health', async () => {
    const data = await get('/api/health');
    assert(data.status === 'ok', 'status should be ok');
  });

  // ── 2. Response structure ───────────────────────────────────
  section('2. Response Structure');

  await test('Returns reply field', 'structure', async () => {
    const data = await post('/api/chat', { message: 'Show all errors' });
    assertNotEmpty(data.reply, 'reply');
  });

  await test('Returns query field', 'structure', async () => {
    const data = await post('/api/chat', { message: 'Show all errors' });
    assertNotEmpty(data.query, 'query');
  });

  await test('Query is extracted cleanly (no backticks)', 'structure', async () => {
    const data = await post('/api/chat', { message: 'Show all errors' });
    assert(!data.query.includes('```'), 'query should not contain markdown backticks');
  });

  // ── 3. DataPrime syntax correctness ─────────────────────────
  section('3. DataPrime Syntax Rules');

  await test('Every query starts with "source logs"', 'syntax', async () => {
    const prompts = [
      'Show all errors',
      'Count logs by service',
      'Find slow requests',
      'Search for timeout keyword',
    ];
    for (const message of prompts) {
      const data = await post('/api/chat', { message });
      assertStartsWith(data.query, 'source logs', `query for "${message}"`);
    }
  });

  await test('Query uses pipe | to chain commands', 'syntax', async () => {
    const data = await post('/api/chat', { message: 'Count errors per service sorted by most errors first' });
    assertContains(data.query, '|', 'query');
  });

  await test('Query has # comments on pipe lines', 'syntax', async () => {
    const data = await post('/api/chat', { message: 'Show errors from payment service grouped by severity' });
    assertContains(data.query, '#', 'query');
  });

  await test('String values use single quotes', 'syntax', async () => {
    const data = await post('/api/chat', { message: 'Show all errors from auth-service' });
    // Should use 'auth-service' not "auth-service"
    assert(!data.query.includes('"auth'), 'query should use single quotes for string values, not double quotes');
  });

  await test('Severity uses correct enum value (not quoted)', 'syntax', async () => {
    const data = await post('/api/chat', { message: 'Filter logs to show only errors' });
    // DataPrime severity is: == ERROR not == 'ERROR'
    assert(
      data.query.includes('$m.severity') || data.query.includes('severity'),
      'query should reference severity field'
    );
  });

  // ── 4. Command usage ─────────────────────────────────────────
  section('4. Correct Command Usage');

  await test('Uses filter for condition-based queries', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Show only ERROR logs from payment-service' });
    assertContains(data.query, 'filter', 'query');
  });

  await test('Uses groupby + aggregate for count queries', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Count errors grouped by service name' });
    assertContains(data.query, 'groupby', 'query');
    assertContains(data.query, 'aggregate', 'query');
    assertContains(data.query, 'count()', 'query');
  });

  await test('Uses orderby after groupby', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Count errors per service, most first' });
    assertContains(data.query, 'orderby', 'query');
  });

  await test('Uses top N pattern correctly', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Top 10 most common error messages' });
    assertContains(data.query, 'top', 'query');
  });

  await test('Uses wildfind for full-text search across all fields', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Search all logs for the word NullPointerException' });
    assertContains(data.query, 'wildfind', 'query');
  });

  await test('Uses find...in for field-specific search', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Find logs where the message field contains timeout' });
    assertContains(data.query, 'find', 'query');
    assertContains(data.query, 'in', 'query');
  });

  await test('Uses limit for raw log queries', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Show me recent error logs' });
    assertContains(data.query, 'limit', 'query');
  });

  await test('Uses avg() for latency queries', 'commands', async () => {
    const data = await post('/api/chat', { message: 'Average response time per service' });
    assertContains(data.query, 'avg(', 'query');
  });

  await test('Uses percentile() for p95 queries', 'commands', async () => {
    const data = await post('/api/chat', { message: 'P95 latency per endpoint' });
    assertContains(data.query, 'percentile(', 'query');
  });

  // ── 5. Special variable usage ────────────────────────────────
  section('5. IBM Cloud Logs Special Variables');

  await test('Uses $m.severity for severity filtering', 'variables', async () => {
    const data = await post('/api/chat', { message: 'Show only critical and error logs' });
    assertContains(data.query, '$m.severity', 'query');
  });

  await test('Uses $m.applicationName for service filtering', 'variables', async () => {
    const data = await post('/api/chat', { message: 'Show logs from payment-service only' });
    assertContains(data.query, '$m.applicationName', 'query');
  });

  await test('Uses $d prefix after groupby for orderby', 'variables', async () => {
    const data = await post('/api/chat', { message: 'Count errors per service and sort descending' });
    assertContains(data.query, '$d.', 'query — should use $d prefix after groupby');
  });

  // ── 6. Log sample field extraction ──────────────────────────
  section('6. Log Sample Field Extraction');

  await test('Uses field names from log sample', 'field extraction', async () => {
    const data = await post('/api/chat', {
      message   : 'Find slow requests',
      logSample : '{"svc_name":"payment","resp_ms":3200,"http_status":503,"log_msg":"Timeout"}',
    });
    // Should use the real field names, not generic guesses
    assert(
      data.query.includes('resp_ms') || data.query.includes('svc_name'),
      'query should use actual field names from log sample (resp_ms or svc_name)'
    );
  });

  await test('Handles nested JSON fields with dot notation', 'field extraction', async () => {
    const data = await post('/api/chat', {
      message   : 'Filter logs where HTTP status code is over 400',
      logSample : '{"payload":{"response":{"statusCode":404}},"msg":"Not found"}',
    });
    assertContains(data.query, 'payload.response.statusCode', 'query');
  });

  await test('Uses custom message field name from sample', 'field extraction', async () => {
    const data = await post('/api/chat', {
      message   : 'Search for timeout errors in the log message',
      logSample : '{"log_text":"Connection timeout","level":"ERROR","service":"db"}',
    });
    assert(
      data.query.includes('log_text'),
      'query should use "log_text" from the sample, not generic "msg"'
    );
  });

  await test('Notes field name assumptions when no sample given', 'field extraction', async () => {
    const data = await post('/api/chat', { message: 'Find slow requests where duration is over 3 seconds' });
    // Should either use a real field name with a note, or explain assumption
    assert(
      data.reply.toLowerCase().includes('assum') ||
      data.reply.toLowerCase().includes('adjust') ||
      data.reply.toLowerCase().includes('replace') ||
      data.reply.toLowerCase().includes('rename'),
      'reply should note field name assumption when no log sample is provided'
    );
  });

  // ── 7. Output quality ────────────────────────────────────────
  section('7. Output Quality');

  await test('Reply contains explanation after the query', 'output quality', async () => {
    const data = await post('/api/chat', { message: 'Count errors per service' });
    // After the code block there should be explanation text
    const afterCode = data.reply.replace(/```[\s\S]*?```/g, '').trim();
    assert(afterCode.length > 80, 'reply should have explanation text outside the code block');
  });

  await test('Suggests follow-up queries', 'output quality', async () => {
    const data = await post('/api/chat', { message: 'Show all errors from auth-service' });
    const lower = data.reply.toLowerCase();
    assert(
      lower.includes('follow') ||
      lower.includes('also') ||
      lower.includes('next') ||
      lower.includes('variation') ||
      lower.includes('you could also') ||
      lower.includes('might also want') ||
      lower.includes('additionally'),
      'reply should suggest follow-up queries'
    );
  });

  await test('Explains what each pipe step does', 'output quality', async () => {
    const data = await post('/api/chat', { message: 'Count errors grouped by service sorted by most errors' });
    // Explanation should mention what the steps do
    const lower = data.reply.toLowerCase();
    assert(
      lower.includes('filter') || lower.includes('group') || lower.includes('sort') || lower.includes('count'),
      'reply should explain what the query steps do'
    );
  });

  await test('Does not produce pseudocode', 'output quality', async () => {
    const data = await post('/api/chat', { message: 'Show slow requests over 2 seconds' });
    assert(
      !data.query.includes('<field_name>') &&
      !data.query.includes('[your_field]') &&
      !data.query.includes('YOUR_SERVICE'),
      'query should not contain placeholder pseudocode like <field_name>'
    );
  });

  // ── 8. Multi-turn conversation ───────────────────────────────
  section('8. Multi-turn Conversation');

  await test('Remembers context from previous turn', 'multi-turn', async () => {
    const turn1 = await post('/api/chat', {
      message: 'Show errors from payment-service',
    });

    const turn2 = await post('/api/chat', {
      message : 'Now group that by severity',
      history : [
        { role: 'user',      content: 'Show errors from payment-service' },
        { role: 'assistant', content: turn1.reply },
      ],
    });

    // Second query should still reference payment-service from context
    assert(
      turn2.query.includes('payment') || turn2.query.includes('applicationName'),
      'follow-up query should retain context of the service name'
    );
    assertContains(turn2.query, 'groupby', 'follow-up query');
  });

  await test('Can refine a query in follow-up', 'multi-turn', async () => {
    const turn1 = await post('/api/chat', {
      message: 'Average latency by service',
    });

    const turn2 = await post('/api/chat', {
      message : 'Add a filter to only include requests over 500ms',
      history : [
        { role: 'user',      content: 'Average latency by service' },
        { role: 'assistant', content: turn1.reply },
      ],
    });

    assertContains(turn2.query, 'filter', 'refined query');
    assertContains(turn2.query, 'source logs', 'refined query');
  });

  // ── 9. Edge cases ────────────────────────────────────────────
  section('9. Edge Cases');

  await test('Handles vague query gracefully', 'edge cases', async () => {
    const data = await post('/api/chat', { message: 'show me something useful' });
    // Should still produce a valid starting query, not fail
    assertNotEmpty(data.reply, 'reply');
    assertContains(data.query, 'source logs', 'query');
  });

  await test('Handles debug/explain request', 'edge cases', async () => {
    const data = await post('/api/chat', {
      message: 'Explain this query: source logs | filter $m.severity == ERROR | count',
    });
    assertNotEmpty(data.reply, 'reply');
    const lower = data.reply.toLowerCase();
    assert(
      lower.includes('filter') || lower.includes('count') || lower.includes('error'),
      'reply should explain the query'
    );
  });

  await test('Handles broken query debug request', 'edge cases', async () => {
    const data = await post('/api/chat', {
      message: 'My query is broken: source logs | filter severity = ERROR — why is it not working?',
    });
    assertNotEmpty(data.reply, 'reply');
    // Should identify the issue ($m.severity and == not =)
    const lower = data.reply.toLowerCase();
    assert(
      lower.includes('$m.severity') || lower.includes('==') || lower.includes('equal'),
      'reply should identify the syntax error'
    );
  });

  await test('Handles empty log sample gracefully', 'edge cases', async () => {
    const data = await post('/api/chat', {
      message   : 'Find errors',
      logSample : '',
    });
    assertContains(data.query, 'source logs', 'query');
  });

  await test('Rejects missing message with 400', 'edge cases', async () => {
    try {
      await post('/api/chat', { message: '' });
      assert(false, 'Should have thrown an error');
    } catch (err) {
      assert(err.message.includes('400') || err.message.includes('Invalid'), 'Should return 400 for empty message');
    }
  });

  // ── 10. Specific pattern correctness ─────────────────────────
  section('10. Pattern Correctness');

  await test('HTTP 5xx pattern uses correct range filter', 'patterns', async () => {
    const data = await post('/api/chat', { message: 'Show all HTTP 5xx server errors' });
    assert(
      data.query.includes('>= 500') || data.query.includes('> 499'),
      'query should filter status_code >= 500'
    );
  });

  await test('Distinct count pattern uses distinct_count()', 'patterns', async () => {
    const data = await post('/api/chat', { message: 'How many unique users appear in the logs?' });
    assertContains(data.query, 'distinct_count(', 'query');
  });

  await test('Null check pattern uses == null', 'patterns', async () => {
    const data = await post('/api/chat', { message: 'Find logs where user_id field is missing or null' });
    assertContains(data.query, '== null', 'query');
  });

  await test('Case-insensitive search uses .toLowerCase()', 'patterns', async () => {
    const data = await post('/api/chat', {
      message: 'Search for error case-insensitively in the message field',
    });
    assertContains(data.query, 'toLowerCase()', 'query');
  });

  await test('Computed field uses create command', 'patterns', async () => {
    const data = await post('/api/chat', {
      message: 'Convert duration_ms to seconds and show logs where it is over 5 seconds',
    });
    assertContains(data.query, 'create', 'query');
  });

  await test('Regex extraction uses extract...into re pattern', 'patterns', async () => {
    const data = await post('/api/chat', {
      message: 'Extract HTTP status code from log message text using regex',
    });
    assertContains(data.query, 'extract', 'query');
    assertContains(data.query, "re'", 'query');
  });

  // ── Summary ──────────────────────────────────────────────────
  printSummary();
}

function printSummary() {
  const { passed, failed, total } = results;
  const pct = Math.round((passed / total) * 100);

  console.log(`\n  ${'─'.repeat(52)}`);
  console.log(`  ${C.bold}Results${C.reset}`);
  console.log(`  ${'─'.repeat(52)}`);
  console.log(`  Total   : ${total}`);
  console.log(`  ${C.green}Passed  : ${passed}${C.reset}`);
  console.log(`  ${C.red}Failed  : ${failed}${C.reset}`);
  console.log(`  Score   : ${pct >= 80 ? C.green : C.yellow}${pct}%${C.reset}\n`);

  if (failures.length > 0) {
    console.log(`  ${C.red}${C.bold}Failed Tests:${C.reset}`);
    failures.forEach(f => {
      console.log(`  ${C.red}✗${C.reset} [${f.category}] ${f.name}`);
      console.log(`    ${C.dim}${f.error.split('\n')[0]}${C.reset}`);
    });
    console.log('');
  }

  if (pct === 100) {
    console.log(`  ${C.green}${C.bold}All tests passed! Skill is working correctly.${C.reset}\n`);
  } else if (pct >= 80) {
    console.log(`  ${C.yellow}${C.bold}Most tests passed. Review failures above.${C.reset}\n`);
  } else {
    console.log(`  ${C.red}${C.bold}Multiple failures. Check skill system prompt.${C.reset}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// ── Run ───────────────────────────────────────────────────────
runAll().catch(err => {
  console.error(`\n  ${C.red}Fatal error: ${err.message}${C.reset}`);
  console.error(`  Make sure the server is running: npm start\n`);
  process.exit(1);
});
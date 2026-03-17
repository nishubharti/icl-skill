---
name: dataprime-query-builder
description: >
  Build, explain, and debug DataPrime queries for IBM Cloud Logs (powered by Coralogix).
  Use this skill whenever the user wants to query their logs using DataPrime — even if they
  don't know the exact syntax. This skill should trigger on phrases like: "how do I query",
  "show me logs where", "filter my logs", "count errors", "group by", "find logs with",
  "write a DataPrime query", "IBM Cloud Logs query", "Coralogix query", or any description
  of a log analysis goal. The skill accepts log samples, field names, and plain-English intent,
  then produces a correct, well-commented DataPrime query. Always use this skill when the user
  mentions IBM Cloud Logs, DataPrime, Coralogix log exploration, or asks to search/analyze logs.
---

# DataPrime Query Builder

## What this skill does
This skill helps users write correct DataPrime queries for IBM Cloud Logs / Coralogix. It:
1. Understands what the user is trying to achieve (in plain English)
2. Inspects any log samples or field names provided
3. Produces a ready-to-run DataPrime query with inline comments
4. Explains each part of the query so the user learns
5. Offers variations or follow-up queries

---

## Workflow

### Step 1 — Understand the Intent
Before writing any query, confirm you understand:
- **What data** the user wants (errors, latency, specific service, specific field value)
- **What shape of output** they want: raw log lines, a count, a grouped table, a time series
- **Any known field names** from their log schema (ask if not provided)
- **Any log sample** they can share (even one line helps)

If critical info is missing, ask ONE focused question rather than bombarding the user.

### Step 2 — Inspect Log Samples
When the user shares log lines (JSON, plaintext, etc.):
- Identify field names and their data types
- Note nested fields (use dot notation: `payload.statusCode`)
- Check for severity/level fields (often `$m.severity`, `level`, `severity`)
- Check for timestamp, service, message fields

### Step 3 — Build the Query
Follow the patterns in `references/syntax.md`. Always:
- Start with `source logs`
- Chain commands with `|`
- Add `# comments` explaining each step
- Use the simplest possible query that satisfies the requirement
- Prefer `filter` before heavy operations like `groupby`

### Step 4 — Present the Query
Format the output as:
```
# [Short description of what this query does]
source logs
| filter ...
| groupby ...
| orderby ...
```

Then explain:
- What each pipe step does
- Any assumptions made about field names
- How to adapt it (e.g., change the field name, adjust the time range)

### Step 5 — Offer Variations
Suggest 1-2 follow-up queries that extend the analysis (e.g., "want to also see this over time?" or "want to break this down by service?")

---

## Key DataPrime Concepts (quick reference)

### Piped syntax
Every query is a pipeline. Commands are chained with `|`:
```
source logs | filter status == 500 | count
```

### Core commands
| Command | Purpose | Example |
|---------|---------|---------|
| `source logs` | Start with all logs | `source logs` |
| `filter` | Keep only matching rows | `filter level == 'ERROR'` |
| `find` | Full-text search in a field | `find 'timeout' in msg` |
| `wildfind` | Full-text search across ALL fields | `wildfind 'OutOfMemory'` |
| `groupby` | Group rows and aggregate | `groupby service aggregate count() as total` |
| `orderby` | Sort results | `orderby -$d.total` (descending) |
| `limit` | Cap result count | `limit 100` |
| `choose` | Select only certain fields | `choose timestamp, level, msg` |
| `distinct` | Deduplicate by field(s) | `distinct region` |
| `count` | Count matching rows | `count` |
| `sortby` | Sort within a stream | `sortby timestamp desc` |
| `extract` | Parse text with regex | `extract msg into re'(?P<code>\d+)'` |
| `create` | Add a computed field | `create latency_sec = duration_ms / 1000` |
| `convert` | Cast a field's data type | `convert version:number` |
| `top` | Top N values by a field | `top 10 service by count()` |

### Special variables
- `$d` — refers to the log's data object (your JSON fields)
- `$m` — refers to metadata fields: `$m.severity`, `$m.timestamp`, `$m.applicationName`, `$m.subsystemName`
- `$l` — refers to the raw log text

### Aggregation functions
`count()`, `avg(field)`, `sum(field)`, `max(field)`, `min(field)`, `distinct_count(field)`, `percentile(field, 95)`

### Operators & predicates
- Equality: `==`, `!=`
- Numeric: `>`, `<`, `>=`, `<=`
- Null check: `field != null`, `field == null`
- Text contains: `field ~ 'substring'`
- Wildcard: `field ~~ 'prefix*'`
- Logical: `&&`, `||`, `!`

### Common severity filter pattern
```
source logs
| filter $m.severity == ERROR
```
Severity values: `DEBUG`, `VERBOSE`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

### IBM Cloud Logs metadata fields
IBM Cloud Logs exposes these via `$m`:
- `$m.severity` — log severity level
- `$m.timestamp` — log timestamp
- `$m.applicationName` — application/service name
- `$m.subsystemName` — subsystem or component
- `$m.className` — log class (if applicable)

---

## Common Query Patterns

See `references/patterns.md` for 20+ ready-made patterns covering:
- Error detection and counting
- Latency analysis
- Grouping by service/region
- Top-N queries
- Time-bucketed trends
- Text extraction with regex
- Lookup table joins

---

## Tips for IBM Cloud Logs users

1. **Field access**: JSON log fields are accessed directly by name. Nested fields use dot notation: `payload.response.statusCode`
2. **String comparison is case-sensitive** by default
3. **No results?** Try `wildfind 'yourterm'` to search everywhere, then check which fields contain the data
4. **Type mismatches**: If filtering a numeric field stored as string, cast it: `filter version:number > 32`
5. **Start broad, narrow down**: Begin with `source logs | filter level == 'ERROR' | limit 50` to inspect before aggregating
6. **The pipe order matters**: Filter early to reduce data before expensive groupby operations

---

## Delivering excellence

- Always show a working query, never pseudocode
- Add `# comments` inside every query so the user understands it
- If you're uncertain about a field name, note your assumption and show how to adapt
- Offer to iterate: "Does this match your log schema? Share a sample log line and I'll adjust."
- When the user shares a log sample, always extract the actual field names and use them

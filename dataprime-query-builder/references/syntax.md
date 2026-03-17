# DataPrime Syntax Reference

Detailed syntax rules and edge cases for query building.

---

## Pipeline structure

```
source <data_source>
| command1 [args]
| command2 [args]
| ...
```

- `source logs` is the standard starting point for IBM Cloud Logs
- Each `|` passes the output stream to the next command
- Commands are case-sensitive (lowercase)
- String literals use single quotes: `'value'`

---

## filter

**Syntax**: `filter <expression>`

Keeps only rows where the expression is true.

```
# Simple equality
| filter level == 'ERROR'

# Numeric comparison
| filter status_code >= 500

# Null check
| filter user_id != null

# String contains (case-sensitive)
| filter msg ~ 'connection refused'

# Wildcard match
| filter service ~~ 'payment*'

# Combined conditions
| filter level == 'ERROR' && region == 'us-east-1'

# OR condition
| filter level == 'ERROR' || level == 'CRITICAL'

# Negation
| filter !(level == 'DEBUG')
```

---

## find

**Syntax**: `find '<text>' in <field>`

Performs substring search in a specific field.

```
| find 'NullPointerException' in stacktrace
| find 'timeout' in msg
```

---

## wildfind

**Syntax**: `wildfind '<text>'`

Searches across ALL fields. Slower but useful for exploration.

```
| wildfind 'OutOfMemoryError'
| wildfind '503'
```

---

## groupby + aggregate

**Syntax**: `groupby <field1>[, <field2>...] aggregate <agg_func> as <alias>`

```
# Count per group
| groupby service aggregate count() as total

# Multiple aggregations
| groupby service aggregate count() as total, avg(duration_ms) as avg_ms

# Multiple groupby keys
| groupby service, region aggregate count() as total

# Rename the groupby key
| groupby $m.applicationName as app_name aggregate count() as total
```

**Aggregation functions**:
- `count()` — number of rows
- `avg(field)` — mean value
- `sum(field)` — total
- `max(field)` — maximum
- `min(field)` — minimum
- `distinct_count(field)` — unique value count
- `percentile(field, N)` — Nth percentile (e.g. `percentile(duration_ms, 95)`)

---

## orderby

**Syntax**: `orderby <field> [asc|desc]`

Prefix with `-` for descending:

```
| orderby -$d.count         # descending (high to low)
| orderby $m.timestamp      # ascending (oldest first)
| orderby $d.avg_ms desc    # explicit descending
```

---

## top

**Syntax**: `top <N> <field> by <agg_func>`

```
| top 10 service by count()
| top 5 endpoint by avg(duration_ms)
```

---

## limit

**Syntax**: `limit <N>`

Caps the number of output rows. Always use during exploration.

```
| limit 100
```

---

## choose

**Syntax**: `choose <field1>[, <field2>...]`

Projects (selects) only specified fields — reduces noise in results.

```
| choose $m.timestamp, $m.applicationName, status_code, msg
| choose $d.service, $d.count    # after groupby, use $d prefix
```

---

## distinct

**Syntax**: `distinct <field1>[, <field2>...]`

Returns unique combinations of specified fields.

```
| distinct region
| distinct service, region
```

---

## count

**Syntax**: `count`

Returns a single number — total matching rows.

```
source logs | filter $m.severity == ERROR | count
```

---

## create

**Syntax**: `create <new_field> = <expression>`

Adds a computed field to each row.

```
| create duration_sec = duration_ms / 1000.0
| create is_slow = duration_ms > 2000
| create full_name = first_name + ' ' + last_name
```

---

## convert

**Syntax**: `convert <field>:<type>`

Casts a field to a different type. Useful when JSON stores numbers as strings.

**Types**: `number`, `string`, `bool`, `timestamp`

```
| convert status_code:number
| filter status_code > 400    # now works as numeric comparison
```

Or inline cast without modifying the stream:

```
| filter status_code:number > 400
```

---

## extract

**Syntax**: `extract <field> into re'<regex_with_named_groups>'`

Parses unstructured text into named fields.

```
# Extract from a log line like: "duration=234ms status=200"
| extract msg into re'duration=(?P<dur_ms>\d+)ms status=(?P<status_code>\d+)'
| filter dur_ms:number > 1000
```

---

## sortby

**Syntax**: `sortby <field> [asc|desc]`

Sorts the full result stream (use `orderby` after aggregation).

```
| sortby $m.timestamp desc
```

---

## String methods (on fields)

```
.toLowerCase()    # lowercase the field value
.toUpperCase()    # uppercase
.length()         # string length
.trim()           # strip whitespace
.contains('str')  # boolean check
.startsWith('str')
.endsWith('str')
```

Example:
```
| filter msg.toLowerCase() ~ 'error'
```

---

## Special variables

| Variable | Meaning |
|----------|---------|
| `$d` | The log's data (your JSON fields) |
| `$m` | Metadata fields |
| `$l` | Raw log text string |
| `$m.severity` | Severity level enum |
| `$m.timestamp` | Unix timestamp in milliseconds |
| `$m.applicationName` | Application name |
| `$m.subsystemName` | Subsystem/component name |
| `$m.className` | Log class |

**Severity enum values**: `DEBUG`, `VERBOSE`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

---

## Common mistakes and fixes

| Mistake | Fix |
|---------|-----|
| Comparing number stored as string | Use `field:number > 0` or `convert field:number` first |
| Case-sensitive text search missing results | Use `field.toLowerCase() ~ 'term'` |
| `orderby` on raw field after `groupby` | After groupby, reference aggregated fields as `$d.alias` |
| Missing pipe `|` between commands | Every command must be separated by `|` |
| No results at all | Try `wildfind 'keyword'` to see if data exists; check time range |
| Nested field not found | Use dot notation: `payload.user.id`; verify field name with `source logs \| limit 5` first |

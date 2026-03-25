# IBM Cloud Logs CLI Reference

## Query Command

### Basic Syntax
```bash
ibmcloud cloud-logs query [OPTIONS]
```

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `--query` | Query string to execute | `"applicationName:myapp"` |
| `--syntax` | Query syntax (lucene or dataprime) | `lucene` |
| `--service-url` | IBM Cloud Logs instance URL | `https://<instance-id>.api.<region>.logs.cloud.ibm.com` |
| `--start-date` | Start time in UTC (ISO 8601) | `2026-03-08T00:00:00Z` |
| `--end-date` | End time in UTC (ISO 8601) | `2026-03-09T11:41:30Z` |

### Optional Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--output` | Output format (json, yaml, table) | `table` |
| `--limit` | Maximum number of results | `100` |
| `--tier` | Log tier (archive, frequent_search) | `archive` |

## Query Syntax Types

### Lucene Syntax

**Field-based queries:**
```bash
# Single field
applicationName:myapp

# Multiple fields with AND
applicationName:myapp AND severity:error

# Multiple fields with OR
applicationName:myapp OR applicationName:yourapp

# Wildcards
applicationName:my*
applicationName:*app

# Range queries
severity:>=5
timestamp:[2026-03-08 TO 2026-03-09]

# Phrase search
"exact error message"

# NOT operator
NOT applicationName:test
```

**Common fields:**
- `applicationName` - Application/namespace name
- `subsystemName` - Subsystem/component name
- `severity` - Log severity (1-6)
- `message` - Log message text
- `timestamp` - Log timestamp

### DataPrime Syntax

**Basic structure:**
```bash
source logs | filter <condition> | limit <n>
```

**Field prefixes:**
- `$l.` - Labels (applicationname, subsystemname, etc.)
- `$m.` - Metadata (severity, timestamp, priority)
- `$d.` - Data fields (JSON fields from log content)

**Examples:**
```bash
# Simple filter
source logs | filter $l.applicationname == 'myapp'

# Multiple conditions
source logs | filter $l.applicationname == 'myapp' && $m.severity >= 5

# String functions
source logs | filter $d.message.contains('error')

# Aggregations
source logs | filter $m.severity >= 5 | groupby $l.applicationname | aggregate count()
```

## Time Range Formats

### ISO 8601 UTC Format (Required)
```bash
# Format: YYYY-MM-DDTHH:MM:SSZ
2026-03-08T00:00:00Z  # Midnight UTC
2026-03-09T11:41:30Z  # 11:41:30 AM UTC
```

### Generating UTC Timestamps

**macOS/Linux:**
```bash
# Current time
date -u +%Y-%m-%dT%H:%M:%SZ

# 1 hour ago
date -u -v-1H +%Y-%m-%dT%H:%M:%SZ

# 24 hours ago
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ

# 7 days ago
date -u -v-7d +%Y-%m-%dT%H:%M:%SZ
```

**Convert local to UTC:**
```bash
# From local time string
date -u -j -f "%Y-%m-%d %H:%M:%S" "2026-03-08 00:00:00" +%Y-%m-%dT%H:%M:%SZ
```

## Complete Examples

### Example 1: Simple Application Query
```bash
ibmcloud cloud-logs query \
  --query "applicationName:api-gateway" \
  --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T00:00:00Z \
  --output json
```

### Example 2: Error Logs with Severity
```bash
ibmcloud cloud-logs query \
  --query "applicationName:myapp AND severity:>=5" \
  --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date $(date -u -v-24H +%Y-%m-%dT%H:%M:%SZ) \
  --end-date $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --limit 500
```

### Example 3: DataPrime Query
```bash
ibmcloud cloud-logs query \
  --query "source logs | filter \$l.applicationname == 'myapp' && \$m.severity >= 5 | limit 100" \
  --syntax dataprime \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T00:00:00Z
```

### Example 4: Wildcard Search
```bash
ibmcloud cloud-logs query \
  --query "applicationName:bm-server-*" \
  --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T00:00:00Z
```

## Authentication

### API Key
```bash
# Set API key
export IBMCLOUD_API_KEY=<your-api-key>

# Or login interactively
ibmcloud login --apikey <your-api-key>

# Verify authentication
ibmcloud target
```

### Service URL Discovery
```bash
# List Cloud Logs instances
ibmcloud resource service-instances --service-name logs

# Get instance details
ibmcloud resource service-instance <instance-name> --output json

# Extract service URL
ibmcloud resource service-instance <instance-name> --output json | \
  jq -r '.extensions.endpoints.public'
```

## Error Handling

### Common Errors

**401 Unauthorized:**
```bash
# Solution: Re-authenticate
ibmcloud login --apikey <your-api-key>
```

**400 Bad Request:**
```bash
# Solution: Check query syntax and parameters
# Verify timestamps are in UTC with Z suffix
# Validate query syntax in UI first
```

**Empty Results:**
```bash
# Solution: Follow troubleshooting workflow
# 1. Verify query in UI
# 2. Check time range
# 3. Validate query syntax
# 4. Test with simpler query
```

## Best Practices

1. **Always test queries in UI first** before using CLI
2. **Use UTC timestamps** with Z suffix
3. **Start with simple queries** and add complexity
4. **Use field-specific searches** (applicationName:value) instead of plain text
5. **Enable JSON output** for debugging: `--output json`
6. **Use reasonable time ranges** (avoid querying months of data)
7. **Set appropriate limits** to avoid overwhelming responses
8. **Verify service URL** from instance details

## Official Documentation

- [IBM Cloud Logs CLI Reference](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-cloud-logs-cli-temp)
- [Query Data Guide](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-query-data&interface=ui)
- [DataPrime Query Language](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-dataprime-reference)
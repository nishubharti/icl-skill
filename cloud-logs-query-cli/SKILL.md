---
name: IBM Cloud Logs CLI Query Troubleshooter
slug: cloud-logs-cli-troubleshoot
description: Diagnose and resolve IBM Cloud Logs CLI query issues when commands return empty results
version: 1.0.0
author: IBM Cloud Logs Team
tags: [ibm-cloud-logs, cli, troubleshooting, query, debugging]
category: troubleshooting
---

# IBM Cloud Logs CLI Query Troubleshooter

## Overview

This skill helps diagnose and resolve issues when IBM Cloud Logs CLI queries return empty results or no logs. It provides a systematic troubleshooting approach for the `ibmcloud cloud-logs query` command.

## When to Use This Skill

Use this skill when:
- Running `ibmcloud cloud-logs query` returns no logs
- CLI query results are empty despite logs existing in the UI
- Need to validate query syntax and parameters
- Troubleshooting time range or filter issues
- Debugging authentication or service URL problems

## Common Issue

**User reports:**
```bash
ibmcloud cloud-logs query --query "bm-server-manager" --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z --end-date 2026-03-09T11:41:30Z
```
Returns empty response with no logs.

## Troubleshooting Steps

### 1. Verify Query Syntax

**Check if query works in UI first:**
- Open IBM Cloud Logs UI
- Navigate to the same instance
- Test the exact same query: `bm-server-manager`
- Verify logs are returned in UI

**Common query issues:**
- Lucene syntax requires field names: `applicationName:bm-server-manager` or `subsystemName:bm-server-manager`
- Plain text search may not match: `"bm-server-manager"` (with quotes)
- Wildcard searches: `bm-server-manager*` or `*bm-server-manager*`

**Correct query formats:**
```bash
# Field-specific search (recommended)
--query "applicationName:bm-server-manager" --syntax lucene

# Wildcard search
--query "bm-server-manager*" --syntax lucene

# Full text search with quotes
--query "\"bm-server-manager\"" --syntax lucene

# DataPrime syntax alternative
--query "source logs | filter \$l.applicationname == 'bm-server-manager'" --syntax dataprime
```

### 2. Validate Time Range

**UTC timezone requirement:**
- All timestamps MUST be in UTC format
- Format: `YYYY-MM-DDTHH:MM:SSZ` (Z suffix is required)
- Verify your local time conversion to UTC

**Common time range issues:**
```bash
# ❌ Wrong: Missing Z suffix
--start-date 2026-03-08T00:00:00 --end-date 2026-03-09T11:41:30

# ✅ Correct: With Z suffix
--start-date 2026-03-08T00:00:00Z --end-date 2026-03-09T11:41:30Z

# ❌ Wrong: Local timezone
--start-date 2026-03-08T00:00:00+05:30

# ✅ Correct: UTC timezone
--start-date 2026-03-08T00:00:00Z
```

**Verify time range contains logs:**
- Check if logs exist in UI for the same time range
- Try expanding time range: use last 24 hours or 7 days
- Ensure end-date is after start-date

### 3. Check Service URL and Authentication

**Verify service URL:**
```bash
# List your Cloud Logs instances
ibmcloud resource service-instances --service-name logs

# Get instance details
ibmcloud resource service-instance <instance-name> --output json
```

**Check API key:**
```bash
# Verify you're logged in
ibmcloud target

# Check current API key
ibmcloud iam api-keys

# Set API key if needed
export IBMCLOUD_API_KEY=<your-api-key>
```

### 4. Validate Syntax Parameter

**Supported syntax values:**
- `lucene` - Lucene query syntax (default)
- `dataprime` - DataPrime query language

**Syntax-specific requirements:**

**Lucene:**
```bash
--query "applicationName:bm-server-manager" --syntax lucene
--query "severity:>=5" --syntax lucene
--query "applicationName:bm* AND severity:error" --syntax lucene
```

**DataPrime:**
```bash
--query "source logs | filter \$l.applicationname == 'bm-server-manager'" --syntax dataprime
--query "source logs | filter \$m.severity >= 5" --syntax dataprime
```

### 5. Add Debug Output

**Enable verbose output:**
```bash
# Add --output json for detailed response
ibmcloud cloud-logs query \
  --query "applicationName:bm-server-manager" \
  --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T11:41:30Z \
  --output json

# Check for error messages
ibmcloud cloud-logs query ... 2>&1 | tee query-debug.log
```

## Systematic Troubleshooting Workflow

When user reports empty query results, follow this workflow:

### Step 1: Validate Query in UI
```
Ask user: "Can you verify this query returns logs in the IBM Cloud Logs UI?"
- If NO: Query syntax is wrong, help fix the query
- If YES: Continue to Step 2
```

### Step 2: Check Time Range
```
Verify:
1. Timestamps are in UTC (Z suffix)
2. Format is correct: YYYY-MM-DDTHH:MM:SSZ
3. Time range contains logs (check UI)
4. end-date > start-date

Suggest: Try last 24 hours to test
--start-date $(date -u -v-24H +%Y-%m-%dT%H:%M:%SZ) --end-date $(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### Step 3: Fix Query Syntax
```
For Lucene queries:
1. Add field name: applicationName:value or subsystemName:value
2. Use wildcards if needed: value*
3. Quote exact phrases: "exact phrase"
4. Escape special characters

For DataPrime queries:
1. Start with: source logs | filter
2. Use field prefixes: $l. (labels), $m. (metadata), $d. (data)
3. Use correct operators: ==, !=, >=, contains()
```

### Step 4: Verify Service Configuration
```
Check:
1. Service URL is correct (from instance details)
2. API key is valid (ibmcloud target)
3. User has access to the instance
4. Instance is in correct region
```

### Step 5: Test with Simple Query
```
Start with simplest possible query:
ibmcloud cloud-logs query \
  --query "*" \
  --syntax lucene \
  --service-url <url> \
  --start-date $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-date $(date -u +%Y-%m-%dT%H:%M:%SZ)

If this works, gradually add filters
```

## Quick Reference Commands

### Test Query Syntax
```bash
# Test in UI first - always validate here
# UI URL: https://cloud.ibm.com/observe/logging/<instance-id>

# Simple Lucene query
ibmcloud cloud-logs query --query "applicationName:myapp" --syntax lucene \
  --service-url <url> --start-date <start> --end-date <end>

# DataPrime query
ibmcloud cloud-logs query \
  --query "source logs | filter \$l.applicationname == 'myapp'" \
  --syntax dataprime --service-url <url> --start-date <start> --end-date <end>
```

### Generate UTC Timestamps
```bash
# Current time in UTC
date -u +%Y-%m-%dT%H:%M:%SZ

# 1 hour ago
date -u -v-1H +%Y-%m-%dT%H:%M:%SZ

# 24 hours ago
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ

# Specific date in UTC
date -u -j -f "%Y-%m-%d %H:%M:%S" "2026-03-08 00:00:00" +%Y-%m-%dT%H:%M:%SZ
```

### Verify Instance Details
```bash
# List instances
ibmcloud resource service-instances --service-name logs

# Get service URL
ibmcloud resource service-instance <name> --output json | jq -r '.extensions.endpoints.public'

# Check current target
ibmcloud target
```

## Response Template

When helping users, provide this structured response:

```markdown
I see you're getting empty results from your Cloud Logs CLI query. Let's troubleshoot:

**1. Query Validation**
- [ ] Does this query return logs in the UI?
- [ ] Query syntax: [Lucene/DataPrime]
- [ ] Suggested fix: `applicationName:bm-server-manager` instead of `bm-server-manager`

**2. Time Range Check**
- [ ] Timestamps in UTC with Z suffix: ✅/❌
- [ ] Format correct: ✅/❌
- [ ] Time range contains logs: ✅/❌

**3. Corrected Command**
```bash
ibmcloud cloud-logs query \
  --query "applicationName:bm-server-manager" \
  --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T11:41:30Z \
  --output json
```

**4. Next Steps**
1. Verify query works in UI first
2. Test with corrected command above
3. If still empty, try expanding time range to last 24 hours
4. Check service URL and authentication

**References:**
- [CLI Reference](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-cloud-logs-cli-temp)
- [Query Data Guide](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-query-data&interface=ui)
```

## Common Mistakes and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Missing field name | Empty results | Add `applicationName:` or `subsystemName:` prefix |
| Wrong timezone | No logs in range | Convert to UTC, add Z suffix |
| Invalid syntax | Parse error | Use `--syntax lucene` or `--syntax dataprime` |
| Wrong service URL | Authentication error | Verify URL from instance details |
| Expired API key | 401 Unauthorized | Run `ibmcloud login` again |
| Missing quotes | Parse error | Quote phrases: `"exact phrase"` |
| Special characters | Unexpected results | Escape: `\(`, `\)`, `\:`, `\*` |

## References

- See `references/cli-reference.md` for complete CLI documentation
- See `references/query-syntax.md` for query syntax examples
- See `references/troubleshooting-guide.md` for advanced troubleshooting

## Testing

Run tests with:
```bash
npm test tests/skill.test.js
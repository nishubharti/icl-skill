# IBM Cloud Logs CLI Query Troubleshooter

An Agent Skill for diagnosing and resolving IBM Cloud Logs CLI query issues when commands return empty results.

## Overview

This skill provides systematic troubleshooting guidance for the `ibmcloud cloud-logs query` command when it returns no logs or empty results, despite logs existing in the UI.

## Quick Start

### Common Issue
```bash
# Command returns empty results
ibmcloud cloud-logs query --query "bm-server-manager" --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z --end-date 2026-03-09T11:41:30Z
```

### Quick Fix
```bash
# Add field name to query
ibmcloud cloud-logs query --query "applicationName:bm-server-manager" --syntax lucene \
  --service-url https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com \
  --start-date 2026-03-08T00:00:00Z --end-date 2026-03-09T11:41:30Z
```

## What This Skill Does

1. **Validates query syntax** - Ensures Lucene/DataPrime queries are correctly formatted
2. **Checks time ranges** - Verifies UTC timestamps and format
3. **Tests authentication** - Confirms service URL and API key are valid
4. **Provides step-by-step fixes** - Guides through systematic troubleshooting
5. **Offers working examples** - Shows correct command syntax

## Key Features

- ✅ Query syntax validation (Lucene and DataPrime)
- ✅ Time range verification and UTC conversion
- ✅ Service URL and authentication checks
- ✅ Progressive debugging workflow
- ✅ Common error solutions
- ✅ Working command examples

## Usage

### With Bob AI Assistant

1. Describe your issue:
   ```
   "My Cloud Logs CLI query returns no results"
   ```

2. Bob will load this skill and guide you through:
   - Query syntax validation
   - Time range verification
   - Authentication checks
   - Step-by-step fixes

### Manual Reference

See the comprehensive guides in:
- `SKILL.md` - Complete troubleshooting workflow
- `references/cli-reference.md` - CLI command reference
- `references/troubleshooting-guide.md` - Detailed debugging steps

## Common Issues Solved

### 1. Missing Field Names
```bash
# ❌ Wrong
--query "bm-server-manager"

# ✅ Correct
--query "applicationName:bm-server-manager"
```

### 2. Wrong Time Format
```bash
# ❌ Wrong
--start-date 2026-03-08T00:00:00

# ✅ Correct
--start-date 2026-03-08T00:00:00Z
```

### 3. Incorrect Syntax Parameter
```bash
# ❌ Wrong
--query "applicationName:myapp" --syntax dataprime

# ✅ Correct
--query "applicationName:myapp" --syntax lucene
```

## Troubleshooting Workflow

```
1. Verify query works in UI
   ↓
2. Check time range (UTC format)
   ↓
3. Validate query syntax
   ↓
4. Test authentication
   ↓
5. Try simple query first
   ↓
6. Add filters incrementally
```

## Quick Reference

### Generate UTC Timestamps
```bash
# Current time
date -u +%Y-%m-%dT%H:%M:%SZ

# 24 hours ago
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

### Test Simple Query
```bash
ibmcloud cloud-logs query \
  --query "*" \
  --syntax lucene \
  --service-url <url> \
  --start-date $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-date $(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### Verify Service URL
```bash
ibmcloud resource service-instance <name> --output json | \
  jq -r '.extensions.endpoints.public'
```

## Files

- `SKILL.md` - Main skill instructions and troubleshooting workflow
- `references/cli-reference.md` - Complete CLI command reference
- `references/troubleshooting-guide.md` - Detailed debugging guide
- `tests/skill.test.js` - Skill validation tests

## Prerequisites

- IBM Cloud CLI installed
- Cloud Logs plugin installed: `ibmcloud plugin install cloud-logs`
- Valid IBM Cloud API key
- Access to IBM Cloud Logs instance

## Related Skills

- `cloud-logs-alerts` - Alert configuration and management
- `dataprime-query-builder` - DataPrime query construction
- `tco-policy-optimizer` - TCO policy optimization

## Documentation Links

- [IBM Cloud Logs CLI Reference](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-cloud-logs-cli-temp)
- [Query Data Guide](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-query-data&interface=ui)
- [DataPrime Reference](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-dataprime-reference)

## Support

For issues or questions:
1. Check `references/troubleshooting-guide.md`
2. Review IBM Cloud Logs documentation
3. Contact IBM Cloud Support

## Version

1.0.0 - Initial release

## License

IBM Internal Use
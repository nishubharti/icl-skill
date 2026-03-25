# IBM Cloud Logs CLI Troubleshooting Guide

## Diagnostic Flowchart

```
Empty Query Results
        ↓
Does query work in UI?
    ↓           ↓
   NO          YES
    ↓           ↓
Fix Query   Check Time Range
Syntax          ↓
            Correct UTC format?
                ↓           ↓
               NO          YES
                ↓           ↓
            Fix Format  Check Service URL
                            ↓
                    Verify Authentication
                            ↓
                    Test Simple Query
```

## Issue Categories

### 1. Query Syntax Issues

#### Problem: Plain text search returns nothing
```bash
# ❌ Wrong
--query "bm-server-manager"

# ✅ Correct - Add field name
--query "applicationName:bm-server-manager"
--query "subsystemName:bm-server-manager"
--query "message:bm-server-manager"
```

#### Problem: Special characters not escaped
```bash
# ❌ Wrong
--query "error: connection failed"

# ✅ Correct - Escape colon
--query "error\\: connection failed"
```

#### Problem: Wildcard not working
```bash
# ❌ Wrong - No field specified
--query "bm-*"

# ✅ Correct - Field with wildcard
--query "applicationName:bm-*"
--query "applicationName:*manager"
--query "applicationName:*server*"
```

### 2. Time Range Issues

#### Problem: Missing Z suffix
```bash
# ❌ Wrong
--start-date 2026-03-08T00:00:00
--end-date 2026-03-09T11:41:30

# ✅ Correct
--start-date 2026-03-08T00:00:00Z
--end-date 2026-03-09T11:41:30Z
```

#### Problem: Using local timezone
```bash
# ❌ Wrong - Local timezone
--start-date 2026-03-08T00:00:00+05:30

# ✅ Correct - UTC only
--start-date 2026-03-08T00:00:00Z
```

#### Problem: Time range too narrow
```bash
# If no results, expand time range
# Try last 24 hours
--start-date $(date -u -v-24H +%Y-%m-%dT%H:%M:%SZ)
--end-date $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Or last 7 days
--start-date $(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)
--end-date $(date -u +%Y-%m-%dT%H:%M:%SZ)
```

#### Problem: End date before start date
```bash
# ❌ Wrong
--start-date 2026-03-09T00:00:00Z
--end-date 2026-03-08T00:00:00Z

# ✅ Correct
--start-date 2026-03-08T00:00:00Z
--end-date 2026-03-09T00:00:00Z
```

### 3. Authentication Issues

#### Problem: 401 Unauthorized
```bash
# Check authentication
ibmcloud target

# Re-login if needed
ibmcloud login --apikey <your-api-key>

# Or set API key
export IBMCLOUD_API_KEY=<your-api-key>
```

#### Problem: Wrong region
```bash
# Check current target
ibmcloud target

# Switch region if needed
ibmcloud target -r <region>

# Verify service URL matches region
# br-sao → São Paulo
# us-south → Dallas
# eu-de → Frankfurt
```

### 4. Service URL Issues

#### Problem: Wrong service URL
```bash
# Get correct URL from instance
ibmcloud resource service-instance <instance-name> --output json | \
  jq -r '.extensions.endpoints.public'

# Verify URL format
# https://<instance-id>.api.<region>.logs.cloud.ibm.com
```

#### Problem: Instance not found
```bash
# List all Cloud Logs instances
ibmcloud resource service-instances --service-name logs

# Check instance exists in current account
ibmcloud target
```

### 5. Syntax Parameter Issues

#### Problem: Wrong syntax for query type
```bash
# Lucene query with wrong syntax
# ❌ Wrong
--query "applicationName:myapp" --syntax dataprime

# ✅ Correct
--query "applicationName:myapp" --syntax lucene

# DataPrime query with wrong syntax
# ❌ Wrong
--query "source logs | filter $l.applicationname == 'myapp'" --syntax lucene

# ✅ Correct
--query "source logs | filter $l.applicationname == 'myapp'" --syntax dataprime
```

## Step-by-Step Debugging

### Step 1: Verify Query in UI

1. Open IBM Cloud Logs UI
2. Navigate to your instance
3. Go to "Explore" or "Logs" view
4. Enter the exact same query
5. Set the same time range
6. Verify logs are returned

**If UI returns logs but CLI doesn't:**
- Issue is with CLI parameters (time format, syntax, etc.)

**If UI also returns no logs:**
- Issue is with the query itself

### Step 2: Test Minimal Query

Start with the simplest possible query:

```bash
# Query everything in last hour
ibmcloud cloud-logs query \
  --query "*" \
  --syntax lucene \
  --service-url <your-url> \
  --start-date $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-date $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --output json
```

**If this works:**
- Your authentication and service URL are correct
- Issue is with your specific query

**If this fails:**
- Check authentication
- Verify service URL
- Check network connectivity

### Step 3: Add Filters Incrementally

```bash
# Step 1: Query all logs
--query "*"

# Step 2: Add application filter
--query "applicationName:bm-server-manager"

# Step 3: Add severity filter
--query "applicationName:bm-server-manager AND severity:>=5"

# Step 4: Add time-based filter
--query "applicationName:bm-server-manager AND severity:>=5 AND timestamp:[2026-03-08 TO 2026-03-09]"
```

### Step 4: Enable Debug Output

```bash
# Add verbose output
ibmcloud cloud-logs query \
  --query "applicationName:bm-server-manager" \
  --syntax lucene \
  --service-url <url> \
  --start-date 2026-03-08T00:00:00Z \
  --end-date 2026-03-09T00:00:00Z \
  --output json \
  2>&1 | tee debug.log

# Check for error messages in debug.log
cat debug.log | grep -i error
```

## Common Error Messages

### "No logs found"
**Causes:**
- Query doesn't match any logs
- Time range doesn't contain logs
- Wrong field names in query

**Solutions:**
1. Verify query in UI
2. Expand time range
3. Use wildcards: `applicationName:*manager*`
4. Check field names are correct

### "Invalid query syntax"
**Causes:**
- Syntax mismatch (Lucene vs DataPrime)
- Special characters not escaped
- Invalid field names

**Solutions:**
1. Verify `--syntax` parameter matches query type
2. Escape special characters: `\:`, `\(`, `\)`
3. Use valid field names from documentation

### "Authentication failed"
**Causes:**
- Expired API key
- Wrong account/region
- Insufficient permissions

**Solutions:**
1. Re-login: `ibmcloud login`
2. Check target: `ibmcloud target`
3. Verify permissions in IAM

### "Invalid time format"
**Causes:**
- Missing Z suffix
- Wrong date format
- Local timezone used

**Solutions:**
1. Add Z suffix: `2026-03-08T00:00:00Z`
2. Use ISO 8601 format
3. Convert to UTC

## Testing Checklist

Before reporting an issue, verify:

- [ ] Query works in UI with same parameters
- [ ] Timestamps are in UTC with Z suffix
- [ ] Format is `YYYY-MM-DDTHH:MM:SSZ`
- [ ] Time range contains logs (verified in UI)
- [ ] Field names are correct (applicationName, subsystemName, etc.)
- [ ] Syntax parameter matches query type
- [ ] Service URL is correct
- [ ] Authentication is valid (`ibmcloud target`)
- [ ] Simple query (`--query "*"`) works
- [ ] Using latest CLI version

## Advanced Debugging

### Check CLI Version
```bash
ibmcloud plugin list | grep cloud-logs
ibmcloud plugin update cloud-logs
```

### Test with curl
```bash
# Get auth token
TOKEN=$(ibmcloud iam oauth-tokens | grep IAM | awk '{print $4}')

# Test API directly
curl -X POST \
  "https://142f467a-2f9c-494e-b0e4-f38cca693e53.api.br-sao.logs.cloud.ibm.com/v1/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "applicationName:bm-server-manager",
    "syntax": "lucene",
    "start_date": "2026-03-08T00:00:00Z",
    "end_date": "2026-03-09T00:00:00Z"
  }'
```

### Enable CLI Debug Mode
```bash
# Set debug environment variable
export IBMCLOUD_TRACE=true

# Run query
ibmcloud cloud-logs query ...

# Disable debug
unset IBMCLOUD_TRACE
```

## Quick Fixes Reference

| Symptom | Quick Fix |
|---------|-----------|
| Empty results | Add field name: `applicationName:value` |
| "Invalid time" | Add Z suffix: `2026-03-08T00:00:00Z` |
| "Auth failed" | Run `ibmcloud login` |
| "Invalid syntax" | Match `--syntax` to query type |
| "No such field" | Use correct field: `applicationName` not `application` |
| Works in UI, not CLI | Check time format and syntax parameter |
| Wildcard not working | Add field: `applicationName:*value*` |

## Getting Help

If issue persists after troubleshooting:

1. **Collect information:**
   - Exact CLI command used
   - Error message (if any)
   - CLI version: `ibmcloud plugin list`
   - Does query work in UI?
   - Time range being queried

2. **Check documentation:**
   - [CLI Reference](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-cloud-logs-cli-temp)
   - [Query Guide](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-query-data)

3. **Contact support:**
   - IBM Cloud Support
   - Include debug output
   - Provide query that works in UI
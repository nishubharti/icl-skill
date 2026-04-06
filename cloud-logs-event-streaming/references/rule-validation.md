# Rule Validation Guide

Comprehensive guide to validating streaming rules before deployment to ensure they match the expected logs.

## Overview

Rule validation is critical to ensure:
- Rules match the intended logs
- No syntax errors in DPXL expressions
- Expected data volume is reasonable
- Rules don't accidentally match too much or too little data

This guide covers:
- Pre-deployment validation process
- Using DataPrime query mode for testing
- Common validation scenarios
- Troubleshooting validation issues

## Why Validate Rules?

### Risks of Unvalidated Rules

**Too Broad:**
- Streams more data than needed
- Increases Event Streams costs
- Overwhelms downstream systems
- May include sensitive data unintentionally

**Too Narrow:**
- Misses critical logs
- Defeats purpose of streaming
- May miss security events or errors

**Syntax Errors:**
- Rule doesn't work at all
- No data streams
- Wastes time troubleshooting

### Benefits of Validation

- **Confidence**: Know exactly what logs will stream
- **Cost Control**: Verify data volume before deployment
- **Accuracy**: Ensure rule matches intended logs
- **Speed**: Catch errors before deployment

## Validation Process

### Step-by-Step Validation

**Step 1: Write Your DPXL Rule**

Example rule to validate:
```
<v1> $l.applicationname == 'payment-service' && $d.severity == 'ERROR'
```

**Step 2: Convert to DataPrime Query**

Remove `<v1>` prefix and wrap in `filter` command:
```
source logs
| filter $l.applicationname == 'payment-service' && $d.severity == 'ERROR'
| limit 100
```

**Step 3: Run Query in Cloud Logs**

1. Navigate to Cloud Logs UI
2. Click **Explore** → **Logs**
3. Switch to **DataPrime** query mode
4. Paste your query
5. Select appropriate time range (e.g., last 1 hour)
6. Click **Run Query**

**Step 4: Analyze Results**

Check:
- **Match Count**: How many logs matched?
- **Sample Logs**: Do they look correct?
- **Field Values**: Are field values what you expected?
- **Volume**: Is this a reasonable amount of data?

**Step 5: Refine Rule**

Based on results:
- **Too many matches**: Add more specific filters
- **Too few matches**: Broaden filters or check field names
- **No matches**: Check syntax, field names, and values
- **Wrong logs**: Adjust filter conditions

**Step 6: Deploy Rule**

Once satisfied:
1. Add `<v1>` prefix back to rule
2. Create streaming configuration in Cloud Logs
3. Monitor initial streaming to verify

## Validation Examples

### Example 1: Validate Application Filter

**Goal**: Stream all logs from `api-gateway` application

**DPXL Rule:**
```
<v1> $l.applicationname == 'api-gateway'
```

**Validation Query:**
```
source logs
| filter $l.applicationname == 'api-gateway'
| limit 100
```

**Expected Results:**
- All logs should have `applicationname: api-gateway`
- Should see various log levels (INFO, ERROR, etc.)
- Should see logs from different subsystems

**Validation Checks:**
```
source logs
| filter $l.applicationname == 'api-gateway'
| aggregate count() by $l.subsystemname
```

This shows distribution across subsystems.

### Example 2: Validate Severity Filter

**Goal**: Stream only ERROR and CRITICAL logs

**DPXL Rule:**
```
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
```

**Validation Query:**
```
source logs
| filter $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
| limit 100
```

**Expected Results:**
- All logs should have severity ERROR or CRITICAL
- Should see logs from various applications
- Should see different error types

**Validation Checks:**
```
source logs
| filter $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
| aggregate count() by $d.severity, $l.applicationname
```

This shows distribution by severity and application.

### Example 3: Validate Complex Multi-Field Rule

**Goal**: Stream production errors from payment service

**DPXL Rule:**
```
<v1> $l.applicationname == 'payment-service' && $d.environment == 'production' && $d.severity == 'ERROR'
```

**Validation Query:**
```
source logs
| filter $l.applicationname == 'payment-service' 
    && $d.environment == 'production' 
    && $d.severity == 'ERROR'
| limit 100
```

**Expected Results:**
- All logs should have `applicationname: payment-service`
- All logs should have `environment: production`
- All logs should have `severity: ERROR`

**Validation Checks:**
```
source logs
| filter $l.applicationname == 'payment-service' 
    && $d.environment == 'production' 
    && $d.severity == 'ERROR'
| aggregate count() by $d.errorType
```

This shows distribution by error type.

### Example 4: Validate Text Search Rule

**Goal**: Stream logs containing "timeout" or "connection refused"

**DPXL Rule:**
```
<v1> $d.msg.contains('timeout') || $d.msg.contains('connection refused')
```

**Validation Query:**
```
source logs
| filter $d.msg.contains('timeout') || $d.msg.contains('connection refused')
| limit 100
```

**Expected Results:**
- All logs should contain "timeout" or "connection refused" in message
- Should see various applications and severities
- Should see different timeout/connection scenarios

**Validation Checks:**
```
source logs
| filter $d.msg.contains('timeout') || $d.msg.contains('connection refused')
| aggregate count() by $l.applicationname, $d.severity
```

This shows which applications have these issues.

### Example 5: Validate Exclusion Rule

**Goal**: Stream all logs EXCEPT health checks

**DPXL Rule:**
```
<v1> !$d.msg.contains('health check')
```

**Validation Query:**
```
source logs
| filter !$d.msg.contains('health check')
| limit 100
```

**Expected Results:**
- No logs should contain "health check" in message
- Should see normal application logs
- Should see various log types

**Validation Checks:**
```
# Verify health checks are excluded
source logs
| filter $d.msg.contains('health check')
| limit 10

# Should return health check logs (these will NOT be streamed)
```

## Volume Estimation

### Estimating Data Volume

**Step 1: Count Matches Over Time**

```
source logs
| filter <your-filter-condition>
| aggregate count() by timebucket(1h)
```

This shows hourly match count.

**Step 2: Calculate Daily Volume**

```
source logs
| filter <your-filter-condition>
| aggregate count() as total_count
```

Multiply by 24 for daily estimate.

**Step 3: Estimate Data Size**

Average log entry size: ~1-2 KB

```
Daily logs = hourly_count × 24
Daily data = daily_logs × 1.5 KB
Monthly data = daily_data × 30
```

**Example Calculation:**

```
Hourly matches: 1,000 logs
Daily matches: 1,000 × 24 = 24,000 logs
Daily data: 24,000 × 1.5 KB = 36 MB
Monthly data: 36 MB × 30 = 1.08 GB
```

### Volume Optimization

**If volume is too high:**

1. **Add more specific filters**:
   ```
   # Before (too broad)
   $l.applicationname == 'api-gateway'
   
   # After (more specific)
   $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'
   ```

2. **Exclude low-value logs**:
   ```
   # Exclude health checks
   $l.applicationname == 'api-gateway' && !$d.msg.contains('health check')
   ```

3. **Focus on specific subsystems**:
   ```
   # Only authentication subsystem
   $l.applicationname == 'api-gateway' && $l.subsystemname == 'auth'
   ```

## Common Validation Issues

### Issue 1: No Matches Found

**Symptoms:**
- Query returns 0 results
- Rule seems correct

**Possible Causes:**
1. **Field name incorrect**: Check exact field names in your logs
2. **Value case mismatch**: Check if values are uppercase/lowercase
3. **Field doesn't exist**: Field may not be present in logs
4. **Time range too narrow**: Extend time range

**Troubleshooting:**

```
# Step 1: Check what fields exist
source logs
| limit 10

# Step 2: Check specific field values
source logs
| aggregate count() by $l.applicationname
| limit 20

# Step 3: Check if field exists
source logs
| filter $d.severity != null
| limit 10
```

### Issue 2: Too Many Matches

**Symptoms:**
- Query returns thousands of results
- More than expected

**Possible Causes:**
1. **Rule too broad**: Not specific enough
2. **Missing filters**: Need additional conditions
3. **Unexpected log volume**: Application logs more than expected

**Troubleshooting:**

```
# Analyze what's matching
source logs
| filter <your-filter-condition>
| aggregate count() by $l.applicationname, $l.subsystemname, $d.severity
```

**Solutions:**
- Add severity filter: `&& $d.severity == 'ERROR'`
- Add subsystem filter: `&& $l.subsystemname == 'critical-component'`
- Add exclusions: `&& !$d.msg.contains('health check')`

### Issue 3: Wrong Logs Matching

**Symptoms:**
- Query returns logs, but not the right ones
- Unexpected applications or log types

**Possible Causes:**
1. **Operator error**: Using `||` instead of `&&`
2. **Parentheses missing**: Logical grouping incorrect
3. **Field value mismatch**: Checking wrong value

**Troubleshooting:**

```
# Check what's actually matching
source logs
| filter <your-filter-condition>
| aggregate count() by $l.applicationname, $d.severity
```

**Common Fixes:**

```
# Wrong: OR when you meant AND
$l.applicationname == 'api' || $d.severity == 'ERROR'
# Matches: ALL api logs OR ALL errors (too broad)

# Correct: AND
$l.applicationname == 'api' && $d.severity == 'ERROR'
# Matches: ONLY api errors (correct)

# Wrong: Missing parentheses
$l.applicationname == 'api' && $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
# Matches: (api AND error) OR (all critical)

# Correct: With parentheses
$l.applicationname == 'api' && ($d.severity == 'ERROR' || $d.severity == 'CRITICAL')
# Matches: api AND (error OR critical)
```

### Issue 4: Syntax Error

**Symptoms:**
- Query fails to run
- Error message about syntax

**Common Syntax Errors:**

```
# Wrong: Single equals
$l.applicationname = 'api'

# Correct: Double equals
$l.applicationname == 'api'

# Wrong: Double quotes
$l.applicationname == "api"

# Correct: Single quotes
$l.applicationname == 'api'

# Wrong: Single pipe
$l.applicationname == 'api' | $d.severity == 'ERROR'

# Correct: Double pipe
$l.applicationname == 'api' || $d.severity == 'ERROR'

# Wrong: Single ampersand
$l.applicationname == 'api' & $d.severity == 'ERROR'

# Correct: Double ampersand
$l.applicationname == 'api' && $d.severity == 'ERROR'
```

## Advanced Validation Techniques

### Validate Field Existence

Before using a field in your rule, verify it exists:

```
# Check if field exists in logs
source logs
| filter $d.environment != null
| aggregate count()

# If count > 0, field exists
# If count = 0, field doesn't exist or is always null
```

### Validate Field Values

Check what values a field can have:

```
# List all unique values
source logs
| aggregate count() by $d.environment
| sort count desc

# Shows: production, staging, development, etc.
```

### Validate Time-Based Patterns

Check if logs occur at specific times:

```
# Hourly distribution
source logs
| filter <your-filter-condition>
| aggregate count() by timebucket(1h)

# Daily distribution
source logs
| filter <your-filter-condition>
| aggregate count() by timebucket(1d)
```

### Validate Across Applications

Check rule impact across all applications:

```
source logs
| filter <your-filter-condition>
| aggregate count() by $l.applicationname
| sort count desc
| limit 20
```

## Validation Checklist

Before deploying a streaming rule:

- [ ] Rule syntax is correct (double equals, single quotes, etc.)
- [ ] Query runs successfully in DataPrime mode
- [ ] Results match expected logs
- [ ] No unexpected applications or log types
- [ ] Data volume is reasonable
- [ ] Field names are correct (check actual logs)
- [ ] Field values are correct (check case sensitivity)
- [ ] Logical operators are correct (AND vs OR)
- [ ] Parentheses are used correctly for complex conditions
- [ ] Exclusions work as expected
- [ ] Time range tested is representative
- [ ] Estimated monthly data volume is acceptable

## Related Documentation

- [DPXL Syntax Guide](dpxl-syntax-guide.md)
- [Streaming Rules Reference](streaming-rules-reference.md)
- [Troubleshooting Guide](troubleshooting.md)
- [Best Practices](best-practices.md)
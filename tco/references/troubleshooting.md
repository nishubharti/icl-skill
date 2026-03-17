# TCO Troubleshooting Guide

## Quick Diagnosis Table

| Symptom | Root Cause | Quick Fix | Detailed Section |
|---------|------------|-----------|------------------|
| Alerts not triggering | Logs in Low priority | Route to High/Medium | [Alert Issues](#alert-issues) |
| Dashboard shows no data | Logs in Low priority | Route to High/Medium | [Dashboard Issues](#dashboard-issues) |
| Partial dashboard data | Mixed priority routing | Consolidate routing | [Dashboard Issues](#dashboard-issues) |
| High costs | Too many logs in High | Move to Medium/Low | [Cost Issues](#cost-issues) |
| Can't create policy | No data bucket | Configure COS bucket | [Configuration Issues](#configuration-issues) |
| Logs not searchable | Wrong pipeline or blocked | Check policy routing | [Search Issues](#search-issues) |
| Policy not working | Wrong priority order | Reorder policies | [Policy Issues](#policy-issues) |

---

## Alert Issues

### Problem: Alerts Not Triggering

#### Symptoms
- Alert configured but never fires
- Alert worked before, stopped after TCO policy changes
- Some alerts work, others don't

#### Root Causes
1. **Logs routed to Low priority (Store & search)**
   - Low priority logs don't support alerting
   - Most common cause

2. **Alert query doesn't match log data**
   - Field names changed
   - Severity level mismatch

3. **Alert disabled or misconfigured**
   - Alert rule turned off
   - Incorrect time window

#### Diagnosis Steps

**Step 1: Verify Log Priority**
```
1. Go to IBM Cloud Logs UI
2. Navigate to Explore Logs
3. Search for logs that should trigger alert
4. Check which pipeline they're in:
   - If "Store & search" → Problem found!
   - If "Priority insights" or "Analyze & alert" → Continue diagnosis
```

**Step 2: Check TCO Policy**
```
1. Go to Data Flow → TCO Policies
2. Find policy matching your logs
3. Check pipeline assignment:
   - Should be "Priority insights" (High) or "Analyze & alert" (Medium)
   - If "Store & search" (Low) → Need to modify policy
```

**Step 3: Verify Alert Configuration**
```
1. Go to Alerts
2. Find your alert
3. Check:
   - Alert is enabled
   - Query matches log fields
   - Severity level matches
   - Time window is appropriate
```

#### Solutions

**Solution 1: Modify TCO Policy**
```
Change policy to route logs to High or Medium priority:

Before:
Application: payment-service
Subsystem: *
Severity: *
Pipeline: Store & search (Low)

After:
Application: payment-service
Subsystem: *
Severity: ERROR, CRITICAL
Pipeline: Priority insights (High)
```

**Solution 2: Create New Policy**
```
Add a higher-priority policy for alert-critical logs:

New Policy (Priority 1):
Application: payment-service
Subsystem: transaction
Severity: ERROR, CRITICAL
Pipeline: Priority insights (High)

Existing Policy (Priority 2):
Application: payment-service
Subsystem: *
Severity: *
Pipeline: Store & search (Low)
```

**Solution 3: Adjust Alert Query**
```
If logs are in correct pipeline but alert still doesn't trigger:

1. Test query in Explore Logs
2. Verify field names match
3. Check severity level in query
4. Adjust alert conditions
```

#### Validation
After making changes:
1. Wait 5-10 minutes for policy to take effect
2. Generate test logs
3. Verify logs appear in High/Medium priority
4. Confirm alert triggers

---

## Dashboard Issues

### Problem: Dashboard Shows No Data

#### Symptoms
- Dashboard widgets empty
- "No data available" message
- Dashboard worked before TCO policy changes
- Some widgets show data, others don't

#### Root Causes
1. **Logs routed to Low priority**
   - Dashboards only query High/Medium priority
   - Most common cause

2. **Time range mismatch**
   - Dashboard time range doesn't include data
   - Logs recently moved to different pipeline

3. **Query syntax error**
   - DataPrime query incorrect
   - Field names changed

#### Diagnosis Steps

**Step 1: Check Data Source**
```
1. Open dashboard
2. Edit widget
3. Check data source:
   - Should query Priority insights or Analyze & alert
   - If querying Store & search → Problem found!
```

**Step 2: Verify Log Location**
```
1. Go to Explore Logs
2. Search for logs that should appear in dashboard
3. Note which pipeline they're in
4. If in Store & search → Need to modify TCO policy
```

**Step 3: Test Query**
```
1. Copy dashboard query
2. Run in Explore Logs
3. Check if data returns:
   - If yes → Dashboard configuration issue
   - If no → Query or routing issue
```

#### Solutions

**Solution 1: Route Logs to High/Medium Priority**
```
Modify TCO policy:

Before:
Application: web-app
Subsystem: *
Severity: *
Pipeline: Store & search (Low)

After:
Application: web-app
Subsystem: *
Severity: INFO, WARNING, ERROR, CRITICAL
Pipeline: Analyze & alert (Medium)
```

**Solution 2: Create Specific Policy for Dashboard Data**
```
Add policy for dashboard-relevant logs:

New Policy (Priority 1):
Application: web-app
Subsystem: api, frontend
Severity: INFO, WARNING, ERROR, CRITICAL
Pipeline: Analyze & alert (Medium)

Keep existing policy for other logs:
Existing Policy (Priority 2):
Application: web-app
Subsystem: *
Severity: DEBUG, VERBOSE
Pipeline: Store & search (Low)
```

**Solution 3: Adjust Dashboard Time Range**
```
If logs recently moved to different pipeline:

1. Extend dashboard time range
2. Include period when logs were in High/Medium priority
3. Or wait for new data to accumulate
```

#### Validation
1. Wait 5-10 minutes after policy change
2. Refresh dashboard
3. Verify widgets show data
4. Check data is current

---

## Cost Issues

### Problem: Costs Too High

#### Symptoms
- Monthly bill higher than expected
- Costs increased after adding logs
- Budget exceeded

#### Root Causes
1. **Too many logs in Priority insights (High)**
   - Highest cost pipeline
   - All logs default here without policies

2. **High log volume**
   - Verbose logging enabled
   - Debug logs in production

3. **No TCO policies configured**
   - All logs go to Priority insights by default

#### Diagnosis Steps

**Step 1: Check Data Usage**
```
1. Go to Data Usage dashboard
2. Review ingestion by pipeline:
   - Priority insights (High) → Most expensive
   - Analyze & alert (Medium) → Medium cost
   - Store & search (Low) → Lowest cost
3. Identify high-volume applications
```

**Step 2: Analyze Log Distribution**
```
1. Check which applications send most logs
2. Review log severity distribution
3. Identify candidates for lower priority:
   - DEBUG logs → Low priority
   - VERBOSE logs → Low priority
   - INFO logs → Medium priority
```

**Step 3: Review Current Policies**
```
1. Go to TCO Policies
2. Check if policies exist
3. If no policies → All logs in High priority
4. If policies exist → Review routing decisions
```

#### Solutions

**Solution 1: Implement Severity-Based Routing**
```
Create policies to route by severity:

Policy 1 (Priority 1):
Application: *
Subsystem: *
Severity: ERROR, CRITICAL
Pipeline: Priority insights (High)

Policy 2 (Priority 2):
Application: *
Subsystem: *
Severity: WARNING, INFO
Pipeline: Analyze & alert (Medium)

Policy 3 (Priority 3):
Application: *
Subsystem: *
Severity: DEBUG, VERBOSE
Pipeline: Store & search (Low)
```

**Solution 2: Route Non-Production to Low Priority**
```
Policy 1 (Priority 1):
Application: dev-*, test-*, staging-*
Subsystem: *
Severity: *
Pipeline: Store & search (Low)

Policy 2 (Priority 2):
Application: prod-*
Subsystem: *
Severity: ERROR, CRITICAL
Pipeline: Priority insights (High)

Policy 3 (Priority 3):
Application: prod-*
Subsystem: *
Severity: *
Pipeline: Analyze & alert (Medium)
```

**Solution 3: Application-Specific Optimization**
```
Identify high-volume, low-value logs:

Policy 1 (Priority 1):
Application: batch-processor
Subsystem: *
Severity: *
Pipeline: Store & search (Low)

Policy 2 (Priority 2):
Application: payment-service
Subsystem: *
Severity: ERROR, CRITICAL
Pipeline: Priority insights (High)
```

#### Cost Estimation
After implementing policies, estimate savings:
```
Before: 100 GB/day × $1.00 = $100/day = $3,000/month

After optimization:
- 10 GB High priority × $1.00 = $10/day
- 30 GB Medium priority × $0.50 = $15/day
- 60 GB Low priority × $0.10 = $6/day
Total: $31/day = $930/month

Savings: $2,070/month (69% reduction)
```

---

## Configuration Issues

### Problem: Cannot Create TCO Policy

#### Symptoms
- Error when creating policy
- "Data bucket not configured" message
- Policy creation button disabled

#### Root Cause
**Data bucket (IBM Cloud Object Storage) not configured**
- Required for Store & search (Low priority) pipeline
- Must be set up before creating policies

#### Solution
```
1. Go to IBM Cloud Object Storage
2. Create a bucket (or use existing)
3. In IBM Cloud Logs:
   - Go to Settings → Data Configuration
   - Configure data bucket
   - Provide bucket details and credentials
4. Wait for configuration to complete
5. Retry policy creation
```

#### Validation
1. Check Settings → Data Configuration
2. Verify data bucket shows "Connected"
3. Try creating a test policy
4. Confirm policy saves successfully

---

## Search Issues

### Problem: Cannot Find Logs

#### Symptoms
- Logs not appearing in search
- Expected logs missing
- Search returns no results

#### Root Causes
1. **Logs in wrong pipeline**
   - Searching in wrong data source
   - Logs in Store & search (slower access)

2. **Logs blocked by policy**
   - Policy drops logs
   - Logs never ingested

3. **Time range issue**
   - Searching wrong time period
   - Logs outside retention period

#### Diagnosis Steps

**Step 1: Check All Pipelines**
```
1. Go to Explore Logs
2. Change data source:
   - Try Priority insights
   - Try Analyze & alert
   - Try Store & search
3. Expand time range
```

**Step 2: Review TCO Policies**
```
1. Go to TCO Policies
2. Check if logs match any policy
3. Verify policy doesn't block logs
4. Check pipeline assignment
```

**Step 3: Verify Log Generation**
```
1. Check application is running
2. Verify logging is enabled
3. Confirm logs are being sent
4. Check for ingestion errors
```

#### Solutions

**Solution 1: Search Correct Pipeline**
```
If logs in Store & search:
1. Select "Store & search" data source
2. Note: Search may be slower
3. Consider routing to High/Medium for faster access
```

**Solution 2: Modify Blocking Policy**
```
If policy blocks logs:

Before:
Application: test-app
Subsystem: *
Severity: *
Action: Block

After:
Application: test-app
Subsystem: *
Severity: *
Pipeline: Store & search (Low)
```

**Solution 3: Adjust Time Range**
```
1. Extend search time range
2. Check retention periods:
   - Priority insights: 7 days (default)
   - Analyze & alert: 30 days
   - Store & search: Long-term
```

---

## Policy Issues

### Problem: Policy Not Working as Expected

#### Symptoms
- Logs going to wrong pipeline
- Policy seems ignored
- Unexpected routing behavior

#### Root Causes
1. **Policy priority order wrong**
   - Lower priority policy matches first
   - More specific policy evaluated after general one

2. **Wildcard matching issue**
   - Pattern doesn't match as expected
   - Case sensitivity

3. **Policy not saved/applied**
   - Changes not committed
   - System delay

#### Diagnosis Steps

**Step 1: Check Policy Order**
```
1. Go to TCO Policies
2. Review priority numbers (1, 2, 3...)
3. Verify most specific policies have lower numbers
4. Check for overlapping patterns
```

**Step 2: Test Policy Matching**
```
1. Find a sample log
2. Note its application, subsystem, severity
3. Manually match against policies in order
4. Verify expected policy matches
```

**Step 3: Verify Policy Active**
```
1. Check policy status (enabled/disabled)
2. Verify policy was saved
3. Wait 5-10 minutes for changes to propagate
```

#### Solutions

**Solution 1: Reorder Policies**
```
Before (Wrong order):
Policy 1: App="*", Sub="*", Sev="*" → Low
Policy 2: App="payment", Sub="*", Sev="ERROR" → High

After (Correct order):
Policy 1: App="payment", Sub="*", Sev="ERROR" → High
Policy 2: App="*", Sub="*", Sev="*" → Low
```

**Solution 2: Fix Wildcard Patterns**
```
Before:
Application: Payment-Service (won't match "payment-service")

After:
Application: payment-service (exact match)
or
Application: *payment* (wildcard match)
```

**Solution 3: Wait and Verify**
```
1. Save policy changes
2. Wait 10 minutes
3. Generate test logs
4. Verify routing
5. Adjust if needed
```

---

## Performance Issues

### Problem: Slow Search Performance

#### Symptoms
- Queries take long time
- Dashboard slow to load
- Timeouts

#### Root Causes
1. **Querying Store & search (Low priority)**
   - Archived data slower to access
   - Expected behavior

2. **Large time range**
   - Too much data to scan
   - Inefficient query

3. **Complex query**
   - Multiple joins
   - Heavy aggregations

#### Solutions

**Solution 1: Use High/Medium Priority for Frequent Queries**
```
Route frequently-queried logs to faster pipelines:

Policy:
Application: api-gateway
Subsystem: *
Severity: INFO, WARNING, ERROR, CRITICAL
Pipeline: Analyze & alert (Medium)
```

**Solution 2: Optimize Query**
```
1. Reduce time range
2. Add filters early in query
3. Limit result set
4. Use indexed fields
```

**Solution 3: Adjust Retention**
```
For Priority insights:
1. Reduce retention period
2. Keep only recent data in fast storage
3. Archive older data to Low priority
```

---

## Common Error Messages

### "Data bucket not configured"
**Cause**: No IBM Cloud Object Storage bucket set up  
**Fix**: Configure data bucket in Settings → Data Configuration

### "Policy priority conflict"
**Cause**: Two policies with same priority number  
**Fix**: Assign unique priority numbers to each policy

### "Invalid application pattern"
**Cause**: Malformed wildcard or special characters  
**Fix**: Use valid patterns: `*`, `app-*`, `*-service`

### "Pipeline not available"
**Cause**: Trying to use Low priority without data bucket  
**Fix**: Configure data bucket first

### "Policy limit reached"
**Cause**: Maximum number of policies exceeded  
**Fix**: Consolidate policies or contact support

---

## Escalation Checklist

Before escalating to support, gather:
- [ ] TCO policy configurations
- [ ] Sample logs showing issue
- [ ] Screenshots of error messages
- [ ] Data usage metrics
- [ ] Timeline of when issue started
- [ ] Recent configuration changes
- [ ] Expected vs actual behavior

---

## Prevention Best Practices

1. **Test in non-production first**
   - Validate policies before production
   - Monitor impact

2. **Document policy decisions**
   - Record why policies were created
   - Note expected behavior

3. **Monitor after changes**
   - Check alerts still trigger
   - Verify dashboards show data
   - Review costs

4. **Regular policy reviews**
   - Monthly review of policies
   - Adjust based on usage patterns
   - Remove obsolete policies

5. **Set up monitoring**
   - Data usage alerts
   - Cost threshold alerts
   - Alert failure notifications
---
name: cloud-logs-alerts
description: >
  Help customers create, configure, and troubleshoot alerts in IBM Cloud Logs (powered by Coralogix).
  Use this skill when users mention: "create alert", "alert not triggering", "alert configuration",
  "notification not working", "alert query", "alert conditions", "alert debugging", "set up alerts",
  "alert threshold", "alert recipients", "webhook alerts", "email alerts", or any questions about
  configuring, managing, or troubleshooting alerts in IBM Cloud Logs.
---

# IBM Cloud Logs Alerts Skill

## What this skill does
This skill helps users create and troubleshoot alerts in IBM Cloud Logs. It:
1. Guides users through alert creation with proper configuration
2. Helps debug why alerts aren't triggering
3. Validates alert queries and conditions
4. Troubleshoots TCO policy issues affecting alerts
5. Explains alert types and their use cases
6. Helps configure notification channels
7. Provides best practices for alert design

## Additional Resources
For guidance on setting up alerts for log ingestion monitoring, refer to:
- **[How to Get Alerted When Log Ingestion Exceeds Threshold](https://community.ibm.com/community/user/blogs/nishu-bharti/2025/12/19/how-to-get-alerted-when-log-ingestion-exceeds)** - Step-by-step guide for creating alerts to monitor log ingestion volumes and prevent unexpected costs

---

## Workflow

### Step 1 — Understand the User's Need
Before providing guidance, determine:
- **Creation**: Do they need to create a new alert?
- **Troubleshooting**: Is an existing alert not working?
- **Configuration**: Do they need to modify alert settings?
- **Query validation**: Is their alert query correct?
- **TCO issue**: Are logs in the wrong pipeline?

Ask ONE focused question if critical information is missing.

**Important**: When users ask about monitoring log ingestion volumes or setting up alerts for ingestion thresholds, always reference the blog post: [How to Get Alerted When Log Ingestion Exceeds Threshold](https://community.ibm.com/community/user/blogs/nishu-bharti/2025/12/19/how-to-get-alerted-when-log-ingestion-exceeds) for step-by-step guidance.

### Step 2 — Gather Context
When troubleshooting, collect:
- Alert type (Standard, Ratio, New Value, Unique Count, Time Relative, Metric, Flow)
- Alert query or condition
- Expected vs actual behavior
- Log samples that should trigger the alert
- TCO policy configuration (if applicable)
- Notification channel setup

### Step 3 — Provide Targeted Guidance
Based on the need:

**For Alert Creation:**
- Recommend appropriate alert type
- Guide query construction
- Explain condition configuration
- Set up notification channels

**For Troubleshooting:**
- Verify logs are in High/Medium priority (TCO check)
- Validate alert query syntax
- Check alert conditions and thresholds
- Verify notification channel configuration
- Test alert with sample data

### Step 4 — Present Solution with Examples
Always provide:
- Clear step-by-step instructions
- Example alert configurations
- Sample queries
- Expected behavior after changes

### Step 5 — Offer Follow-up Guidance
Suggest:
- Alert optimization tips
- Additional monitoring recommendations
- Best practices for their use case

---

## Critical Alert Concepts

### TCO Policy Impact on Alerts
⚠️ **MOST IMPORTANT**: 
- **Alerts ONLY trigger on High and Medium priority logs**
- If logs are routed to Low priority (Store & search), alerts will NOT work
- This is the #1 cause of "alert not triggering" issues

**Quick Check**:
```
1. Go to Explore Logs
2. Search for logs that should trigger alert
3. Check which pipeline they're in:
   - Priority insights (High) → ✅ Alerts work
   - Analyze & alert (Medium) → ✅ Alerts work
   - Store & search (Low) → ❌ Alerts DON'T work
```

### Alert Types

#### 1. Standard Alert
**Use Case**: Trigger when log count exceeds threshold  
**Example**: Alert when error count > 10 in 5 minutes

**Configuration**:
```
Type: Standard
Query: source logs | filter $m.severity == ERROR
Condition: More than 10 results
Time Window: 5 minutes
Group By: (optional) $m.applicationName
```

#### 2. Ratio Alert
**Use Case**: Trigger when ratio between two queries exceeds threshold  
**Example**: Alert when error rate > 5% of total requests

**Configuration**:
```
Type: Ratio
Query 1 (Numerator): source logs | filter $m.severity == ERROR | count
Query 2 (Denominator): source logs | count
Condition: Ratio > 0.05 (5%)
Time Window: 10 minutes
```

#### 3. New Value Alert
**Use Case**: Trigger when a new unique value appears  
**Example**: Alert on new error message or new failing endpoint

**Configuration**:
```
Type: New Value
Query: source logs | filter $m.severity == ERROR
Key to Track: error_message
Time Window: Look back 24 hours
```

#### 4. Unique Count Alert
**Use Case**: Trigger when unique value count exceeds threshold  
**Example**: Alert when more than 5 different services are failing

**Configuration**:
```
Type: Unique Count
Query: source logs | filter $m.severity == ERROR
Key to Count: $m.applicationName
Condition: More than 5 unique values
Time Window: 15 minutes
```

#### 5. Time Relative Alert
**Use Case**: Trigger when current value differs from historical baseline  
**Example**: Alert when error count is 2x higher than last week

**Configuration**:
```
Type: Time Relative
Query: source logs | filter $m.severity == ERROR | count
Condition: More than 2x compared to same time last week
Time Window: 5 minutes
Comparison Period: 1 week ago
```

#### 6. Metric Alert
**Use Case**: Trigger based on metric values  
**Example**: Alert when CPU usage > 80%

**Configuration**:
```
Type: Metric
Metric Query: avg(cpu_usage)
Condition: > 80
Time Window: 5 minutes
```

#### 7. Flow Alert
**Use Case**: Trigger when log flow stops or resumes  
**Example**: Alert when no logs received from critical service

**Configuration**:
```
Type: Flow
Query: source logs | filter $m.applicationName == 'payment-service'
Condition: No logs for 10 minutes
```

---

## Common Alert Scenarios

### Scenario 1: Alert Not Triggering

**Symptom**: Alert configured but never fires despite matching conditions

**Diagnosis Checklist**:
```
1. ✅ Check TCO Policy
   - Are logs in High or Medium priority?
   - If Low priority → That's the problem!

2. ✅ Verify Alert Query
   - Run query in Explore Logs
   - Does it return expected results?
   - Check field names are correct

3. ✅ Check Alert Conditions
   - Is threshold appropriate?
   - Is time window correct?
   - Are group-by fields valid?

4. ✅ Verify Alert is Enabled
   - Check alert status
   - Ensure not in maintenance window

5. ✅ Check Notification Channel
   - Is channel configured?
   - Are recipients correct?
   - Check spam/junk folders
```

**Common Causes & Solutions**:

**Cause 1: Logs in Low Priority**
```
Problem: TCO policy routes logs to Store & search (Low)
Solution: Modify TCO policy to route to High or Medium

Example Fix:
Policy:
  Application: payment-service
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
```

**Cause 2: Incorrect Query**
```
Problem: Query doesn't match actual log structure
Solution: Test query in Explore Logs first

Example:
Wrong: filter severity == "ERROR"
Right: filter $m.severity == ERROR
```

**Cause 3: Threshold Too High**
```
Problem: Condition never met
Solution: Adjust threshold based on actual data

Example:
Wrong: More than 1000 results (but max is 50)
Right: More than 10 results
```

### Scenario 2: Creating Error Count Alert

**Goal**: Alert when errors exceed threshold

**Step-by-Step**:
```
1. Choose Alert Type: Standard

2. Define Query:
   source logs
   | filter $m.severity == ERROR
   | filter $m.applicationName == 'payment-service'

3. Set Condition:
   - More than: 10
   - In time window: 5 minutes

4. Configure Notifications:
   - Channel: Email
   - Recipients: ops-team@company.com
   - Severity: High

5. Set Alert Details:
   - Name: "Payment Service - High Error Rate"
   - Description: "Triggers when payment service errors exceed 10 in 5 minutes"
   - Tags: production, payment, critical
```

### Scenario 3: Creating Ratio Alert for Error Rate

**Goal**: Alert when error rate exceeds percentage of total requests

**Step-by-Step**:
```
1. Choose Alert Type: Ratio

2. Define Numerator Query (Errors):
   source logs
   | filter $m.applicationName == 'api-gateway'
   | filter $m.severity == ERROR
   | count

3. Define Denominator Query (Total):
   source logs
   | filter $m.applicationName == 'api-gateway'
   | count

4. Set Condition:
   - Ratio greater than: 0.05 (5%)
   - Time window: 10 minutes

5. Configure Notifications:
   - Channel: Slack
   - Channel: #alerts-production
   - Severity: Medium
```

### Scenario 4: Creating New Value Alert

**Goal**: Alert on new error messages

**Step-by-Step**:
```
1. Choose Alert Type: New Value

2. Define Query:
   source logs
   | filter $m.severity == ERROR
   | filter $m.applicationName == 'web-app'

3. Set Key to Track:
   - Field: error_message
   - Look back period: 24 hours

4. Configure Notifications:
   - Channel: PagerDuty
   - Severity: High
   - Note: "New error type detected"
```

### Scenario 5: Creating Flow Alert

**Goal**: Alert when logs stop flowing from critical service

**Step-by-Step**:
```
1. Choose Alert Type: Flow

2. Define Query:
   source logs
   | filter $m.applicationName == 'payment-service'

3. Set Condition:
   - Alert when: No logs received
   - For duration: 10 minutes

4. Configure Notifications:
   - Channel: PagerDuty
   - Severity: Critical
   - Note: "Payment service stopped sending logs"
```

---

## Alert Query Best Practices

### 1. Use Specific Filters
```
❌ Bad:
source logs | filter $m.severity == ERROR

✅ Good:
source logs
| filter $m.severity == ERROR
| filter $m.applicationName == 'payment-service'
| filter $m.subsystemName == 'transaction'
```

### 2. Test Queries First
```
Always test in Explore Logs before creating alert:
1. Run query
2. Verify results match expectations
3. Check field names are correct
4. Validate time range
```

### 3. Use Appropriate Aggregations
```
For count-based alerts:
source logs | filter condition | count

For grouped counts:
source logs
| filter condition
| groupby $m.applicationName aggregate count() as error_count

For metrics:
source logs
| filter condition
| groupby $m.applicationName aggregate avg(response_time) as avg_time
```

### 4. Handle Missing Fields
```
Check for field existence:
source logs
| filter error_code != null
| filter error_code >= 500
```

### 5. Use Time-Based Filters Wisely
```
For recent data:
source logs
| filter $m.timestamp >= now() - 5m
| filter $m.severity == ERROR
```

---

## Notification Channels

### Email
**Configuration**:
```
- Recipients: comma-separated emails
- Subject: Custom subject line
- Body: Custom message with variables
```

**Variables Available**:
- `{{alert_name}}` - Alert name
- `{{alert_description}}` - Alert description
- `{{alert_severity}}` - Alert severity
- `{{result_count}}` - Number of matching logs
- `{{alert_url}}` - Link to alert in UI

### Slack
**Configuration**:
```
- Webhook URL: Slack incoming webhook
- Channel: #channel-name
- Message: Custom message with variables
```

### PagerDuty
**Configuration**:
```
- Integration Key: PagerDuty service key
- Severity: Maps to PagerDuty severity
- Details: Custom incident details
```

### Webhook
**Configuration**:
```
- URL: Endpoint to receive alert
- Method: POST
- Headers: Custom headers
- Body: JSON payload with alert data
```

---

## Troubleshooting Guide

### Issue: "Alert triggers too frequently"

**Diagnosis**:
```
1. Check threshold - is it too low?
2. Review time window - is it too short?
3. Examine log volume - is it higher than expected?
```

**Solutions**:
```
1. Increase threshold
2. Extend time window
3. Add more specific filters
4. Use ratio alert instead of count
5. Implement alert suppression/grouping
```

### Issue: "Alert never triggers"

**Diagnosis**:
```
1. ✅ TCO Policy Check (MOST COMMON)
   - Verify logs in High/Medium priority
   
2. ✅ Query Validation
   - Test query in Explore Logs
   - Check for syntax errors
   
3. ✅ Condition Check
   - Is threshold reachable?
   - Is time window appropriate?
   
4. ✅ Alert Status
   - Is alert enabled?
   - Check for maintenance windows
```

**Solutions**:
```
1. Fix TCO policy routing
2. Correct query syntax
3. Adjust threshold/conditions
4. Enable alert if disabled
```

### Issue: "Notifications not received"

**Diagnosis**:
```
1. Check notification channel configuration
2. Verify recipient addresses/webhooks
3. Check spam/junk folders (email)
4. Review channel permissions (Slack)
5. Validate integration keys (PagerDuty)
```

**Solutions**:
```
1. Reconfigure notification channel
2. Update recipient information
3. Test channel with test alert
4. Check service status of notification provider
```

### Issue: "Alert query returns no results"

**Diagnosis**:
```
1. Field names incorrect
2. Filters too restrictive
3. Time range doesn't include data
4. Logs in wrong pipeline
```

**Solutions**:
```
1. Verify field names in sample logs
2. Simplify filters
3. Extend time range
4. Check TCO policy
```

---

## Alert Design Best Practices

### 1. Alert Naming Convention
```
Format: [Service] - [Condition] - [Severity]

Examples:
✅ "Payment Service - High Error Rate - Critical"
✅ "API Gateway - Slow Response Time - Warning"
✅ "Auth Service - Failed Logins - High"
```

### 2. Alert Severity Levels
```
Critical: Immediate action required, service down
High: Urgent attention needed, degraded service
Medium: Important but not urgent
Low: Informational, no immediate action
```

### 3. Alert Grouping
```
Group related alerts by:
- Application/Service
- Environment (prod, staging, dev)
- Team ownership
- Business impact
```

### 4. Alert Suppression
```
Prevent alert fatigue:
- Set minimum time between alerts
- Use alert grouping
- Implement escalation policies
- Schedule maintenance windows
```

### 5. Alert Documentation
```
Include in alert description:
- What the alert means
- Why it's important
- How to investigate
- Who to contact
- Runbook link
```

---

## Query Validation Checklist

Before creating an alert, validate:

```
✅ Query runs successfully in Explore Logs
✅ Query returns expected results
✅ Field names match actual log structure
✅ Filters are not too restrictive
✅ Time window is appropriate
✅ Aggregations are correct
✅ Group-by fields exist in logs
✅ Logs are in High or Medium priority
✅ Query performance is acceptable
✅ Query handles missing fields gracefully
```

---

## Common Query Patterns

### Pattern 1: Error Count by Service
```
source logs
| filter $m.severity == ERROR
| groupby $m.applicationName aggregate count() as error_count
| orderby -$d.error_count
```

### Pattern 2: Slow Requests
```
source logs
| filter response_time > 2000
| filter $m.applicationName == 'api-gateway'
| count
```

### Pattern 3: Failed Authentication
```
source logs
| filter event_type == 'authentication'
| filter status == 'failed'
| groupby user_id aggregate count() as failed_attempts
| filter $d.failed_attempts > 3
```

### Pattern 4: High Error Rate
```
source logs
| filter $m.applicationName == 'web-app'
| groupby $m.severity aggregate count() as log_count
| filter $m.severity == ERROR
```

### Pattern 5: Missing Expected Logs
```
source logs
| filter $m.applicationName == 'health-check'
| filter message ~ 'heartbeat'
| count
```

---

## TCO Policy Considerations for Alerts

### Ensure Alert-Critical Logs in High/Medium Priority

**Example Policy for Alerts**:
```
Policy 1 (Priority 1):
  Application: payment-service, auth-service
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
  Reason: Critical alerts needed

Policy 2 (Priority 2):
  Application: api-gateway, web-app
  Subsystem: *
  Severity: WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
  Reason: Standard monitoring alerts

Policy 3 (Priority 3):
  Application: *
  Subsystem: *
  Severity: DEBUG, VERBOSE
  Pipeline: Store & search (Low)
  Reason: Archive only, no alerts needed
```

---

## Delivering Excellence

- Always check TCO policy first when troubleshooting alerts
- Test queries in Explore Logs before creating alerts
- Provide specific, actionable alert configurations
- Explain WHY certain configurations are recommended
- Warn about alert fatigue and over-alerting
- Suggest appropriate alert types for use cases
- Include notification channel setup guidance
- Offer query optimization tips
- Recommend alert naming and documentation standards
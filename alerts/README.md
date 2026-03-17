# IBM Cloud Logs Alerts Skill

A comprehensive skill for creating, configuring, and troubleshooting alerts in IBM Cloud Logs (powered by Coralogix). This skill helps customers set up effective monitoring, debug alert issues, and optimize alert configurations.

## What This Skill Does

This skill helps you:
- **Create Alerts**: Guide through alert creation with proper configuration
- **Debug Issues**: Troubleshoot why alerts aren't triggering
- **Validate Queries**: Ensure alert queries are correct and efficient
- **Fix TCO Problems**: Resolve TCO policy issues affecting alerts
- **Configure Notifications**: Set up email, Slack, PagerDuty, and webhook channels
- **Optimize Alerts**: Reduce false positives and improve alert effectiveness

## Skill Contents

### 📁 `SKILL.md`
Comprehensive skill documentation covering:
- Alert creation workflow
- 7 alert types with examples
- Common scenarios and solutions
- Query best practices
- TCO policy considerations
- Troubleshooting guide

### 📚 `references/`
Detailed reference documentation:

#### `alert-types.md`
Complete alert types reference covering:
- Standard, Ratio, New Value, Unique Count alerts
- Time Relative, Metric, and Flow alerts
- Configuration parameters for each type
- Use cases and examples
- Alert severity levels
- Best practices

#### `troubleshooting.md`
Comprehensive troubleshooting guide including:
- Quick diagnosis table
- TCO policy issues (most common)
- Query problems and solutions
- False positive reduction
- Notification channel debugging
- Configuration issues
- Performance optimization

## Critical Concept

⚠️ **MOST IMPORTANT**: 
- **Alerts ONLY trigger on High and Medium priority logs**
- If logs are routed to Low priority (Store & search) by TCO policy, alerts will NOT work
- This is the #1 cause of "alert not triggering" issues

## Alert Types Overview

| Alert Type | Use Case | Example |
|------------|----------|---------|
| **Standard** | Count-based thresholds | Error count > 10 in 5 minutes |
| **Ratio** | Percentage-based conditions | Error rate > 5% |
| **New Value** | Detect new occurrences | New error message detected |
| **Unique Count** | Count distinct values | > 5 services failing |
| **Time Relative** | Compare to historical data | 2x more errors than last week |
| **Metric** | Numeric metric thresholds | CPU > 80% |
| **Flow** | Log flow monitoring | No logs for 10 minutes |

## Quick Start Examples

### Example 1: Create Error Count Alert

**Goal**: Alert when errors exceed threshold

```yaml
Name: "Payment Service - High Error Count"
Type: Standard
Query: |
  source logs
  | filter $m.severity == ERROR
  | filter $m.applicationName == 'payment-service'
Condition: More than 10
Time Window: 5 minutes
Notifications: Email to ops-team@company.com
Severity: High
```

### Example 2: Create Error Rate Alert

**Goal**: Alert when error rate exceeds percentage

```yaml
Name: "API Gateway - High Error Rate"
Type: Ratio
Query 1 (Errors): |
  source logs
  | filter $m.applicationName == 'api-gateway'
  | filter $m.severity == ERROR
  | count
Query 2 (Total): |
  source logs
  | filter $m.applicationName == 'api-gateway'
  | count
Condition: Ratio > 0.05 (5%)
Time Window: 10 minutes
Notifications: Slack #api-alerts
Severity: High
```

### Example 3: Create New Error Alert

**Goal**: Alert on new error messages

```yaml
Name: "Web App - New Error Detected"
Type: New Value
Query: |
  source logs
  | filter $m.severity == ERROR
  | filter $m.applicationName == 'web-app'
Key to Track: error_message
Lookback Period: 24 hours
Notifications: Slack #dev-alerts
Severity: Medium
```

### Example 4: Create Service Health Alert

**Goal**: Alert when service stops logging

```yaml
Name: "Payment Service - Stopped Logging"
Type: Flow
Query: |
  source logs
  | filter $m.applicationName == 'payment-service'
Condition: No logs for 10 minutes
Notifications: PagerDuty
Severity: Critical
```

## Common Issues and Solutions

### Issue 1: Alert Not Triggering

**Most Common Cause**: Logs in Low priority (TCO policy issue)

**Quick Fix**:
```
1. Check which pipeline logs are in (Explore Logs)
2. If "Store & search" (Low) → Modify TCO policy
3. Route logs to High or Medium priority
4. Wait 5-10 minutes for changes to take effect
```

**TCO Policy Fix**:
```yaml
Policy:
  Application: payment-service
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
```

### Issue 2: Alert Triggers Too Often

**Cause**: Threshold too low or time window too short

**Solutions**:
```
1. Increase threshold (e.g., from 1 to 20)
2. Extend time window (e.g., from 1 min to 10 min)
3. Add more specific filters
4. Use ratio alert instead of count
5. Implement alert suppression
```

### Issue 3: Query Returns No Results

**Cause**: Incorrect field names or syntax

**Solutions**:
```
1. Test query in Explore Logs first
2. Check field names in sample logs
3. Use correct metadata prefix ($m.)
4. Verify case sensitivity
5. Add null checks for optional fields
```

### Issue 4: Notifications Not Received

**Cause**: Channel misconfiguration

**Solutions by Channel**:
```
Email:
- Check spam/junk folder
- Verify email addresses
- Add sender to safe list

Slack:
- Verify webhook URL
- Check channel permissions
- Test webhook with curl

PagerDuty:
- Verify integration key
- Check service status
- Review escalation policy

Webhook:
- Test endpoint accessibility
- Verify POST method accepted
- Check authentication
```

## Alert Creation Workflow

### Step 1: Define Requirements
```
- What are you monitoring?
- What condition triggers the alert?
- How urgent is it?
- Who should be notified?
```

### Step 2: Choose Alert Type
```
Count-based → Standard Alert
Rate-based → Ratio Alert
New occurrences → New Value Alert
Multiple failures → Unique Count Alert
Anomalies → Time Relative Alert
Metrics → Metric Alert
Service health → Flow Alert
```

### Step 3: Build Query
```
1. Start in Explore Logs
2. Build query incrementally
3. Test with sample data
4. Verify results
5. Optimize performance
```

### Step 4: Configure Conditions
```
1. Set appropriate threshold
2. Choose time window
3. Add group by if needed
4. Set alert severity
```

### Step 5: Set Up Notifications
```
1. Choose notification channel
2. Configure recipients
3. Customize message
4. Test notification
```

### Step 6: Test and Deploy
```
1. Save alert
2. Generate test data
3. Verify alert triggers
4. Check notification received
5. Monitor and adjust
```

## Query Best Practices

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
2. Verify results
3. Check field names
4. Validate time range
5. Optimize performance
```

### 3. Use Correct Field References
```
Metadata fields: $m.severity, $m.applicationName, $m.timestamp
Data fields: error_code, response_time, user_id
Aggregated fields: $d.count, $d.avg_time (after groupby)
```

### 4. Handle Missing Fields
```
Add null checks:
source logs
| filter error_code != null
| filter error_code >= 500
```

### 5. Optimize Performance
```
- Add filters early in query
- Use specific field names
- Avoid unnecessary aggregations
- Keep time windows reasonable
```

## TCO Policy Considerations

### Ensure Alert-Critical Logs in High/Medium Priority

**Example Policy Configuration**:
```yaml
# Critical services - High priority
Policy 1 (Priority 1):
  Application: payment-service, auth-service
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
  Reason: Critical alerts needed

# Standard services - Medium priority
Policy 2 (Priority 2):
  Application: api-gateway, web-app
  Subsystem: *
  Severity: WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
  Reason: Standard monitoring alerts

# Debug logs - Low priority
Policy 3 (Priority 3):
  Application: *
  Subsystem: *
  Severity: DEBUG, VERBOSE
  Pipeline: Store & search (Low)
  Reason: Archive only, no alerts
```

## Notification Channels

### Email
```yaml
Configuration:
  Recipients: ops-team@company.com, dev-team@company.com
  Subject: "[{{alert_severity}}] {{alert_name}}"
  Body: "Alert triggered: {{result_count}} matches"
```

### Slack
```yaml
Configuration:
  Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
  Channel: #alerts-production
  Message: "🚨 {{alert_name}}: {{result_count}} matches"
```

### PagerDuty
```yaml
Configuration:
  Integration Key: YOUR_PAGERDUTY_KEY
  Severity: Maps to alert severity
  Details: Include alert context
```

### Webhook
```yaml
Configuration:
  URL: https://your-endpoint.com/alerts
  Method: POST
  Headers: Authorization: Bearer TOKEN
  Body: JSON with alert data
```

## Alert Severity Guidelines

### Critical
- **Impact**: Service down or major functionality broken
- **Response**: Immediate action required (24/7)
- **Examples**: Payment processing down, authentication failing
- **Notification**: PagerDuty + Email

### High
- **Impact**: Degraded service or important functionality affected
- **Response**: Urgent attention needed (within 1 hour)
- **Examples**: High error rate, slow response times
- **Notification**: PagerDuty or Email

### Medium
- **Impact**: Minor issues or potential problems
- **Response**: Should be addressed soon (within 4 hours)
- **Examples**: Elevated warnings, new error types
- **Notification**: Email or Slack

### Low
- **Impact**: Informational or minor anomalies
- **Response**: Can be addressed during business hours
- **Examples**: Unusual patterns, low-priority warnings
- **Notification**: Email or Slack

## Troubleshooting Checklist

When an alert isn't working:

```
1. ✅ Check TCO Policy (MOST IMPORTANT)
   - Are logs in High or Medium priority?
   - Review TCO policy routing
   - Test with sample logs

2. ✅ Validate Query
   - Test in Explore Logs
   - Check field names
   - Verify filters

3. ✅ Review Conditions
   - Is threshold appropriate?
   - Is time window correct?
   - Check operators

4. ✅ Verify Alert Status
   - Is alert enabled?
   - Check maintenance windows
   - Review alert history

5. ✅ Test Notifications
   - Verify channel configuration
   - Test with manual trigger
   - Check recipient settings
```

## Best Practices

### 1. Alert Naming Convention
```
Format: [Service] - [Condition] - [Severity]

Examples:
✅ "Payment Service - High Error Rate - Critical"
✅ "API Gateway - Slow Response Time - High"
✅ "Auth Service - Failed Logins - Medium"
```

### 2. Alert Documentation
```
Include in alert description:
- What the alert monitors
- Why it's important
- How to investigate
- Who to contact
- Link to runbook
```

### 3. Avoid Alert Fatigue
```
- Set appropriate thresholds
- Use alert suppression
- Group related alerts
- Schedule maintenance windows
- Review and tune regularly
```

### 4. Test Before Deploying
```
- Test query in Explore Logs
- Verify with historical data
- Use alert preview
- Start with low severity
- Monitor and adjust
```

### 5. Regular Maintenance
```
Monthly:
- Review alert effectiveness
- Check false positive rate
- Adjust thresholds
- Remove obsolete alerts
- Update documentation
```

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

### Pattern 4: Service Health Check
```
source logs
| filter $m.applicationName == 'health-check'
| filter message ~ 'heartbeat'
| count
```

## Support and Documentation

### Skill Documentation
- `SKILL.md` - Complete skill guide
- `references/alert-types.md` - Alert types reference
- `references/troubleshooting.md` - Troubleshooting guide

### IBM Cloud Logs Documentation
- [Alerts Documentation](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-alerts)
- [DataPrime Query Language](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-dataprime-query-language)
- [TCO Optimizer](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-tco-optimizer)

### Coralogix Documentation
- [Introduction to Alerts](https://coralogix.com/docs/user-guides/alerting/introduction-to-alerts/)

## Common Questions

### Q: Why isn't my alert triggering?
**A**: Most likely, your logs are in Low priority (Store & search). Alerts only work with High and Medium priority logs. Check your TCO policy.

### Q: How do I reduce false positives?
**A**: Increase threshold, extend time window, add more specific filters, or use ratio alerts instead of count alerts.

### Q: What's the best alert type for error monitoring?
**A**: Standard alert for error counts, Ratio alert for error rates, New Value alert for new error types.

### Q: How do I test an alert before deploying?
**A**: Test the query in Explore Logs first, use alert preview with historical data, and start with low severity.

### Q: Can I alert on logs in Low priority?
**A**: No. Alerts only work with High and Medium priority logs. You must modify your TCO policy to route logs to High or Medium priority.

### Q: How long does it take for an alert to trigger?
**A**: Alerts are evaluated based on the time window. For a 5-minute window, the alert evaluates every 5 minutes.

---

**Version**: 1.0  
**Last Updated**: 2026-03-17  
**Maintained by**: Nishu Bharti (nishu.bharti1@ibm.com)
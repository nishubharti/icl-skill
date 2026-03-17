# Alert Types Reference

## Overview
IBM Cloud Logs (powered by Coralogix) supports multiple alert types, each designed for specific monitoring scenarios. This reference provides detailed information about each alert type, when to use it, and how to configure it.

---

## Alert Type Comparison

| Alert Type | Use Case | Complexity | Best For |
|------------|----------|------------|----------|
| **Standard** | Count-based thresholds | Simple | Error counts, log volume |
| **Ratio** | Percentage-based conditions | Medium | Error rates, success rates |
| **New Value** | Detect new occurrences | Simple | New errors, new endpoints |
| **Unique Count** | Count distinct values | Medium | Unique users, unique errors |
| **Time Relative** | Compare to historical data | Complex | Anomaly detection, trends |
| **Metric** | Numeric metric thresholds | Simple | CPU, memory, latency |
| **Flow** | Log flow monitoring | Simple | Service health, data pipeline |

---

## 1. Standard Alert

### Description
Triggers when the number of logs matching a query exceeds (or falls below) a threshold within a time window.

### When to Use
- Monitor error counts
- Track log volume
- Detect spikes in activity
- Count specific events

### Configuration Parameters

#### Query
- **Type**: DataPrime query
- **Purpose**: Filter logs to count
- **Example**:
  ```
  source logs
  | filter $m.severity == ERROR
  | filter $m.applicationName == 'payment-service'
  ```

#### Condition
- **Operators**: More than, Less than, More than usual
- **Threshold**: Numeric value
- **Example**: More than 10

#### Time Window
- **Range**: 1 minute to 24 hours
- **Common values**: 5 minutes, 15 minutes, 1 hour
- **Purpose**: Period to evaluate condition

#### Group By (Optional)
- **Purpose**: Create separate alerts per group
- **Fields**: Any log field
- **Example**: `$m.applicationName`, `region`, `environment`

### Examples

#### Example 1: High Error Count
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

#### Example 2: Low Log Volume
```yaml
Name: "Health Check - Missing Logs"
Type: Standard
Query: |
  source logs
  | filter $m.applicationName == 'health-check'
  | filter message ~ 'heartbeat'
Condition: Less than 1
Time Window: 10 minutes
Notifications: PagerDuty
Severity: Critical
```

#### Example 3: Grouped by Service
```yaml
Name: "All Services - Error Monitoring"
Type: Standard
Query: |
  source logs
  | filter $m.severity == ERROR
Condition: More than 5
Time Window: 5 minutes
Group By: $m.applicationName
Notifications: Slack #alerts
Severity: Medium
```

---

## 2. Ratio Alert

### Description
Triggers when the ratio between two queries exceeds a threshold. Useful for percentage-based monitoring.

### When to Use
- Monitor error rates (errors / total requests)
- Track success rates
- Calculate percentages
- Compare two metrics

### Configuration Parameters

#### Query 1 (Numerator)
- **Purpose**: Count for numerator
- **Example**:
  ```
  source logs
  | filter $m.severity == ERROR
  | count
  ```

#### Query 2 (Denominator)
- **Purpose**: Count for denominator
- **Example**:
  ```
  source logs
  | count
  ```

#### Condition
- **Operators**: Greater than, Less than
- **Threshold**: Decimal value (0.05 = 5%)
- **Example**: Greater than 0.05

#### Time Window
- **Range**: 1 minute to 24 hours
- **Purpose**: Period to evaluate both queries

### Examples

#### Example 1: Error Rate
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

#### Example 2: Failed Login Rate
```yaml
Name: "Auth Service - High Failed Login Rate"
Type: Ratio
Query 1 (Failed): |
  source logs
  | filter event_type == 'login'
  | filter status == 'failed'
  | count
Query 2 (Total): |
  source logs
  | filter event_type == 'login'
  | count
Condition: Ratio > 0.10 (10%)
Time Window: 15 minutes
Notifications: Email to security@company.com
Severity: High
```

---

## 3. New Value Alert

### Description
Triggers when a new unique value appears in a specified field that hasn't been seen in the lookback period.

### When to Use
- Detect new error messages
- Monitor new failing endpoints
- Track new error codes
- Identify new failing services

### Configuration Parameters

#### Query
- **Purpose**: Filter logs to monitor
- **Example**:
  ```
  source logs
  | filter $m.severity == ERROR
  ```

#### Key to Track
- **Purpose**: Field to monitor for new values
- **Examples**: `error_message`, `endpoint`, `error_code`

#### Lookback Period
- **Range**: 1 hour to 30 days
- **Common values**: 24 hours, 7 days
- **Purpose**: Historical period to check against

### Examples

#### Example 1: New Error Messages
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

#### Example 2: New Failing Endpoints
```yaml
Name: "API - New Failing Endpoint"
Type: New Value
Query: |
  source logs
  | filter status_code >= 500
  | filter $m.applicationName == 'api-gateway'
Key to Track: endpoint
Lookback Period: 7 days
Notifications: Email to api-team@company.com
Severity: High
```

---

## 4. Unique Count Alert

### Description
Triggers when the number of unique values in a field exceeds a threshold.

### When to Use
- Count unique failing services
- Monitor unique error types
- Track unique affected users
- Count distinct endpoints with issues

### Configuration Parameters

#### Query
- **Purpose**: Filter logs to analyze
- **Example**:
  ```
  source logs
  | filter $m.severity == ERROR
  ```

#### Key to Count
- **Purpose**: Field to count unique values
- **Examples**: `$m.applicationName`, `user_id`, `error_code`

#### Condition
- **Operators**: More than, Less than
- **Threshold**: Numeric value
- **Example**: More than 5

#### Time Window
- **Range**: 1 minute to 24 hours
- **Purpose**: Period to count unique values

### Examples

#### Example 1: Multiple Services Failing
```yaml
Name: "Platform - Multiple Services Failing"
Type: Unique Count
Query: |
  source logs
  | filter $m.severity == ERROR
Key to Count: $m.applicationName
Condition: More than 5 unique values
Time Window: 15 minutes
Notifications: PagerDuty
Severity: Critical
```

#### Example 2: Multiple Users Affected
```yaml
Name: "Auth - Multiple Users Failing Login"
Type: Unique Count
Query: |
  source logs
  | filter event_type == 'login'
  | filter status == 'failed'
Key to Count: user_id
Condition: More than 10 unique values
Time Window: 5 minutes
Notifications: Slack #security-alerts
Severity: High
```

---

## 5. Time Relative Alert

### Description
Triggers when current metric differs significantly from historical baseline (same time in the past).

### When to Use
- Detect anomalies
- Compare to previous week/day
- Identify unusual patterns
- Trend analysis

### Configuration Parameters

#### Query
- **Purpose**: Metric to compare
- **Example**:
  ```
  source logs
  | filter $m.severity == ERROR
  | count
  ```

#### Condition
- **Operators**: More than, Less than
- **Multiplier**: How many times different (e.g., 2x, 3x)
- **Example**: More than 2x

#### Time Window
- **Range**: 1 minute to 24 hours
- **Purpose**: Current period to evaluate

#### Comparison Period
- **Options**: Same time yesterday, last week, last month
- **Purpose**: Historical baseline to compare against

### Examples

#### Example 1: Error Spike vs Last Week
```yaml
Name: "Payment - Error Spike Detected"
Type: Time Relative
Query: |
  source logs
  | filter $m.applicationName == 'payment-service'
  | filter $m.severity == ERROR
  | count
Condition: More than 2x
Time Window: 5 minutes
Comparison Period: Same time last week
Notifications: Email to ops@company.com
Severity: High
```

#### Example 2: Traffic Drop
```yaml
Name: "API - Unusual Traffic Drop"
Type: Time Relative
Query: |
  source logs
  | filter $m.applicationName == 'api-gateway'
  | count
Condition: Less than 0.5x (50% drop)
Time Window: 10 minutes
Comparison Period: Same time yesterday
Notifications: Slack #api-monitoring
Severity: Medium
```

---

## 6. Metric Alert

### Description
Triggers based on numeric metric values (CPU, memory, latency, etc.).

### When to Use
- Monitor system metrics
- Track performance metrics
- Alert on resource usage
- Monitor SLIs/SLOs

### Configuration Parameters

#### Metric Query
- **Purpose**: Metric to monitor
- **Aggregations**: avg, sum, min, max, percentile
- **Example**: `avg(response_time)`, `max(cpu_usage)`

#### Condition
- **Operators**: >, <, >=, <=, ==
- **Threshold**: Numeric value
- **Example**: > 80

#### Time Window
- **Range**: 1 minute to 24 hours
- **Purpose**: Period to evaluate metric

### Examples

#### Example 1: High CPU Usage
```yaml
Name: "Server - High CPU Usage"
Type: Metric
Metric Query: avg(cpu_usage)
Condition: > 80
Time Window: 5 minutes
Notifications: PagerDuty
Severity: High
```

#### Example 2: Slow Response Time
```yaml
Name: "API - Slow Response Time"
Type: Metric
Metric Query: percentile(response_time, 95)
Condition: > 2000
Time Window: 10 minutes
Notifications: Slack #performance
Severity: Medium
```

---

## 7. Flow Alert

### Description
Triggers when log flow stops or resumes for a specified duration.

### When to Use
- Monitor service health
- Detect data pipeline issues
- Track heartbeat logs
- Ensure continuous logging

### Configuration Parameters

#### Query
- **Purpose**: Logs to monitor for flow
- **Example**:
  ```
  source logs
  | filter $m.applicationName == 'payment-service'
  ```

#### Condition
- **Options**: No logs received, Logs resumed
- **Duration**: How long to wait before alerting
- **Example**: No logs for 10 minutes

### Examples

#### Example 1: Service Stopped Logging
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

#### Example 2: Heartbeat Missing
```yaml
Name: "Health Check - Heartbeat Missing"
Type: Flow
Query: |
  source logs
  | filter $m.applicationName == 'health-check'
  | filter message ~ 'heartbeat'
Condition: No logs for 5 minutes
Notifications: Email to ops@company.com
Severity: High
```

---

## Alert Severity Levels

### Critical
- **Impact**: Service down or major functionality broken
- **Response**: Immediate action required
- **Examples**: Payment processing down, authentication failing
- **Notification**: PagerDuty, SMS, Phone call

### High
- **Impact**: Degraded service or important functionality affected
- **Response**: Urgent attention needed
- **Examples**: High error rate, slow response times
- **Notification**: PagerDuty, Email, Slack

### Medium
- **Impact**: Minor issues or potential problems
- **Response**: Should be addressed soon
- **Examples**: Elevated warnings, new error types
- **Notification**: Email, Slack

### Low
- **Impact**: Informational or minor anomalies
- **Response**: Can be addressed during business hours
- **Examples**: Unusual patterns, low-priority warnings
- **Notification**: Email, Slack

---

## Alert Configuration Best Practices

### 1. Choose the Right Alert Type
```
Error counts → Standard Alert
Error rates → Ratio Alert
New errors → New Value Alert
Multiple failures → Unique Count Alert
Anomalies → Time Relative Alert
Metrics → Metric Alert
Service health → Flow Alert
```

### 2. Set Appropriate Thresholds
```
Too low → Alert fatigue
Too high → Miss important issues
Right balance → Based on historical data
```

### 3. Use Meaningful Time Windows
```
Short (1-5 min) → Critical, fast-changing metrics
Medium (5-15 min) → Standard monitoring
Long (15-60 min) → Trend analysis
```

### 4. Group Alerts Wisely
```
Group by service → Separate alerts per service
Group by region → Separate alerts per region
No grouping → Single alert for all
```

### 5. Configure Notifications Appropriately
```
Critical → Multiple channels (PagerDuty + Email)
High → Primary channel (PagerDuty or Email)
Medium → Team channel (Slack)
Low → Email digest
```

---

## Common Alert Patterns

### Pattern 1: Tiered Error Monitoring
```
Alert 1 (Critical):
  Condition: > 100 errors in 5 minutes
  Notification: PagerDuty

Alert 2 (High):
  Condition: > 50 errors in 5 minutes
  Notification: Email

Alert 3 (Medium):
  Condition: > 20 errors in 5 minutes
  Notification: Slack
```

### Pattern 2: Multi-Service Monitoring
```
Alert: Multiple Services Failing
Type: Unique Count
Key: $m.applicationName
Condition: > 3 unique services
Indicates: Platform-wide issue
```

### Pattern 3: Baseline Comparison
```
Alert: Unusual Error Pattern
Type: Time Relative
Comparison: Last week same time
Condition: > 2x increase
Indicates: Anomaly or regression
```

---

## Alert Maintenance

### Regular Reviews
- Review alert effectiveness monthly
- Adjust thresholds based on trends
- Remove obsolete alerts
- Update notification channels

### Alert Tuning
- Reduce false positives
- Ensure critical alerts trigger
- Balance sensitivity vs noise
- Test with historical data

### Documentation
- Document alert purpose
- Include investigation steps
- Link to runbooks
- Note escalation procedures
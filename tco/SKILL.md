---
name: tco-policy-optimizer
description: >
  Help customers optimize Total Cost of Ownership (TCO) for IBM Cloud Logs by configuring
  TCO policies, troubleshooting data pipeline issues, and debugging alert/dashboard problems
  related to log priority levels. Use this skill when users mention: "TCO", "cost optimization",
  "data pipelines", "priority insights", "alerts not triggering", "logs not flowing", "high/medium/low
  priority", "TCO policy", "control costs", "optimize logging costs", or any questions about
  configuring log data routing and cost management in IBM Cloud Logs.
---

# TCO Policy Optimizer for IBM Cloud Logs

## What this skill does
This skill helps users optimize their IBM Cloud Logs costs and troubleshoot TCO-related issues. It:
1. Guides users in creating effective TCO policies to control costs
2. Helps debug why alerts aren't triggering (only High/Medium priority logs trigger alerts)
3. Troubleshoots dashboard issues (only High/Medium priority logs appear in dashboards)
4. Explains data pipeline routing and priority levels
5. Provides cost optimization strategies
6. Helps diagnose data flow issues across pipelines

---

## Workflow

### Step 1 — Understand the User's Goal
Before providing guidance, determine:
- **Cost concern**: Are they trying to reduce costs or understand current spending?
- **Functional issue**: Are alerts not triggering? Dashboards showing no data?
- **Configuration need**: Do they need to create or modify TCO policies?
- **Data flow question**: Are logs not appearing where expected?

Ask ONE focused question if critical information is missing.

### Step 2 — Assess Current Configuration
When troubleshooting, gather:
- Current TCO policies (if any)
- Which data pipeline logs are flowing to (Priority insights, Analyze & alert, Store & search)
- Alert configurations and expected behavior
- Dashboard queries and data sources
- Log severity levels being generated

### Step 3 — Provide Targeted Guidance
Based on the issue:

**For Cost Optimization:**
- Explain the three data pipelines and their costs
- Guide policy creation to route less critical logs to cheaper pipelines
- Recommend appropriate priority levels for different log types

**For Alert Issues:**
- Verify logs are flowing to High or Medium priority (Priority insights or Analyze & alert)
- Check TCO policy configuration
- Confirm alert query matches log priority level

**For Dashboard Issues:**
- Verify data source includes High/Medium priority logs
- Check TCO policies aren't routing all logs to Low priority
- Validate dashboard queries

### Step 4 — Present Solution with Examples
Always provide:
- Clear explanation of the issue
- Step-by-step resolution
- Example TCO policy configurations
- Expected behavior after changes

### Step 5 — Offer Follow-up Guidance
Suggest:
- Additional optimizations
- Monitoring recommendations
- Best practices for their use case

---

## Key TCO Concepts (quick reference)

### Data Pipelines
IBM Cloud Logs has three data pipelines with different costs and capabilities:

| Pipeline | Priority | Cost | Search Speed | Alerts | Dashboards | Retention |
|----------|----------|------|--------------|--------|------------|-----------|
| **Priority insights** | High | Highest | Fastest | ✅ Yes | ✅ Yes | Configurable (default: 7 days) |
| **Analyze & alert** | Medium | Medium | Fast | ✅ Yes | ✅ Yes | 30 days |
| **Store & search** | Low | Lowest | Slower | ❌ No | ❌ No | Long-term (COS) |

### Critical Rules for Alerts and Dashboards
⚠️ **IMPORTANT**: 
- **Alerts ONLY trigger on High and Medium priority logs**
- **Dashboards ONLY show High and Medium priority logs**
- Logs in Low priority (Store & search) are archived but NOT available for real-time analysis

### TCO Policy Structure
Policies route logs to pipelines based on:
- **Application name**: The source application
- **Subsystem name**: Component or service within the application
- **Severity level**: DEBUG, VERBOSE, INFO, WARNING, ERROR, CRITICAL

### Policy Priority
- Policies are evaluated in order (priority 1, 2, 3...)
- First matching policy wins
- Default policy (if no match): All logs go to Priority insights (High)

---

## Common TCO Scenarios

### Scenario 1: Alerts Not Triggering
**Symptom**: Alerts configured but not firing despite logs being generated

**Diagnosis Steps**:
1. Check which pipeline the logs are flowing to
2. Verify log severity matches alert conditions
3. Confirm TCO policy isn't routing logs to Low priority

**Common Cause**: TCO policy routes logs to Store & search (Low priority)

**Solution**:
```
Modify TCO policy to route relevant logs to:
- Priority insights (High) for critical alerts
- Analyze & alert (Medium) for standard alerts

Example policy:
- Application: "payment-service"
- Subsystem: "transaction"
- Severity: ERROR, CRITICAL
- Pipeline: Priority insights (High)
```

### Scenario 2: Dashboard Shows No Data
**Symptom**: Dashboard widgets empty or showing "No data"

**Diagnosis Steps**:
1. Check data source configuration
2. Verify logs are in High or Medium priority
3. Confirm time range includes recent data

**Common Cause**: All logs routed to Low priority

**Solution**:
```
Create TCO policy to route dashboard-relevant logs to High or Medium:

Example policy:
- Application: "web-app"
- Subsystem: "*" (all subsystems)
- Severity: INFO, WARNING, ERROR, CRITICAL
- Pipeline: Analyze & alert (Medium)
```

### Scenario 3: Cost Optimization
**Goal**: Reduce costs while maintaining critical monitoring

**Strategy**:
1. Route DEBUG/VERBOSE logs to Low priority (Store & search)
2. Route INFO logs to Medium priority (Analyze & alert)
3. Route WARNING/ERROR/CRITICAL to High priority (Priority insights)

**Example Policy Set**:
```
Policy 1 (Priority 1):
- Application: "*"
- Subsystem: "*"
- Severity: ERROR, CRITICAL
- Pipeline: Priority insights (High)

Policy 2 (Priority 2):
- Application: "*"
- Subsystem: "*"
- Severity: WARNING, INFO
- Pipeline: Analyze & alert (Medium)

Policy 3 (Priority 3):
- Application: "*"
- Subsystem: "*"
- Severity: DEBUG, VERBOSE
- Pipeline: Store & search (Low)
```

### Scenario 4: Selective High-Priority Monitoring
**Goal**: Only specific services need real-time alerting

**Strategy**:
```
Policy 1 (Priority 1):
- Application: "payment-service"
- Subsystem: "*"
- Severity: WARNING, ERROR, CRITICAL
- Pipeline: Priority insights (High)

Policy 2 (Priority 2):
- Application: "auth-service"
- Subsystem: "*"
- Severity: ERROR, CRITICAL
- Pipeline: Priority insights (High)

Policy 3 (Priority 3):
- Application: "*"
- Subsystem: "*"
- Severity: "*"
- Pipeline: Store & search (Low)
```

---

## Troubleshooting Guide

### Issue: "My alerts stopped working after creating TCO policies"
**Root Cause**: Logs moved from High/Medium to Low priority

**Fix**:
1. Review TCO policies
2. Identify which policy is routing alert-relevant logs
3. Modify policy to route to High or Medium priority
4. Wait 5-10 minutes for changes to take effect

### Issue: "Dashboards show partial data"
**Root Cause**: Some logs in Low priority, some in High/Medium

**Fix**:
1. Check which applications/subsystems are missing
2. Create policy to route those logs to High or Medium
3. Ensure policy priority is correct (lower number = higher priority)

### Issue: "Costs are too high"
**Root Cause**: Too many logs in Priority insights (High)

**Fix**:
1. Analyze log volume by application and severity
2. Move non-critical logs (DEBUG, VERBOSE) to Low priority
3. Move informational logs (INFO) to Medium priority
4. Keep only critical logs (ERROR, CRITICAL) in High priority

### Issue: "Can't find logs in search"
**Root Cause**: Logs in wrong pipeline or blocked

**Fix**:
1. Check TCO policies for blocking rules
2. Verify logs aren't being dropped
3. Confirm correct pipeline assignment
4. Check data bucket configuration (required for Low priority)

---

## Best Practices

### 1. Start Conservative
- Begin with all logs in Priority insights
- Gradually move non-critical logs to lower priorities
- Monitor alert and dashboard functionality

### 2. Use Severity Wisely
- ERROR/CRITICAL → High priority (Priority insights)
- WARNING/INFO → Medium priority (Analyze & alert)
- DEBUG/VERBOSE → Low priority (Store & search)

### 3. Application-Specific Policies
- Critical services → High priority
- Standard services → Medium priority
- Development/test logs → Low priority

### 4. Policy Ordering Matters
- Most specific policies first (lower priority number)
- Catch-all policies last (higher priority number)
- Test policy changes in non-production first

### 5. Monitor Data Usage
- Configure data usage metrics
- Set up alerts for unexpected volume increases
- Review TCO policy effectiveness monthly

### 6. Prerequisites
- **Data bucket required**: Must configure IBM Cloud Object Storage bucket before creating policies
- **Metrics bucket recommended**: For monitoring data usage
- **Parsing rules**: Apply before TCO policies in data flow

---

## Data Flow Understanding

### Ingestion Order
```
1. Logs sent by source (agent, API, IBM Cloud)
   ↓
2. IBM Cloud Logs receives data
   ↓
3. Parsing rules applied
   ↓
4. TCO policies applied
   ↓
5. Data routed to pipeline (or dropped)
```

### Billing Point
- Logs are billed AFTER parsing and TCO policy application
- Blocked logs (before pipeline) are NOT billed
- Dropped logs are NOT retained

---

## Policy Configuration Examples

### Example 1: Production vs Non-Production
```
# Production - High priority
Policy 1:
  Application: "prod-*"
  Subsystem: "*"
  Severity: WARNING, ERROR, CRITICAL
  Pipeline: Priority insights

# Production - Medium priority
Policy 2:
  Application: "prod-*"
  Subsystem: "*"
  Severity: INFO
  Pipeline: Analyze & alert

# Non-production - Low priority
Policy 3:
  Application: "dev-*", "test-*", "staging-*"
  Subsystem: "*"
  Severity: "*"
  Pipeline: Store & search
```

### Example 2: Service-Based Routing
```
# Critical services
Policy 1:
  Application: "payment", "auth", "billing"
  Subsystem: "*"
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights

# Standard services
Policy 2:
  Application: "api-gateway", "web-frontend"
  Subsystem: "*"
  Severity: WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert

# Background jobs
Policy 3:
  Application: "batch-processor", "scheduler"
  Subsystem: "*"
  Severity: "*"
  Pipeline: Store & search
```

---

## Delivering Excellence

- Always explain WHY alerts/dashboards require High/Medium priority
- Provide specific policy examples tailored to user's use case
- Warn about alert/dashboard impact before suggesting Low priority routing
- Offer cost estimates when possible
- Suggest monitoring to validate policy effectiveness
- Remind about data bucket prerequisite for policies
- Explain policy evaluation order clearly
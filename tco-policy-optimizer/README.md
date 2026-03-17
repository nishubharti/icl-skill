# TCO Policy Optimizer Skill

A comprehensive skill for optimizing Total Cost of Ownership (TCO) in IBM Cloud Logs through intelligent data pipeline routing, cost management, and troubleshooting alert and dashboard issues.

## What is TCO Optimization?

TCO (Total Cost of Ownership) Optimization in IBM Cloud Logs helps you control costs by routing logs to different data pipelines based on their importance to your business. This skill helps you configure policies, troubleshoot issues, and optimize your logging costs.

## What This Skill Does

This skill helps you:
- **Optimize Costs**: Create TCO policies to route logs to appropriate pipelines
- **Troubleshoot Alerts**: Debug why alerts aren't triggering (only High/Medium priority logs trigger alerts)
- **Fix Dashboards**: Resolve dashboard issues (only High/Medium priority logs appear in dashboards)
- **Configure Policies**: Build effective TCO policies based on application, subsystem, and severity
- **Understand Data Flow**: Learn how logs flow through pipelines and when they're billed
- **Debug Issues**: Diagnose and resolve common TCO-related problems

## Skill Contents

### 📁 `tco-policy.skill`
The main skill file that enables AI assistants to understand and optimize TCO configurations.

### 📚 `SKILL.md`
Comprehensive skill documentation covering:
- TCO workflow and best practices
- Common scenarios and solutions
- Alert and dashboard troubleshooting
- Policy configuration examples
- Cost optimization strategies

### 📚 `references/`
Detailed reference documentation:

#### `tco-concepts.md`
Complete TCO concepts reference covering:
- Three data pipelines (Priority insights, Analyze & alert, Store & search)
- Pipeline features, costs, and use cases
- TCO policy structure and evaluation
- Critical constraints for alerts and dashboards
- Data flow and billing
- Prerequisites and configuration
- Cost optimization strategies
- Common patterns and best practices

#### `troubleshooting.md`
Comprehensive troubleshooting guide including:
- Quick diagnosis table
- Alert issues and solutions
- Dashboard problems and fixes
- Cost optimization techniques
- Configuration issues
- Search and performance problems
- Common error messages
- Escalation checklist

## Key Concepts

### Data Pipelines

IBM Cloud Logs has three data pipelines:

| Pipeline | Priority | Cost | Alerts | Dashboards | Best For |
|----------|----------|------|--------|------------|----------|
| **Priority insights** | High | Highest | ✅ Yes | ✅ Yes | Critical logs, real-time analysis |
| **Analyze & alert** | Medium | Medium | ✅ Yes | ✅ Yes | Important logs, standard monitoring |
| **Store & search** | Low | Lowest | ❌ No | ❌ No | Archives, compliance, debug logs |

### Critical Rules

⚠️ **IMPORTANT**: 
- **Alerts ONLY trigger on High and Medium priority logs**
- **Dashboards ONLY show High and Medium priority logs**
- Logs in Low priority are archived but NOT available for real-time analysis

### TCO Policies

Policies route logs to pipelines based on:
- **Application name**: Source application
- **Subsystem name**: Component within application
- **Severity level**: DEBUG, VERBOSE, INFO, WARNING, ERROR, CRITICAL

## How to Use This Skill

### Example 1: Alerts Not Triggering

**Problem**: "My alerts stopped working after I created TCO policies"

**Diagnosis**:
```
1. Check which pipeline the logs are flowing to
2. If logs are in "Store & search" (Low priority) → That's the problem!
3. Alerts only work with High or Medium priority logs
```

**Solution**:
```
Modify TCO policy to route alert-relevant logs to High or Medium priority:

Policy:
  Application: payment-service
  Subsystem: transaction
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
```

### Example 2: Dashboard Shows No Data

**Problem**: "My dashboard is empty after configuring TCO"

**Diagnosis**:
```
1. Check which pipeline the logs are in
2. If logs are in "Store & search" (Low priority) → That's the problem!
3. Dashboards only query High or Medium priority logs
```

**Solution**:
```
Create policy to route dashboard data to High or Medium:

Policy:
  Application: web-app
  Subsystem: api, frontend
  Severity: INFO, WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
```

### Example 3: Cost Optimization

**Goal**: "Reduce my IBM Cloud Logs costs"

**Strategy**:
```
Route logs by severity to appropriate pipelines:

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

**Expected Savings**: 50-70% cost reduction while maintaining critical monitoring

## Common Use Cases

### Use Case 1: Production vs Non-Production
Route production logs to higher priority, non-production to low priority:
```
Policy 1: prod-* apps, ERROR/CRITICAL → High priority
Policy 2: prod-* apps, WARNING/INFO → Medium priority
Policy 3: dev-*, test-* apps, all severities → Low priority
```

### Use Case 2: Service-Based Routing
Route by service criticality:
```
Policy 1: payment, auth, billing → High priority
Policy 2: api-gateway, web-app → Medium priority
Policy 3: batch-processor, scheduler → Low priority
```

### Use Case 3: Severity-First Routing
Route all logs by severity regardless of source:
```
Policy 1: All apps, CRITICAL → High priority
Policy 2: All apps, ERROR → Medium priority
Policy 3: All apps, other severities → Low priority
```

## Prerequisites

### Required Configuration

1. **Data Bucket (IBM Cloud Object Storage)**
   - Required for Store & search (Low priority) pipeline
   - Must be configured before creating TCO policies
   - Used for long-term log storage

2. **Metrics Bucket (Recommended)**
   - For monitoring data usage and costs
   - Helps track ingestion volume by pipeline
   - Enables cost trend analysis

## Quick Start Guide

### Step 1: Understand Your Current State
```
1. Check if you have TCO policies configured
2. Review current data usage by pipeline
3. Identify high-volume applications
4. Note which logs need alerting/dashboards
```

### Step 2: Plan Your Policies
```
1. Categorize logs by importance:
   - Critical (need alerts) → High priority
   - Important (need monitoring) → Medium priority
   - Archive/debug → Low priority

2. Consider:
   - Which services are business-critical?
   - What severity levels need alerting?
   - What can be archived?
```

### Step 3: Create Policies
```
1. Start with most specific policies (lower priority number)
2. End with catch-all policies (higher priority number)
3. Test in non-production first
4. Monitor impact on alerts and dashboards
```

### Step 4: Validate and Monitor
```
1. Verify alerts still trigger
2. Check dashboards show data
3. Monitor cost changes
4. Adjust policies as needed
```

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Alerts not triggering | Route logs to High or Medium priority |
| Dashboard empty | Route logs to High or Medium priority |
| High costs | Move non-critical logs to Medium or Low priority |
| Can't create policy | Configure IBM Cloud Object Storage data bucket |
| Logs not found | Check all pipelines, verify policy routing |

## Best Practices

1. ✅ **Start Conservative**: Begin with all logs in High priority, then optimize
2. ✅ **Test First**: Validate policies in non-production before production
3. ✅ **Monitor Impact**: Check alerts and dashboards after policy changes
4. ✅ **Document Decisions**: Record why policies were created
5. ✅ **Review Regularly**: Monthly review of policies and costs
6. ✅ **Order Matters**: Most specific policies first, general policies last
7. ✅ **Keep Critical Logs Fast**: Route ERROR/CRITICAL to High or Medium priority
8. ✅ **Archive Debug Logs**: Route DEBUG/VERBOSE to Low priority
9. ✅ **Configure Prerequisites**: Set up data bucket before creating policies
10. ✅ **Use Severity Wisely**: Match severity to business impact

## Cost Optimization Examples

### Example 1: Basic Optimization
**Before**: All logs in High priority → $3,000/month

**After**: Severity-based routing
- 10% High priority (ERROR, CRITICAL)
- 30% Medium priority (WARNING, INFO)
- 60% Low priority (DEBUG, VERBOSE)

**Result**: $930/month (69% savings)

### Example 2: Application-Based Optimization
**Before**: All logs in High priority → $5,000/month

**After**: Service-tier routing
- 20% High priority (critical services)
- 40% Medium priority (standard services)
- 40% Low priority (non-production)

**Result**: $1,800/month (64% savings)

## Data Flow Understanding

### Ingestion Pipeline
```
1. Log Source (Agent, API, IBM Cloud)
   ↓
2. IBM Cloud Logs Ingestion
   ↓
3. Parsing Rules Applied
   ↓
4. TCO Policies Evaluated
   ↓
5. Pipeline Assignment
   ↓
6. Data Storage & Indexing
```

### Billing Point
- Logs are billed AFTER parsing and TCO policy evaluation
- Blocked logs (before pipeline) are NOT billed
- All logs reaching a pipeline are billed

## Support and Documentation

### Skill Documentation
- `SKILL.md` - Complete skill guide
- `references/tco-concepts.md` - TCO concepts reference
- `references/troubleshooting.md` - Troubleshooting guide

### IBM Cloud Logs Documentation
- [Controlling Cost](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-controlling-cost)
- [Control Data](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-control-data)
- [TCO Optimizer](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-tco-optimizer)

### Coralogix Documentation
- [TCO Optimizer User Guide](https://coralogix.com/docs/user-guides/account-management/tco-optimizer/)

## Common Questions

### Q: Why aren't my alerts triggering?
**A**: Alerts only work with High and Medium priority logs. Check if your logs are routed to Low priority (Store & search).

### Q: Why is my dashboard empty?
**A**: Dashboards only show High and Medium priority logs. Verify your logs aren't all routed to Low priority.

### Q: How much can I save with TCO optimization?
**A**: Typically 50-70% cost reduction by routing non-critical logs to lower-cost pipelines while maintaining critical monitoring.

### Q: Can I change policies without affecting alerts?
**A**: Yes, but ensure alert-relevant logs stay in High or Medium priority. Test in non-production first.

### Q: What happens to logs in Low priority?
**A**: They're archived to IBM Cloud Object Storage for long-term retention but aren't available for real-time alerts or dashboards.

### Q: How long does it take for policy changes to take effect?
**A**: Typically 5-10 minutes. New logs will be routed according to updated policies.

---

**Version**: 1.0  
**Last Updated**: 2026-03-17  
**Maintained by**: Nishu Bharti (nishu.bharti1@ibm.com)
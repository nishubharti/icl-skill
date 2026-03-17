# IBM Cloud Logs Skills

A comprehensive collection of skills for IBM Cloud Logs (powered by Coralogix) to help customers optimize costs, create alerts, build queries, and troubleshoot issues.

## Overview

This repository contains specialized skills that enable AI assistants to help customers with various aspects of IBM Cloud Logs:

- **TCO Policy Optimizer** - Cost optimization and data pipeline management
- **Cloud Logs Alerts** - Alert creation, configuration, and troubleshooting
- **DataPrime Query Builder** - Query construction and optimization

## Skills

### 1. TCO Policy Optimizer (`tco-policy-optimizer/`)

**Purpose**: Help customers optimize Total Cost of Ownership (TCO) by configuring data pipeline routing and troubleshooting cost-related issues.

**Key Features**:
- Create and configure TCO policies
- Route logs to appropriate pipelines (High, Medium, Low priority)
- Debug why alerts and dashboards aren't working (TCO-related)
- Optimize costs while maintaining critical monitoring
- Understand data flow and billing

**Critical Concept**: 
- Alerts and dashboards ONLY work with High and Medium priority logs
- Logs in Low priority (Store & search) don't support real-time analysis

**Files**:
- `SKILL.md` - Comprehensive skill guide
- `README.md` - User documentation
- `references/tco-concepts.md` - TCO concepts reference
- `references/troubleshooting.md` - Troubleshooting guide
- `tests/skill.test.js` - Test suite

**Use Cases**:
- Reduce logging costs by 50-70%
- Fix alerts that stopped working after TCO policy changes
- Resolve dashboard showing no data
- Route logs based on severity, application, or environment
- Balance cost and functionality

---

### 2. Cloud Logs Alerts (`cloud-logs-alerts/`)

**Purpose**: Help customers create, configure, and troubleshoot alerts in IBM Cloud Logs.

**Key Features**:
- Create 7 types of alerts (Standard, Ratio, New Value, Unique Count, Time Relative, Metric, Flow)
- Debug why alerts aren't triggering
- Validate alert queries and conditions
- Configure notification channels (Email, Slack, PagerDuty, Webhook)
- Reduce false positives
- Optimize alert performance

**Critical Concept**:
- Alerts ONLY trigger on High and Medium priority logs
- TCO policy routing to Low priority prevents alerts from working

**Files**:
- `SKILL.md` - Comprehensive skill guide
- `README.md` - User documentation
- `references/alert-types.md` - Alert types reference
- `references/troubleshooting.md` - Troubleshooting guide
- `tests/skill.test.js` - Test suite

**Use Cases**:
- Create error count alerts
- Set up error rate monitoring
- Detect new error types
- Monitor service health
- Configure multi-channel notifications
- Debug alert configuration issues

---

### 3. DataPrime Query Builder (`dataprime-query-builder/`)

**Purpose**: Help customers build and understand DataPrime queries for log analysis.

**Key Features**:
- Build DataPrime queries from natural language
- Explain query syntax and commands
- Provide common query patterns
- Optimize query performance
- Troubleshoot query issues

**Files**:
- `dataprime-query-builder.skill` - Main skill file
- `SKILL.md` - Comprehensive skill guide
- `README.md` - User documentation
- `references/syntax.md` - Complete syntax reference
- `references/patterns.md` - 25+ query patterns
- `tests/skill.test.js` - Test suite

**Use Cases**:
- Count logs by severity
- Find slow requests
- Analyze error patterns
- Group by service or region
- Extract data with regex
- Time-based analysis

---

## Quick Start

### For Cost Optimization

```yaml
# Route logs by severity to optimize costs
Policy 1: ERROR/CRITICAL → High priority (Priority insights)
Policy 2: WARNING/INFO → Medium priority (Analyze & alert)
Policy 3: DEBUG/VERBOSE → Low priority (Store & search)

Expected Savings: 50-70% cost reduction
```

### For Alert Creation

```yaml
# Create error count alert
Name: "Payment Service - High Error Count"
Type: Standard
Query: |
  source logs
  | filter $m.severity == ERROR
  | filter $m.applicationName == 'payment-service'
Condition: More than 10
Time Window: 5 minutes
Notifications: Email to ops-team@company.com
```

### For Query Building

```dataprime
# Count errors by service
source logs
| filter $m.severity == ERROR
| groupby $m.applicationName aggregate count() as error_count
| orderby -$d.error_count
| limit 10
```

---

## Common Issues and Solutions

### Issue 1: Alerts Not Triggering

**Cause**: Logs routed to Low priority by TCO policy

**Solution**:
```yaml
Modify TCO Policy:
  Application: payment-service
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Priority insights (High)
```

### Issue 2: Dashboard Shows No Data

**Cause**: Logs in Low priority (Store & search)

**Solution**:
```yaml
Create TCO Policy:
  Application: web-app
  Subsystem: *
  Severity: INFO, WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
```

### Issue 3: High Costs

**Cause**: Too many logs in High priority

**Solution**:
```yaml
Implement severity-based routing:
- ERROR/CRITICAL → High priority
- WARNING/INFO → Medium priority
- DEBUG/VERBOSE → Low priority
```

---

## Data Pipelines

IBM Cloud Logs has three data pipelines:

| Pipeline | Priority | Cost | Alerts | Dashboards | Search Speed | Best For |
|----------|----------|------|--------|------------|--------------|----------|
| **Priority insights** | High | Highest | ✅ Yes | ✅ Yes | Fastest | Critical logs, real-time analysis |
| **Analyze & alert** | Medium | Medium | ✅ Yes | ✅ Yes | Fast | Important logs, standard monitoring |
| **Store & search** | Low | Lowest | ❌ No | ❌ No | Slower | Archives, compliance, debug logs |

---

## Prerequisites

### Required Configuration

1. **IBM Cloud Logs Instance**
   - Active instance in any region
   - API access configured

2. **Data Bucket (for TCO policies)**
   - IBM Cloud Object Storage bucket
   - Required for Low priority (Store & search) pipeline
   - Must be configured before creating TCO policies

3. **Metrics Bucket (recommended)**
   - For monitoring data usage
   - Helps track costs and volume

---

## Best Practices

### TCO Optimization
1. ✅ Start with all logs in High priority, then optimize
2. ✅ Route ERROR/CRITICAL to High or Medium priority
3. ✅ Use Low priority for DEBUG/VERBOSE logs
4. ✅ Test policies in non-production first
5. ✅ Monitor data usage after policy changes

### Alert Configuration
1. ✅ Test queries in Explore Logs before creating alerts
2. ✅ Set appropriate thresholds based on historical data
3. ✅ Use meaningful alert names and descriptions
4. ✅ Configure multiple notification channels for critical alerts
5. ✅ Review and tune alerts regularly

### Query Building
1. ✅ Start with simple queries and add complexity
2. ✅ Use specific filters early in the query
3. ✅ Test queries with sample data
4. ✅ Add comments to explain complex logic
5. ✅ Optimize for performance

---

## Documentation Links

### IBM Cloud Logs
- [Controlling Cost](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-controlling-cost)
- [Control Data](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-control-data)
- [TCO Optimizer](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-tco-optimizer)
- [Alerts](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-alerts)
- [DataPrime Query Language](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-dataprime-query-language)

### Coralogix
- [TCO Optimizer User Guide](https://coralogix.com/docs/user-guides/account-management/tco-optimizer/)
- [Introduction to Alerts](https://coralogix.com/docs/user-guides/alerting/introduction-to-alerts/)

---

## Skill Structure

Each skill follows a consistent structure:

```
skill-name/
├── SKILL.md                    # Comprehensive skill documentation
├── README.md                   # User-friendly documentation
├── skill-name.skill           # Main skill file (binary)
├── references/                 # Reference documentation
│   ├── concepts.md            # Core concepts
│   ├── troubleshooting.md     # Troubleshooting guide
│   └── patterns.md            # Common patterns (if applicable)
└── tests/                      # Test suite
    └── skill.test.js          # Skill tests
```

---

## Contributing

When adding new skills:

1. Follow the existing skill structure
2. Include comprehensive documentation
3. Provide real-world examples
4. Add troubleshooting guides
5. Create test suites
6. Update this README

---

## Support

For issues or questions:

1. Check the skill-specific README.md
2. Review the troubleshooting guides
3. Consult IBM Cloud Logs documentation
4. Contact: nishu.bharti1@ibm.com

---

## Version History

### v1.0 (2026-03-17)
- ✅ TCO Policy Optimizer skill
- ✅ Alerts skill
- ✅ DataPrime Query Builder skill
- ✅ Comprehensive documentation
- ✅ Test suites
- ✅ Troubleshooting guides

---

## License

IBM Internal Use

---

**Maintained by**: Nishu Bharti (nishu.bharti1@ibm.com)  
**Last Updated**: 2026-03-17
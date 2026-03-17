# TCO Optimizer Concepts Reference

## Overview
The TCO (Total Cost of Ownership) Optimizer in IBM Cloud Logs helps you control costs by routing logs to different data pipelines based on their importance to your business operations.

---

## Data Pipelines

### 1. Priority Insights (High Priority)
**Cost**: Highest  
**Search Speed**: Fastest (real-time)  
**Retention**: Configurable (default 7 days)  
**Use Case**: Critical logs requiring immediate analysis and alerting

**Features**:
- ✅ Real-time search and analysis
- ✅ Alerts and notifications
- ✅ Dashboard visualization
- ✅ Fastest query performance
- ✅ Full DataPrime query support

**Best For**:
- Production errors and critical issues
- Security events
- Payment/transaction logs
- Authentication failures
- System health metrics

**Cost Impact**: ~$1.00 per GB ingested (example pricing)

---

### 2. Analyze & Alert (Medium Priority)
**Cost**: Medium  
**Search Speed**: Fast  
**Retention**: 30 days  
**Use Case**: Important logs that need alerting but not immediate real-time analysis

**Features**:
- ✅ Search and analysis (slightly delayed)
- ✅ Alerts and notifications
- ✅ Dashboard visualization
- ✅ DataPrime query support
- ⚠️ Slightly slower than Priority insights

**Best For**:
- Application warnings
- API request logs
- Performance metrics
- Non-critical errors
- Audit logs

**Cost Impact**: ~$0.50 per GB ingested (example pricing)

---

### 3. Store & Search (Low Priority)
**Cost**: Lowest  
**Search Speed**: Slower (archived)  
**Retention**: Long-term (IBM Cloud Object Storage)  
**Use Case**: Logs for compliance, debugging, or historical analysis

**Features**:
- ✅ Long-term storage
- ✅ Search capability (slower)
- ❌ NO alerts
- ❌ NO dashboards
- ❌ NO real-time analysis
- ⚠️ Requires data bucket configuration

**Best For**:
- Debug logs
- Verbose logging
- Development/test logs
- Compliance archives
- Historical data

**Cost Impact**: ~$0.10 per GB ingested + storage costs (example pricing)

---

## TCO Policies

### Policy Components

#### 1. Application Name
- Identifies the source application
- Supports wildcards: `*`, `prod-*`, `*-service`
- Case-sensitive
- Examples: `payment-service`, `auth-api`, `web-frontend`

#### 2. Subsystem Name
- Component or service within the application
- Supports wildcards
- Optional (use `*` for all subsystems)
- Examples: `transaction`, `login`, `database`

#### 3. Severity Level
- Log severity/level
- Standard levels: `DEBUG`, `VERBOSE`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- Can specify multiple levels
- Use `*` for all levels

#### 4. Pipeline Assignment
- Target data pipeline
- Options:
  - Priority insights (High)
  - Analyze & alert (Medium)
  - Store & search (Low)
  - Block (drop logs)

---

### Policy Evaluation

#### Priority Order
Policies are evaluated in priority order (1, 2, 3...):
```
Policy 1 (Priority 1) - Evaluated first
  ↓ (if no match)
Policy 2 (Priority 2) - Evaluated second
  ↓ (if no match)
Policy 3 (Priority 3) - Evaluated third
  ↓ (if no match)
Default: Priority insights (High)
```

#### First Match Wins
- Once a log matches a policy, evaluation stops
- Subsequent policies are not evaluated
- Order your policies from most specific to most general

#### Example Evaluation
```
Log: Application="payment-service", Subsystem="api", Severity="ERROR"

Policy 1: App="payment-service", Sub="*", Sev="CRITICAL" → No match
Policy 2: App="payment-service", Sub="*", Sev="ERROR,CRITICAL" → MATCH! → High priority
Policy 3: App="*", Sub="*", Sev="*" → Not evaluated (already matched)
```

---

## Critical Constraints

### Alerts
⚠️ **Alerts ONLY work with High and Medium priority logs**

**Why**: Alerts require real-time data access. Low priority logs are archived to object storage and not available for real-time alerting.

**Impact**: If you route logs to Low priority, alerts on those logs will NOT trigger.

**Solution**: Ensure alert-relevant logs are routed to High or Medium priority.

---

### Dashboards
⚠️ **Dashboards ONLY show High and Medium priority logs**

**Why**: Dashboards query real-time data. Low priority logs are in cold storage and not included in dashboard queries.

**Impact**: If you route logs to Low priority, they will NOT appear in dashboards.

**Solution**: Ensure dashboard data sources include High or Medium priority logs.

---

## Data Flow

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
- Logs are metered AFTER parsing and TCO policy evaluation
- Blocked logs (before pipeline) are NOT billed
- Dropped logs are NOT retained
- All logs reaching a pipeline are billed

---

## Prerequisites

### Required Configuration

#### 1. Data Bucket (IBM Cloud Object Storage)
**Required For**: Store & search (Low priority) pipeline  
**Purpose**: Long-term log storage  
**Setup**: Must be configured before creating TCO policies

**Without Data Bucket**:
- Cannot use Low priority pipeline
- Cannot create policies routing to Store & search
- Logs will default to Priority insights

#### 2. Metrics Bucket (Optional but Recommended)
**Purpose**: Monitor data usage and costs  
**Benefits**:
- Track ingestion volume by pipeline
- Monitor cost trends
- Set up usage alerts
- Analyze data distribution

---

## Cost Optimization Strategies

### Strategy 1: Severity-Based Routing
```
High Priority: ERROR, CRITICAL
Medium Priority: WARNING, INFO
Low Priority: DEBUG, VERBOSE
```

**Benefit**: Reduces costs while maintaining critical monitoring

### Strategy 2: Application-Based Routing
```
High Priority: Critical services (payment, auth)
Medium Priority: Standard services (API, web)
Low Priority: Non-production (dev, test)
```

**Benefit**: Focuses costs on business-critical applications

### Strategy 3: Hybrid Approach
```
Policy 1: prod-payment-service, ERROR/CRITICAL → High
Policy 2: prod-*, WARNING/INFO → Medium
Policy 3: prod-*, DEBUG/VERBOSE → Low
Policy 4: dev-*, test-*, * → Low
```

**Benefit**: Balances cost and functionality across environments

---

## Common Patterns

### Pattern 1: Production-Only High Priority
```
# Production errors - High priority
Application: prod-*
Subsystem: *
Severity: ERROR, CRITICAL
Pipeline: Priority insights

# Everything else - Low priority
Application: *
Subsystem: *
Severity: *
Pipeline: Store & search
```

### Pattern 2: Service-Tier Routing
```
# Tier 1 services - High priority
Application: payment, auth, billing
Subsystem: *
Severity: WARNING, ERROR, CRITICAL
Pipeline: Priority insights

# Tier 2 services - Medium priority
Application: api-gateway, web-app
Subsystem: *
Severity: WARNING, ERROR, CRITICAL
Pipeline: Analyze & alert

# All other - Low priority
Application: *
Subsystem: *
Severity: *
Pipeline: Store & search
```

### Pattern 3: Severity-First Routing
```
# All critical errors - High priority
Application: *
Subsystem: *
Severity: CRITICAL
Pipeline: Priority insights

# All errors - Medium priority
Application: *
Subsystem: *
Severity: ERROR
Pipeline: Analyze & alert

# Everything else - Low priority
Application: *
Subsystem: *
Severity: *
Pipeline: Store & search
```

---

## Monitoring and Validation

### Data Usage Metrics
Monitor these metrics to validate TCO policies:
- **Ingestion volume by pipeline**: Ensure expected distribution
- **Cost trends**: Track spending over time
- **Alert trigger rates**: Verify alerts are working
- **Dashboard data availability**: Confirm dashboards show data

### Policy Effectiveness Checks
1. **Alert validation**: Test that critical alerts trigger
2. **Dashboard verification**: Confirm dashboards display data
3. **Cost analysis**: Compare costs before/after policy changes
4. **Log availability**: Verify logs are searchable when needed

### Adjustment Triggers
Consider adjusting policies when:
- Alerts stop triggering unexpectedly
- Dashboards show incomplete data
- Costs exceed budget
- New applications are deployed
- Log volume changes significantly

---

## Troubleshooting Quick Reference

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Alerts not triggering | Logs in Low priority | Route to High/Medium |
| Dashboard empty | Logs in Low priority | Route to High/Medium |
| High costs | Too many logs in High priority | Move non-critical to Medium/Low |
| Can't create policy | No data bucket | Configure COS bucket |
| Logs not found | Blocked by policy | Review policy rules |
| Partial dashboard data | Mixed priority routing | Consolidate to High/Medium |

---

## Best Practices Summary

1. ✅ Start with all logs in High priority, then optimize
2. ✅ Route ERROR/CRITICAL to High or Medium priority
3. ✅ Use Low priority for DEBUG/VERBOSE logs
4. ✅ Test policies in non-production first
5. ✅ Monitor data usage after policy changes
6. ✅ Document policy decisions and rationale
7. ✅ Review policies monthly
8. ✅ Configure data bucket before creating policies
9. ✅ Order policies from specific to general
10. ✅ Keep alert-critical logs in High/Medium priority
# Dashboard Widget Types Reference

## Widget Overview

| Widget Type | Use Case | Best For | Requires |
|------------|----------|----------|----------|
| Line Chart | Trends over time | Error rates, response times | timestamp grouping |
| Bar Chart | Category comparison | Errors by service, top endpoints | category grouping |
| Pie Chart | Distribution | Severity breakdown, status codes | category grouping |
| Data Table | Detailed logs | Recent errors, transactions | limit clause |
| Gauge | Single metric | Current error count, availability | single value |
| Markdown | Documentation | Instructions, runbooks | N/A |

## Line Chart

**Query Pattern**:
```
source logs
| filter condition
| groupby $m.timestamp aggregate count()
```

**Example - Error Trend**:
```
source logs
| filter $m.severity == ERROR
| groupby $m.timestamp aggregate count() as error_count
```

## Bar Chart

**Query Pattern**:
```
source logs
| filter condition
| groupby category_field aggregate count()
| orderby -count
```

**Example - Errors by Service**:
```
source logs
| filter $m.severity == ERROR
| groupby $m.applicationName aggregate count() as errors
| orderby -$d.errors
| limit 10
```

## Pie Chart

**Query Pattern**:
```
source logs
| groupby category_field aggregate count()
```

**Example - Severity Distribution**:
```
source logs
| groupby $m.severity aggregate count() as log_count
```

## Data Table

**Query Pattern**:
```
source logs
| filter condition
| orderby -$m.timestamp
| limit N
```

**Example - Recent Errors**:
```
source logs
| filter $m.severity == ERROR
| orderby -$m.timestamp
| limit 50
```

## Gauge

**Query Pattern**:
```
source logs
| filter condition
| count
```

**Example - Current Error Count**:
```
source logs
| filter $m.timestamp >= now() - 5m
| filter $m.severity == ERROR
| count
```

**Thresholds**:
- Green: 0-10 (healthy)
- Yellow: 11-50 (warning)
- Red: 51+ (critical)

## Markdown

**Use Cases**:
- Dashboard descriptions
- Runbook links
- Troubleshooting instructions
- Metric definitions
- Team contact information

**Example**:
```markdown
# Production Monitoring Dashboard

This dashboard shows key metrics for production services.

**Thresholds:**
- 🟢 Green: Healthy (0-10 errors)
- 🟡 Yellow: Warning (11-50 errors)
- 🔴 Red: Critical (51+ errors)

**Runbook:** [Link to runbook](https://wiki.example.com/runbook)
**Contact:** ops-team@company.com
```

## Widget Sizing Guidelines

```
Full Width (12 columns): Important trend charts, tables
Half Width (6 columns): Comparison charts, distributions
Third Width (4 columns): Related metrics
Quarter Width (3 columns): Gauges, single metrics
```

## Refresh Rate Recommendations

```
Critical monitoring: 1 minute
Standard monitoring: 5 minutes
Historical analysis: Manual refresh
Resource-intensive: 10-15 minutes
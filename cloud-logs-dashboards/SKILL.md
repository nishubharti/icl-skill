---
name: cloud-logs-dashboards
description: >
  Help customers create, configure, and troubleshoot dashboards in IBM Cloud Logs (powered by Coralogix).
  Use this skill when users mention: "create dashboard", "dashboard not showing data", "dashboard configuration",
  "widget not working", "dashboard query", "dashboard visualization", "dashboard debugging", "set up dashboard",
  "dashboard layout", "dashboard widgets", "custom dashboard", "dashboard metrics", or any questions about
  configuring, managing, or troubleshooting dashboards in IBM Cloud Logs.
---

# IBM Cloud Logs Dashboards Skill

## What this skill does
This skill helps users create and troubleshoot dashboards in IBM Cloud Logs. It:
1. Guides users through dashboard creation with proper widget configuration
2. Helps debug why dashboards aren't showing data
3. Validates dashboard queries and data sources
4. Troubleshoots TCO policy issues affecting dashboards
5. Explains widget types and their use cases
6. Helps configure dashboard layouts and visualizations

---

## Workflow

### Step 1 — Understand the User's Need
Before providing guidance, determine:
- **Creation**: Do they need to create a new dashboard?
- **Troubleshooting**: Is an existing dashboard not working?
- **Configuration**: Do they need to modify dashboard settings?
- **Query validation**: Is their dashboard query correct?
- **TCO issue**: Are logs in the wrong pipeline?

Ask ONE focused question if critical information is missing.

### Step 2 — Gather Context
When troubleshooting, collect:
- Dashboard widget types (Line Chart, Bar Chart, Pie Chart, Data Table, Gauge, Markdown)
- Dashboard queries or data sources
- Expected vs actual behavior
- Log samples that should appear in dashboard
- TCO policy configuration (if applicable)
- Time range settings

### Step 3 — Provide Targeted Guidance
Based on the need:

**For Dashboard Creation:**
- Recommend appropriate widget types
- Guide query construction
- Explain layout configuration
- Set up data sources

**For Troubleshooting:**
- Verify logs are in High/Medium priority (TCO check)
- Validate dashboard query syntax
- Check widget configuration
- Verify time range settings
- Test queries with sample data

### Step 4 — Present Solution with Examples
Always provide:
- Clear step-by-step instructions
- Example dashboard configurations
- Sample queries
- Expected behavior after changes

### Step 5 — Offer Follow-up Guidance
Suggest:
- Dashboard optimization tips
- Additional visualization recommendations
- Best practices for their use case

---

## Critical Dashboard Concepts

### TCO Policy Impact on Dashboards
⚠️ **MOST IMPORTANT**: 
- **Dashboards ONLY show High and Medium priority logs**
- If logs are routed to Low priority (Store & search), dashboards will NOT display them
- This is the #1 cause of "dashboard showing no data" issues

**Quick Check**:
```
1. Go to Explore Logs
2. Search for logs that should appear in dashboard
3. Check which pipeline they're in:
   - Priority insights (High) → ✅ Dashboards work
   - Analyze & alert (Medium) → ✅ Dashboards work
   - Store & search (Low) → ❌ Dashboards DON'T work
```

### Dashboard Widget Types

#### 1. Line Chart
**Use Case**: Show trends over time  
**Example**: Error rate over the last 24 hours

**Configuration**:
```
Widget Type: Line Chart
Query: source logs | filter $m.severity == ERROR | groupby $m.timestamp aggregate count()
Time Range: Last 24 hours
Aggregation: Count
Group By: timestamp
```

#### 2. Bar Chart
**Use Case**: Compare values across categories  
**Example**: Error count by application

**Configuration**:
```
Widget Type: Bar Chart
Query: source logs | filter $m.severity == ERROR | groupby $m.applicationName aggregate count()
Aggregation: Count
Group By: applicationName
Sort: Descending by count
```

#### 3. Pie Chart
**Use Case**: Show distribution/proportions  
**Example**: Log distribution by severity

**Configuration**:
```
Widget Type: Pie Chart
Query: source logs | groupby $m.severity aggregate count()
Aggregation: Count
Group By: severity
```

#### 4. Data Table
**Use Case**: Display detailed log entries  
**Example**: Recent error logs with details

**Configuration**:
```
Widget Type: Data Table
Query: source logs | filter $m.severity == ERROR | limit 100
Columns: timestamp, applicationName, subsystemName, message
Sort: timestamp descending
```

#### 5. Gauge
**Use Case**: Show single metric value  
**Example**: Current error rate

**Configuration**:
```
Widget Type: Gauge
Query: source logs | filter $m.severity == ERROR | count
Aggregation: Count
Thresholds: 
  - Green: 0-10
  - Yellow: 11-50
  - Red: 51+
```

#### 6. Markdown
**Use Case**: Add text, documentation, or instructions  
**Example**: Dashboard description or runbook links

---

## Common Dashboard Scenarios

### Scenario 1: Dashboard Shows No Data

**Symptom**: Dashboard widgets are empty or showing "No data"

**Diagnosis Checklist**:
```
1. ✅ Check TCO Policy (MOST COMMON)
   - Are logs in High or Medium priority?
   - If Low priority → That's the problem!

2. ✅ Verify Dashboard Query
   - Run query in Explore Logs
   - Does it return expected results?
   - Check field names are correct

3. ✅ Check Time Range
   - Is time range appropriate?
   - Does it include recent data?
   - Try "Last 1 hour" to test

4. ✅ Verify Data Source
   - Is data source configured correctly?
   - Are filters too restrictive?

5. ✅ Check Widget Configuration
   - Is aggregation correct?
   - Are group-by fields valid?
```

**Common Solutions**:

**Solution 1: Fix TCO Policy**
```
Problem: Logs in Store & search (Low priority)
Fix: Modify TCO policy to route to High or Medium

Example:
Policy:
  Application: web-app
  Subsystem: *
  Severity: INFO, WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
```

**Solution 2: Correct Query Syntax**
```
Wrong: filter severity == "ERROR"
Right: filter $m.severity == ERROR

Wrong: groupby timestamp
Right: groupby $m.timestamp
```

**Solution 3: Adjust Time Range**
```
Wrong: Last 5 minutes (but logs are sparse)
Right: Last 1 hour or Last 24 hours
```

### Scenario 2: Creating Error Monitoring Dashboard

**Goal**: Monitor application errors in real-time

**Step-by-Step**:
```
1. Create Dashboard:
   - Name: "Production Error Monitoring"
   - Description: "Real-time error tracking for production services"

2. Add Line Chart Widget - Error Trend:
   Query: source logs | filter $m.severity == ERROR | groupby $m.timestamp aggregate count()
   Title: "Error Count Over Time"
   Time Range: Last 24 hours
   Refresh: Auto (1 minute)

3. Add Bar Chart Widget - Errors by Service:
   Query: source logs | filter $m.severity == ERROR | groupby $m.applicationName aggregate count()
   Title: "Errors by Application"
   Sort: Descending

4. Add Pie Chart Widget - Error Distribution:
   Query: source logs | filter $m.severity >= ERROR | groupby $m.severity aggregate count()
   Title: "Error Severity Distribution"

5. Add Data Table Widget - Recent Errors:
   Query: source logs | filter $m.severity == ERROR | limit 50
   Title: "Recent Error Logs"
   Columns: timestamp, applicationName, subsystemName, message
```

### Scenario 3: Creating Performance Dashboard

**Goal**: Monitor application performance metrics

**Step-by-Step**:
```
1. Create Dashboard:
   - Name: "Application Performance"
   - Description: "Response times and throughput metrics"

2. Add Line Chart Widget - Response Time:
   Query: source logs | filter response_time != null | groupby $m.timestamp aggregate avg(response_time)
   Title: "Average Response Time"
   Unit: milliseconds

3. Add Gauge Widget - Current Throughput:
   Query: source logs | filter $m.timestamp >= now() - 5m | count
   Title: "Requests per 5 Minutes"
   Thresholds:
     - Green: 0-1000
     - Yellow: 1001-5000
     - Red: 5001+

4. Add Bar Chart Widget - Slow Endpoints:
   Query: source logs | filter response_time > 2000 | groupby endpoint aggregate count()
   Title: "Slow Endpoints (>2s)"
```

### Scenario 4: Creating Service Health Dashboard

**Goal**: Overall service health monitoring

**Step-by-Step**:
```
1. Create Dashboard:
   - Name: "Service Health Overview"
   - Description: "Health status of all production services"

2. Add Markdown Widget - Instructions:
   Content:
   # Service Health Dashboard
   Monitor the health of all production services.
   🟢 Green: Healthy | 🟡 Yellow: Warning | 🔴 Red: Critical

3. Add Gauge Widgets (one per service):
   Query: source logs | filter $m.applicationName == 'payment-service' && $m.severity >= ERROR | count
   Title: "Payment Service Health"
   Thresholds:
     - Green: 0-5
     - Yellow: 6-20
     - Red: 21+

4. Add Data Table Widget - Service Status:
   Query: source logs | groupby $m.applicationName aggregate count() as total, count($m.severity == ERROR) as errors
   Title: "Service Summary"
```

---

## Dashboard Query Best Practices

### 1. Use Specific Filters
```
❌ Bad:
source logs

✅ Good:
source logs
| filter $m.severity >= WARNING
| filter $m.applicationName == 'api-gateway'
```

### 2. Test Queries First
```
Always test in Explore Logs before adding to dashboard:
1. Run query
2. Verify results match expectations
3. Check field names are correct
4. Validate time range
```

### 3. Use Appropriate Aggregations
```
For count-based widgets:
source logs | filter condition | count

For grouped counts:
source logs | filter condition | groupby $m.applicationName aggregate count()

For averages:
source logs | filter condition | groupby $m.applicationName aggregate avg(response_time)
```

### 4. Handle Missing Fields
```
Check for field existence:
source logs | filter response_time != null | filter response_time > 1000
```

---

## Dashboard Layout Best Practices

### 1. Organize by Priority
```
Top Row: Most critical metrics (gauges, key numbers)
Middle Rows: Trend charts (line charts, bar charts)
Bottom Rows: Detailed data (tables, logs)
```

### 2. Use Consistent Sizing
```
Full Width (12 cols): Important trend charts
Half Width (6 cols): Comparison charts
Quarter Width (3 cols): Gauges and single metrics
```

### 3. Group Related Widgets
```
Section 1: Error Monitoring
  - Error count gauge
  - Error trend line chart
  - Error distribution pie chart

Section 2: Performance
  - Response time line chart
  - Throughput gauge
  - Slow requests table
```

---

## Troubleshooting Guide

### Issue: "Dashboard widgets show no data"

**Diagnosis**:
```
1. ✅ TCO Policy Check (MOST COMMON - 80% of cases)
   - Verify logs in High/Medium priority
   
2. ✅ Query Validation
   - Test query in Explore Logs
   - Check for syntax errors
   
3. ✅ Time Range Check
   - Is time range appropriate?
   - Does it include data?
   
4. ✅ Data Source Check
   - Is data source configured?
   - Are filters correct?
```

**Solutions**:
```
1. Fix TCO policy routing to High/Medium
2. Correct query syntax
3. Adjust time range
4. Update data source configuration
```

### Issue: "Dashboard shows partial data"

**Diagnosis**:
```
1. Check which applications/subsystems are missing
2. Verify TCO policies for those sources
3. Check if filters are too restrictive
4. Verify time range includes all data
```

**Solutions**:
```
1. Create policy to route missing logs to High/Medium
2. Adjust filters to be less restrictive
3. Expand time range
4. Check for data gaps in source logs
```

### Issue: "Dashboard queries are slow"

**Diagnosis**:
```
1. Check query complexity
2. Review time range (too wide?)
3. Check aggregation operations
4. Verify filter specificity
```

**Solutions**:
```
1. Simplify query
2. Reduce time range
3. Add more specific filters
4. Optimize aggregations
```

---

## Query Validation Checklist

Before adding a query to a dashboard, validate:

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

### Pattern 2: Response Time Trend
```
source logs
| filter response_time != null
| groupby $m.timestamp aggregate avg(response_time) as avg_response_time
```

### Pattern 3: Top Error Messages
```
source logs
| filter $m.severity == ERROR
| groupby message aggregate count() as occurrences
| orderby -$d.occurrences
| limit 10
```

### Pattern 4: Request Rate
```
source logs
| filter endpoint != null
| groupby $m.timestamp aggregate count() as request_count
```

---

## TCO Policy Considerations for Dashboards

### Ensure Dashboard-Critical Logs in High/Medium Priority

**Example Policy for Dashboards**:
```
Policy 1 (Priority 1):
  Application: api-gateway, web-app, payment-service
  Subsystem: *
  Severity: INFO, WARNING, ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
  Reason: Dashboard monitoring needed

Policy 2 (Priority 2):
  Application: background-jobs
  Subsystem: *
  Severity: ERROR, CRITICAL
  Pipeline: Analyze & alert (Medium)
  Reason: Error dashboards only

Policy 3 (Priority 3):
  Application: *
  Subsystem: *
  Severity: DEBUG, VERBOSE
  Pipeline: Store & search (Low)
  Reason: Archive only, no dashboards needed
```

---

## Delivering Excellence

- Always check TCO policy first when troubleshooting dashboards
- Test queries in Explore Logs before adding to dashboards
- Provide specific, actionable dashboard configurations
- Explain WHY certain configurations are recommended
- Suggest appropriate widget types for use cases
- Include layout and organization guidance
- Offer query optimization tips
- Recommend dashboard naming and documentation standards
- Consider refresh rates and performance impact
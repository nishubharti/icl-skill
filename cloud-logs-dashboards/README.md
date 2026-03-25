# IBM Cloud Logs Dashboards Skill

An Agent Skill for creating, configuring, and troubleshooting dashboards in IBM Cloud Logs.

## What This Skill Does

This skill helps users:
- Create new dashboards with appropriate widget configurations
- Troubleshoot dashboards that aren't showing data
- Validate dashboard queries and data sources
- Understand TCO policy impact on dashboards
- Configure dashboard layouts and visualizations
- Optimize dashboard performance

## When to Use This Skill

Use this skill when users mention:
- "create dashboard"
- "dashboard not showing data"
- "dashboard configuration"
- "widget not working"
- "dashboard query"
- "dashboard visualization"
- "dashboard debugging"
- "set up dashboard"
- "dashboard layout"
- "dashboard widgets"
- "custom dashboard"
- "dashboard metrics"

## Key Concepts

### TCO Policy Impact (CRITICAL)
**Dashboards ONLY show High and Medium priority logs**. If logs are routed to Low priority (Store & search), dashboards will NOT display them. This is the #1 cause of "dashboard showing no data" issues.

### Dashboard Widget Types
1. **Line Chart** - Show trends over time
2. **Bar Chart** - Compare values across categories
3. **Pie Chart** - Show distribution/proportions
4. **Data Table** - Display detailed log entries
5. **Gauge** - Show single metric value
6. **Markdown** - Add text, documentation, or instructions

## Common Scenarios

### Scenario 1: Dashboard Shows No Data
**Diagnosis Checklist**:
1. Check TCO Policy - Are logs in High or Medium priority?
2. Verify Dashboard Query - Does it work in Explore Logs?
3. Check Time Range - Is it appropriate?
4. Verify Data Source - Is it configured correctly?
5. Check Widget Configuration - Is aggregation correct?

### Scenario 2: Creating Error Monitoring Dashboard
Step-by-step guidance for creating a comprehensive error monitoring dashboard with multiple widget types.

### Scenario 3: Creating Performance Dashboard
Step-by-step guidance for monitoring application performance metrics.

### Scenario 4: Creating Service Health Dashboard
Step-by-step guidance for overall service health monitoring.

## Quick Reference

### Query Validation Checklist
- ✅ Query runs successfully in Explore Logs
- ✅ Query returns expected results
- ✅ Field names match actual log structure
- ✅ Filters are not too restrictive
- ✅ Time window is appropriate
- ✅ Aggregations are correct
- ✅ Logs are in High or Medium priority

### Dashboard Design Best Practices
1. Organize by priority (critical metrics at top)
2. Use consistent sizing
3. Group related widgets
4. Add context with markdown
5. Use descriptive titles
6. Implement consistent color coding
7. Set appropriate refresh rates
8. Document dashboard purpose

## References

- [IBM Cloud Logs Dashboard Documentation](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-about_dashboards)
- [IBM Cloud Logs FAQ](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-faq)

## Related Skills

- **cloud-logs-alerts** - For creating and troubleshooting alerts
- **cloud-logs-cli-troubleshoot** - For debugging CLI query issues
- **dataprime-query-builder** - For building DataPrime queries
- **tco-policy-optimizer** - For cost optimization and TCO policies

## Testing

Run tests with:
```bash
npm test
```

## License

MIT
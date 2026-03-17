# DataPrime Query Builder Skill

A comprehensive skill for building and understanding DataPrime queries for IBM Cloud Logs. This skill provides syntax references, query patterns, and best practices for analyzing logs using DataPrime query language.

## What is DataPrime?

DataPrime is IBM Cloud Logs' powerful query language designed for log analysis and observability. It uses a pipeline-based syntax where data flows through a series of transformations and aggregations.

## What This Skill Does

This skill helps you:
- **Build DataPrime queries** from natural language descriptions
- **Understand query syntax** with detailed references and examples
- **Apply common patterns** for log analysis tasks
- **Troubleshoot queries** with syntax validation and error explanations
- **Optimize queries** for performance and clarity

## Skill Contents

### 📁 `dataprime-query-builder.skill`
The main skill file that enables AI assistants to understand and generate DataPrime queries.

### 📚 `references/`
Comprehensive reference documentation:

#### `syntax.md`
Complete syntax reference covering:
- Pipeline structure and commands
- Filter expressions and operators
- Aggregation functions (count, avg, sum, max, min, percentile)
- Grouping and ordering
- Field manipulation (create, convert, extract)
- Special variables (`$m`, `$d`, `$l`)
- String methods and type conversions
- Common mistakes and fixes

#### `patterns.md`
25+ ready-to-use query patterns including:
- Basic exploration and filtering
- Error analysis and counting
- Performance monitoring (latency, P95)
- Service-level aggregations
- Text search and extraction
- Time-based analysis
- Nested field access

## How to Use This Skill

### Example 1: Count Logs by Severity
**Request:** "Count logs by severity level"

**Generated Query:**
```dataprime
source logs
| groupby $m.severity aggregate count() as log_count
| orderby -$d.log_count
```

### Example 2: Find Slow Requests
**Request:** "Show me requests taking more than 2 seconds"

**Generated Query:**
```dataprime
source logs
| filter duration_ms > 2000
| choose $m.timestamp, $m.applicationName, endpoint, duration_ms, msg
| orderby -duration_ms
| limit 50
```

### Example 3: Top Error Messages
**Request:** "What are the most common error messages?"

**Generated Query:**
```dataprime
source logs
| filter $m.severity == ERROR
| top 10 msg by count()
```

## Key DataPrime Concepts

### Pipeline Structure
```dataprime
source logs
| command1 [args]
| command2 [args]
| ...
```
Each `|` passes data to the next command in the pipeline.

### Special Variables
- `$m` - Metadata fields (severity, timestamp, applicationName, etc.)
- `$d` - Aggregated data fields (after groupby)
- `$l` - Raw log text string

### Severity Levels
`DEBUG`, `VERBOSE`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

### Common Commands
- `filter` - Keep rows matching conditions
- `groupby` - Group and aggregate data
- `orderby` - Sort results
- `choose` - Select specific fields
- `limit` - Cap number of results
- `top` - Get top N by aggregation
- `find` - Search in specific field
- `wildfind` - Search across all fields

## Best Practices

1. **Always start with `source logs`** for IBM Cloud Logs
2. **Use `limit`** during exploration to avoid overwhelming results
3. **Read files first** when unsure about field names
4. **Reference aggregated fields** with `$d.` prefix after groupby
5. **Use `-` prefix** for descending order in orderby
6. **Check field types** - use `:number` cast if comparing numeric strings
7. **Use `.toLowerCase()`** for case-insensitive text searches

## Common Patterns Quick Reference

| Task | Query Pattern |
|------|---------------|
| Count errors | `filter $m.severity == ERROR \| count` |
| Group by service | `groupby $m.applicationName aggregate count() as total` |
| Top 10 values | `top 10 field by count()` |
| Search text | `find 'keyword' in msg` |
| Filter range | `filter field >= 500 && field < 600` |
| Sort descending | `orderby -$d.count` |

## Target Use Cases

- **Log Analysis**: Find errors, warnings, and patterns in logs
- **Performance Monitoring**: Track latency, response times, and bottlenecks
- **Troubleshooting**: Search for specific errors or conditions
- **Service Health**: Monitor service-level metrics and error rates
- **Trend Analysis**: Aggregate logs over time periods
- **Security**: Track suspicious activities or access patterns

## IBM Cloud Logs Integration

This skill is designed for use with IBM Cloud Logs instances across all regions (us-south, us-east, eu-de, eu-gb, jp-tok, jp-osa, au-syd, etc.).

Queries can be executed in:
- IBM Cloud Logs UI query editor
- API calls to Cloud Logs endpoints
- Automated monitoring and alerting rules
- Dashboard widgets and visualizations

## Getting Started

1. **Explore your data**: Start with `source logs | limit 100`
2. **Identify fields**: Use the output to see available field names
3. **Build incrementally**: Add filters and aggregations step by step
4. **Test and refine**: Adjust time ranges and conditions as needed
5. **Save useful queries**: Document patterns for your specific use cases

## Support

For DataPrime syntax questions, refer to:
- `references/syntax.md` - Complete syntax reference
- `references/patterns.md` - 25+ example queries

For IBM Cloud Logs documentation:
- [IBM Cloud Logs Documentation](https://cloud.ibm.com/docs/cloud-logs)
- [DataPrime Query Language Guide](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-dataprime-query-language)

---

**Version**: 1.0  
**Last Updated**: 2026-03-14  
**Maintained by**: Nishu Bharti

# DataPrime Query Patterns

A ready-made library of patterns. Each has a goal, query, and notes on adapting it.

---

## 1. Show all recent logs (starting point)
**Goal**: See raw logs — useful for exploring unknown data.
```
source logs
| limit 100
```
*Always start here when you don't know the field schema.*

---

## 2. Filter by severity level
**Goal**: See only ERROR logs.
```
source logs
| filter $m.severity == ERROR
| limit 200
```
*Values: DEBUG, VERBOSE, INFO, WARNING, ERROR, CRITICAL*

---

## 3. Count total errors
**Goal**: How many error logs in the time window?
```
source logs
| filter $m.severity == ERROR
| count
```

---

## 4. Search for a keyword (in a specific field)
**Goal**: Find all logs mentioning "timeout" in the message.
```
source logs
| find 'timeout' in msg
```
*Replace `msg` with your message field name (e.g. `message`, `log`, `text`)*

---

## 5. Search across ALL fields
**Goal**: Find logs mentioning "OutOfMemory" anywhere.
```
source logs
| wildfind 'OutOfMemory'
```

---

## 6. Filter by application / service name
**Goal**: Only logs from a specific service.
```
source logs
| filter $m.applicationName == 'payment-service'
```

---

## 7. Filter by multiple conditions
**Goal**: Errors from a specific service.
```
source logs
| filter $m.severity == ERROR && $m.applicationName == 'payment-service'
```

---

## 8. Count errors per service
**Goal**: Which services are generating the most errors?
```
source logs
| filter $m.severity == ERROR
| groupby $m.applicationName aggregate count() as error_count
| orderby -$d.error_count
```

---

## 9. Top 10 error messages
**Goal**: What are the most common error messages?
```
source logs
| filter $m.severity == ERROR
| top 10 msg by count()
```

---

## 10. Count errors per service, per severity
**Goal**: Error breakdown by service and severity.
```
source logs
| groupby $m.applicationName, $m.severity aggregate count() as log_count
| orderby $m.applicationName, -$d.log_count
```

---

## 11. Filter by HTTP status code
**Goal**: Find all 5xx errors (assuming field `status_code`).
```
source logs
| filter status_code >= 500 && status_code < 600
| choose $m.timestamp, $m.applicationName, status_code, msg
| limit 100
```
*If status_code is stored as a string: `filter status_code:number >= 500`*

---

## 12. Average response latency per service
**Goal**: What is the average request duration per service? (field: `duration_ms`)
```
source logs
| filter duration_ms != null
| groupby $m.applicationName aggregate avg(duration_ms) as avg_latency_ms
| orderby -$d.avg_latency_ms
```

---

## 13. P95 latency per endpoint
**Goal**: 95th percentile latency broken down by endpoint.
```
source logs
| filter duration_ms != null && endpoint != null
| groupby endpoint aggregate percentile(duration_ms, 95) as p95_latency_ms
| orderby -$d.p95_latency_ms
| limit 20
```

---

## 14. Slow requests (above a threshold)
**Goal**: Find requests taking more than 2 seconds.
```
source logs
| filter duration_ms > 2000
| choose $m.timestamp, $m.applicationName, endpoint, duration_ms, msg
| orderby -$d.duration_ms
| limit 50
```

---

## 15. Distinct values of a field
**Goal**: What unique regions appear in the logs?
```
source logs
| distinct region
```
*Use this to explore what values a field actually contains.*

---

## 16. Count distinct users
**Goal**: How many unique users generated logs?
```
source logs
| groupby $m.applicationName aggregate distinct_count(user_id) as unique_users
| orderby -$d.unique_users
```

---

## 17. Logs containing a specific IP address
**Goal**: All logs mentioning a specific client IP.
```
source logs
| filter client_ip == '192.168.1.100'
| choose $m.timestamp, $m.applicationName, client_ip, msg
| limit 100
```

---

## 18. Extract a value from unstructured text
**Goal**: Parse an HTTP status code from a log message like `"Response: 404 Not Found"`.
```
source logs
| extract msg into re'Response: (?P<extracted_status>\d{3})'
| filter extracted_status != null
| groupby extracted_status aggregate count() as occurrences
| orderby -$d.occurrences
```

---

## 19. Create a computed field
**Goal**: Convert milliseconds to seconds, then filter on it.
```
source logs
| filter duration_ms != null
| create duration_sec = duration_ms / 1000.0
| filter duration_sec > 5
| choose $m.timestamp, $m.applicationName, duration_sec, msg
```

---

## 20. Error rate: errors as % of total logs per service
**Goal**: What fraction of each service's logs are errors?
```
# Step 1: Get total logs per service
source logs
| groupby $m.applicationName aggregate count() as total_logs

# ---- (Run separately or use subquery syntax if supported) ----

# Step 2: Get error logs per service, then calculate ratio manually
source logs
| filter $m.severity == ERROR
| groupby $m.applicationName aggregate count() as error_logs
```
*Note: Cross-referencing two aggregations requires two queries; compare results side by side.*

---

## 21. Logs with nested JSON field access
**Goal**: Filter by a nested field `payload.response.statusCode`.
```
source logs
| filter payload.response.statusCode >= 400
| choose $m.timestamp, $m.applicationName, payload.response.statusCode, msg
| limit 50
```

---

## 22. Logs from a specific time range (relative)
**Goal**: Errors from the last hour only.
*Use the time range picker in the UI, or override in the query using the timeframe parameter if supported by your UI.*
```
source logs
| filter $m.severity == ERROR
| limit 100
```
*Adjust the time picker in IBM Cloud Logs UI to "Last 1 hour".*

---

## 23. Find logs where a field is missing / null
**Goal**: Logs where `user_id` is not present.
```
source logs
| filter user_id == null
| choose $m.timestamp, $m.applicationName, msg
| limit 50
```

---

## 24. Case-insensitive search workaround
**Goal**: Find "error" case-insensitively (DataPrime is case-sensitive).
```
source logs
| filter msg.toLowerCase() ~ 'error'
```
*Use `.toLowerCase()` method on string fields.*

---

## 25. Count logs per minute (time bucketing)
**Goal**: How many logs per minute? (for trend analysis in dashboards)
```
source logs
| groupby $m.timestamp / 60000 * 60000 as minute_bucket aggregate count() as logs_per_minute
| orderby $d.minute_bucket
```
*Note: Timestamp is in milliseconds. Adapt the divisor for different bucket sizes (e.g., 3600000 for hourly).*

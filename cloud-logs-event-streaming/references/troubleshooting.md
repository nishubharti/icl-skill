# Event Streaming Troubleshooting Guide

Common issues and solutions for IBM Cloud Logs Event Streaming configuration and operation.

## Issue 1: No Data Streaming to Event Streams

### Symptoms
- Event Streams topic exists but has no messages
- Kafka Connect shows no records processed
- Destination system receives no data

### Possible Causes
1. Streaming rule doesn't match any logs
2. IAM permissions are insufficient
3. Service credentials are invalid or expired
4. Streaming configuration is not active

### Troubleshooting Steps

**Step 1: Verify Streaming Rule Matches Logs**
```
# In DataPrime query mode
filter YOUR_CONDITION

# Example
filter $l.applicationname == 'api-gateway'
filter $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
```

If no logs are returned:
- Check field names (case-sensitive)
- Verify field values are correct
- Ensure custom fields are extracted by parsing rules
- Try a simpler rule first

**Step 2: Check IAM Permissions**
```bash
# Check user policies
ibmcloud iam user-policies YOUR_EMAIL

# Verify you have:
# - Manager role on Cloud Logs instance
# - Writer role on Event Streams instance
# - Manager role on Event Streams instance
```

**Step 3: Verify Service Credentials**
- Navigate to Event Streams instance
- Check service credentials exist
- Verify credentials have `messagehub.topic.write` permission
- Verify credentials have `messagehub.topic.manage` permission
- Check credentials are not expired

**Step 4: Check Streaming Configuration Status**
- Navigate to Cloud Logs UI → Settings → Event Streaming
- Verify configuration shows as "Active"
- Check for any error messages
- Verify Event Streams instance is selected correctly

**Step 5: Review Activity Tracker**
```bash
# Check for streaming configuration events
ibmcloud at event-list --service-name logs --event-type logs.logs-stream-setup.*

# Look for error events
```

### Solution
- Fix streaming rule to match logs
- Grant required IAM roles
- Create new service credentials with correct permissions
- Activate streaming configuration if disabled

---

## Issue 2: Streaming Rule Not Matching Expected Logs

### Symptoms
- Too few logs streaming
- Too many logs streaming
- Wrong logs being streamed

### Possible Causes
1. Incorrect field names or values
2. Syntax errors in DPXL rule
3. Custom fields not extracted by parsing rules
4. Case sensitivity issues

### Troubleshooting Steps

**Step 1: Validate Rule Syntax**
Check for common syntax errors:
- Using `=` instead of `==`
- Using double quotes instead of single quotes
- Missing quotes around string values
- Using `|` instead of `||` for OR
- Using `&` instead of `&&` for AND

**Correct Syntax**:
```
<v1> $l.applicationname == 'api-gateway'  // Correct
<v1> $l.applicationname = 'api-gateway'   // Wrong: single =
<v1> $l.applicationname == "api-gateway"  // Wrong: double quotes
<v1> $l.applicationname == api-gateway    // Wrong: missing quotes
```

**Step 2: Verify Field Names**
```
# Test field existence
filter $l.applicationname == 'any-value'
filter $d.severity == 'any-value'

# If no results, field doesn't exist or name is wrong
```

Common field name issues:
- `applicationName` vs `applicationname` (case matters)
- `subsystemName` vs `subsystemname` (case matters)
- `msg` vs `message` (different fields)

**Step 3: Check Custom Fields**
If using custom fields like `$d.statusCode` or `$d.severity`:
- Verify parsing rule exists to extract the field
- Check parsing rule is enabled
- Verify parsing rule matches your logs
- Test field extraction in Explore Logs

**Step 4: Test with Simpler Rule**
```
# Start simple
filter $l.applicationname == 'api-gateway'

# Add complexity gradually
filter $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Add more conditions
filter $l.applicationname == 'api-gateway' && $d.severity == 'ERROR' && $d.environment == 'production'
```

**Step 5: Check Operator Logic**
```
# OR: Matches ANY condition
$l.applicationname == 'app1' || $l.applicationname == 'app2'
# Matches logs from app1 OR app2

# AND: Matches ALL conditions
$l.applicationname == 'app1' && $d.severity == 'ERROR'
# Matches ERROR logs from app1 only
```

### Solution
- Fix syntax errors
- Correct field names (check case)
- Create or fix parsing rules for custom fields
- Adjust operator logic (AND vs OR)
- Test incrementally with simpler rules

---

## Issue 3: Kafka Connect Connector Failing

### Symptoms
- Connector status shows "FAILED"
- Error messages in connector logs
- Data in Event Streams but not in destination

### Possible Causes
1. Authentication failure to destination
2. Network connectivity issues
3. Invalid connector configuration
4. Resource limits exceeded

### Troubleshooting Steps

**Step 1: Check Connector Status**
```bash
# Get connector status
curl http://kafka-connect:8083/connectors/my-connector/status

# Look for error messages in response
```

**Step 2: Review Connector Logs**
```bash
# For Kubernetes deployment
kubectl logs -f kafka-connect-pod-name

# Look for authentication errors, network errors, or configuration errors
```

**Step 3: Verify Authentication**
- Check destination system credentials are correct
- Verify API keys or tokens are not expired
- Test credentials manually:
  ```bash
  # For HTTP endpoint
  curl -X POST https://destination.example.com/api/events \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"test": "data"}'
  
  # For S3
  aws s3 ls s3://my-bucket/
  ```

**Step 4: Check Network Connectivity**
```bash
# From Kafka Connect pod
kubectl exec -it kafka-connect-pod-name -- /bin/bash

# Test connectivity to destination
curl -v https://destination.example.com
ping destination.example.com
nslookup destination.example.com
```

**Step 5: Validate Connector Configuration**
```bash
# Get connector configuration
curl http://kafka-connect:8083/connectors/my-connector/config

# Check for:
# - Correct topic name
# - Valid destination URL
# - Correct authentication settings
# - Proper format configuration
```

**Step 6: Check Resource Limits**
```bash
# Check Kafka Connect pod resources
kubectl describe pod kafka-connect-pod-name

# Look for:
# - Memory limits
# - CPU limits
# - OOMKilled status
```

### Solution
- Update destination credentials
- Fix network connectivity (firewall rules, DNS)
- Correct connector configuration
- Increase resource limits for Kafka Connect
- Restart connector:
  ```bash
  curl -X POST http://kafka-connect:8083/connectors/my-connector/restart
  ```

---

## Issue 4: High Data Volume and Costs

### Symptoms
- Unexpectedly high Event Streams usage
- High Kafka Connect resource usage
- High destination system costs
- Slower than expected performance

### Possible Causes
1. Streaming rule is too broad
2. No filtering applied (streaming all logs)
3. High-volume applications included
4. Debug/verbose logs being streamed

### Troubleshooting Steps

**Step 1: Review Data Volume**
```bash
# Check Event Streams topic metrics
ibmcloud es topic cloud-logs-stream --monitoring

# Look for:
# - Messages per second
# - Bytes per second
# - Total message count
```

**Step 2: Analyze Streamed Logs**
Sample logs in destination system to identify:
- Are all streamed logs valuable?
- Are debug/verbose logs being streamed?
- Are test/development logs being streamed?
- Are high-volume applications included?

**Step 3: Review Streaming Rule Specificity**
```
# Too broad (high volume)
<v1> $l.applicationname == 'api-gateway'

# More specific (lower volume)
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Most specific (lowest volume)
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR' && $d.environment == 'production'
```

**Step 4: Identify High-Volume Sources**
```
# In DataPrime query mode, count by application
source logs 
| filter YOUR_STREAMING_RULE
| aggregate count() by $l.applicationname
| sort count desc
```

### Solution

**Option 1: Add More Specific Filters**
```
# Add severity filter
<v1> $l.applicationname == 'api-gateway' && ( $d.severity == 'ERROR' || $d.severity == 'CRITICAL' )

# Add environment filter
<v1> $l.applicationname == 'api-gateway' && $d.environment == 'production'

# Combine filters
<v1> $l.applicationname == 'api-gateway' && ( $d.severity == 'ERROR' || $d.severity == 'CRITICAL' ) && $d.environment == 'production'
```

**Option 2: Exclude High-Volume, Low-Value Logs**
```
# Exclude health checks
<v1> $l.applicationname == 'api-gateway' && !$d.msg.contains('health check')

# Exclude debug logs
<v1> $l.applicationname == 'api-gateway' && $d.severity != 'DEBUG'
```

**Option 3: Implement Sampling** (if appropriate)
```
# Stream only 10% of INFO logs (example using requestId)
<v1> $d.severity == 'INFO' && $d.requestId.endsWith('0')
```

**Option 4: Enable Compression**
```json
// In Kafka Connect S3 sink configuration
{
  "s3.compression.type": "gzip"
}
```

---

## Issue 5: Data Not Reaching Destination System

### Symptoms
- Data in Event Streams but not in destination
- Connector shows records processed but destination is empty
- No errors in connector logs

### Possible Causes
1. Connector consuming but not writing
2. Destination system rate limiting
3. Data format mismatch
4. Network issues between Kafka Connect and destination

### Troubleshooting Steps

**Step 1: Verify Connector is Consuming**
```bash
# Check connector metrics
curl http://kafka-connect:8083/connectors/my-connector/status

# Look for:
# - "records-read" > 0
# - "records-sent" > 0
```

**Step 2: Check Destination System**
- Log into destination system
- Check for incoming data
- Review destination system logs for errors
- Check for rate limiting or throttling

**Step 3: Verify Data Format**
```bash
# Check connector format configuration
curl http://kafka-connect:8083/connectors/my-connector/config | jq '.config."format.class"'

# Common formats:
# - io.confluent.connect.s3.format.json.JsonFormat
# - io.confluent.connect.s3.format.avro.AvroFormat
# - org.apache.kafka.connect.json.JsonConverter
```

**Step 4: Test Destination Connectivity**
```bash
# From Kafka Connect pod
kubectl exec -it kafka-connect-pod-name -- /bin/bash

# Test write to destination
# For S3
aws s3 cp test.txt s3://my-bucket/test.txt

# For HTTP
curl -X POST https://destination.example.com/api/events \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Step 5: Check Network Policies**
```bash
# Verify Kafka Connect can reach destination
kubectl get networkpolicies
kubectl describe networkpolicy kafka-connect-egress
```

### Solution
- Fix data format configuration
- Increase rate limits on destination
- Fix network connectivity
- Update network policies
- Verify destination system is accepting data

---

## Issue 6: Streaming Configuration Cannot Be Created

### Symptoms
- Error when creating streaming configuration
- "Insufficient permissions" error
- "Invalid configuration" error

### Possible Causes
1. Missing IAM roles
2. Event Streams instance not in same account
3. Invalid DPXL syntax
4. Service credentials not created

### Troubleshooting Steps

**Step 1: Verify IAM Roles**
```bash
# Check your IAM policies
ibmcloud iam user-policies YOUR_EMAIL

# Required roles:
# - Manager on Cloud Logs instance
# - Writer on Event Streams instance
# - Manager on Event Streams instance
```

**Step 2: Verify Account**
```bash
# Check Cloud Logs instance account
ibmcloud resource service-instance cloud-logs-instance

# Check Event Streams instance account
ibmcloud resource service-instance event-streams-instance

# Both must be in the same account
```

**Step 3: Validate DPXL Syntax**
```
# Test in DataPrime query mode (without <v1> prefix)
filter $l.applicationname == 'api-gateway'

# If successful, add <v1> prefix for streaming rule
<v1> $l.applicationname == 'api-gateway'
```

**Step 4: Verify Service Credentials**
- Navigate to Event Streams instance
- Go to Service Credentials
- Verify credentials exist with Manager role
- Create new credentials if needed

### Solution
- Request required IAM roles from administrator
- Ensure both instances are in same account
- Fix DPXL syntax errors
- Create service credentials with correct permissions

---

## Issue 7: Streaming Stopped Working

### Symptoms
- Streaming was working but stopped
- No recent data in Event Streams
- Configuration still shows as active

### Possible Causes
1. Service credentials expired or revoked
2. IAM roles changed
3. Event Streams instance issue
4. Cloud Logs instance issue

### Troubleshooting Steps

**Step 1: Check Service Credentials**
- Navigate to Event Streams instance
- Verify service credentials still exist
- Check credentials are not expired
- Test credentials:
  ```bash
  ibmcloud es topic-list --instance event-streams-instance
  ```

**Step 2: Verify IAM Roles**
```bash
# Check current IAM policies
ibmcloud iam user-policies YOUR_EMAIL

# Verify roles haven't changed
```

**Step 3: Check Event Streams Health**
```bash
# Check Event Streams instance status
ibmcloud resource service-instance event-streams-instance

# Check topic exists
ibmcloud es topic cloud-logs-stream
```

**Step 4: Check Cloud Logs Health**
- Navigate to Cloud Logs UI
- Verify instance is accessible
- Check for any service notifications

**Step 5: Review Activity Tracker**
```bash
# Look for configuration changes
ibmcloud at event-list --service-name logs --event-type logs.logs-stream-setup.*

# Look for IAM policy changes
ibmcloud at event-list --service-name iam
```

### Solution
- Recreate service credentials
- Restore IAM roles
- Contact IBM Cloud support if instance issues
- Recreate streaming configuration if needed

---

## Diagnostic Commands

### Check Streaming Configuration
```bash
# List all streaming configurations
# (via Cloud Logs UI: Settings → Event Streaming)
```

### Check Event Streams Topic
```bash
# List topics
ibmcloud es topic-list

# Get topic details
ibmcloud es topic cloud-logs-stream

# Check topic messages
ibmcloud es topic cloud-logs-stream --monitoring
```

### Check Kafka Connect
```bash
# List connectors
curl http://kafka-connect:8083/connectors

# Get connector status
curl http://kafka-connect:8083/connectors/my-connector/status

# Get connector config
curl http://kafka-connect:8083/connectors/my-connector/config

# Restart connector
curl -X POST http://kafka-connect:8083/connectors/my-connector/restart
```

### Check Activity Tracker
```bash
# List streaming events
ibmcloud at event-list --service-name logs --event-type logs.logs-stream-setup.*

# Get specific event details
ibmcloud at event-get EVENT_ID
```

## Getting Help

If issues persist after troubleshooting:

1. **Check IBM Cloud Status**: https://cloud.ibm.com/status
2. **Review Documentation**: 
   - [Event Streaming Docs](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-streaming)
   - [Streaming Rules Docs](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-streaming_rules)
3. **Contact Support**: Open a support case with:
   - Cloud Logs instance ID
   - Event Streams instance ID
   - Streaming rule configuration
   - Error messages
   - Activity Tracker events
   - Connector logs (if applicable)

## Related Documentation

- [DPXL Syntax Guide](dpxl-syntax-guide.md)
- [Streaming Rules Reference](streaming-rules-reference.md)
- [Rule Validation](rule-validation.md)
- [Best Practices](best-practices.md)
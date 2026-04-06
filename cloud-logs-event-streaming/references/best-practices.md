# Event Streaming Best Practices

Comprehensive guide to best practices for configuring, managing, and optimizing IBM Cloud Logs Event Streaming.

## Overview

This guide covers:
- Configuration best practices
- Performance optimization
- Cost management
- Security recommendations
- Monitoring strategies
- Operational excellence

## Configuration Best Practices

### 1. Start Small and Iterate

**Recommendation**: Begin with narrow, specific rules and expand gradually.

**Why:**
- Easier to validate
- Lower initial costs
- Faster troubleshooting
- Better understanding of data patterns

**Example Progression:**

```
# Phase 1: Start with critical errors only
<v1> $l.applicationname == 'payment-service' && $d.severity == 'CRITICAL'

# Phase 2: Add ERROR severity
<v1> $l.applicationname == 'payment-service' && ($d.severity == 'ERROR' || $d.severity == 'CRITICAL')

# Phase 3: Add more applications
<v1> ($l.applicationname == 'payment-service' || $l.applicationname == 'auth-service') && ($d.severity == 'ERROR' || $d.severity == 'CRITICAL')
```

### 2. Use Specific Filters

**Recommendation**: Always use the most specific filters possible.

**Good Examples:**

```
# Specific application + severity
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Specific subsystem + field value
<v1> $l.subsystemname == 'authentication' && $d.statusCode == '401'

# Multiple specific conditions
<v1> $l.applicationname == 'payment-service' && $d.transactionType == 'refund' && $d.amount > 1000
```

**Avoid:**

```
# Too broad - streams everything
<v1> $l.applicationname == 'api-gateway'

# Too broad - all errors from all apps
<v1> $d.severity == 'ERROR'
```

### 3. Exclude Low-Value Logs

**Recommendation**: Explicitly exclude health checks, debug logs, and other noise.

**Examples:**

```
# Exclude health checks
<v1> $l.applicationname == 'api-gateway' && !$d.msg.contains('health check')

# Exclude debug logs
<v1> $l.applicationname == 'api-gateway' && $d.severity != 'DEBUG'

# Exclude multiple patterns
<v1> $l.applicationname == 'api-gateway' && !$d.msg.contains('health check') && !$d.msg.contains('ping')
```

### 4. Validate Before Deployment

**Recommendation**: Always validate rules using DataPrime query mode before deploying.

**Validation Process:**

1. Write DPXL rule
2. Convert to DataPrime query (remove `<v1>`)
3. Run query in Cloud Logs UI
4. Analyze results and volume
5. Refine rule as needed
6. Deploy with `<v1>` prefix

**See**: [Rule Validation Guide](rule-validation.md)

### 5. Document Your Rules

**Recommendation**: Maintain documentation for each streaming rule.

**Documentation Template:**

```yaml
Rule Name: Payment Service Errors
Purpose: Stream payment processing errors to SIEM
DPXL Rule: <v1> $l.applicationname == 'payment-service' && $d.severity == 'ERROR'
Created: 2026-01-15
Owner: Security Team
Expected Volume: ~500 logs/hour
Destination: Splunk via Kafka Connect
Review Date: 2026-04-15
```

### 6. Use Descriptive Names

**Recommendation**: Use clear, descriptive names for streaming configurations.

**Good Names:**
- `payment-errors-to-splunk`
- `security-events-to-siem`
- `production-critical-logs`
- `compliance-audit-logs`

**Avoid:**
- `stream1`
- `test`
- `my-stream`
- `logs`

## Performance Optimization

### 1. Optimize Rule Complexity

**Recommendation**: Balance specificity with performance.

**Performance Impact:**

```
# Fast: Simple equality checks
<v1> $l.applicationname == 'api-gateway'

# Medium: Multiple conditions with AND
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Slower: Text search with contains()
<v1> $d.msg.contains('timeout')

# Slowest: Multiple text searches with OR
<v1> $d.msg.contains('timeout') || $d.msg.contains('error') || $d.msg.contains('failed')
```

**Optimization Tips:**
- Use label fields (`$l.`) when possible (faster than data fields)
- Use equality checks (`==`) instead of text search when possible
- Combine multiple text searches into one if possible
- Use AND before OR in complex conditions

### 2. Batch Configuration Changes

**Recommendation**: Make multiple rule changes together rather than one at a time.

**Why:**
- Reduces configuration churn
- Easier to track changes
- Better for testing
- Reduces Activity Tracker noise

### 3. Monitor Event Streams Performance

**Recommendation**: Monitor Event Streams topic metrics regularly.

**Key Metrics:**
- Messages per second
- Bytes per second
- Consumer lag
- Partition distribution

**Monitoring Commands:**

```bash
# Check topic details
ibmcloud es topic <topic-name>

# Monitor consumer lag
ibmcloud es topic-consumer-groups <topic-name>
```

### 4. Right-Size Event Streams

**Recommendation**: Choose appropriate Event Streams plan based on volume.

**Volume Guidelines:**
- **Lite Plan**: Testing only (max 1 MB/s)
- **Standard Plan**: Low to medium volume (up to 150 MB/s)
- **Enterprise Plan**: High volume (up to 450 MB/s)

**Calculation:**

```
Average log size: 1.5 KB
Logs per hour: 10,000
Hourly data: 10,000 × 1.5 KB = 15 MB
Per second: 15 MB / 3600 = 4.2 KB/s

Standard Plan is sufficient
```

## Cost Management

### 1. Estimate Costs Before Deployment

**Recommendation**: Calculate expected costs before enabling streaming.

**Cost Components:**
1. **Event Streams**: Based on throughput and storage
2. **Data Transfer**: Egress from Cloud Logs
3. **Kafka Connect**: Compute resources
4. **Destination**: SIEM/analytics platform costs

**Estimation Process:**

```
# Step 1: Estimate log volume
Logs per hour: 5,000
Daily logs: 5,000 × 24 = 120,000
Monthly logs: 120,000 × 30 = 3,600,000

# Step 2: Estimate data size
Average log size: 1.5 KB
Monthly data: 3,600,000 × 1.5 KB = 5.4 GB

# Step 3: Calculate Event Streams cost
Standard Plan: $X/month base + $Y/GB
Total: $X + (5.4 × $Y)
```

### 2. Implement Cost Controls

**Recommendation**: Set up alerts for unexpected cost increases.

**Cost Control Strategies:**

1. **Volume Alerts**: Alert when volume exceeds threshold
2. **Rule Reviews**: Quarterly review of all streaming rules
3. **Unused Rules**: Disable rules that are no longer needed
4. **Test in Non-Production**: Test rules in dev/staging first

### 3. Optimize for Cost

**Recommendation**: Regularly review and optimize streaming rules.

**Optimization Checklist:**
- [ ] Remove unused streaming configurations
- [ ] Consolidate similar rules
- [ ] Add exclusions for low-value logs
- [ ] Review severity filters (do you need DEBUG?)
- [ ] Check for duplicate streams
- [ ] Validate destination is still needed

### 4. Use Sampling for High-Volume Logs

**Recommendation**: For very high-volume logs, consider sampling.

**Sampling Strategies:**

```
# Sample 10% of logs (using modulo on timestamp)
<v1> $l.applicationname == 'high-volume-app' && ($m.timestamp % 10) == 0

# Sample only errors (natural sampling)
<v1> $l.applicationname == 'high-volume-app' && $d.severity == 'ERROR'

# Sample specific subsystems
<v1> $l.applicationname == 'high-volume-app' && $l.subsystemname == 'critical-component'
```

## Security Best Practices

### 1. Principle of Least Privilege

**Recommendation**: Grant minimum required IAM permissions.

**Role Assignment:**
- **Streaming Admins**: Manager role on Cloud Logs
- **Streaming Viewers**: Reader role on Cloud Logs
- **Service Credentials**: Writer role on Event Streams (not Manager unless needed)

**See**: [IAM Roles and Permissions](iam-roles-permissions.md)

### 2. Rotate Service Credentials

**Recommendation**: Rotate Event Streams service credentials regularly.

**Rotation Schedule:**
- **Production**: Every 90 days
- **Non-Production**: Every 180 days
- **After Incidents**: Immediately

**Rotation Process:**

```bash
# 1. Create new credentials
ibmcloud resource service-key-create <new-key-name> Writer \
  --instance-name <event-streams-instance>

# 2. Update streaming configuration with new credentials
# (via Cloud Logs UI or API)

# 3. Verify streaming works with new credentials

# 4. Delete old credentials
ibmcloud resource service-key-delete <old-key-name> -f
```

### 3. Encrypt Data in Transit

**Recommendation**: Always use TLS/SSL for Event Streams connections.

**Configuration:**
- Event Streams automatically uses TLS
- Verify `kafka_brokers_sasl` endpoints (not plain)
- Use SASL_SSL protocol in Kafka Connect

### 4. Audit Access Regularly

**Recommendation**: Review IAM access quarterly.

**Audit Checklist:**
- [ ] Review users with Manager role on Cloud Logs
- [ ] Review service credentials for Event Streams
- [ ] Check Activity Tracker for unusual access patterns
- [ ] Verify access groups are up to date
- [ ] Remove access for departed team members

### 5. Protect Sensitive Data

**Recommendation**: Avoid streaming sensitive data or mask it first.

**Strategies:**

1. **Exclude sensitive fields**: Use parsing rules to remove PII
2. **Filter sensitive logs**: Don't stream logs containing sensitive data
3. **Use data access rules**: Restrict who can configure streaming
4. **Compliance review**: Ensure streaming complies with GDPR, HIPAA, etc.

**Example - Exclude PII:**

```
# Don't stream logs containing credit card patterns
<v1> $l.applicationname == 'payment-service' && !$d.msg.contains('4[0-9]{15}')
```

## Monitoring Best Practices

### 1. Monitor Streaming Health

**Recommendation**: Set up monitoring for streaming pipeline health.

**Key Metrics to Monitor:**

1. **Cloud Logs Side:**
   - Streaming configuration status
   - Activity Tracker events
   - Error logs in Cloud Logs

2. **Event Streams Side:**
   - Topic message rate
   - Topic size
   - Consumer lag
   - Partition health

3. **Kafka Connect Side:**
   - Connector status
   - Task status
   - Error logs
   - Throughput

### 2. Set Up Alerts

**Recommendation**: Create alerts for critical streaming issues.

**Recommended Alerts:**

```yaml
Alert 1: No Data Streaming
Condition: Message rate = 0 for > 15 minutes
Severity: Critical
Action: Page on-call engineer

Alert 2: High Consumer Lag
Condition: Consumer lag > 10,000 messages
Severity: Warning
Action: Notify streaming team

Alert 3: Kafka Connect Down
Condition: Connector status = FAILED
Severity: Critical
Action: Page on-call engineer

Alert 4: High Data Volume
Condition: Message rate > expected × 2
Severity: Warning
Action: Notify streaming team (possible rule issue)
```

### 3. Use Activity Tracker

**Recommendation**: Monitor Activity Tracker for streaming configuration changes.

**Key Events to Monitor:**
- `logs.logs-stream-setup.create`
- `logs.logs-stream-setup.update`
- `logs.logs-stream-setup.delete`

**Query Example:**

```bash
# List recent streaming configuration changes
ibmcloud at event-list --service logs --action logs.logs-stream-setup.update
```

### 4. Regular Health Checks

**Recommendation**: Perform weekly health checks of streaming pipeline.

**Health Check Checklist:**
- [ ] Verify data is flowing to Event Streams
- [ ] Check consumer lag is acceptable
- [ ] Verify Kafka Connect is running
- [ ] Check destination is receiving data
- [ ] Review error logs
- [ ] Validate data volume is expected
- [ ] Check IAM credentials are valid

## Operational Excellence

### 1. Maintain Runbooks

**Recommendation**: Create and maintain runbooks for common issues.

**Runbook Topics:**
- Streaming stopped working
- High consumer lag
- Kafka Connect failures
- Credential rotation
- Adding new streaming rules
- Troubleshooting no data

**See**: [Troubleshooting Guide](troubleshooting.md)

### 2. Test in Non-Production First

**Recommendation**: Always test new rules in dev/staging before production.

**Testing Process:**

1. **Dev Environment**: Test rule syntax and validation
2. **Staging Environment**: Test with production-like data volume
3. **Production**: Deploy with monitoring

### 3. Implement Change Management

**Recommendation**: Use formal change management for production streaming changes.

**Change Process:**

1. **Request**: Document proposed change
2. **Review**: Security and cost review
3. **Approval**: Manager approval required
4. **Testing**: Test in non-production
5. **Deployment**: Deploy during maintenance window
6. **Verification**: Verify streaming works
7. **Documentation**: Update documentation

### 4. Plan for Disaster Recovery

**Recommendation**: Have a disaster recovery plan for streaming pipeline.

**DR Considerations:**

1. **Backup Configurations**: Export streaming configurations regularly
2. **Credential Backup**: Store credentials securely (e.g., Key Protect)
3. **Runbooks**: Maintain recovery runbooks
4. **Testing**: Test DR procedures quarterly

**Configuration Backup:**

```bash
# Export streaming configuration (via API)
curl -X GET "https://api.<region>.logs.cloud.ibm.com/v1/config/stream" \
  -H "Authorization: Bearer $TOKEN" \
  > streaming-config-backup.json
```

### 5. Continuous Improvement

**Recommendation**: Regularly review and improve streaming configurations.

**Review Schedule:**
- **Weekly**: Health checks and monitoring
- **Monthly**: Cost review and optimization
- **Quarterly**: Full configuration review and cleanup
- **Annually**: Architecture review and planning

**Review Questions:**
- Are all streaming rules still needed?
- Can any rules be consolidated?
- Are costs within budget?
- Is performance acceptable?
- Are there new use cases to support?
- Should we upgrade Event Streams plan?

## Integration Best Practices

### 1. Coordinate with Parsing Rules

**Recommendation**: Use parsing rules to extract fields before streaming.

**Why:**
- Enables more specific streaming rules
- Reduces need for downstream parsing
- Improves query performance
- Better data structure

**Example:**

```
# Step 1: Create parsing rule to extract fields
Parse: "status=(?P<statusCode>\d+)"
Extract: statusCode field

# Step 2: Use extracted field in streaming rule
<v1> $l.applicationname == 'api-gateway' && $d.statusCode == '500'
```

### 2. Consider TCO Policies

**Recommendation**: Understand interaction between streaming and TCO policies.

**Key Points:**
- Streaming occurs BEFORE TCO routing
- Streamed logs are still subject to TCO policies
- Streaming doesn't affect TCO costs
- Both can use same filters

**Example:**

```
# TCO Policy: Route errors to Frequent Search
Priority: High
Filter: severity >= ERROR

# Streaming Rule: Stream errors to SIEM
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'

# Result: Errors are both streamed AND stored in Frequent Search
```

### 3. Align with Data Access Rules

**Recommendation**: Ensure streaming rules respect data access policies.

**Considerations:**
- Streamed data bypasses data access rules
- Ensure destination has appropriate access controls
- Consider compliance requirements
- Document data flows

## Compliance Best Practices

### 1. Data Residency

**Recommendation**: Ensure streaming complies with data residency requirements.

**Compliance Checklist:**
- [ ] Cloud Logs and Event Streams in same region
- [ ] Destination in compliant region
- [ ] Data transfer documented
- [ ] Legal review completed

### 2. Data Retention

**Recommendation**: Configure appropriate retention in Event Streams.

**Retention Guidelines:**
- **Compliance Logs**: Match regulatory requirements (e.g., 7 years)
- **Security Logs**: 90-365 days typical
- **Operational Logs**: 7-30 days typical
- **Debug Logs**: 1-7 days typical

### 3. Audit Trail

**Recommendation**: Maintain audit trail of streaming configurations.

**Audit Requirements:**
- Who created/modified streaming rules
- When changes were made
- What was changed
- Why changes were made

**Use Activity Tracker for audit trail**

### 4. Regular Compliance Reviews

**Recommendation**: Review streaming configurations for compliance quarterly.

**Review Checklist:**
- [ ] All streaming rules documented
- [ ] Data flows mapped
- [ ] Retention policies correct
- [ ] Access controls appropriate
- [ ] Encryption verified
- [ ] Compliance requirements met

## Related Documentation

- [DPXL Syntax Guide](dpxl-syntax-guide.md)
- [Streaming Rules Reference](streaming-rules-reference.md)
- [Rule Validation Guide](rule-validation.md)
- [Troubleshooting Guide](troubleshooting.md)
- [IAM Roles and Permissions](iam-roles-permissions.md)
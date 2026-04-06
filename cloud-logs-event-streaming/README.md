# IBM Cloud Logs Event Streaming Skill

Expert guidance for configuring and managing IBM Cloud Logs Event Streaming to external destinations like SIEM tools, data lakes, and analysis platforms.

## Overview

This skill helps users successfully configure streaming of log data from IBM Cloud Logs to IBM Event Streams (Kafka) for integration with external systems. It covers the complete streaming workflow from prerequisites and IAM setup through DPXL rule configuration, validation, and optimization.

## Key Capabilities

- **Streaming Architecture**: Understanding the data flow from Cloud Logs → Event Streams → Kafka Connect → External Tools
- **DPXL Syntax**: DataPrime eXpression Language for filtering streamed logs
- **IAM & Prerequisites**: Required roles, permissions, and service-to-service authentication
- **Rule Validation**: Testing streaming rules before deployment using DataPrime query mode
- **Integration**: Kafka Connect configuration and integration with parsing rules
- **Compliance**: Data residency and regulatory compliance considerations
- **Optimization**: Performance tuning, cost optimization, and troubleshooting

## Common Use Cases

### 1. SIEM Tool Integration
Stream security-relevant logs to SIEM platforms (Splunk, QRadar, etc.) for real-time threat detection and compliance monitoring.

**Example Rule**:
```
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
```

### 2. Data Lake Integration
Stream logs to S3-compatible storage for long-term retention, historical analysis, and machine learning.

**Example Rule**:
```
<v1> $l.applicationname == 'api-gateway' && $d.environment == 'production'
```

### 3. Real-Time Analytics
Stream application performance metrics to external analytics platforms for real-time dashboards and anomaly detection.

**Example Rule**:
```
<v1> $l.applicationname == 'payment-service' && $d.transactionAmount > 10000
```

### 4. AI-Powered Threat Detection
Stream authentication and access logs to AI/ML platforms for vulnerability detection and automated threat response.

**Example Rule**:
```
<v1> ( $l.applicationname == 'auth-service' || $l.applicationname == 'user-service' ) && $d.eventType == 'login_failure'
```

## Quick Start

### Prerequisites

1. **IBM Cloud Logs instance** - Source of log data
2. **IBM Event Streams instance** - Kafka message broker (must be in same account)
3. **IAM Roles**:
   - `Manager` role on Cloud Logs instance
   - `Writer` and `Manager` roles on Event Streams instance
4. **Service Credentials** - Created in Event Streams with topic management permissions

### Basic Configuration Steps

1. **Navigate to Event Streaming Settings**
   - Cloud Logs UI → Settings → Event Streaming

2. **Create Streaming Configuration**
   - Select Event Streams instance
   - Enter topic name (auto-created if doesn't exist)
   - Enter DPXL streaming rule (or leave empty for all logs)

3. **Validate Rule** (before deployment)
   - Go to Explore Logs → DataPrime query mode
   - Test with: `filter YOUR_CONDITION`
   - Verify results match expectations

4. **Deploy Configuration**
   - Add `<v1>` prefix to validated rule
   - Create streaming configuration
   - Monitor Event Streams topic for data

## DPXL Syntax Quick Reference

### Field Types

- **Label Fields** (`$l.`): Metadata fields like `applicationname`, `subsystemname`, `namespace`
- **Data Fields** (`$d.`): Log content and custom fields like `severity`, `statusCode`, `msg`

### Operators

- **Equality**: `==` (exact match)
- **Logical OR**: `||` (match any condition)
- **Logical AND**: `&&` (match all conditions)
- **Contains**: `.contains()` (text matching in data fields)
- **Grouping**: `( )` (group complex conditions)

### Example Rules

```
# Stream specific application
<v1> $l.applicationname == 'api-gateway'

# Stream multiple applications
<v1> $l.applicationname == 'app1' || $l.applicationname == 'app2'

# Stream by severity
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'

# Complex multi-condition
<v1> ( $l.applicationname == 'api-gateway' && $d.statusCode == '500' ) || ( $l.applicationname == 'database' && $d.severity == 'CRITICAL' )
```

## Eight Streaming Rule Types

1. **Stream All Data** - No rule defined (empty)
2. **Stream with Free Text** - `$d.msg.contains('ERROR')`
3. **Stream by Application** - `<v1> $l.applicationname == 'app1'`
4. **Stream by Subsystem** - `<v1> $l.subsystemname == 'database'`
5. **Stream by Field Values** - `<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'`
6. **Stream by Multiple Fields** - `<v1> $d.severity == 'ERROR' && $d.environment == 'production'`
7. **Stream with Complex Logic** - `<v1> ( $d.field1 == 'value1' && $d.field2 == 'value2' ) || ( $d.field1 == 'value1' && $d.field2 == 'value3' )`
8. **Combine Application + Fields** - `<v1> $l.applicationname == 'api-gateway' && $d.statusCode == '500'`

## Integration with Other Features

### Parsing Rules
Custom fields used in streaming rules (e.g., `$d.statusCode`, `$d.severity`) must first be extracted by parsing rules.

**Workflow**:
1. Create parsing rule to extract custom fields
2. Validate field extraction in logs
3. Use extracted fields in streaming rule
4. Validate streaming rule with `filter` command

### TCO Policies
- Event Streaming occurs **before** TCO policy routing
- All logs matching the streaming rule are streamed, regardless of TCO priority
- TCO policies affect storage and query performance, not streaming

### Data Access Rules
- Data Access Rules do **not** affect streaming
- Streaming occurs before access control is applied
- All matching logs are streamed regardless of user access permissions

## Kafka Connect Integration

After logs are streamed to Event Streams, use Kafka Connect to forward them to destination systems:

### Common Connectors

- **S3 Sink Connector** - Stream to AWS S3 or S3-compatible storage
- **JDBC Sink Connector** - Stream to relational databases
- **HTTP Sink Connector** - Stream to REST APIs
- **Elasticsearch Sink Connector** - Stream to Elasticsearch clusters
- **Splunk Sink Connector** - Stream to Splunk SIEM

### Basic Kafka Connect Setup

1. Deploy Kafka Connect cluster with network access to Event Streams
2. Install required connectors
3. Configure connector with Event Streams credentials and destination details
4. Deploy connector and monitor status

## Compliance and Data Residency

### Regulatory Considerations

- **GDPR**: Ensure all components (Cloud Logs, Event Streams, Kafka Connect, destination) are in EU regions
- **HIPAA**: Enable encryption in-transit and at-rest, implement access controls
- **SOC 2**: Enable audit logging, implement security controls

### Data Residency Control

All components must be deployed in compliant regions:
- Cloud Logs instance
- Event Streams instance (must be in same region as Cloud Logs)
- Kafka Connect cluster
- Destination system

## Monitoring and Troubleshooting

### Key Metrics

- **Event Streams**: Message rate, byte rate, topic lag
- **Kafka Connect**: Connector status, records processed, error rate
- **Destination**: Data ingestion rate, storage usage
- **Activity Tracker**: Configuration changes, access patterns

### Common Issues

1. **No data streaming**: Verify IAM roles, service credentials, and streaming rule
2. **Wrong logs streaming**: Validate rule syntax and field names
3. **High data volume**: Add more specific filters to reduce volume
4. **Connector failures**: Check credentials, network connectivity, and configuration

## Reference Documentation

- [`references/dpxl-syntax-guide.md`](references/dpxl-syntax-guide.md) - Complete DPXL syntax reference
- [`references/streaming-rules-reference.md`](references/streaming-rules-reference.md) - All 8 rule types with examples
- [`references/iam-roles-permissions.md`](references/iam-roles-permissions.md) - IAM role requirements
- [`references/rule-validation.md`](references/rule-validation.md) - Validation procedures
- [`references/troubleshooting.md`](references/troubleshooting.md) - Common issues and solutions
- [`references/best-practices.md`](references/best-practices.md) - Configuration best practices

## Activity Tracking

Event Streaming operations generate Activity Tracker events:

- `logs.logs-stream-setup.get` - Retrieve streaming configuration
- `logs.logs-stream-setup.create` - Create streaming configuration
- `logs.logs-stream-setup.update` - Update streaming configuration
- `logs.logs-stream-setup.delete` - Delete streaming configuration

Use these events for audit logging, compliance reporting, and troubleshooting.

## Best Practices

1. **Always validate rules** using DataPrime query mode before deployment
2. **Start with simple rules** and add complexity gradually
3. **Monitor data volume** to control costs
4. **Use specific filters** to stream only valuable data
5. **Document configurations** for team knowledge sharing
6. **Test end-to-end** from Cloud Logs to destination system
7. **Implement monitoring** and alerting for streaming health
8. **Review and optimize** streaming rules regularly
9. **Consider compliance** and data residency requirements
10. **Leverage parsing rules** for custom field extraction

## Support

For additional help:
- Review the [SKILL.md](SKILL.md) file for detailed guidance
- Check reference documentation in the `references/` directory
- Consult [IBM Cloud Logs documentation](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-streaming)
- Review [streaming rules documentation](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-streaming_rules)

## Related Skills

- **cloud-logs-parsing-rules** - Extract custom fields for streaming rule filtering
- **tco-policy-optimizer** - Optimize costs while maintaining streaming
- **dataprime-query-builder** - Build DataPrime queries for rule validation
- **cloud-logs-alerts** - Set up alerts for streaming health monitoring
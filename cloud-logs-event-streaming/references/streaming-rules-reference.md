# Streaming Rules Reference

Complete reference for all 8 IBM Cloud Logs Event Streaming rule types with examples and use cases.

## Overview

IBM Cloud Logs Event Streaming supports 8 distinct rule types, from simple (stream all data) to complex (multi-condition filtering). This reference provides detailed examples and use cases for each type.

## Rule Type 1: Stream All Data

### Description
Stream all logs without any filtering.

### DPXL Rule
No DataPrime rule defined (leave empty)

### Use Cases
- Initial setup and testing
- Complete log replication to external system
- Data lake integration requiring all logs
- Backup and disaster recovery

### Configuration
- **Topic Name**: `all-logs`
- **Streaming Rule**: (empty - no rule)

### Considerations
- **High data volume**: All logs will be streamed
- **High costs**: Event Streams and destination system costs
- **Use sparingly**: Only when all logs are truly needed

### Example Scenario
Stream all logs to S3 data lake for long-term retention and compliance.

---

## Rule Type 2: Stream Data with Free Text

### Description
Stream logs containing specific text in the message field.

### DPXL Rule
```
$d.msg.contains('ENTER_FREE_TEXT')
```

### Use Cases
- Stream logs containing specific error messages
- Stream logs with specific keywords
- Stream logs mentioning specific features or components

### Examples

**Stream logs containing "ERROR"**:
```
$d.msg.contains('ERROR')
```

**Stream logs containing "timeout"**:
```
$d.msg.contains('timeout')
```

**Stream logs containing "authentication failed"**:
```
$d.msg.contains('authentication failed')
```

**Stream logs containing "connection refused"**:
```
$d.msg.contains('connection refused')
```

**Stream logs containing "out of memory"**:
```
$d.msg.contains('out of memory')
```

### Prerequisites
- The `msg` or `message` field must exist in log data
- May require parsing rule to extract message field

### Validation
```
# Test in DataPrime query mode
filter $d.msg.contains('ERROR')
```

### Example Scenario
Stream all logs containing "payment failed" to fraud detection system.

---

## Rule Type 3: Stream Data for One or More Applications

### Description
Stream logs from specific applications by application name.

### DPXL Rule (Single Application)
```
<v1> $l.applicationname == 'app1'
```

### DPXL Rule (Multiple Applications)
```
<v1> $l.applicationname == 'app1' || $l.applicationname == 'app2' || $l.applicationname == 'app3'
```

### Use Cases
- Stream logs from production applications only
- Stream logs from specific microservices
- Stream logs from critical applications to SIEM

### Examples

**Stream single application**:
```
<v1> $l.applicationname == 'api-gateway'
```

**Stream two applications**:
```
<v1> $l.applicationname == 'auth-service' || $l.applicationname == 'payment-service'
```

**Stream three applications**:
```
<v1> $l.applicationname == 'api-gateway' || $l.applicationname == 'auth-service' || $l.applicationname == 'user-service'
```

**Stream all production applications** (using naming convention):
```
<v1> $l.applicationname == 'prod-api-gateway' || $l.applicationname == 'prod-auth-service' || $l.applicationname == 'prod-payment-service'
```

### Validation
```
# Test in DataPrime query mode
filter $l.applicationname == 'api-gateway'
filter $l.applicationname == 'app1' || $l.applicationname == 'app2'
```

### Example Scenario
Stream logs from api-gateway, auth-service, and payment-service to SIEM for security monitoring.

---

## Rule Type 4: Stream Data for One or More Subsystems

### Description
Stream logs from specific subsystems or components.

### DPXL Rule (Single Subsystem)
```
<v1> $l.subsystemname == 'subsystem1'
```

### DPXL Rule (Multiple Subsystems)
```
<v1> $l.subsystemname == 'subsystem1' || $l.subsystemname == 'subsystem2' || $l.subsystemname == 'subsystem3'
```

### Use Cases
- Stream logs from specific components (database, cache, queue)
- Stream logs from specific layers (frontend, backend, data)
- Stream logs from specific modules

### Examples

**Stream database subsystem**:
```
<v1> $l.subsystemname == 'database'
```

**Stream API and worker subsystems**:
```
<v1> $l.subsystemname == 'api' || $l.subsystemname == 'worker'
```

**Stream multiple subsystems**:
```
<v1> $l.subsystemname == 'database' || $l.subsystemname == 'cache' || $l.subsystemname == 'queue'
```

**Stream frontend components**:
```
<v1> $l.subsystemname == 'web-ui' || $l.subsystemname == 'mobile-app' || $l.subsystemname == 'admin-portal'
```

### Validation
```
# Test in DataPrime query mode
filter $l.subsystemname == 'database'
filter $l.subsystemname == 'api' || $l.subsystemname == 'worker'
```

### Example Scenario
Stream logs from database, cache, and queue subsystems to performance monitoring platform.

---

## Rule Type 5: Stream Data Based on Multiple Values for a Single Field

### Description
Stream logs where a custom field matches any of several values.

### DPXL Rule
```
<v1> $d.<FIELD_NAME> == 'value1' || $d.<FIELD_NAME> == 'value2' || $d.<FIELD_NAME> == 'value3'
```

### Use Cases
- Stream logs with specific severity levels
- Stream logs with specific status codes
- Stream logs from specific environments
- Stream logs with specific event types

### Examples

**Stream ERROR and CRITICAL logs**:
```
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
```

**Stream server error status codes**:
```
<v1> $d.statusCode == '500' || $d.statusCode == '502' || $d.statusCode == '503'
```

**Stream production and staging logs**:
```
<v1> $d.environment == 'production' || $d.environment == 'staging'
```

**Stream security event types**:
```
<v1> $d.eventType == 'login_failure' || $d.eventType == 'access_denied' || $d.eventType == 'privilege_escalation'
```

**Stream client and server errors**:
```
<v1> $d.statusCode == '400' || $d.statusCode == '401' || $d.statusCode == '403' || $d.statusCode == '404' || $d.statusCode == '500' || $d.statusCode == '502' || $d.statusCode == '503'
```

### Prerequisites
- Custom field must be extracted by parsing rule
- Field must exist in log data

### Validation
```
# Test in DataPrime query mode
filter $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
filter $d.statusCode == '500' || $d.statusCode == '502'
```

### Example Scenario
Stream all ERROR and CRITICAL severity logs to SIEM for immediate investigation.

---

## Rule Type 6: Stream Data Based on Values of Multiple Fields

### Description
Stream logs matching conditions on multiple fields using AND logic.

### DPXL Rule
```
<v1> $d.<FIELD_NAME_1> == 'value1' && $d.<FIELD_NAME_2> == 'value2'
```

### Use Cases
- Stream production errors only
- Stream specific events from specific services
- Stream high-severity logs from critical applications
- Combine environment, severity, and application filters

### Examples

**Stream production ERROR logs**:
```
<v1> $d.severity == 'ERROR' && $d.environment == 'production'
```

**Stream API gateway 500 errors**:
```
<v1> $l.applicationname == 'api-gateway' && $d.statusCode == '500'
```

**Stream auth service login failures**:
```
<v1> $d.serviceName == 'auth' && $d.eventType == 'login_failure'
```

**Stream production payment service errors**:
```
<v1> $l.applicationname == 'payment-service' && $d.severity == 'ERROR' && $d.environment == 'production'
```

**Stream database slow queries in production**:
```
<v1> $l.subsystemname == 'database' && $d.queryTime > 1000 && $d.environment == 'production'
```

### Validation
```
# Test in DataPrime query mode
filter $d.severity == 'ERROR' && $d.environment == 'production'
filter $l.applicationname == 'api-gateway' && $d.statusCode == '500'
```

### Example Scenario
Stream only production ERROR logs from payment-service to financial monitoring system.

---

## Rule Type 7: Stream Data Based on Complex Conditions

### Description
Stream logs with complex multi-condition logic using parentheses grouping.

### DPXL Rule
```
<v1> ( $d.<FIELD_NAME_1> == 'value1' && $d.<FIELD_NAME_2> == 'value2' ) || ( $d.<FIELD_NAME_1> == 'value1' && $d.<FIELD_NAME_2> == 'value3' )
```

### Use Cases
- Stream different severity levels from different applications
- Stream multiple error conditions
- Complex security event filtering
- Multi-application, multi-condition scenarios

### Examples

**Stream ERROR from api-gateway OR CRITICAL from database**:
```
<v1> ( $d.severity == 'ERROR' && $l.applicationname == 'api-gateway' ) || ( $d.severity == 'CRITICAL' && $l.applicationname == 'database' )
```

**Stream production 500 or 502 errors**:
```
<v1> ( $d.statusCode == '500' && $d.environment == 'production' ) || ( $d.statusCode == '502' && $d.environment == 'production' )
```

**Stream authentication failures from multiple services**:
```
<v1> ( $l.applicationname == 'auth-service' && $d.eventType == 'login_failure' ) || ( $l.applicationname == 'api-gateway' && $d.statusCode == '401' )
```

**Stream high-value transactions or fraud alerts**:
```
<v1> ( $l.applicationname == 'payment-service' && $d.transactionAmount > 10000 ) || ( $l.applicationname == 'fraud-detection' && $d.alertLevel == 'HIGH' )
```

**Stream multiple security events**:
```
<v1> ( $l.applicationname == 'auth-service' && $d.eventType == 'login_failure' ) || ( $l.applicationname == 'user-service' && $d.eventType == 'access_denied' ) || ( $l.applicationname == 'admin-portal' && $d.eventType == 'privilege_escalation' )
```

### Validation
```
# Test in DataPrime query mode
filter ( $d.severity == 'ERROR' && $l.applicationname == 'api-gateway' ) || ( $d.severity == 'CRITICAL' && $l.applicationname == 'database' )
```

### Example Scenario
Stream ERROR logs from api-gateway OR CRITICAL logs from database OR authentication failures from auth-service to unified SIEM platform.

---

## Rule Type 8: Combine Application/Subsystem with Custom Fields

### Description
Stream logs from specific applications or subsystems with additional custom field filtering.

### DPXL Rule
```
<v1> ( $l.applicationname == 'app1' || $l.applicationname == 'app2' ) && $d.severity == 'ERROR'
```

### Use Cases
- Stream errors from multiple related applications
- Stream specific events from application groups
- Combine application filtering with severity/status filtering
- Filter by application family and custom conditions

### Examples

**Stream ERROR logs from auth and user services**:
```
<v1> ( $l.applicationname == 'auth-service' || $l.applicationname == 'user-service' ) && $d.severity == 'ERROR'
```

**Stream 500 errors from API gateway**:
```
<v1> $l.applicationname == 'api-gateway' && $d.statusCode == '500'
```

**Stream security events from multiple services**:
```
<v1> ( $l.applicationname == 'auth-service' || $l.applicationname == 'user-service' ) && $d.eventType == 'security_event'
```

**Stream slow queries from database subsystem**:
```
<v1> $l.subsystemname == 'database' && ( $d.queryTime > 1000 || $d.errorType == 'connection_timeout' )
```

**Stream production errors from payment services**:
```
<v1> ( $l.applicationname == 'payment-service' || $l.applicationname == 'billing-service' ) && $d.severity == 'ERROR' && $d.environment == 'production'
```

**Stream high-priority logs from critical applications**:
```
<v1> ( $l.applicationname == 'payment-service' || $l.applicationname == 'auth-service' || $l.applicationname == 'api-gateway' ) && ( $d.severity == 'ERROR' || $d.severity == 'CRITICAL' )
```

### Validation
```
# Test in DataPrime query mode
filter ( $l.applicationname == 'auth-service' || $l.applicationname == 'user-service' ) && $d.severity == 'ERROR'
filter $l.applicationname == 'api-gateway' && $d.statusCode == '500'
```

### Example Scenario
Stream ERROR and CRITICAL logs from auth-service, user-service, and api-gateway to security monitoring platform.

---

## Rule Selection Guide

### Choose Rule Type Based on Requirements

| Requirement | Recommended Rule Type |
|-------------|----------------------|
| Stream everything | Type 1: Stream All Data |
| Stream logs with specific text | Type 2: Free Text |
| Stream from specific apps | Type 3: Applications |
| Stream from specific components | Type 4: Subsystems |
| Stream by severity/status | Type 5: Multiple Values |
| Stream production errors only | Type 6: Multiple Fields |
| Stream different conditions from different apps | Type 7: Complex Conditions |
| Stream errors from app group | Type 8: Application + Fields |

### Complexity vs. Specificity

- **Simple rules** (Types 1-4): Easy to configure, may stream more data
- **Intermediate rules** (Types 5-6): Balanced complexity and specificity
- **Advanced rules** (Types 7-8): Most specific, lowest data volume

### Cost Optimization

More specific rules = Less data = Lower costs

**Example progression**:
```
# Least specific (highest cost)
<v1> $l.applicationname == 'api-gateway'

# More specific (medium cost)
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Most specific (lowest cost)
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR' && $d.environment == 'production'
```

## Best Practices

1. **Start simple**: Begin with Type 3 or 4, then add filters
2. **Validate first**: Always test in DataPrime query mode
3. **Be specific**: Use multiple conditions to reduce volume
4. **Monitor volume**: Track data volume and adjust rules
5. **Document rules**: Explain the purpose and logic
6. **Use parentheses**: Make complex conditions clear
7. **Consider costs**: More specific = lower costs
8. **Test thoroughly**: Verify results match expectations
9. **Iterate**: Refine rules based on monitoring
10. **Combine wisely**: Use AND/OR operators effectively

## Common Patterns

### Security Monitoring
```
<v1> ( $l.applicationname == 'auth-service' && $d.eventType == 'login_failure' ) || ( $l.applicationname == 'api-gateway' && $d.statusCode == '401' ) || ( $d.severity == 'CRITICAL' )
```

### Error Tracking
```
<v1> ( $d.severity == 'ERROR' || $d.severity == 'CRITICAL' ) && $d.environment == 'production'
```

### Performance Monitoring
```
<v1> $d.responseTime > 5000 || $d.queryTime > 1000 || $d.statusCode == '503'
```

### Compliance Logging
```
<v1> $d.eventType == 'data_access' || $d.eventType == 'data_modification' || $d.eventType == 'user_action'
```

### Financial Transactions
```
<v1> $l.applicationname == 'payment-service' && ( $d.transactionAmount > 10000 || $d.eventType == 'fraud_alert' )
```

## Related Documentation

- [DPXL Syntax Guide](dpxl-syntax-guide.md) - Complete syntax reference
- [Rule Validation](rule-validation.md) - Testing procedures
- [Troubleshooting](troubleshooting.md) - Common issues
- [Best Practices](best-practices.md) - Configuration guidelines
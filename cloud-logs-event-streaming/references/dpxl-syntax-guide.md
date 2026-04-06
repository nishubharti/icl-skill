# DataPrime eXpression Language (DPXL) Syntax Guide

Complete reference for DPXL syntax used in IBM Cloud Logs Event Streaming rules.

## Overview

DPXL (DataPrime eXpression Language) is used to define filtering rules for Event Streaming. It allows you to specify which logs should be streamed from IBM Cloud Logs to IBM Event Streams based on field values and conditions.

## Field Type Prefixes

### Label Fields (`$l.`)

Label fields are metadata fields automatically extracted by IBM Cloud Logs from log sources.

**Common Label Fields**:
- `$l.applicationname` - Application or service name
- `$l.subsystemname` - Subsystem or component name
- `$l.namespace` - Kubernetes namespace
- `$l.pod` - Kubernetes pod name
- `$l.container` - Container name
- `$l.hostname` - Host or node name
- `$l.computername` - Computer name
- `$l.ipaddress` - IP address
- `$l.category` - Log category

**Usage Examples**:
```
$l.applicationname == 'api-gateway'
$l.subsystemname == 'database'
$l.namespace == 'production'
$l.pod == 'api-gateway-7d8f9c-xyz'
```

### Data Fields (`$d.`)

Data fields are log content and custom fields extracted by parsing rules.

**Common Data Fields**:
- `$d.msg` or `$d.message` - Log message text
- `$d.severity` - Log severity level
- `$d.statusCode` - HTTP status code
- `$d.userId` - User identifier
- `$d.serviceName` - Service name
- `$d.eventType` - Event type
- `$d.environment` - Environment (production, staging, dev)
- `$d.transactionAmount` - Transaction amount
- `$d.queryTime` - Query execution time
- `$d.errorType` - Error type

**Usage Examples**:
```
$d.severity == 'ERROR'
$d.statusCode == '500'
$d.msg.contains('timeout')
$d.environment == 'production'
```

**Note**: Custom data fields must be extracted by parsing rules before they can be used in streaming rules.

## Operators

### Equality Operator (`==`)

Exact match comparison for field values.

**Syntax**: `field == 'value'`

**Examples**:
```
$l.applicationname == 'api-gateway'
$d.severity == 'ERROR'
$d.statusCode == '500'
$d.environment == 'production'
```

**Important**:
- Use `==` (double equals) for equality, not `=` (single equals)
- Always use single quotes for string values
- Field names and values are case-sensitive

### Logical OR (`||` or `OR`)

Match any of multiple conditions.

**Syntax**: `condition1 || condition2 || condition3`

**Examples**:
```
# Match multiple applications
$l.applicationname == 'app1' || $l.applicationname == 'app2'

# Match multiple severity levels
$d.severity == 'ERROR' || $d.severity == 'CRITICAL'

# Match multiple status codes
$d.statusCode == '500' || $d.statusCode == '502' || $d.statusCode == '503'

# Match multiple environments
$d.environment == 'production' || $d.environment == 'staging'
```

**Alternative Syntax**:
```
$l.applicationname == 'app1' OR $l.applicationname == 'app2'
```

### Logical AND (`&&`)

Match all conditions (all must be true).

**Syntax**: `condition1 && condition2 && condition3`

**Examples**:
```
# Application AND severity
$l.applicationname == 'api-gateway' && $d.severity == 'ERROR'

# Application AND status code
$l.applicationname == 'api-gateway' && $d.statusCode == '500'

# Multiple field conditions
$d.severity == 'ERROR' && $d.environment == 'production' && $l.applicationname == 'api-gateway'

# Service AND event type
$d.serviceName == 'auth' && $d.eventType == 'login_failure'
```

### Comparison Operators

**Greater Than (`>`)**: Numeric comparison
```
$d.transactionAmount > 10000
$d.queryTime > 1000
$d.responseTime > 5000
```

**Less Than (`<`)**: Numeric comparison
```
$d.transactionAmount < 100
$d.queryTime < 50
```

**Greater Than or Equal (`>=`)**: Numeric comparison
```
$d.statusCode >= 500
$d.severity >= 4
```

**Less Than or Equal (`<=`)**: Numeric comparison
```
$d.statusCode <= 299
$d.responseTime <= 1000
```

## String Methods

### Contains Method (`.contains()`)

Check if a data field contains specific text.

**Syntax**: `$d.fieldname.contains('text')`

**Examples**:
```
# Check if message contains text
$d.msg.contains('ERROR')
$d.msg.contains('timeout')
$d.msg.contains('authentication failed')

# Check if message contains error codes
$d.message.contains('ERR-500')
$d.message.contains('connection refused')
```

**Important**:
- Only works with data fields (`$d.`), not label fields (`$l.`)
- Text matching is case-sensitive
- Use single quotes for the search text

### Starts With (`.startsWith()`)

Check if a field starts with specific text.

**Syntax**: `$d.fieldname.startsWith('text')`

**Examples**:
```
$d.msg.startsWith('ERROR:')
$d.serviceName.startsWith('api-')
$l.applicationname.startsWith('prod-')
```

### Ends With (`.endsWith()`)

Check if a field ends with specific text.

**Syntax**: `$d.fieldname.endsWith('text')`

**Examples**:
```
$d.msg.endsWith('failed')
$l.applicationname.endsWith('-service')
$d.hostname.endsWith('.example.com')
```

## Grouping with Parentheses

Use parentheses to group conditions and control evaluation order.

**Syntax**: `( condition1 && condition2 ) || ( condition3 && condition4 )`

**Examples**:

**Example 1: Group OR conditions**
```
( $l.applicationname == 'app1' || $l.applicationname == 'app2' ) && $d.severity == 'ERROR'
```
This matches ERROR logs from either app1 OR app2.

**Example 2: Complex multi-condition**
```
( $d.severity == 'ERROR' && $l.applicationname == 'api-gateway' ) || ( $d.severity == 'CRITICAL' && $l.applicationname == 'database' )
```
This matches:
- ERROR logs from api-gateway, OR
- CRITICAL logs from database

**Example 3: Multiple field combinations**
```
( $d.statusCode == '500' && $d.environment == 'production' ) || ( $d.statusCode == '502' && $d.environment == 'production' )
```
This matches production logs with status code 500 OR 502.

**Example 4: Nested grouping**
```
( $l.applicationname == 'auth-service' && ( $d.eventType == 'login_failure' || $d.eventType == 'access_denied' ) ) || ( $l.applicationname == 'api-gateway' && $d.statusCode == '401' )
```

## Version Prefix

All DPXL streaming rules must start with the `<v1>` version prefix.

**Syntax**: `<v1> YOUR_CONDITION`

**Examples**:
```
<v1> $l.applicationname == 'api-gateway'
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
<v1> ( $l.applicationname == 'app1' || $l.applicationname == 'app2' ) && $d.severity == 'ERROR'
```

**Important**:
- The `<v1>` prefix is required for streaming rules
- When testing in DataPrime query mode, use `filter` command WITHOUT the `<v1>` prefix
- Example: `filter $l.applicationname == 'api-gateway'`

## String Literals

Always use single quotes for string values in DPXL.

**Correct**:
```
$l.applicationname == 'api-gateway'
$d.severity == 'ERROR'
$d.msg.contains('timeout')
```

**Incorrect**:
```
$l.applicationname == "api-gateway"  // Wrong: double quotes
$d.severity == ERROR  // Wrong: missing quotes
$d.msg.contains("timeout")  // Wrong: double quotes
```

## Complete Syntax Examples

### Simple Rules

**Stream specific application**:
```
<v1> $l.applicationname == 'api-gateway'
```

**Stream by severity**:
```
<v1> $d.severity == 'ERROR'
```

**Stream by subsystem**:
```
<v1> $l.subsystemname == 'database'
```

### Intermediate Rules

**Stream multiple applications**:
```
<v1> $l.applicationname == 'app1' || $l.applicationname == 'app2' || $l.applicationname == 'app3'
```

**Stream multiple severity levels**:
```
<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
```

**Stream application with severity filter**:
```
<v1> $l.applicationname == 'api-gateway' && $d.severity == 'ERROR'
```

**Stream by status codes**:
```
<v1> $d.statusCode == '500' || $d.statusCode == '502' || $d.statusCode == '503'
```

### Advanced Rules

**Stream production errors from specific applications**:
```
<v1> ( $l.applicationname == 'api-gateway' || $l.applicationname == 'payment-service' ) && $d.severity == 'ERROR' && $d.environment == 'production'
```

**Stream authentication failures**:
```
<v1> ( $l.applicationname == 'auth-service' || $l.applicationname == 'user-service' ) && $d.eventType == 'login_failure'
```

**Stream high-value transactions**:
```
<v1> $l.applicationname == 'payment-service' && $d.transactionAmount > 10000 && $d.environment == 'production'
```

**Stream slow database queries**:
```
<v1> $l.subsystemname == 'database' && ( $d.queryTime > 1000 || $d.errorType == 'connection_timeout' )
```

**Stream complex security events**:
```
<v1> ( $l.applicationname == 'auth-service' && $d.eventType == 'login_failure' ) || ( $l.applicationname == 'api-gateway' && $d.statusCode == '401' ) || ( $l.applicationname == 'user-service' && $d.eventType == 'access_denied' )
```

## Common Mistakes and Corrections

### Mistake 1: Using single equals
**Wrong**: `$l.applicationname = 'api-gateway'`  
**Correct**: `$l.applicationname == 'api-gateway'`

### Mistake 2: Using double quotes
**Wrong**: `$l.applicationname == "api-gateway"`  
**Correct**: `$l.applicationname == 'api-gateway'`

### Mistake 3: Missing quotes
**Wrong**: `$d.severity == ERROR`  
**Correct**: `$d.severity == 'ERROR'`

### Mistake 4: Wrong OR operator
**Wrong**: `$l.applicationname == 'app1' | $l.applicationname == 'app2'`  
**Correct**: `$l.applicationname == 'app1' || $l.applicationname == 'app2'`

### Mistake 5: Wrong AND operator
**Wrong**: `$l.applicationname == 'app1' & $d.severity == 'ERROR'`  
**Correct**: `$l.applicationname == 'app1' && $d.severity == 'ERROR'`

### Mistake 6: Using contains on label fields
**Wrong**: `$l.applicationname.contains('api')`  
**Correct**: Use equality or startsWith/endsWith for label fields

### Mistake 7: Forgetting version prefix in streaming rule
**Wrong**: `$l.applicationname == 'api-gateway'`  
**Correct**: `<v1> $l.applicationname == 'api-gateway'`

### Mistake 8: Case sensitivity
**Wrong**: `$l.ApplicationName == 'api-gateway'` (wrong field name case)  
**Correct**: `$l.applicationname == 'api-gateway'`

## Testing DPXL Rules

Before deploying a streaming rule, test it in DataPrime query mode:

1. Navigate to **Explore Logs** > **Logs**
2. Switch to **DataPrime** query mode
3. Use `filter` command WITHOUT `<v1>` prefix:
   ```
   filter $l.applicationname == 'api-gateway'
   filter $d.severity == 'ERROR' || $d.severity == 'CRITICAL'
   filter ( $l.applicationname == 'app1' || $l.applicationname == 'app2' ) && $d.severity == 'ERROR'
   ```
4. Verify results match expectations
5. Add `<v1>` prefix when creating streaming rule

## Field Discovery

To discover available fields in your logs:

1. Navigate to **Explore Logs** > **Logs**
2. View sample logs to identify field names
3. Check parsing rules to see which custom fields are extracted
4. Use DataPrime query mode to test field availability:
   ```
   filter $d.yourFieldName == 'value'
   ```

## Best Practices

1. **Always use single quotes** for string values
2. **Use `==` for equality**, not `=`
3. **Test rules in DataPrime query mode** before deployment
4. **Start with simple rules** and add complexity gradually
5. **Use parentheses** to make complex conditions clear
6. **Verify custom fields exist** (check parsing rules)
7. **Be specific** to reduce data volume and costs
8. **Use label fields** when possible (faster than data fields)
9. **Document your rules** for team knowledge sharing
10. **Monitor data volume** after deploying rules

## Related Documentation

- [Streaming Rules Reference](streaming-rules-reference.md) - All 8 rule types with examples
- [Rule Validation](rule-validation.md) - Testing and validation procedures
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
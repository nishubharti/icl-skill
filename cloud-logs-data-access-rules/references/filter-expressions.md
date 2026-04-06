# Data Access Rule Filter Expressions Reference

This document provides comprehensive guidance on writing filter expressions for IBM Cloud Logs data access rules.

## Filter Expression Basics

Data access rules use DataPrime expression syntax to filter logs based on their attributes.

### Field Prefixes

All field references must use the appropriate prefix:

| Prefix | Description | Examples |
|--------|-------------|----------|
| `$l.` | Labels (log metadata) | `$l.applicationname`, `$l.subsystemname`, `$l.hostname` |
| `$m.` | Metadata (system fields) | `$m.severity`, `$m.timestamp`, `$m.priority` |
| `$d.` | Data (custom JSON fields) | `$d.customer_id`, `$d.environment`, `$d.region` |

### Common Label Fields

```
$l.applicationname    - Application/service name
$l.subsystemname      - Subsystem/component name
$l.hostname           - Host/server name
$l.computername       - Computer name
$l.ipaddress          - IP address
$l.category           - Log category
```

### Common Metadata Fields

```
$m.severity           - Log severity (DEBUG, INFO, WARNING, ERROR, CRITICAL)
$m.timestamp          - Log timestamp
$m.priority           - Log priority level
```

## Operators

### Comparison Operators

```
==    Equal to
!=    Not equal to
>     Greater than
<     Less than
>=    Greater than or equal to
<=    Less than or equal to
```

### Logical Operators

```
&&    Logical AND
||    Logical OR
!     Logical NOT
```

### String Operators

```
~     Regex match
```

### String Functions

```
.startsWith('prefix')    - Check if string starts with prefix
.endsWith('suffix')      - Check if string ends with suffix
.contains('substring')   - Check if string contains substring
```

## Filter Expression Patterns

### Pattern 1: Simple Application Filter

**Use Case**: Restrict to specific application

```
$l.applicationname == 'payment-service'
```

**Use Case**: Multiple applications (OR logic)

```
$l.applicationname == 'payment-service' || $l.applicationname == 'billing-service'
```

### Pattern 2: Application Prefix Filter

**Use Case**: All production applications

```
$l.applicationname.startsWith('prod-')
```

**Use Case**: Multiple prefixes

```
$l.applicationname.startsWith('prod-') || $l.applicationname.startsWith('staging-')
```

### Pattern 3: Subsystem Filter

**Use Case**: Specific subsystem

```
$l.subsystemname == 'authentication'
```

**Use Case**: Multiple subsystems

```
$l.subsystemname == 'authentication' || $l.subsystemname == 'authorization'
```

### Pattern 4: Severity Filter

**Use Case**: Errors and above

```
$m.severity >= ERROR
```

**Use Case**: Critical only

```
$m.severity == CRITICAL
```

**Use Case**: Warnings, errors, and critical

```
$m.severity >= WARNING
```

### Pattern 5: Combined Application and Severity

**Use Case**: Production errors only

```
$l.applicationname.startsWith('prod-') && $m.severity >= ERROR
```

**Use Case**: Specific app with warnings and above

```
$l.applicationname == 'payment-service' && $m.severity >= WARNING
```

### Pattern 6: Regex Matching

**Use Case**: Pattern matching application names

```
$l.applicationname ~ '^prod-.*-api$'
```

**Use Case**: Multiple patterns

```
$l.subsystemname ~ 'payment|billing|invoice'
```

### Pattern 7: Exclusion Filters (NOT)

**Use Case**: Exclude PII logs

```
NOT ($l.subsystemname == 'pii-service')
```

**Use Case**: Exclude multiple subsystems

```
NOT ($l.subsystemname == 'pii-service' || $l.subsystemname == 'sensitive-data')
```

### Pattern 8: Custom Field Filters

**Use Case**: Filter by customer ID

```
$d.customer_id == 'customer-123'
```

**Use Case**: Filter by environment

```
$d.environment == 'production'
```

**Use Case**: Filter by region

```
$d.region == 'us-east-1' || $d.region == 'us-west-2'
```

### Pattern 9: Complex Combined Filters

**Use Case**: Team-specific production errors

```
($l.applicationname.startsWith('payment-') || $l.applicationname.startsWith('billing-')) && 
$m.severity >= ERROR && 
$d.environment == 'production'
```

**Use Case**: Multi-tenant with severity

```
$d.tenant_id == 'tenant-a' && 
($m.severity >= WARNING || $l.subsystemname == 'audit')
```

### Pattern 10: Null/Existence Checks

**Use Case**: Logs with customer ID present

```
$d.customer_id != null
```

**Use Case**: Logs without PII flag

```
$d.contains_pii != true
```

## Common Use Case Examples

### Team-Based Access

**Frontend Team**:
```
$l.applicationname.startsWith('web-') || $l.applicationname.startsWith('mobile-')
```

**Backend Team**:
```
$l.applicationname.startsWith('api-') || $l.applicationname.startsWith('service-')
```

**DevOps Team**:
```
$l.subsystemname.contains('infrastructure') || $l.subsystemname.contains('deployment')
```

### Environment-Based Access

**Production Only**:
```
$l.applicationname ~ 'prod-.*' || $d.environment == 'production'
```

**Non-Production**:
```
$l.applicationname ~ 'dev-.*' || $l.applicationname ~ 'test-.*' || $l.applicationname ~ 'staging-.*'
```

### Compliance and Security

**No PII Access**:
```
NOT ($l.subsystemname == 'pii-service' || $d.contains_pii == true || $d.data_classification == 'sensitive')
```

**Security Team (Critical Events)**:
```
$m.severity == CRITICAL || $l.subsystemname.contains('security') || $d.event_type == 'security_incident'
```

**Audit Logs Only**:
```
$l.subsystemname == 'audit' || $d.log_type == 'audit'
```

### Multi-Tenant SaaS

**Customer A**:
```
$d.customer_id == 'customer-a' || $d.tenant_id == 'tenant-a'
```

**Customer B**:
```
$d.customer_id == 'customer-b' || $d.tenant_id == 'tenant-b'
```

**Platform Admins (All Customers)**:
```
(No filter - see all logs)
```

### Regional Access

**US Region**:
```
$d.region.startsWith('us-') || $l.hostname.contains('us-east') || $l.hostname.contains('us-west')
```

**EU Region**:
```
$d.region.startsWith('eu-') || $l.hostname.contains('eu-west') || $l.hostname.contains('eu-central')
```

## Testing Filter Expressions

### Method 1: Test in Explore Logs

1. Navigate to Explore Logs
2. Run query with your filter:
   ```
   source logs | filter <your_expression>
   ```
3. Verify results match expectations
4. Copy working expression to data access rule

### Method 2: Use Test Expression Feature

1. In data access rule creation
2. Enter filter expression
3. Click "Test expression"
4. Review matched logs
5. Adjust as needed

## Common Mistakes and Fixes

### Mistake 1: Missing Field Prefix

❌ **Wrong**:
```
applicationname == 'web-app'
```

✅ **Correct**:
```
$l.applicationname == 'web-app'
```

### Mistake 2: Wrong Operator for Equality

❌ **Wrong**:
```
$m.severity = ERROR
```

✅ **Correct**:
```
$m.severity == ERROR
```

### Mistake 3: Double Quotes Instead of Single

❌ **Wrong**:
```
$l.applicationname == "web-app"
```

✅ **Correct**:
```
$l.applicationname == 'web-app'
```

### Mistake 4: Incorrect String Function Syntax

❌ **Wrong**:
```
applicationname contains 'api'
```

✅ **Correct**:
```
$l.applicationname.contains('api')
```

### Mistake 5: Missing Parentheses with NOT

❌ **Wrong**:
```
NOT $l.subsystemname == 'pii'
```

✅ **Correct**:
```
NOT ($l.subsystemname == 'pii')
```

### Mistake 6: Case Sensitivity

❌ **Wrong** (if actual value is 'Payment-Service'):
```
$l.applicationname == 'payment-service'
```

✅ **Correct**:
```
$l.applicationname == 'Payment-Service'
```

Or use case-insensitive regex:
```
$l.applicationname ~ '(?i)payment-service'
```

## Performance Considerations

### Efficient Filters

✅ **Good** (specific, indexed fields):
```
$l.applicationname == 'payment-service' && $m.severity >= ERROR
```

❌ **Slow** (regex on every log):
```
$d.message ~ '.*error.*'
```

### Best Practices

1. **Use specific equality checks** when possible
2. **Filter on indexed fields** ($l., $m.) before custom fields ($d.)
3. **Avoid complex regex** on large text fields
4. **Combine filters efficiently** (AND before OR)
5. **Test performance** with representative data volume

## Validation Checklist

Before deploying a filter expression:

✅ Syntax is correct (no errors in test)
✅ Field names match actual log structure
✅ Field prefixes are correct ($l., $m., $d.)
✅ Operators are appropriate for data types
✅ Parentheses are balanced
✅ String values use single quotes
✅ Expression tested in Explore Logs
✅ Results match expectations
✅ Performance is acceptable
✅ Edge cases considered

## Additional Resources

- [DataPrime Query Language Documentation](https://coralogix.com/docs/dataprime-query-language/)
- [IBM Cloud Logs - Data Access Rules](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-data-access-rules)
---
name: cloud-logs-data-access-rules
description: >
  Help customers create, configure, and troubleshoot data access rules in IBM Cloud Logs (powered by Coralogix).
  Use this skill when users mention: "data access rules", "restrict log access", "user permissions", "data security",
  "compliance", "GDPR", "data isolation", "multi-tenant", "access control", "filter logs by user", "role-based access",
  "data governance", or any questions about controlling who can view which logs in IBM Cloud Logs.
---

# IBM Cloud Logs Data Access Rules Skill

## What this skill does
This skill helps users implement data access controls in IBM Cloud Logs. It:
1. Guides users through creating data access rules for security and compliance
2. Helps configure role-based access to logs
3. Troubleshoots access control issues
4. Explains data access rule concepts and best practices
5. Assists with multi-tenant log isolation
6. Helps implement GDPR and compliance requirements
7. Validates data access rule configurations

## Additional Resources
For comprehensive guidance on data access rules and IAM integration, refer to:
- **[IBM Cloud Logs - Data Access Rules](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-data-access-rules)** - Official documentation on data access rules
- **[IAM and CBR Tutorial](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-iam-cbr-tutorial-integrated-services)** - Integration with IBM Cloud IAM and Context-Based Restrictions

---

## Workflow

### Step 1 — Understand the User's Need
Before providing guidance, determine:
- **Security requirement**: Do they need to restrict log access for compliance?
- **Multi-tenancy**: Do they need to isolate logs between teams or customers?
- **Troubleshooting**: Are users seeing logs they shouldn't, or not seeing logs they should?
- **Configuration**: Do they need to create or modify data access rules?
- **Compliance**: Are they implementing GDPR, HIPAA, or other regulatory requirements?

Ask ONE focused question if critical information is missing.

### Step 2 — Gather Context
When configuring or troubleshooting, collect:
- User roles and access groups
- Applications/subsystems that need access control
- Compliance or regulatory requirements
- Current IAM configuration
- Expected vs actual access behavior
- Log samples and their sensitivity levels

### Step 3 — Provide Targeted Guidance
Based on the need:

**For Rule Creation:**
- Explain data access rule concepts
- Guide rule configuration
- Recommend appropriate filters
- Set up IAM integration
- Test access controls

**For Troubleshooting:**
- Verify IAM permissions
- Check rule configuration
- Validate filter expressions
- Test with different user roles
- Review rule priority and evaluation order

### Step 4 — Present Solution with Examples
Always provide:
- Clear step-by-step instructions
- Example rule configurations
- Sample filter expressions
- Expected behavior after changes
- Testing procedures

### Step 5 — Offer Follow-up Guidance
Suggest:
- Additional security best practices
- Monitoring and audit recommendations
- Compliance validation steps

---

## Critical Data Access Rule Concepts

### What are Data Access Rules?
Data access rules are policies that control which logs users can view based on:
- **User identity**: IAM access groups, users, or trusted profiles
- **Log attributes**: Application name, subsystem, severity, custom fields
- **Filter expressions**: DataPrime expressions to match specific logs

### Key Benefits
✅ **Security**: Restrict sensitive log access to authorized users only
✅ **Compliance**: Meet GDPR, HIPAA, SOC2 requirements
✅ **Multi-tenancy**: Isolate logs between teams or customers
✅ **Data governance**: Control data visibility across organization
✅ **Audit trail**: Track who accessed which logs

### How Data Access Rules Work
```
1. User logs into IBM Cloud Logs
   ↓
2. IAM validates user identity and access groups
   ↓
3. Data access rules are evaluated
   ↓
4. Filter expressions applied to user's queries
   ↓
5. User sees only logs matching their access rules
```

### Rule Evaluation Order
- Rules are evaluated based on IAM access group membership
- Multiple rules can apply to a single user
- Rules are combined with OR logic (user sees logs matching ANY rule)
- Default behavior: If no rules match, user sees all logs (unless default rule is set)

---

## Prerequisites

Before creating data access rules:

✅ **IBM Cloud account** with appropriate permissions
✅ **IBM Cloud Logs instance** provisioned
✅ **IAM Manager role** for Cloud Logs service
✅ **logs.data-usage.manage** permission
✅ **Access groups** configured in IAM
✅ **Understanding** of log structure and fields

---

## Common Data Access Rule Scenarios

### Scenario 1: Team-Based Log Isolation

**Goal**: Each team only sees their own application logs

**Use Case**: Development teams should only access logs from their services

**Configuration**:
```
Rule 1 - Payment Team:
  Access Group: payment-team-access-group
  Filter Expression: $l.applicationname.startsWith('payment')
  Description: Payment team can only view payment service logs

Rule 2 - Auth Team:
  Access Group: auth-team-access-group
  Filter Expression: $l.applicationname.startsWith('auth')
  Description: Auth team can only view authentication service logs

Rule 3 - Frontend Team:
  Access Group: frontend-team-access-group
  Filter Expression: $l.applicationname.startsWith('web') || $l.applicationname.startsWith('mobile')
  Description: Frontend team can view web and mobile app logs
```

**Steps**:
```
1. Create IAM access groups:
   - payment-team-access-group
   - auth-team-access-group
   - frontend-team-access-group

2. Add users to appropriate access groups

3. Create data access rules in Cloud Logs:
   - Navigate to Data access rules
   - Click "Create new rule"
   - Configure filter expression
   - Assign to access group
   - Save and test

4. Verify access:
   - Log in as user from each team
   - Confirm they only see their team's logs
```

### Scenario 2: Environment-Based Access Control

**Goal**: Restrict production log access to senior engineers

**Use Case**: Junior developers can see dev/test logs, but only senior engineers can access production

**Configuration**:
```
Rule 1 - Production Access (Senior Engineers):
  Access Group: senior-engineers-group
  Filter Expression: $l.applicationname ~ 'prod-*'
  Description: Senior engineers can view production logs

Rule 2 - Non-Production Access (All Developers):
  Access Group: all-developers-group
  Filter Expression: $l.applicationname ~ 'dev-*' || $l.applicationname ~ 'test-*' || $l.applicationname ~ 'staging-*'
  Description: All developers can view non-production logs
```

### Scenario 3: Severity-Based Access

**Goal**: Restrict critical error logs to security team

**Use Case**: Security team needs access to all critical errors, while developers see standard logs

**Configuration**:
```
Rule 1 - Security Team (All Critical):
  Access Group: security-team-group
  Filter Expression: $m.severity == CRITICAL || $m.severity == ERROR
  Description: Security team sees all errors and critical logs

Rule 2 - Developers (Non-Critical):
  Access Group: developers-group
  Filter Expression: $m.severity <= WARNING
  Description: Developers see info, debug, and warning logs only
```

### Scenario 4: Customer Data Isolation (Multi-Tenant SaaS)

**Goal**: Each customer only sees their own logs

**Use Case**: SaaS platform with multiple customers sharing infrastructure

**Configuration**:
```
Rule 1 - Customer A:
  Access Group: customer-a-access-group
  Filter Expression: $d.customer_id == 'customer-a' || $d.tenant_id == 'tenant-a'
  Description: Customer A can only view their logs

Rule 2 - Customer B:
  Access Group: customer-b-access-group
  Filter Expression: $d.customer_id == 'customer-b' || $d.tenant_id == 'tenant-b'
  Description: Customer B can only view their logs

Rule 3 - Platform Admins:
  Access Group: platform-admins-group
  Filter Expression: (No filter - see all logs)
  Description: Platform admins have full access
```

### Scenario 5: PII Data Protection (GDPR Compliance)

**Goal**: Restrict access to logs containing PII

**Use Case**: Compliance requirement to limit PII log access

**Configuration**:
```
Rule 1 - Compliance Team (PII Access):
  Access Group: compliance-team-group
  Filter Expression: (No filter - see all logs including PII)
  Description: Compliance team can view all logs

Rule 2 - Standard Users (No PII):
  Access Group: standard-users-group
  Filter Expression: NOT ($l.subsystemname == 'pii-service' || $d.contains_pii == true)
  Description: Standard users cannot see logs with PII data

Default Rule:
  Filter Expression: NOT ($l.subsystemname == 'pii-service')
  Description: Default rule blocks PII logs for users without specific access
```

---

## Data Access Rule Configuration

### Creating a Data Access Rule

**Step-by-Step Process**:
```
1. Navigate to IBM Cloud Logs instance

2. Click on "Data access rules" in left navigation

3. Click "Create new rule"

4. Configure rule details:
   - Display Name: Descriptive name for the rule
   - Description: Purpose and scope of the rule
   - Access Group: Select IAM access group
   - Filter Expression: DataPrime expression to filter logs

5. Test the rule:
   - Use "Test expression" feature
   - Verify expected logs are included/excluded

6. Save the rule

7. Copy the Rule ID for IAM integration

8. Assign rule to users via IAM:
   - Go to IAM > Access Groups
   - Select access group
   - Assign access to Cloud Logs service
   - Add rule ID to access policy
```

### Filter Expression Syntax

Data access rules use DataPrime expressions:

**Basic Operators**:
```
==  Equal to
!=  Not equal to
>   Greater than
<   Less than
>=  Greater than or equal
<=  Less than or equal
&&  Logical AND
||  Logical OR
!   Logical NOT
~   Regex match
```

**Field Prefixes**:
```
$l.  Labels (applicationname, subsystemname, hostname, etc.)
$m.  Metadata (severity, timestamp, priority)
$d.  Data fields (custom JSON fields from logs)
```

**Common Filter Patterns**:

**Pattern 1: Application Filter**
```
$l.applicationname == 'payment-service'
$l.applicationname.startsWith('prod-')
$l.applicationname ~ 'api-.*'
```

**Pattern 2: Subsystem Filter**
```
$l.subsystemname == 'authentication'
$l.subsystemname.contains('database')
```

**Pattern 3: Severity Filter**
```
$m.severity >= ERROR
$m.severity == CRITICAL || $m.severity == ERROR
```

**Pattern 4: Custom Field Filter**
```
$d.customer_id == 'customer-123'
$d.environment == 'production'
$d.contains_pii != true
```

**Pattern 5: Combined Filters**
```
$l.applicationname == 'web-app' && $m.severity >= WARNING
$l.applicationname.startsWith('prod-') || $l.applicationname.startsWith('staging-')
NOT ($l.subsystemname == 'pii-service' || $d.sensitive == true)
```

**Pattern 6: Regex Matching**
```
$l.applicationname ~ '^prod-.*-api$'
$l.subsystemname ~ 'payment|billing|invoice'
```

---

## IAM Integration

### Setting Up IAM Access Groups

**Step 1: Create Access Group**
```
1. Go to IBM Cloud Console
2. Navigate to Manage > Access (IAM)
3. Click "Access Groups"
4. Click "Create"
5. Enter group name and description
6. Click "Create"
```

**Step 2: Add Users to Access Group**
```
1. Select the access group
2. Click "Users" tab
3. Click "Add users"
4. Select users to add
5. Click "Add to group"
```

**Step 3: Assign Cloud Logs Access**
```
1. In access group, click "Access" tab
2. Click "Assign access"
3. Select "Cloud Logs" service
4. Choose "Service Instance"
5. Select your Cloud Logs instance
6. Assign roles:
   - Reader: View logs (minimum for data access rules)
   - Writer: Modify configurations
   - Manager: Full access
7. Click "Add" then "Assign"
```

**Step 4: Link Data Access Rule**
```
1. Copy the Rule ID from Cloud Logs data access rules
2. In IAM access policy, add custom attribute:
   - Attribute: data-access-rule-id
   - Value: <Rule ID>
3. Save the policy
```

---

## Troubleshooting Guide

### Issue: User Sees No Logs

**Symptom**: User can access Cloud Logs but sees no data

**Diagnosis Checklist**:
```
1. ✅ Verify IAM Permissions
   - Does user have Reader role or higher?
   - Is user in correct access group?

2. ✅ Check Data Access Rule
   - Is rule configured correctly?
   - Does filter expression match any logs?
   - Is rule ID linked to IAM policy?

3. ✅ Test Filter Expression
   - Run filter in Explore Logs as admin
   - Verify logs exist matching the filter
   - Check for syntax errors

4. ✅ Verify Log Attributes
   - Do logs have expected field names?
   - Are field values correct?
   - Check for case sensitivity
```

**Common Solutions**:

**Solution 1: Fix IAM Permissions**
```
Problem: User not in access group or missing permissions
Fix:
1. Add user to appropriate access group
2. Verify Cloud Logs Reader role assigned
3. Wait 5-10 minutes for IAM changes to propagate
```

**Solution 2: Correct Filter Expression**
```
Problem: Filter expression doesn't match any logs
Fix:
1. Test expression in Explore Logs
2. Verify field names and values
3. Check for typos or case sensitivity
4. Update rule with corrected expression
```

**Solution 3: Link Rule to IAM**
```
Problem: Rule created but not linked to IAM policy
Fix:
1. Copy Rule ID from data access rules
2. Edit IAM access policy
3. Add data-access-rule-id attribute
4. Save and test
```

### Issue: User Sees Too Many Logs

**Symptom**: User can see logs they shouldn't have access to

**Diagnosis Checklist**:
```
1. ✅ Check Rule Configuration
   - Is filter expression too broad?
   - Are multiple rules applying?

2. ✅ Verify Access Group Membership
   - Is user in multiple access groups?
   - Are rules combining with OR logic?

3. ✅ Check Default Rule
   - Is there a default rule allowing all access?
   - Should default rule be more restrictive?
```

**Solutions**:

**Solution 1: Tighten Filter Expression**
```
Problem: Filter too broad
Fix:
Wrong: $l.applicationname.contains('api')
Right: $l.applicationname == 'payment-api' && $l.subsystemname == 'transactions'
```

**Solution 2: Review Access Group Membership**
```
Problem: User in multiple groups with different rules
Fix:
1. Review all access groups user belongs to
2. Remove from unnecessary groups
3. Create more specific access groups if needed
```

**Solution 3: Set Restrictive Default Rule**
```
Problem: No default rule, so users see all logs
Fix:
1. Create default data access rule
2. Set restrictive filter expression
3. Apply to "All users" or default access group
```

### Issue: Filter Expression Syntax Error

**Symptom**: Rule creation fails with syntax error

**Common Mistakes**:
```
❌ Wrong: applicationname == 'web-app'
✅ Right: $l.applicationname == 'web-app'

❌ Wrong: severity = ERROR
✅ Right: $m.severity == ERROR

❌ Wrong: customer_id == "123"
✅ Right: $d.customer_id == '123'

❌ Wrong: applicationname contains 'api'
✅ Right: $l.applicationname.contains('api')

❌ Wrong: NOT subsystemname == 'pii'
✅ Right: NOT ($l.subsystemname == 'pii')
```

**Testing Filter Expressions**:
```
1. Go to Explore Logs
2. Run query with filter:
   source logs | filter <your_expression>
3. Verify results match expectations
4. Copy working expression to data access rule
```

---

## Best Practices

### 1. Principle of Least Privilege
```
✅ Grant minimum access needed
✅ Start restrictive, expand as needed
✅ Regular access reviews
✅ Remove access when no longer needed
```

### 2. Use Descriptive Names
```
✅ Good: "Payment Team - Production Logs Only"
✅ Good: "Customer A - Tenant Isolation"
❌ Bad: "Rule 1"
❌ Bad: "Test Rule"
```

### 3. Document Rules Thoroughly
```
Include in description:
- Purpose of the rule
- Which users/teams it applies to
- What logs are included/excluded
- Business justification
- Compliance requirements
```

### 4. Test Before Deploying
```
1. Create rule in test environment first
2. Test with sample users
3. Verify expected behavior
4. Document test results
5. Deploy to production
```

### 5. Monitor and Audit
```
- Enable audit logging for access changes
- Review access patterns regularly
- Monitor for unauthorized access attempts
- Update rules as requirements change
```

### 6. Use Access Groups Effectively
```
✅ Create groups by role/team
✅ Use consistent naming convention
✅ Document group purpose
✅ Regular membership reviews
```

### 7. Handle Edge Cases
```
- What happens if user is in no groups?
- What if user is in multiple groups?
- How to handle service accounts?
- Emergency access procedures?
```

---

## Compliance Scenarios

### GDPR Compliance

**Requirements**:
- Restrict PII log access
- Audit log access
- Data minimization
- Right to be forgotten

**Implementation**:
```
Rule 1 - DPO Access (Data Protection Officer):
  Access Group: dpo-group
  Filter Expression: (No filter - full access for compliance)
  Description: DPO has full access for compliance audits

Rule 2 - Standard Users (No PII):
  Access Group: standard-users-group
  Filter Expression: NOT ($d.contains_pii == true || $l.subsystemname ~ '.*-pii-.*')
  Description: Standard users cannot access PII logs

Rule 3 - Customer Service (Limited PII):
  Access Group: customer-service-group
  Filter Expression: $l.applicationname == 'customer-portal' && $m.severity >= INFO
  Description: Customer service can view customer portal logs only
```

### HIPAA Compliance

**Requirements**:
- Restrict PHI (Protected Health Information) access
- Audit trails
- Access controls
- Encryption

**Implementation**:
```
Rule 1 - Healthcare Providers:
  Access Group: healthcare-providers-group
  Filter Expression: $l.applicationname == 'patient-portal' && $d.patient_id != null
  Description: Healthcare providers can access patient logs

Rule 2 - IT Operations (No PHI):
  Access Group: it-ops-group
  Filter Expression: NOT ($d.contains_phi == true || $l.subsystemname == 'patient-data')
  Description: IT ops cannot access PHI logs

Rule 3 - Compliance Auditors:
  Access Group: compliance-auditors-group
  Filter Expression: (No filter - full access for audits)
  Description: Auditors have full access for compliance reviews
```

### SOC 2 Compliance

**Requirements**:
- Access controls
- Audit logging
- Separation of duties
- Monitoring

**Implementation**:
```
Rule 1 - Security Team:
  Access Group: security-team-group
  Filter Expression: $m.severity >= WARNING || $l.subsystemname.contains('security')
  Description: Security team monitors security-related logs

Rule 2 - Developers (Non-Production):
  Access Group: developers-group
  Filter Expression: $l.applicationname ~ 'dev-.*' || $l.applicationname ~ 'test-.*'
  Description: Developers limited to non-production environments

Rule 3 - Auditors:
  Access Group: auditors-group
  Filter Expression: (No filter - full access)
  Description: External auditors have full access for SOC 2 audits
```

---

## Advanced Configurations

### Dynamic Access Based on Custom Fields

**Use Case**: Access based on log metadata

```
Rule - Regional Access:
  Access Group: eu-team-group
  Filter Expression: $d.region == 'eu-west-1' || $d.region == 'eu-central-1'
  Description: EU team only sees EU region logs

Rule - Customer Tier Access:
  Access Group: premium-support-group
  Filter Expression: $d.customer_tier == 'premium' || $d.customer_tier == 'enterprise'
  Description: Premium support team sees premium customer logs only
```

### Time-Based Access (Using IAM Policies)

**Use Case**: Temporary access for contractors

```
1. Create time-limited IAM policy
2. Set policy expiration date
3. Link to data access rule
4. Access automatically revoked after expiration
```

### Hierarchical Access

**Use Case**: Managers see team logs, team members see own logs

```
Rule 1 - Engineering Manager:
  Access Group: eng-managers-group
  Filter Expression: $l.applicationname.startsWith('eng-')
  Description: Engineering managers see all engineering logs

Rule 2 - Frontend Developer:
  Access Group: frontend-dev-group
  Filter Expression: $l.applicationname == 'eng-frontend' && $l.subsystemname == 'web-app'
  Description: Frontend devs see only frontend logs

Rule 3 - Backend Developer:
  Access Group: backend-dev-group
  Filter Expression: $l.applicationname == 'eng-backend' && $l.subsystemname ~ 'api|database'
  Description: Backend devs see only backend logs
```

---

## Validation Checklist

Before deploying data access rules:

```
✅ IAM Configuration
   - Access groups created
   - Users assigned to groups
   - Cloud Logs permissions granted
   - Rule IDs linked to policies

✅ Rule Configuration
   - Filter expressions tested
   - Field names verified
   - Syntax validated
   - Expected behavior documented

✅ Testing
   - Test with sample users from each group
   - Verify users see correct logs
   - Verify users don't see restricted logs
   - Test edge cases

✅ Documentation
   - Rule purpose documented
   - Access groups documented
   - Testing results recorded
   - Runbook created

✅ Compliance
   - Regulatory requirements met
   - Audit logging enabled
   - Access reviews scheduled
   - Incident response plan updated
```

---

## Delivering Excellence

- Always explain the security implications of access rules
- Provide specific, tested filter expressions
- Warn about overly permissive rules
- Suggest regular access reviews
- Include compliance considerations
- Offer testing procedures
- Document all configurations
- Recommend audit and monitoring practices
- Consider multi-tenant scenarios
- Address data privacy requirements
# Data Access Rules Troubleshooting Guide

This guide helps diagnose and resolve common issues with IBM Cloud Logs data access rules.

## Quick Diagnostic Checklist

When users report access issues, check:

1. ✅ User has correct IAM permissions
2. ✅ User is in correct access group
3. ✅ Access group is linked to data access rule
4. ✅ Filter expression syntax is valid
5. ✅ Filter expression matches expected logs
6. ✅ No conflicting rules blocking access
7. ✅ Rule is enabled/active
8. ✅ Recent changes haven't broken access

## Common Issues and Solutions

### Issue 1: User Cannot See Any Logs

**Symptoms**:
- User logs in successfully
- Explore Logs shows "No logs found"
- User has IAM permissions

**Possible Causes**:

#### Cause A: No Data Access Rule Assigned

**Diagnosis**:
```
1. Check user's access groups
2. Verify access groups have data access rules
3. Confirm rules are enabled
```

**Solution**:
```
1. Add user to appropriate access group
2. OR create new data access rule for user's group
3. Wait 5-10 minutes for IAM propagation
4. Have user refresh browser/re-login
```

#### Cause B: Filter Expression Too Restrictive

**Diagnosis**:
```
1. Review filter expression in data access rule
2. Test expression in Explore Logs
3. Check if any logs match the filter
```

**Solution**:
```
1. Broaden filter expression
2. Test with: source logs | filter <expression>
3. Verify logs exist matching criteria
4. Update data access rule with corrected filter
```

#### Cause C: IAM Propagation Delay

**Diagnosis**:
```
1. Check when access group membership was added
2. Check when data access rule was created/modified
```

**Solution**:
```
1. Wait 5-10 minutes for IAM changes to propagate
2. Have user log out and log back in
3. Clear browser cache if needed
4. Try incognito/private browsing mode
```

### Issue 2: User Sees Wrong Logs

**Symptoms**:
- User sees logs they shouldn't access
- User sees logs from wrong environment/tenant

**Possible Causes**:

#### Cause A: Multiple Rules with OR Logic

**Diagnosis**:
```
1. List all data access rules
2. Check which rules apply to user's access groups
3. Remember: Multiple rules combine with OR logic
```

**Solution**:
```
1. Review all applicable rules
2. Ensure no rule grants unintended access
3. Consider consolidating rules
4. Use more specific filters
```

#### Cause B: Filter Expression Too Broad

**Diagnosis**:
```
1. Review filter expression
2. Test what logs it matches
3. Check for missing conditions
```

**Solution**:
```
Example - Too broad:
❌ $l.applicationname.startsWith('prod-')

Better - More specific:
✅ $l.applicationname.startsWith('prod-payment-') && $d.team == 'payments'
```

### Issue 3: Filter Expression Syntax Errors

**Symptoms**:
- Error creating/updating data access rule
- "Invalid expression" message
- Rule saves but doesn't work

**Common Syntax Errors**:

#### Error A: Missing Field Prefix

❌ **Wrong**:
```
applicationname == 'web-app'
```

✅ **Correct**:
```
$l.applicationname == 'web-app'
```

#### Error B: Wrong Equality Operator

❌ **Wrong**:
```
$l.applicationname = 'web-app'
```

✅ **Correct**:
```
$l.applicationname == 'web-app'
```

#### Error C: Double Quotes Instead of Single

❌ **Wrong**:
```
$l.applicationname == "web-app"
```

✅ **Correct**:
```
$l.applicationname == 'web-app'
```

#### Error D: Missing Parentheses with NOT

❌ **Wrong**:
```
NOT $l.subsystemname == 'pii'
```

✅ **Correct**:
```
NOT ($l.subsystemname == 'pii')
```

#### Error E: Incorrect String Function

❌ **Wrong**:
```
applicationname contains 'api'
```

✅ **Correct**:
```
$l.applicationname.contains('api')
```

### Issue 4: IAM Permission Errors

**Symptoms**:
- "Access denied" when viewing logs
- "Insufficient permissions" error
- Cannot create/modify data access rules

**Required IAM Permissions**:

#### For Viewing Logs:
```
Service: IBM Cloud Logs
Role: Viewer or higher
Actions:
  - logs.dashboard.view
  - logs.data.read
```

#### For Managing Data Access Rules:
```
Service: IBM Cloud Logs
Role: Manager or Administrator
Actions:
  - logs.data-access-rule.create
  - logs.data-access-rule.update
  - logs.data-access-rule.delete
  - logs.data-access-rule.read
```

**Solution**:
```
1. Verify user has correct IAM roles
2. Check service access policies
3. Ensure policies apply to correct instance
4. Wait for IAM propagation (5-10 minutes)
```

### Issue 5: Access Group Not Working

**Symptoms**:
- User added to access group
- Data access rule exists for group
- User still cannot see logs

**Diagnosis Steps**:

1. **Verify Access Group Membership**:
   ```
   IAM → Access Groups → [Group Name] → Users
   Confirm user is listed
   ```

2. **Verify Data Access Rule Configuration**:
   ```
   Cloud Logs → Data Access Rules
   Check rule is enabled
   Verify access group ID matches
   ```

3. **Check IAM Propagation**:
   ```
   Wait 5-10 minutes after changes
   Have user log out and back in
   ```

**Solution**:
```
1. Remove and re-add user to access group
2. Verify access group ID in data access rule
3. Check for typos in access group name/ID
4. Ensure rule is enabled
5. Wait for propagation and retry
```

### Issue 6: Logs Suddenly Disappeared

**Symptoms**:
- User previously had access
- Now sees no logs or fewer logs
- No intentional changes made

**Possible Causes**:

#### Cause A: Data Access Rule Modified

**Diagnosis**:
```
1. Check audit logs for rule changes
2. Review rule modification history
3. Compare current vs. previous filter
```

**Solution**:
```
1. Review recent changes
2. Restore previous filter expression
3. Test restored expression
4. Document change for future reference
```

#### Cause B: Access Group Membership Changed

**Diagnosis**:
```
1. Check user's current access groups
2. Review access group audit logs
3. Verify group membership history
```

**Solution**:
```
1. Re-add user to correct access group
2. Verify group has data access rule
3. Wait for IAM propagation
```

#### Cause C: Log Structure Changed

**Diagnosis**:
```
1. Check if application names changed
2. Verify field names still match
3. Test filter expression with recent logs
```

**Solution**:
```
1. Update filter expression for new structure
2. Use more flexible patterns (e.g., .contains())
3. Test thoroughly before deploying
```

### Issue 7: Performance Issues

**Symptoms**:
- Slow log loading
- Timeouts when viewing logs
- UI becomes unresponsive

**Possible Causes**:

#### Cause A: Complex Filter Expression

**Diagnosis**:
```
1. Review filter complexity
2. Check for expensive regex patterns
3. Look for filters on large text fields
```

**Solution**:
```
❌ Slow:
$d.message ~ '.*error.*'

✅ Faster:
$l.applicationname == 'payment-service' && $m.severity >= ERROR
```

#### Cause B: Too Many Matching Logs

**Diagnosis**:
```
1. Test filter in Explore Logs
2. Check result count
3. Verify time range
```

**Solution**:
```
1. Add more specific filters
2. Reduce time range
3. Use severity filters
4. Add application/subsystem filters
```

### Issue 8: Multi-Tenant Isolation Broken

**Symptoms**:
- Customer A sees Customer B's logs
- Tenant isolation not working
- Cross-tenant data leakage

**Critical Diagnosis**:

1. **Review All Data Access Rules**:
   ```
   List all rules
   Check each rule's filter
   Identify overlapping access
   ```

2. **Test Tenant Isolation**:
   ```
   Log in as Customer A user
   Search for Customer B identifier
   Should return no results
   ```

3. **Verify Filter Logic**:
   ```
   ❌ Wrong (too broad):
   $l.applicationname.startsWith('app-')
   
   ✅ Correct (tenant-specific):
   $d.tenant_id == 'customer-a'
   ```

**Solution**:
```
1. Immediately restrict overly broad rules
2. Add explicit tenant_id filters
3. Test isolation thoroughly
4. Document tenant boundaries
5. Regular audit of access rules
```

### Issue 9: Cannot Create Data Access Rule

**Symptoms**:
- Error when creating rule
- "Invalid configuration" message
- Rule creation fails silently

**Common Causes**:

#### Cause A: Invalid Access Group ID

**Diagnosis**:
```
1. Verify access group exists
2. Check access group ID format
3. Confirm ID is correct
```

**Solution**:
```
1. Get access group ID from IAM console
2. Copy ID exactly (case-sensitive)
3. Verify format: AccessGroupId-xxxxx
```

#### Cause B: Duplicate Rule Name

**Diagnosis**:
```
1. List existing data access rules
2. Check for name conflicts
```

**Solution**:
```
1. Use unique, descriptive names
2. Follow naming convention
3. Include team/purpose in name
```

#### Cause C: Invalid Filter Expression

**Diagnosis**:
```
1. Test expression in Explore Logs
2. Check syntax carefully
3. Validate field names
```

**Solution**:
```
1. Test expression first: source logs | filter <expression>
2. Fix syntax errors
3. Verify field names exist
4. Use validation checklist
```

### Issue 10: Compliance Audit Failures

**Symptoms**:
- Audit shows unauthorized access
- Users accessing restricted logs
- Compliance violations detected

**Investigation Steps**:

1. **Review Audit Logs**:
   ```
   Check who accessed what logs
   Identify unauthorized access patterns
   Review access timestamps
   ```

2. **Analyze Data Access Rules**:
   ```
   List all active rules
   Check for overly permissive filters
   Verify access group memberships
   ```

3. **Test Access Controls**:
   ```
   Log in as different user types
   Verify access restrictions work
   Test edge cases
   ```

**Remediation**:
```
1. Tighten overly broad rules immediately
2. Remove users from inappropriate groups
3. Add explicit exclusion filters for sensitive data
4. Document all changes
5. Re-test compliance
6. Schedule regular audits
```

## Debugging Workflow

### Step 1: Identify the Problem

```
Questions to ask:
- What is the user trying to do?
- What do they expect to see?
- What are they actually seeing?
- When did the problem start?
- Has anything changed recently?
```

### Step 2: Check IAM Configuration

```
1. Verify user identity
2. Check access group membership
3. Review IAM roles and permissions
4. Confirm service access policies
```

### Step 3: Review Data Access Rules

```
1. List all applicable rules
2. Check rule filters
3. Test filters in Explore Logs
4. Verify rule is enabled
```

### Step 4: Test Filter Expression

```
1. Copy filter expression
2. Run in Explore Logs: source logs | filter <expression>
3. Verify results match expectations
4. Adjust filter as needed
```

### Step 5: Check Propagation

```
1. Note when changes were made
2. Wait 5-10 minutes
3. Have user log out/in
4. Clear browser cache
5. Test again
```

### Step 6: Verify Resolution

```
1. User logs in
2. Navigates to Explore Logs
3. Sees expected logs
4. Cannot see restricted logs
5. Document solution
```

## Testing Checklist

Before deploying data access rules:

✅ Filter expression syntax validated
✅ Expression tested in Explore Logs
✅ Results match expectations
✅ Access group correctly configured
✅ IAM permissions verified
✅ Test user can access correct logs
✅ Test user cannot access restricted logs
✅ Performance is acceptable
✅ Edge cases tested
✅ Documentation updated

## Escalation Criteria

Escalate to IBM Support when:

- IAM propagation takes > 30 minutes
- Filter expressions work in Explore but not in rules
- Persistent "Access denied" with correct permissions
- Data access rules not applying at all
- Suspected platform bug or service issue
- Security incident or data breach

## Prevention Best Practices

1. **Test Before Deploying**:
   - Always test filters in Explore Logs first
   - Verify with test users before production

2. **Use Descriptive Names**:
   - Name rules clearly: "Team-Payments-Production"
   - Include purpose in description

3. **Document Everything**:
   - Document filter logic
   - Note which teams/users affected
   - Record change history

4. **Regular Audits**:
   - Review rules quarterly
   - Check for unused rules
   - Verify access is still appropriate

5. **Monitor Access Patterns**:
   - Review audit logs regularly
   - Look for unusual access
   - Investigate anomalies

6. **Keep It Simple**:
   - Avoid overly complex filters
   - Use clear, maintainable expressions
   - Prefer multiple simple rules over one complex rule

## Additional Resources

- [IBM Cloud Logs Documentation](https://cloud.ibm.com/docs/cloud-logs)
- [IAM Access Groups](https://cloud.ibm.com/docs/account?topic=account-groups)
- [DataPrime Query Language](https://coralogix.com/docs/dataprime-query-language/)
- [IBM Cloud Support](https://cloud.ibm.com/unifiedsupport/supportcenter)
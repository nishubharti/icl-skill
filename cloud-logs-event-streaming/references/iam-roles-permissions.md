# IAM Roles and Permissions for Event Streaming

Detailed guide to Identity and Access Management (IAM) requirements for configuring and managing IBM Cloud Logs Event Streaming.

## Overview

Event Streaming requires specific IAM roles on both Cloud Logs and Event Streams instances. This document covers:
- Required roles and permissions
- How to verify current access
- How to request access
- Service-to-service authentication
- Troubleshooting permission issues

## Required IAM Roles

### Cloud Logs Instance Roles

| Role | Purpose | Required Actions |
|------|---------|------------------|
| **Manager** | Configure streaming | `logs.logs-stream-setup.create`<br>`logs.logs-stream-setup.update`<br>`logs.logs-stream-setup.delete` |
| **Reader** | View streaming config | `logs.logs-stream-setup.get` |

**Who needs these roles:**
- Users who configure streaming rules
- Users who view streaming configuration
- Service IDs used for automation

### Event Streams Instance Roles

| Role | Purpose | Required Actions |
|------|---------|------------------|
| **Writer** | Write to topics | `messagehub.topic.write` |
| **Manager** | Manage topics | `messagehub.topic.manage`<br>`messagehub.topic.create`<br>`messagehub.topic.delete` |

**Who needs these roles:**
- Cloud Logs service (service-to-service auth)
- Users who manage Event Streams topics
- Kafka Connect service accounts

## Prerequisites

Before configuring Event Streaming:

1. **Same Account Requirement**
   - Cloud Logs instance must be in the same IBM Cloud account as Event Streams instance
   - Cross-account streaming is not supported

2. **Service Credentials**
   - Event Streams service credentials must exist
   - Credentials must have Manager role
   - Credentials must include `messagehub.topic.write` permission
   - Credentials must include `messagehub.topic.manage` permission

3. **Topic Creation**
   - Event Streams topic must exist before configuring streaming
   - Topic must have appropriate retention and partition settings

## Verifying Your Access

### Check Cloud Logs Access

**Via IBM Cloud CLI:**
```bash
# List your IAM policies
ibmcloud iam user-policies YOUR_EMAIL

# Look for policies on Cloud Logs instance
# Should show Manager or Reader role
```

**Via IBM Cloud Console:**
1. Navigate to **Manage** → **Access (IAM)**
2. Click **Users** → Select your user
3. Click **Access policies**
4. Look for policies on Cloud Logs instance
5. Verify you have Manager role

**Expected Output:**
```
Policy ID:   abc123...
Roles:       Manager
Resources:   
  Service:   logs
  Instance:  cloud-logs-instance-name
```

### Check Event Streams Access

**Via IBM Cloud CLI:**
```bash
# List your IAM policies
ibmcloud iam user-policies YOUR_EMAIL

# Look for policies on Event Streams instance
# Should show Writer and Manager roles
```

**Via IBM Cloud Console:**
1. Navigate to **Manage** → **Access (IAM)**
2. Click **Users** → Select your user
3. Click **Access policies**
4. Look for policies on Event Streams instance
5. Verify you have Writer and Manager roles

**Expected Output:**
```
Policy ID:   def456...
Roles:       Writer, Manager
Resources:   
  Service:   messagehub
  Instance:  event-streams-instance-name
```

### Test Access

**Test Cloud Logs Access:**
```bash
# Try to access Cloud Logs instance
ibmcloud resource service-instance cloud-logs-instance

# If successful, you have at least Reader access
```

**Test Event Streams Access:**
```bash
# Try to list topics
ibmcloud es topic-list --instance event-streams-instance

# If successful, you have at least Reader access

# Try to create a test topic
ibmcloud es topic-create test-topic --partitions 1 --instance event-streams-instance

# If successful, you have Manager access

# Clean up test topic
ibmcloud es topic-delete test-topic --instance event-streams-instance
```

## Requesting Access

If you don't have the required roles, request them from your IBM Cloud account administrator.

### Request Template

**Subject:** Access Request for Event Streaming Configuration

**Body:**
```
Hello,

I need access to configure Event Streaming between Cloud Logs and Event Streams.

Please grant me the following IAM roles:

Cloud Logs Instance:
- Instance Name: [cloud-logs-instance-name]
- Instance ID: [cloud-logs-instance-id]
- Required Role: Manager
- Purpose: Configure streaming rules

Event Streams Instance:
- Instance Name: [event-streams-instance-name]
- Instance ID: [event-streams-instance-id]
- Required Roles: Writer, Manager
- Purpose: Stream logs to Event Streams topics

Use Case: [Describe your use case, e.g., "Stream production error logs to SIEM"]

Thank you!
```

### Administrator Instructions

**To grant Cloud Logs Manager role:**
```bash
# Via CLI
ibmcloud iam user-policy-create USER_EMAIL \
  --roles Manager \
  --service-name logs \
  --service-instance CLOUD_LOGS_INSTANCE_ID

# Via Console
# 1. Navigate to Manage → Access (IAM)
# 2. Click Users → Select user
# 3. Click "Assign access"
# 4. Select "Cloud Logs"
# 5. Select specific instance
# 6. Select "Manager" role
# 7. Click "Add" and "Assign"
```

**To grant Event Streams Writer and Manager roles:**
```bash
# Via CLI
ibmcloud iam user-policy-create USER_EMAIL \
  --roles Writer,Manager \
  --service-name messagehub \
  --service-instance EVENT_STREAMS_INSTANCE_ID

# Via Console
# 1. Navigate to Manage → Access (IAM)
# 2. Click Users → Select user
# 3. Click "Assign access"
# 4. Select "Event Streams"
# 5. Select specific instance
# 6. Select "Writer" and "Manager" roles
# 7. Click "Add" and "Assign"
```

## Service-to-Service Authentication

Cloud Logs uses service-to-service authentication to write logs to Event Streams.

### How It Works

1. **Service Credentials**: Cloud Logs uses Event Streams service credentials
2. **Credential-Based Auth**: Credentials contain API key and connection details
3. **Automatic Authentication**: Cloud Logs automatically authenticates using credentials
4. **No User Involvement**: After initial setup, no user authentication required

### Creating Service Credentials

**Via IBM Cloud Console:**
1. Navigate to Event Streams instance
2. Click **Service credentials** in left menu
3. Click **New credential**
4. Configure credential:
   - **Name**: `cloud-logs-streaming`
   - **Role**: Manager
   - **Service ID**: Auto-generated or select existing
5. Click **Add**
6. Expand credential to view details

**Via IBM Cloud CLI:**
```bash
# Create service credential
ibmcloud resource service-key-create cloud-logs-streaming Manager \
  --instance-name event-streams-instance

# View credential details
ibmcloud resource service-key cloud-logs-streaming
```

**Expected Credential Structure:**
```json
{
  "api_key": "abc123...",
  "apikey": "abc123...",
  "iam_apikey_description": "Auto-generated for key...",
  "iam_apikey_name": "cloud-logs-streaming",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::...",
  "instance_id": "...",
  "kafka_brokers_sasl": [
    "broker-1.kafka.svc.cluster.local:9093",
    "broker-2.kafka.svc.cluster.local:9093"
  ],
  "kafka_http_url": "https://...",
  "password": "...",
  "user": "token"
}
```

### Verifying Service Credentials

**Check Credential Permissions:**
```bash
# Get service ID from credential
SERVICE_ID=$(ibmcloud resource service-key cloud-logs-streaming --output json | jq -r '.[0].credentials.iam_serviceid_crn')

# List policies for service ID
ibmcloud iam service-policies $SERVICE_ID

# Should show Manager role on Event Streams instance
```

**Test Credential:**
```bash
# Export API key from credential
export API_KEY=$(ibmcloud resource service-key cloud-logs-streaming --output json | jq -r '.[0].credentials.api_key')

# Test authentication
ibmcloud login --apikey $API_KEY

# List topics (should succeed)
ibmcloud es topic-list --instance event-streams-instance
```

## Permission Troubleshooting

### Error: "Insufficient permissions to configure streaming"

**Cause:** Missing Manager role on Cloud Logs instance

**Solution:**
```bash
# Verify current roles
ibmcloud iam user-policies YOUR_EMAIL | grep logs

# Request Manager role from administrator
# See "Requesting Access" section above
```

### Error: "Cannot write to Event Streams topic"

**Cause:** Missing Writer role on Event Streams instance or invalid service credentials

**Solution:**
```bash
# Check Event Streams roles
ibmcloud iam user-policies YOUR_EMAIL | grep messagehub

# Verify service credentials exist
ibmcloud resource service-keys --instance-name event-streams-instance

# Recreate service credentials if needed
ibmcloud resource service-key-delete cloud-logs-streaming
ibmcloud resource service-key-create cloud-logs-streaming Manager \
  --instance-name event-streams-instance
```

### Error: "Service credentials not found"

**Cause:** Service credentials deleted or never created

**Solution:**
```bash
# Create new service credentials
ibmcloud resource service-key-create cloud-logs-streaming Manager \
  --instance-name event-streams-instance

# Verify credentials created
ibmcloud resource service-key cloud-logs-streaming

# Update streaming configuration with new credentials
# (via Cloud Logs UI: Settings → Event Streaming)
```

### Error: "Cross-account streaming not supported"

**Cause:** Cloud Logs and Event Streams instances in different accounts

**Solution:**
```bash
# Check Cloud Logs account
ibmcloud resource service-instance cloud-logs-instance | grep "Account ID"

# Check Event Streams account
ibmcloud resource service-instance event-streams-instance | grep "Account ID"

# If different, move one instance to same account or create new instance
```

## IAM Best Practices

### Principle of Least Privilege

**For Users:**
- Grant Manager role only to users who need to configure streaming
- Grant Reader role to users who only need to view configuration
- Use access groups to manage permissions for teams

**For Service IDs:**
- Create dedicated service ID for streaming
- Grant only required permissions (Writer, Manager on Event Streams)
- Rotate service credentials regularly

### Access Groups

Create access groups for common roles:

**Streaming Administrators Group:**
```bash
# Create access group
ibmcloud iam access-group-create streaming-admins \
  --description "Users who can configure streaming"

# Add users to group
ibmcloud iam access-group-user-add streaming-admins USER_EMAIL

# Assign policies to group
ibmcloud iam access-group-policy-create streaming-admins \
  --roles Manager \
  --service-name logs \
  --service-instance CLOUD_LOGS_INSTANCE_ID

ibmcloud iam access-group-policy-create streaming-admins \
  --roles Writer,Manager \
  --service-name messagehub \
  --service-instance EVENT_STREAMS_INSTANCE_ID
```

**Streaming Viewers Group:**
```bash
# Create access group
ibmcloud iam access-group-create streaming-viewers \
  --description "Users who can view streaming configuration"

# Add users to group
ibmcloud iam access-group-user-add streaming-viewers USER_EMAIL

# Assign policies to group
ibmcloud iam access-group-policy-create streaming-viewers \
  --roles Reader \
  --service-name logs \
  --service-instance CLOUD_LOGS_INSTANCE_ID
```

### Credential Rotation

Rotate service credentials regularly:

**Rotation Process:**
1. Create new service credentials
2. Update streaming configuration with new credentials
3. Verify streaming is working
4. Delete old service credentials

**Rotation Script:**
```bash
#!/bin/bash

# Create new credentials
ibmcloud resource service-key-create cloud-logs-streaming-new Manager \
  --instance-name event-streams-instance

# Manual step: Update streaming configuration in Cloud Logs UI

# Wait for confirmation streaming is working
read -p "Confirm streaming is working with new credentials (y/n): " confirm

if [ "$confirm" = "y" ]; then
  # Delete old credentials
  ibmcloud resource service-key-delete cloud-logs-streaming
  
  # Rename new credentials
  # (Note: IBM Cloud CLI doesn't support renaming, so keep as is)
  
  echo "Credential rotation complete"
else
  echo "Rotation cancelled. Old credentials still active."
fi
```

### Audit and Compliance

**Monitor IAM Changes:**
```bash
# Check Activity Tracker for IAM events
ibmcloud at event-list --service-name iam

# Look for policy changes
ibmcloud at event-list --service-name iam --event-type iam.policy.*

# Look for credential changes
ibmcloud at event-list --service-name iam --event-type iam.service-key.*
```

**Regular Access Reviews:**
- Review user access quarterly
- Remove access for users who no longer need it
- Verify service credentials are still needed
- Check for unused or expired credentials

## Related Documentation

- [Troubleshooting Guide](troubleshooting.md)
- [Best Practices](best-practices.md)
- [Streaming Rules Reference](streaming-rules-reference.md)
- [IBM Cloud IAM Documentation](https://cloud.ibm.com/docs/account?topic=account-iamoverview)
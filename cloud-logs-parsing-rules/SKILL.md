---
name: cloud-logs-parsing-rules
description: >
  Help customers create, configure, and troubleshoot parsing rules in IBM Cloud Logs (powered by Coralogix).
  Use this skill when users mention: "parsing rules", "parse logs", "extract fields", "log parsing",
  "regex parsing", "JSON parsing", "parsing not working", "fields not extracted", "parsing order",
  "rule priority", "parsing configuration", "log transformation", or any questions about
  configuring, managing, or troubleshooting parsing rules in IBM Cloud Logs.
---

# IBM Cloud Logs Parsing Rules Skill

## What this skill does
This skill helps users create and troubleshoot parsing rules in IBM Cloud Logs. It:
1. Guides users through parsing rule creation with proper configuration
2. Helps debug why parsing rules aren't working
3. Explains rule ordering and priority (CRITICAL for parsing)
4. Validates regex patterns and field extraction
5. Troubleshoots common parsing issues
6. Provides best practices for rule design

---

## Workflow

### Step 1 — Understand the User's Need
Before providing guidance, determine:
- **Creation**: Do they need to create new parsing rules?
- **Troubleshooting**: Are existing rules not working?
- **Ordering**: Do they need help with rule priority?
- **Validation**: Is their regex pattern correct?
- **Field extraction**: Are fields not being extracted?

Ask ONE focused question if critical information is missing.

### Step 2 — Gather Context
When troubleshooting, collect:
- Sample log messages (raw format)
- Current parsing rules (if any)
- Expected vs actual parsed output
- Rule order/priority
- Source field being parsed
- Target fields for extraction

### Step 3 — Provide Targeted Guidance
Based on the need:

**For Rule Creation:**
- Recommend appropriate rule type
- Guide regex pattern construction
- Explain field extraction
- Set up rule ordering

**For Troubleshooting:**
- Verify rule order (MOST IMPORTANT)
- Validate regex pattern
- Check source field configuration
- Test with sample logs
- Verify field name conflicts

### Step 4 — Present Solution with Examples
Always provide:
- Clear step-by-step instructions
- Example parsing rules
- Sample regex patterns
- Expected output after parsing

### Step 5 — Offer Follow-up Guidance
Suggest:
- Rule optimization tips
- Additional parsing recommendations
- Best practices for their use case

---

## Critical Parsing Concepts

### Rule Order is CRITICAL
⚠️ **MOST IMPORTANT**: 
- **Parsing rules execute in ORDER (top to bottom)**
- **First matching rule wins - subsequent rules are skipped**
- **Rule order determines which pattern gets applied**
- This is the #1 cause of "parsing not working" issues

**Rule Execution Flow**:
```
Log arrives → Rule 1 matches? → YES → Apply Rule 1 → STOP
                              ↓ NO
              Rule 2 matches? → YES → Apply Rule 2 → STOP
                              ↓ NO
              Rule 3 matches? → YES → Apply Rule 3 → STOP
                              ↓ NO
              No rules match → Log remains unparsed
```

### Parsing Rule Types

#### 1. Extract (Regex)
**Use Case**: Extract specific fields using regex patterns  
**Example**: Extract timestamp, level, message from structured logs

**Configuration**:
```
Rule Type: Extract
Source Field: text
Regex Pattern: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}) \[(?P<level>\w+)\] (?P<message>.*)
Destination: Create new fields (timestamp, level, message)
```

#### 2. Parse (JSON)
**Use Case**: Parse JSON-formatted log messages  
**Example**: Extract fields from JSON logs

**Configuration**:
```
Rule Type: Parse
Source Field: text
Format: JSON
Destination: Extract all JSON fields
```

#### 3. Replace
**Use Case**: Replace text patterns in logs  
**Example**: Mask sensitive data, normalize formats

**Configuration**:
```
Rule Type: Replace
Source Field: text
Regex Pattern: \b\d{16}\b
Replacement: [REDACTED-CARD]
```

#### 4. Block
**Use Case**: Drop logs matching pattern  
**Example**: Filter out health check logs

**Configuration**:
```
Rule Type: Block
Source Field: text
Regex Pattern: /health
Action: Drop log
```

---

## Common Parsing Scenarios

### Scenario 1: Parsing Not Working

**Symptom**: Fields not being extracted despite rule configuration

**Diagnosis Checklist**:
```
1. ✅ Check Rule Order (MOST COMMON - 70% of cases)
   - Is a more general rule above this one?
   - Does an earlier rule match first?
   - Move specific rules ABOVE general rules

2. ✅ Verify Regex Pattern
   - Test regex with sample log
   - Check for escaping issues
   - Validate named capture groups

3. ✅ Check Source Field
   - Is source field correct? (text, text.log, etc.)
   - Does field exist in logs?
   - Check field name case sensitivity

4. ✅ Verify Rule is Enabled
   - Check rule status
   - Ensure rule group is active

5. ✅ Check for Field Conflicts
   - Are field names already used?
   - Check for reserved field names
```

**Common Causes & Solutions**:

**Cause 1: Wrong Rule Order (70% of cases)**
```
Problem: General rule above specific rule

Wrong Order:
  Rule 1: .* (matches everything) → Catches all logs
  Rule 2: ERROR.* (specific pattern) → Never reached

Right Order:
  Rule 1: ERROR.* (specific pattern) → Matches errors first
  Rule 2: .* (matches everything) → Catches remaining logs
```

**Cause 2: Incorrect Regex Pattern**
```
Problem: Regex doesn't match log format

Wrong: (?P<level>\w+)
Right: \[(?P<level>\w+)\]

Test with sample log:
Log: [ERROR] Connection failed
Pattern: \[(?P<level>\w+)\] (?P<message>.*)
Result: level=ERROR, message=Connection failed
```

**Cause 3: Wrong Source Field**
```
Problem: Parsing wrong field

Common fields:
- text: Main log message
- text.log: Nested log field (Kubernetes)
- json.message: JSON field

Check your log structure first!
```

### Scenario 2: Creating Nginx Log Parser

**Goal**: Parse nginx access logs into structured fields

**Sample Log**:
```
192.168.1.100 - - [25/Mar/2024:10:30:45 +0000] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"
```

**Step-by-Step**:
```
1. Create Parsing Rule:
   - Name: "Nginx Access Log Parser"
   - Rule Type: Extract
   - Source Field: text
   - Order: 1 (high priority)

2. Define Regex Pattern:
   (?P<client_ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] "(?P<method>\w+) (?P<path>\S+) (?P<protocol>[^"]+)" (?P<status>\d+) (?P<bytes>\d+) "(?P<referrer>[^"]*)" "(?P<user_agent>[^"]*)"

3. Extracted Fields:
   - client_ip: 192.168.1.100
   - timestamp: 25/Mar/2024:10:30:45 +0000
   - method: GET
   - path: /api/users
   - protocol: HTTP/1.1
   - status: 200
   - bytes: 1234
   - referrer: https://example.com
   - user_agent: Mozilla/5.0

4. Test with sample logs before deploying
```

### Scenario 3: Creating Application Log Parser

**Goal**: Parse application logs with timestamp, level, and message

**Sample Log**:
```
2024-03-25T10:30:45.123Z [ERROR] payment-service: Transaction failed for user 12345
```

**Step-by-Step**:
```
1. Create Parsing Rule:
   - Name: "Application Log Parser"
   - Rule Type: Extract
   - Source Field: text
   - Order: 1

2. Define Regex Pattern:
   (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) \[(?P<level>\w+)\] (?P<service>[\w-]+): (?P<message>.*)

3. Extracted Fields:
   - timestamp: 2024-03-25T10:30:45.123Z
   - level: ERROR
   - service: payment-service
   - message: Transaction failed for user 12345

4. Verify field extraction in Explore Logs
```

### Scenario 4: Parsing JSON Logs

**Goal**: Extract fields from JSON-formatted logs

**Sample Log**:
```
{"timestamp":"2024-03-25T10:30:45Z","level":"ERROR","service":"api-gateway","message":"Request timeout","duration_ms":5000}
```

**Step-by-Step**:
```
1. Create Parsing Rule:
   - Name: "JSON Log Parser"
   - Rule Type: Parse (JSON)
   - Source Field: text
   - Order: 1

2. Configuration:
   - Format: JSON
   - Extract all fields: Yes
   - Prefix: (optional) json.

3. Extracted Fields:
   - json.timestamp: 2024-03-25T10:30:45Z
   - json.level: ERROR
   - json.service: api-gateway
   - json.message: Request timeout
   - json.duration_ms: 5000

4. Fields available for queries and dashboards
```

### Scenario 5: Masking Sensitive Data

**Goal**: Replace credit card numbers with masked values

**Sample Log**:
```
Payment processed: card=4532123456789012 amount=99.99
```

**Step-by-Step**:
```
1. Create Parsing Rule:
   - Name: "Mask Credit Cards"
   - Rule Type: Replace
   - Source Field: text
   - Order: 1 (BEFORE other parsing)

2. Define Regex Pattern:
   Pattern: \b\d{16}\b
   Replacement: [REDACTED-CARD]

3. Result:
   Payment processed: card=[REDACTED-CARD] amount=99.99

4. Apply BEFORE field extraction rules
```

---

## Parsing Rule Best Practices

### 1. Rule Ordering Strategy
```
Order 1-10: Blocking rules (drop unwanted logs)
Order 11-20: Data masking rules (security)
Order 21-30: Specific parsing rules (exact patterns)
Order 31-40: General parsing rules (catch-all patterns)
Order 41+: Fallback rules
```

### 2. Test Regex Patterns First
```
Always test regex before deploying:
1. Use regex testing tool (regex101.com)
2. Test with multiple sample logs
3. Verify all capture groups work
4. Check for edge cases
```

### 3. Use Named Capture Groups
```
❌ Bad:
(\d{4}-\d{2}-\d{2}) (\w+) (.*)

✅ Good:
(?P<date>\d{4}-\d{2}-\d{2}) (?P<level>\w+) (?P<message>.*)
```

### 4. Handle Missing Fields
```
Make patterns flexible:
(?P<timestamp>\S+) (?P<level>\w+)? (?P<message>.*)

The ? makes level optional
```

### 5. Avoid Greedy Matching
```
❌ Bad (greedy):
(?P<message>.*)

✅ Good (non-greedy):
(?P<message>.*?)

Or be specific:
(?P<message>[^\n]+)
```

---

## Rule Order Examples

### Example 1: Specific Before General

**Wrong Order** (doesn't work):
```
Rule 1 (Order: 1):
  Pattern: .*
  Action: Extract basic fields
  → Matches ALL logs, stops processing

Rule 2 (Order: 2):
  Pattern: ERROR.*
  Action: Extract error details
  → NEVER REACHED
```

**Right Order** (works correctly):
```
Rule 1 (Order: 1):
  Pattern: ERROR.*
  Action: Extract error details
  → Matches errors first

Rule 2 (Order: 2):
  Pattern: .*
  Action: Extract basic fields
  → Matches remaining logs
```

### Example 2: Multiple Application Parsers

**Correct Order**:
```
Rule 1 (Order: 1):
  Application: nginx
  Pattern: nginx access log regex
  → Parses nginx logs

Rule 2 (Order: 2):
  Application: payment-service
  Pattern: payment service log regex
  → Parses payment logs

Rule 3 (Order: 3):
  Application: *
  Pattern: generic log regex
  → Parses other logs
```

### Example 3: Security First

**Correct Order**:
```
Rule 1 (Order: 1):
  Pattern: \b\d{16}\b
  Action: Replace with [REDACTED]
  → Masks credit cards FIRST

Rule 2 (Order: 2):
  Pattern: password=\S+
  Action: Replace with password=[REDACTED]
  → Masks passwords

Rule 3 (Order: 3):
  Pattern: .*
  Action: Parse fields
  → Parses already-masked logs
```

---

## Troubleshooting Guide

### Issue: "Fields not being extracted"

**Diagnosis**:
```
1. ✅ Check rule order
   - Is a more general rule above?
   - Move specific rules higher

2. ✅ Test regex pattern
   - Use regex101.com
   - Test with actual log samples
   - Verify named groups

3. ✅ Check source field
   - Verify field name
   - Check field exists in logs

4. ✅ Verify rule is enabled
   - Check rule status
   - Check rule group status
```

**Solutions**:
```
1. Reorder rules (specific above general)
2. Fix regex pattern
3. Correct source field name
4. Enable rule/rule group
```

### Issue: "Some logs parsed, others not"

**Diagnosis**:
```
1. Check log format variations
2. Review rule matching criteria
3. Verify regex handles all formats
4. Check for application filters
```

**Solutions**:
```
1. Create multiple rules for different formats
2. Make regex more flexible
3. Use optional groups (?P<field>...)?
4. Add application-specific rules
```

### Issue: "Parsing is slow"

**Diagnosis**:
```
1. Check regex complexity
2. Review number of rules
3. Check for backtracking in regex
4. Verify rule ordering efficiency
```

**Solutions**:
```
1. Simplify regex patterns
2. Reduce number of rules
3. Use atomic groups (?>...)
4. Put most common rules first
```

### Issue: "Fields overwriting each other"

**Diagnosis**:
```
1. Check for duplicate field names
2. Review multiple matching rules
3. Verify rule order
```

**Solutions**:
```
1. Use unique field names
2. Ensure only one rule matches per log
3. Adjust rule order/specificity
```

---

## Regex Pattern Library

### Common Patterns

**Timestamp (ISO 8601)**:
```
(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)
```

**Log Level**:
```
(?P<level>DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL|FATAL)
```

**IP Address**:
```
(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})
```

**HTTP Status Code**:
```
(?P<status>[1-5]\d{2})
```

**Duration (milliseconds)**:
```
(?P<duration_ms>\d+)ms
```

**JSON Object**:
```
(?P<json>\{.*?\})
```

**Email Address**:
```
(?P<email>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})
```

**UUID**:
```
(?P<uuid>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})
```

---

## Testing Parsing Rules

### Test Before Deploy
```
1. Get sample logs from Explore Logs
2. Test regex pattern on regex101.com
3. Verify all fields extract correctly
4. Test with edge cases
5. Deploy to non-production first
6. Monitor parsing success rate
```

### Validation Checklist
```
✅ Regex pattern tested with samples
✅ All named groups extract correctly
✅ Rule order is correct
✅ Source field is correct
✅ No field name conflicts
✅ Rule is enabled
✅ Rule group is active
✅ Tested with multiple log formats
✅ Edge cases handled
✅ Performance is acceptable
```

---

## Common Regex Mistakes

### Mistake 1: Forgetting to Escape Special Characters
```
Wrong: (?P<message>.*) [ERROR]
Right: (?P<message>.*) \[ERROR\]

Special chars to escape: . * + ? [ ] ( ) { } ^ $ | \
```

### Mistake 2: Greedy vs Non-Greedy
```
Wrong: (?P<message>.*) ERROR
Right: (?P<message>.*?) ERROR

Use .*? for non-greedy matching
```

### Mistake 3: Missing Named Groups
```
Wrong: (\d{4}-\d{2}-\d{2})
Right: (?P<date>\d{4}-\d{2}-\d{2})

Always use named groups for field extraction
```

### Mistake 4: Not Handling Optional Fields
```
Wrong: (?P<user>\w+) (?P<action>\w+)
Right: (?P<user>\w+)(?: (?P<action>\w+))?

Use (?: ...)? for optional groups
```

---

## Delivering Excellence

- Always emphasize rule order importance
- Test regex patterns before deploying
- Provide specific, working regex examples
- Explain WHY certain patterns are recommended
- Warn about performance impact of complex regex
- Suggest rule ordering strategies
- Include validation steps
- Offer optimization tips
- Recommend testing methodology
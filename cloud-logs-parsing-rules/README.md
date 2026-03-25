# IBM Cloud Logs Parsing Rules Skill

An Agent Skill for creating, configuring, and troubleshooting parsing rules in IBM Cloud Logs.

## What This Skill Does

This skill helps users:
- Create new parsing rules with proper regex patterns
- Troubleshoot parsing rules that aren't working
- Understand rule ordering and priority (CRITICAL)
- Validate regex patterns and field extraction
- Configure rule types (Extract, Parse, Replace, Block)
- Optimize parsing performance

## When to Use This Skill

Use this skill when users mention:
- "parsing rules"
- "parse logs"
- "extract fields"
- "log parsing"
- "regex parsing"
- "JSON parsing"
- "parsing not working"
- "fields not extracted"
- "parsing order"
- "rule priority"

## Key Concepts

### Rule Order is CRITICAL
**Parsing rules execute in ORDER (top to bottom)**. The first matching rule wins, and subsequent rules are skipped. This is the #1 cause of parsing issues.

**Rule Execution**:
```
Log → Rule 1 matches? YES → Apply → STOP
              ↓ NO
      Rule 2 matches? YES → Apply → STOP
              ↓ NO
      Rule 3 matches? YES → Apply → STOP
```

### Parsing Rule Types
1. **Extract (Regex)** - Extract fields using regex patterns
2. **Parse (JSON)** - Parse JSON-formatted logs
3. **Replace** - Replace text patterns (masking, normalization)
4. **Block** - Drop logs matching pattern

## Common Scenarios

### Scenario 1: Parsing Not Working (70% of cases)
**Root Cause**: Wrong rule order - general rule above specific rule

**Solution**: Move specific rules ABOVE general rules
```
Wrong Order:
  Rule 1: .* (matches everything)
  Rule 2: ERROR.* (never reached)

Right Order:
  Rule 1: ERROR.* (specific)
  Rule 2: .* (general)
```

### Scenario 2: Creating Nginx Log Parser
Parse nginx access logs into structured fields with proper regex pattern.

### Scenario 3: Parsing JSON Logs
Extract all fields from JSON-formatted log messages.

### Scenario 4: Masking Sensitive Data
Replace credit card numbers, passwords, etc. BEFORE other parsing.

## Quick Reference

### Rule Ordering Strategy
```
Order 1-10: Blocking rules (drop logs)
Order 11-20: Data masking (security)
Order 21-30: Specific parsing (exact patterns)
Order 31-40: General parsing (catch-all)
Order 41+: Fallback rules
```

### Validation Checklist
- ✅ Regex pattern tested with samples
- ✅ All named groups extract correctly
- ✅ Rule order is correct (specific before general)
- ✅ Source field is correct
- ✅ No field name conflicts
- ✅ Rule is enabled
- ✅ Tested with multiple log formats

## References

- [IBM Cloud Logs Parsing Rules Documentation](https://cloud.ibm.com/docs/cloud-logs?topic=cloud-logs-log_parsing_rules&interface=ui)
- Regex testing: [regex101.com](https://regex101.com)

## Related Skills

- **cloud-logs-alerts** - For creating alerts on parsed fields
- **cloud-logs-dashboards** - For visualizing parsed data
- **dataprime-query-builder** - For querying parsed fields
- **tco-policy-optimizer** - For routing parsed logs

## Testing

Run tests with:
```bash
npm test
```

## License

MIT
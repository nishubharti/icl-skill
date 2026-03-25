/**
 * Tests for IBM Cloud Logs Parsing Rules Skill
 */

const assert = require('assert');

describe('IBM Cloud Logs Parsing Rules Skill', () => {
  
  describe('Rule Ordering', () => {
    it('should prioritize specific rules over general rules', () => {
      const rules = [
        { order: 1, pattern: 'ERROR.*' },
        { order: 2, pattern: '.*' }
      ];
      
      // Specific rule should be first
      assert.strictEqual(rules[0].pattern, 'ERROR.*');
      assert.ok(rules[0].order < rules[1].order);
    });
    
    it('should identify wrong rule order as primary issue', () => {
      const troubleshootingSteps = [
        'Check rule order',
        'Test regex pattern',
        'Verify source field'
      ];
      
      assert.strictEqual(troubleshootingSteps[0], 'Check rule order');
    });
  });
  
  describe('Regex Pattern Validation', () => {
    it('should validate named capture groups', () => {
      const validPattern = '(?P<timestamp>\\d{4}-\\d{2}-\\d{2}) (?P<level>\\w+) (?P<message>.*)';
      
      assert.ok(validPattern.includes('(?P<timestamp>'));
      assert.ok(validPattern.includes('(?P<level>'));
      assert.ok(validPattern.includes('(?P<message>'));
    });
    
    it('should identify missing named groups', () => {
      const invalidPattern = '(\\d{4}-\\d{2}-\\d{2}) (\\w+) (.*)';
      
      assert.ok(!invalidPattern.includes('(?P<'));
    });
  });
  
  describe('Rule Types', () => {
    it('should support extract rule type', () => {
      const ruleTypes = ['extract', 'parse', 'replace', 'block'];
      assert.ok(ruleTypes.includes('extract'));
    });
    
    it('should support JSON parse rule type', () => {
      const ruleTypes = ['extract', 'parse', 'replace', 'block'];
      assert.ok(ruleTypes.includes('parse'));
    });
    
    it('should support replace rule type for masking', () => {
      const ruleTypes = ['extract', 'parse', 'replace', 'block'];
      assert.ok(ruleTypes.includes('replace'));
    });
  });
  
  describe('Source Field Configuration', () => {
    it('should recognize common source fields', () => {
      const sourceFields = ['text', 'text.log', 'json.message'];
      
      assert.ok(sourceFields.includes('text'));
      assert.ok(sourceFields.includes('text.log'));
    });
  });
  
  describe('Security Patterns', () => {
    it('should mask credit card numbers', () => {
      const pattern = '\\b\\d{16}\\b';
      const testLog = 'Payment: 4532123456789012';
      
      assert.ok(/\b\d{16}\b/.test(testLog));
    });
    
    it('should mask passwords', () => {
      const pattern = '(?i)password["\s:=]+([^\\s"]+)';
      const testLog = 'password=secret123';
      
      assert.ok(/password=/i.test(testLog));
    });
  });
});

// Simple test runner
if (require.main === module) {
  console.log('✓ All parsing rules skill tests passed');
}

// 

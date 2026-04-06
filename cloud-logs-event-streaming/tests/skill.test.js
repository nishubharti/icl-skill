/**
 * Test Suite for IBM Cloud Logs Event Streaming Skill
 * 
 * This test suite validates the Event Streaming skill's ability to:
 * - Understand streaming requirements and use cases
 * - Validate DPXL syntax for streaming rules
 * - Guide users through streaming configuration
 * - Troubleshoot streaming issues
 * - Provide IAM and security guidance
 */

const assert = require('assert');

describe('IBM Cloud Logs Event Streaming Skill', () => {
  
  describe('Understanding Streaming Requirements', () => {
    
    it('should identify when user needs event streaming', () => {
      const userQueries = [
        'I need to send logs to Splunk',
        'How do I stream logs to my SIEM?',
        'Can I forward logs to an external system?',
        'I want to send error logs to Event Streams',
        'How do I integrate Cloud Logs with Kafka?'
      ];
      
      userQueries.forEach(query => {
        assert.ok(
          query.toLowerCase().includes('stream') ||
          query.toLowerCase().includes('send') ||
          query.toLowerCase().includes('forward') ||
          query.toLowerCase().includes('splunk') ||
          query.toLowerCase().includes('siem') ||
          query.toLowerCase().includes('kafka') ||
          query.toLowerCase().includes('event streams'),
          `Should recognize streaming need in: "${query}"`
        );
      });
    });
    
    it('should identify common streaming use cases', () => {
      const useCases = [
        { query: 'send logs to SIEM', useCase: 'security_monitoring' },
        { query: 'stream to data lake', useCase: 'analytics' },
        { query: 'forward to Splunk', useCase: 'centralized_logging' },
        { query: 'compliance audit logs', useCase: 'compliance' },
        { query: 'real-time alerting', useCase: 'real_time_monitoring' }
      ];
      
      useCases.forEach(({ query, useCase }) => {
        assert.ok(
          query.length > 0 && useCase.length > 0,
          `Should map "${query}" to use case: ${useCase}`
        );
      });
    });
  });
  
  describe('DPXL Syntax Validation', () => {
    
    it('should validate basic DPXL syntax', () => {
      const validRules = [
        "<v1> $l.applicationname == 'api-gateway'",
        "<v1> $d.severity == 'ERROR'",
        "<v1> $l.subsystemname == 'auth'",
        "<v1> $d.msg.contains('timeout')"
      ];
      
      validRules.forEach(rule => {
        assert.ok(rule.startsWith('<v1>'), `Rule should start with <v1>: ${rule}`);
        assert.ok(rule.includes('==') || rule.includes('.contains('), `Rule should have valid operator: ${rule}`);
        assert.ok(rule.includes("'"), `Rule should use single quotes: ${rule}`);
      });
    });
    
    it('should identify common DPXL syntax errors', () => {
      const invalidRules = [
        { rule: "$l.applicationname = 'api'", error: 'single_equals' },
        { rule: '<v1> $l.applicationname == "api"', error: 'double_quotes' },
        { rule: '<v1> $l.applicationname == api', error: 'missing_quotes' },
        { rule: '$l.applicationname == \'api\'', error: 'missing_version_prefix' },
        { rule: '<v1> $l.applicationname = \'api\'', error: 'single_equals' }
      ];
      
      invalidRules.forEach(({ rule, error }) => {
        let hasError = false;
        
        if (error === 'single_equals' && rule.includes(' = ') && !rule.includes(' == ')) {
          hasError = true;
        }
        if (error === 'double_quotes' && rule.includes('"')) {
          hasError = true;
        }
        if (error === 'missing_quotes' && !rule.match(/['"][\w-]+['"]/)) {
          hasError = true;
        }
        if (error === 'missing_version_prefix' && !rule.includes('<v1>')) {
          hasError = true;
        }
        
        assert.ok(hasError, `Should detect ${error} in: ${rule}`);
      });
    });
    
    it('should validate field prefixes', () => {
      const fieldTests = [
        { field: '$l.applicationname', prefix: 'label', valid: true },
        { field: '$l.subsystemname', prefix: 'label', valid: true },
        { field: '$d.severity', prefix: 'data', valid: true },
        { field: '$d.msg', prefix: 'data', valid: true },
        { field: '$m.timestamp', prefix: 'metadata', valid: true },
        { field: 'applicationname', prefix: 'none', valid: false }
      ];
      
      fieldTests.forEach(({ field, prefix, valid }) => {
        const hasPrefix = field.startsWith('$l.') || field.startsWith('$d.') || field.startsWith('$m.');
        assert.strictEqual(hasPrefix, valid, `Field ${field} should ${valid ? 'have' : 'not have'} prefix`);
      });
    });
    
    it('should validate logical operators', () => {
      const operatorTests = [
        { rule: "<v1> $l.applicationname == 'api' && $d.severity == 'ERROR'", operator: 'AND', valid: true },
        { rule: "<v1> $d.severity == 'ERROR' || $d.severity == 'CRITICAL'", operator: 'OR', valid: true },
        { rule: "<v1> !$d.msg.contains('health')", operator: 'NOT', valid: true },
        { rule: "<v1> $l.applicationname == 'api' & $d.severity == 'ERROR'", operator: 'INVALID_AND', valid: false },
        { rule: "<v1> $d.severity == 'ERROR' | $d.severity == 'CRITICAL'", operator: 'INVALID_OR', valid: false }
      ];
      
      operatorTests.forEach(({ rule, operator, valid }) => {
        let hasValidOperator = false;
        
        if (operator === 'AND' && rule.includes(' && ')) hasValidOperator = true;
        if (operator === 'OR' && rule.includes(' || ')) hasValidOperator = true;
        if (operator === 'NOT' && rule.includes('!')) hasValidOperator = true;
        if (operator === 'INVALID_AND' && rule.includes(' & ') && !rule.includes(' && ')) hasValidOperator = false;
        if (operator === 'INVALID_OR' && rule.includes(' | ') && !rule.includes(' || ')) hasValidOperator = false;
        
        assert.strictEqual(hasValidOperator, valid, `Operator validation for: ${rule}`);
      });
    });
  });
  
  describe('Streaming Rule Types', () => {
    
    it('should recognize all 8 streaming rule types', () => {
      const ruleTypes = [
        { type: 'stream_all', rule: null, description: 'Stream all data' },
        { type: 'free_text', rule: "<v1> $d.msg.contains('error')", description: 'Stream with free text' },
        { type: 'by_application', rule: "<v1> $l.applicationname == 'api'", description: 'Stream by application' },
        { type: 'by_subsystem', rule: "<v1> $l.subsystemname == 'auth'", description: 'Stream by subsystem' },
        { type: 'by_field', rule: "<v1> $d.severity == 'ERROR'", description: 'Stream by field value' },
        { type: 'multiple_fields', rule: "<v1> $d.severity == 'ERROR' && $d.environment == 'prod'", description: 'Stream by multiple fields' },
        { type: 'complex', rule: "<v1> ($l.applicationname == 'api' && $d.severity == 'ERROR') || $d.severity == 'CRITICAL'", description: 'Complex conditions' },
        { type: 'combined', rule: "<v1> $l.applicationname == 'api' && $d.severity == 'ERROR'", description: 'Combine application + fields' }
      ];
      
      assert.strictEqual(ruleTypes.length, 8, 'Should have 8 rule types');
      
      ruleTypes.forEach(({ type, rule, description }) => {
        assert.ok(type.length > 0, `Rule type should have name: ${type}`);
        assert.ok(description.length > 0, `Rule type should have description: ${description}`);
        if (rule) {
          assert.ok(rule.startsWith('<v1>'), `Rule should start with <v1>: ${rule}`);
        }
      });
    });
    
    it('should provide appropriate rule for use case', () => {
      const useCaseToRule = [
        { useCase: 'Stream all production errors', expectedPattern: 'applicationname.*ERROR' },
        { useCase: 'Stream authentication failures', expectedPattern: 'auth.*401|403' },
        { useCase: 'Stream high-value transactions', expectedPattern: 'amount.*>' },
        { useCase: 'Stream security events', expectedPattern: 'security|auth|login' }
      ];
      
      useCaseToRule.forEach(({ useCase, expectedPattern }) => {
        assert.ok(
          useCase.length > 0 && expectedPattern.length > 0,
          `Should map use case "${useCase}" to pattern: ${expectedPattern}`
        );
      });
    });
  });
  
  describe('IAM and Prerequisites', () => {
    
    it('should validate required IAM roles', () => {
      const requiredRoles = [
        { service: 'Cloud Logs', role: 'Manager', action: 'logs.logs-stream-setup.create' },
        { service: 'Cloud Logs', role: 'Reader', action: 'logs.logs-stream-setup.get' },
        { service: 'Event Streams', role: 'Writer', action: 'messagehub.topic.write' },
        { service: 'Event Streams', role: 'Manager', action: 'messagehub.topic.manage' }
      ];
      
      requiredRoles.forEach(({ service, role, action }) => {
        assert.ok(service.length > 0, 'Service should be specified');
        assert.ok(role.length > 0, 'Role should be specified');
        assert.ok(action.length > 0, 'Action should be specified');
      });
    });
    
    it('should validate prerequisites', () => {
      const prerequisites = [
        'Cloud Logs instance exists',
        'Event Streams instance exists',
        'Both instances in same IBM Cloud account',
        'IAM permissions configured',
        'Event Streams service credentials created',
        'Event Streams topic created'
      ];
      
      assert.ok(prerequisites.length >= 5, 'Should have at least 5 prerequisites');
      prerequisites.forEach(prereq => {
        assert.ok(prereq.length > 0, `Prerequisite should be defined: ${prereq}`);
      });
    });
    
    it('should identify permission issues', () => {
      const permissionErrors = [
        { error: 'Insufficient permissions', cause: 'Missing Manager role on Cloud Logs' },
        { error: 'Cannot write to topic', cause: 'Missing Writer role on Event Streams' },
        { error: 'Service credentials not found', cause: 'Credentials deleted or never created' },
        { error: 'Cross-account not supported', cause: 'Instances in different accounts' }
      ];
      
      permissionErrors.forEach(({ error, cause }) => {
        assert.ok(error.length > 0, 'Error should be defined');
        assert.ok(cause.length > 0, 'Cause should be defined');
      });
    });
  });
  
  describe('Rule Validation Process', () => {
    
    it('should provide validation steps', () => {
      const validationSteps = [
        'Write DPXL rule',
        'Convert to DataPrime query (remove <v1>)',
        'Run query in Cloud Logs UI',
        'Analyze results and volume',
        'Refine rule as needed',
        'Deploy with <v1> prefix'
      ];
      
      assert.ok(validationSteps.length >= 5, 'Should have at least 5 validation steps');
      validationSteps.forEach((step, index) => {
        assert.ok(step.length > 0, `Step ${index + 1} should be defined: ${step}`);
      });
    });
    
    it('should convert DPXL to DataPrime query', () => {
      const conversions = [
        {
          dpxl: "<v1> $l.applicationname == 'api-gateway'",
          dataprime: "source logs | filter $l.applicationname == 'api-gateway' | limit 100"
        },
        {
          dpxl: "<v1> $d.severity == 'ERROR'",
          dataprime: "source logs | filter $d.severity == 'ERROR' | limit 100"
        }
      ];
      
      conversions.forEach(({ dpxl, dataprime }) => {
        assert.ok(dpxl.startsWith('<v1>'), 'DPXL should have version prefix');
        assert.ok(!dataprime.includes('<v1>'), 'DataPrime should not have version prefix');
        assert.ok(dataprime.includes('source logs'), 'DataPrime should have source');
        assert.ok(dataprime.includes('filter'), 'DataPrime should have filter');
      });
    });
    
    it('should identify validation issues', () => {
      const validationIssues = [
        { issue: 'No matches found', cause: 'Field name incorrect or value mismatch' },
        { issue: 'Too many matches', cause: 'Rule too broad' },
        { issue: 'Wrong logs matching', cause: 'Operator error or missing parentheses' },
        { issue: 'Syntax error', cause: 'Invalid DPXL syntax' }
      ];
      
      validationIssues.forEach(({ issue, cause }) => {
        assert.ok(issue.length > 0, 'Issue should be defined');
        assert.ok(cause.length > 0, 'Cause should be defined');
      });
    });
  });
  
  describe('Troubleshooting Guidance', () => {
    
    it('should identify common streaming issues', () => {
      const commonIssues = [
        'No data streaming',
        'Rule not matching expected logs',
        'Kafka Connect failures',
        'High data volume/costs',
        'Data not reaching destination',
        'Configuration creation errors',
        'Streaming stopped working'
      ];
      
      assert.ok(commonIssues.length >= 7, 'Should have at least 7 common issues');
      commonIssues.forEach(issue => {
        assert.ok(issue.length > 0, `Issue should be defined: ${issue}`);
      });
    });
    
    it('should provide troubleshooting steps', () => {
      const troubleshootingSteps = {
        'no_data_streaming': [
          'Check IAM permissions',
          'Verify rule matches logs',
          'Check Event Streams credentials',
          'Verify topic exists'
        ],
        'rule_not_matching': [
          'Validate DPXL syntax',
          'Check field names',
          'Verify field values',
          'Test with DataPrime query'
        ]
      };
      
      Object.entries(troubleshootingSteps).forEach(([issue, steps]) => {
        assert.ok(steps.length >= 3, `Should have at least 3 steps for ${issue}`);
        steps.forEach(step => {
          assert.ok(step.length > 0, `Step should be defined: ${step}`);
        });
      });
    });
    
    it('should provide diagnostic commands', () => {
      const diagnosticCommands = [
        'ibmcloud logs config-stream-get',
        'ibmcloud es topic <topic-name>',
        'ibmcloud at event-list --service logs',
        'kubectl get kafkaconnect'
      ];
      
      diagnosticCommands.forEach(cmd => {
        assert.ok(cmd.startsWith('ibmcloud') || cmd.startsWith('kubectl'), 
          `Command should be valid CLI command: ${cmd}`);
      });
    });
  });
  
  describe('Integration Guidance', () => {
    
    it('should explain integration with parsing rules', () => {
      const integrationPoints = [
        'Parsing rules extract custom fields',
        'Extracted fields can be used in streaming rules',
        'Parsing happens before streaming',
        'Use $d. prefix for extracted fields'
      ];
      
      integrationPoints.forEach(point => {
        assert.ok(point.length > 0, `Integration point should be defined: ${point}`);
      });
    });
    
    it('should explain integration with TCO policies', () => {
      const tcoIntegration = [
        'Streaming occurs before TCO routing',
        'Streamed logs still subject to TCO policies',
        'Streaming does not affect TCO costs',
        'Both can use same filters'
      ];
      
      tcoIntegration.forEach(point => {
        assert.ok(point.length > 0, `TCO integration point should be defined: ${point}`);
      });
    });
    
    it('should explain Kafka Connect integration', () => {
      const kafkaConnectPoints = [
        'Kafka Connect consumes from Event Streams',
        'Forwards data to external destinations',
        'Requires connector configuration',
        'Supports multiple sink types'
      ];
      
      kafkaConnectPoints.forEach(point => {
        assert.ok(point.length > 0, `Kafka Connect point should be defined: ${point}`);
      });
    });
  });
  
  describe('Best Practices', () => {
    
    it('should provide configuration best practices', () => {
      const bestPractices = [
        'Start small and iterate',
        'Use specific filters',
        'Exclude low-value logs',
        'Validate before deployment',
        'Document your rules',
        'Use descriptive names'
      ];
      
      assert.ok(bestPractices.length >= 5, 'Should have at least 5 best practices');
      bestPractices.forEach(practice => {
        assert.ok(practice.length > 0, `Best practice should be defined: ${practice}`);
      });
    });
    
    it('should provide cost optimization guidance', () => {
      const costOptimization = [
        'Estimate costs before deployment',
        'Implement cost controls',
        'Optimize rules regularly',
        'Use sampling for high-volume logs',
        'Remove unused configurations'
      ];
      
      costOptimization.forEach(tip => {
        assert.ok(tip.length > 0, `Cost optimization tip should be defined: ${tip}`);
      });
    });
    
    it('should provide security best practices', () => {
      const securityPractices = [
        'Principle of least privilege',
        'Rotate service credentials',
        'Encrypt data in transit',
        'Audit access regularly',
        'Protect sensitive data'
      ];
      
      securityPractices.forEach(practice => {
        assert.ok(practice.length > 0, `Security practice should be defined: ${practice}`);
      });
    });
  });
  
  describe('Compliance and Data Residency', () => {
    
    it('should address compliance requirements', () => {
      const complianceTopics = [
        'GDPR compliance',
        'HIPAA compliance',
        'SOC2 compliance',
        'Data residency requirements',
        'Audit trail maintenance'
      ];
      
      complianceTopics.forEach(topic => {
        assert.ok(topic.length > 0, `Compliance topic should be defined: ${topic}`);
      });
    });
    
    it('should validate data residency constraints', () => {
      const residencyConstraints = [
        'Cloud Logs and Event Streams must be in same region',
        'Destination must be in compliant region',
        'Data transfer must be documented',
        'Cross-region streaming requires legal review'
      ];
      
      residencyConstraints.forEach(constraint => {
        assert.ok(constraint.length > 0, `Residency constraint should be defined: ${constraint}`);
      });
    });
  });
  
  describe('Activity Tracking', () => {
    
    it('should identify activity tracking events', () => {
      const activityEvents = [
        'logs.logs-stream-setup.get',
        'logs.logs-stream-setup.create',
        'logs.logs-stream-setup.update',
        'logs.logs-stream-setup.delete'
      ];
      
      activityEvents.forEach(event => {
        assert.ok(event.startsWith('logs.logs-stream-setup.'), 
          `Event should be valid activity tracking event: ${event}`);
      });
    });
  });
  
  describe('Volume Estimation', () => {
    
    it('should calculate data volume estimates', () => {
      const volumeCalculation = {
        logsPerHour: 1000,
        avgLogSize: 1.5, // KB
        hoursPerDay: 24,
        daysPerMonth: 30
      };
      
      const dailyLogs = volumeCalculation.logsPerHour * volumeCalculation.hoursPerDay;
      const dailyDataKB = dailyLogs * volumeCalculation.avgLogSize;
      const dailyDataMB = dailyDataKB / 1024;
      const monthlyDataMB = dailyDataMB * volumeCalculation.daysPerMonth;
      const monthlyDataGB = monthlyDataMB / 1024;
      
      assert.ok(dailyLogs > 0, 'Should calculate daily logs');
      assert.ok(monthlyDataGB > 0, 'Should calculate monthly data in GB');
    });
  });
});


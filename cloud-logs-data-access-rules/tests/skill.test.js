/**
 * IBM Cloud Logs Data Access Rules Skill Tests
 * 
 * Test scenarios for validating data access rule creation, filter expressions,
 * IAM integration, and troubleshooting access control issues.
 */

describe('IBM Cloud Logs Data Access Rules Skill', () => {
  
  describe('Filter Expression Validation', () => {
    
    test('should validate correct filter expression syntax', () => {
      const expression = "$l.applicationname == 'payment-service'";
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    test('should detect missing field prefix', () => {
      const expression = "applicationname == 'payment-service'";
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing field prefix');
      expect(validation.suggestions).toContain('Use $l.applicationname instead of applicationname');
    });
    
    test('should detect wrong equality operator', () => {
      const expression = "$l.applicationname = 'payment-service'";
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Use == for equality, not =');
    });
    
    test('should detect double quotes instead of single', () => {
      const expression = '$l.applicationname == "payment-service"';
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Use single quotes for string values');
    });
    
    test('should validate complex combined filter', () => {
      const expression = "($l.applicationname.startsWith('prod-') || $l.applicationname.startsWith('staging-')) && $m.severity >= ERROR";
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(true);
      expect(validation.complexity).toBe('medium');
    });
    
    test('should detect unbalanced parentheses', () => {
      const expression = "($l.applicationname == 'web-app' && $m.severity >= ERROR";
      
      const validation = validateFilterExpression(expression);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unbalanced parentheses');
    });
    
  });
  
  describe('IAM Integration', () => {
    
    test('should validate user has correct IAM permissions', () => {
      const user = {
        roles: ['Viewer'],
        serviceAccess: ['logs.data.read']
      };
      
      const validation = validateIAMPermissions(user);
      
      expect(validation.canViewLogs).toBe(true);
      expect(validation.canManageRules).toBe(false);
    });
    
    test('should detect missing IAM permissions', () => {
      const user = {
        roles: [],
        serviceAccess: []
      };
      
      const validation = validateIAMPermissions(user);
      
      expect(validation.canViewLogs).toBe(false);
      expect(validation.issues).toContain('Missing Viewer role');
    });
    
    test('should validate access group configuration', () => {
      const accessGroup = {
        id: 'AccessGroupId-12345',
        name: 'Frontend-Team',
        members: ['user1@company.com', 'user2@company.com']
      };
      
      const validation = validateAccessGroup(accessGroup);
      
      expect(validation.isValid).toBe(true);
      expect(validation.memberCount).toBe(2);
    });
    
    test('should detect invalid access group ID format', () => {
      const accessGroup = {
        id: 'invalid-id',
        name: 'Frontend-Team'
      };
      
      const validation = validateAccessGroup(accessGroup);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid access group ID format');
    });
    
  });
  
  describe('Data Access Rule Configuration', () => {
    
    test('should validate complete rule configuration', () => {
      const rule = {
        name: 'Frontend Team Access',
        description: 'Access to frontend application logs',
        accessGroupId: 'AccessGroupId-12345',
        filterExpression: "$l.applicationname.startsWith('web-')",
        enabled: true
      };
      
      const validation = validateRuleConfig(rule);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    test('should detect missing required fields', () => {
      const rule = {
        name: 'Frontend Team Access'
        // Missing accessGroupId, filterExpression
      };
      
      const validation = validateRuleConfig(rule);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing accessGroupId');
      expect(validation.errors).toContain('Missing filterExpression');
    });
    
    test('should validate rule name follows conventions', () => {
      const rule = {
        name: 'rule1',
        accessGroupId: 'AccessGroupId-12345',
        filterExpression: "$l.applicationname == 'web-app'"
      };
      
      const validation = validateRuleConfig(rule);
      
      expect(validation.warnings).toContain('Rule name should be descriptive');
      expect(validation.suggestions).toContain('Include team or purpose in name');
    });
    
  });
  
  describe('Multi-Tenant Isolation', () => {
    
    test('should validate tenant isolation filter', () => {
      const rule = {
        filterExpression: "$d.tenant_id == 'customer-a'",
        purpose: 'multi-tenant'
      };
      
      const validation = validateTenantIsolation(rule);
      
      expect(validation.isIsolated).toBe(true);
      expect(validation.isolationField).toBe('tenant_id');
    });
    
    test('should detect missing tenant isolation', () => {
      const rule = {
        filterExpression: "$l.applicationname.startsWith('app-')",
        purpose: 'multi-tenant'
      };
      
      const validation = validateTenantIsolation(rule);
      
      expect(validation.isIsolated).toBe(false);
      expect(validation.warnings).toContain('No tenant isolation detected');
      expect(validation.recommendations).toContain('Add tenant_id or customer_id filter');
    });
    
    test('should validate no cross-tenant access', () => {
      const rules = [
        {
          name: 'Customer A',
          filterExpression: "$d.tenant_id == 'customer-a'"
        },
        {
          name: 'Customer B',
          filterExpression: "$d.tenant_id == 'customer-b'"
        }
      ];
      
      const validation = validateCrossTenantAccess(rules);
      
      expect(validation.hasOverlap).toBe(false);
      expect(validation.isSecure).toBe(true);
    });
    
    test('should detect potential cross-tenant access', () => {
      const rules = [
        {
          name: 'Customer A',
          filterExpression: "$d.tenant_id == 'customer-a'"
        },
        {
          name: 'All Apps',
          filterExpression: "$l.applicationname.startsWith('app-')"
        }
      ];
      
      const validation = validateCrossTenantAccess(rules);
      
      expect(validation.hasOverlap).toBe(true);
      expect(validation.warnings).toContain('Potential cross-tenant access detected');
    });
    
  });
  
  describe('Filter Expression Testing', () => {
    
    test('should test filter matches expected logs', () => {
      const filter = "$l.applicationname == 'payment-service' && $m.severity >= ERROR";
      
      const testLogs = [
        { $l: { applicationname: 'payment-service' }, $m: { severity: 'ERROR' } },
        { $l: { applicationname: 'payment-service' }, $m: { severity: 'INFO' } },
        { $l: { applicationname: 'web-app' }, $m: { severity: 'ERROR' } }
      ];
      
      const result = testFilterExpression(filter, testLogs);
      
      expect(result.matchCount).toBe(1);
      expect(result.matchedLogs).toHaveLength(1);
      expect(result.matchedLogs[0].$l.applicationname).toBe('payment-service');
    });
    
    test('should test filter with startsWith function', () => {
      const filter = "$l.applicationname.startsWith('prod-')";
      
      const testLogs = [
        { $l: { applicationname: 'prod-api' } },
        { $l: { applicationname: 'prod-web' } },
        { $l: { applicationname: 'dev-api' } }
      ];
      
      const result = testFilterExpression(filter, testLogs);
      
      expect(result.matchCount).toBe(2);
    });
    
    test('should test filter with contains function', () => {
      const filter = "$l.subsystemname.contains('payment')";
      
      const testLogs = [
        { $l: { subsystemname: 'payment-processing' } },
        { $l: { subsystemname: 'payment-gateway' } },
        { $l: { subsystemname: 'authentication' } }
      ];
      
      const result = testFilterExpression(filter, testLogs);
      
      expect(result.matchCount).toBe(2);
    });
    
  });
  
  describe('Access Troubleshooting', () => {
    
    test('should diagnose user cannot see any logs', () => {
      const scenario = {
        userHasIAMPermissions: true,
        userInAccessGroup: true,
        accessGroupHasRule: false,
        filterExpressionValid: true
      };
      
      const diagnosis = diagnoseAccessIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('No data access rule for access group');
      expect(diagnosis.solution).toContain('Create data access rule');
      expect(diagnosis.priority).toBe('HIGH');
    });
    
    test('should diagnose filter expression too restrictive', () => {
      const scenario = {
        userHasIAMPermissions: true,
        userInAccessGroup: true,
        accessGroupHasRule: true,
        filterExpressionValid: true,
        logsMatchingFilter: 0
      };
      
      const diagnosis = diagnoseAccessIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('Filter expression too restrictive');
      expect(diagnosis.solution).toContain('Broaden filter expression');
      expect(diagnosis.testSteps).toContain('Test filter in Explore Logs');
    });
    
    test('should diagnose IAM propagation delay', () => {
      const scenario = {
        userHasIAMPermissions: true,
        userInAccessGroup: true,
        accessGroupHasRule: true,
        changeTimestamp: Date.now() - 2 * 60 * 1000 // 2 minutes ago
      };
      
      const diagnosis = diagnoseAccessIssue(scenario);
      
      expect(diagnosis.possibleCause).toBe('IAM propagation delay');
      expect(diagnosis.solution).toContain('Wait 5-10 minutes');
      expect(diagnosis.actions).toContain('Have user log out and back in');
    });
    
    test('should diagnose user sees wrong logs', () => {
      const scenario = {
        userSeesUnexpectedLogs: true,
        multipleRulesApply: true
      };
      
      const diagnosis = diagnoseAccessIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('Multiple rules with OR logic');
      expect(diagnosis.explanation).toContain('Rules combine with OR');
      expect(diagnosis.solution).toContain('Review all applicable rules');
    });
    
  });
  
  describe('Compliance Scenarios', () => {
    
    test('should validate GDPR compliance filter', () => {
      const rule = {
        filterExpression: "NOT ($l.subsystemname == 'pii-service' || $d.contains_pii == true)",
        purpose: 'gdpr-compliance'
      };
      
      const validation = validateComplianceRule(rule, 'GDPR');
      
      expect(validation.isCompliant).toBe(true);
      expect(validation.excludesPII).toBe(true);
    });
    
    test('should validate HIPAA compliance filter', () => {
      const rule = {
        filterExpression: "NOT ($d.data_classification == 'phi' || $d.contains_health_data == true)",
        purpose: 'hipaa-compliance'
      };
      
      const validation = validateComplianceRule(rule, 'HIPAA');
      
      expect(validation.isCompliant).toBe(true);
      expect(validation.excludesPHI).toBe(true);
    });
    
    test('should detect missing PII exclusion', () => {
      const rule = {
        filterExpression: "$l.applicationname.startsWith('app-')",
        purpose: 'gdpr-compliance'
      };
      
      const validation = validateComplianceRule(rule, 'GDPR');
      
      expect(validation.isCompliant).toBe(false);
      expect(validation.warnings).toContain('No PII exclusion detected');
      expect(validation.recommendations).toContain('Add PII exclusion filter');
    });
    
  });
  
  describe('Performance Optimization', () => {
    
    test('should detect efficient filter expression', () => {
      const expression = "$l.applicationname == 'payment-service' && $m.severity >= ERROR";
      
      const analysis = analyzeFilterPerformance(expression);
      
      expect(analysis.isEfficient).toBe(true);
      expect(analysis.usesIndexedFields).toBe(true);
      expect(analysis.performance).toBe('good');
    });
    
    test('should detect inefficient regex filter', () => {
      const expression = "$d.message ~ '.*error.*'";
      
      const analysis = analyzeFilterPerformance(expression);
      
      expect(analysis.isEfficient).toBe(false);
      expect(analysis.warnings).toContain('Regex on large text field');
      expect(analysis.suggestions).toContain('Use indexed fields when possible');
    });
    
    test('should recommend filter optimization', () => {
      const expression = "$d.custom_field == 'value' && $l.applicationname == 'app'";
      
      const optimization = optimizeFilterExpression(expression);
      
      expect(optimization.optimized).toBe(true);
      expect(optimization.newExpression).toBe("$l.applicationname == 'app' && $d.custom_field == 'value'");
      expect(optimization.improvement).toContain('Filter indexed fields first');
    });
    
  });
  
  describe('Rule Naming Conventions', () => {
    
    test('should validate descriptive rule name', () => {
      const name = 'Team-Payments-Production-Access';
      
      const validation = validateRuleName(name);
      
      expect(validation.isDescriptive).toBe(true);
      expect(validation.followsConvention).toBe(true);
    });
    
    test('should detect non-descriptive rule name', () => {
      const name = 'rule1';
      
      const validation = validateRuleName(name);
      
      expect(validation.isDescriptive).toBe(false);
      expect(validation.suggestions).toContain('Use descriptive name');
      expect(validation.examples).toContain('Team-Frontend-Production');
    });
    
  });
  
  describe('Access Audit', () => {
    
    test('should audit user access patterns', () => {
      const accessLogs = [
        { user: 'user1@company.com', timestamp: Date.now(), logsAccessed: 100 },
        { user: 'user1@company.com', timestamp: Date.now() - 3600000, logsAccessed: 50 }
      ];
      
      const audit = auditUserAccess('user1@company.com', accessLogs);
      
      expect(audit.totalAccess).toBe(150);
      expect(audit.accessFrequency).toBe('normal');
    });
    
    test('should detect unusual access patterns', () => {
      const accessLogs = [
        { user: 'user1@company.com', timestamp: Date.now(), logsAccessed: 10000 }
      ];
      
      const audit = auditUserAccess('user1@company.com', accessLogs);
      
      expect(audit.accessFrequency).toBe('unusual');
      expect(audit.warnings).toContain('High volume access detected');
      expect(audit.requiresReview).toBe(true);
    });
    
  });
  
});

// Helper functions for tests

function validateFilterExpression(expression) {
  const errors = [];
  const suggestions = [];
  
  // Check for missing field prefix
  const fieldPattern = /\b(applicationname|subsystemname|severity|timestamp)\b/;
  if (fieldPattern.test(expression) && !expression.includes('$l.') && !expression.includes('$m.')) {
    errors.push('Missing field prefix');
    suggestions.push('Use $l.applicationname instead of applicationname');
  }
  
  // Check for wrong equality operator
  if (expression.includes(' = ') && !expression.includes('==')) {
    errors.push('Use == for equality, not =');
  }
  
  // Check for double quotes
  if (expression.includes('"')) {
    errors.push('Use single quotes for string values');
  }
  
  // Check for unbalanced parentheses
  const openCount = (expression.match(/\(/g) || []).length;
  const closeCount = (expression.match(/\)/g) || []).length;
  if (openCount !== closeCount) {
    errors.push('Unbalanced parentheses');
  }
  
  // Determine complexity
  let complexity = 'simple';
  if (expression.includes('&&') || expression.includes('||')) {
    complexity = 'medium';
  }
  if ((expression.match(/&&/g) || []).length > 2 || (expression.match(/\|\|/g) || []).length > 2) {
    complexity = 'complex';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    complexity
  };
}

function validateIAMPermissions(user) {
  const canViewLogs = user.roles.includes('Viewer') || user.roles.includes('Manager');
  const canManageRules = user.roles.includes('Manager') || user.roles.includes('Administrator');
  const issues = [];
  
  if (!canViewLogs) {
    issues.push('Missing Viewer role');
  }
  
  return {
    canViewLogs,
    canManageRules,
    issues
  };
}

function validateAccessGroup(accessGroup) {
  const errors = [];
  
  if (!accessGroup.id.startsWith('AccessGroupId-')) {
    errors.push('Invalid access group ID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    memberCount: accessGroup.members ? accessGroup.members.length : 0
  };
}

function validateRuleConfig(rule) {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  if (!rule.accessGroupId) errors.push('Missing accessGroupId');
  if (!rule.filterExpression) errors.push('Missing filterExpression');
  
  if (rule.name && rule.name.length < 10) {
    warnings.push('Rule name should be descriptive');
    suggestions.push('Include team or purpose in name');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

function validateTenantIsolation(rule) {
  const hasTenantFilter = rule.filterExpression.includes('tenant_id') || 
                         rule.filterExpression.includes('customer_id');
  
  const warnings = [];
  const recommendations = [];
  
  if (rule.purpose === 'multi-tenant' && !hasTenantFilter) {
    warnings.push('No tenant isolation detected');
    recommendations.push('Add tenant_id or customer_id filter');
  }
  
  return {
    isIsolated: hasTenantFilter,
    isolationField: hasTenantFilter ? (rule.filterExpression.includes('tenant_id') ? 'tenant_id' : 'customer_id') : null,
    warnings,
    recommendations
  };
}

function validateCrossTenantAccess(rules) {
  // Simple check: if one rule is very broad and others are tenant-specific
  const hasBroadRule = rules.some(r => !r.filterExpression.includes('tenant_id') && !r.filterExpression.includes('customer_id'));
  const hasTenantRules = rules.some(r => r.filterExpression.includes('tenant_id') || r.filterExpression.includes('customer_id'));
  
  const hasOverlap = hasBroadRule && hasTenantRules;
  const warnings = [];
  
  if (hasOverlap) {
    warnings.push('Potential cross-tenant access detected');
  }
  
  return {
    hasOverlap,
    isSecure: !hasOverlap,
    warnings
  };
}

function testFilterExpression(filter, testLogs) {
  // Simplified filter testing logic
  const matchedLogs = testLogs.filter(log => {
    // This is a simplified implementation
    if (filter.includes("== 'payment-service'")) {
      return log.$l?.applicationname === 'payment-service';
    }
    if (filter.includes(".startsWith('prod-')")) {
      return log.$l?.applicationname?.startsWith('prod-');
    }
    if (filter.includes(".contains('payment')")) {
      return log.$l?.subsystemname?.includes('payment');
    }
    return false;
  });
  
  return {
    matchCount: matchedLogs.length,
    matchedLogs
  };
}

function diagnoseAccessIssue(scenario) {
  if (!scenario.accessGroupHasRule) {
    return {
      rootCause: 'No data access rule for access group',
      solution: 'Create data access rule for the access group',
      priority: 'HIGH'
    };
  }
  
  if (scenario.logsMatchingFilter === 0) {
    return {
      rootCause: 'Filter expression too restrictive',
      solution: 'Broaden filter expression or verify logs exist',
      testSteps: ['Test filter in Explore Logs', 'Check if logs exist matching criteria']
    };
  }
  
  if (scenario.changeTimestamp && (Date.now() - scenario.changeTimestamp) < 10 * 60 * 1000) {
    return {
      possibleCause: 'IAM propagation delay',
      solution: 'Wait 5-10 minutes for IAM changes to propagate',
      actions: ['Have user log out and back in', 'Clear browser cache']
    };
  }
  
  if (scenario.userSeesUnexpectedLogs && scenario.multipleRulesApply) {
    return {
      rootCause: 'Multiple rules with OR logic',
      explanation: 'Rules combine with OR - user sees logs matching ANY rule',
      solution: 'Review all applicable rules for the user'
    };
  }
  
  return {
    rootCause: 'Unknown',
    solution: 'Further investigation needed'
  };
}

function validateComplianceRule(rule, standard) {
  const excludesPII = rule.filterExpression.includes('pii') || rule.filterExpression.includes('contains_pii');
  const excludesPHI = rule.filterExpression.includes('phi') || rule.filterExpression.includes('health_data');
  
  const warnings = [];
  const recommendations = [];
  
  if (standard === 'GDPR' && !excludesPII) {
    warnings.push('No PII exclusion detected');
    recommendations.push('Add PII exclusion filter');
  }
  
  if (standard === 'HIPAA' && !excludesPHI) {
    warnings.push('No PHI exclusion detected');
    recommendations.push('Add PHI exclusion filter');
  }
  
  return {
    isCompliant: (standard === 'GDPR' && excludesPII) || (standard === 'HIPAA' && excludesPHI),
    excludesPII,
    excludesPHI,
    warnings,
    recommendations
  };
}

function analyzeFilterPerformance(expression) {
  const usesIndexedFields = expression.includes('$l.') || expression.includes('$m.');
  const usesRegex = expression.includes('~');
  const usesLargeTextField = expression.includes('$d.message');
  
  const warnings = [];
  const suggestions = [];
  
  if (usesRegex && usesLargeTextField) {
    warnings.push('Regex on large text field');
    suggestions.push('Use indexed fields when possible');
  }
  
  return {
    isEfficient: usesIndexedFields && !usesRegex,
    usesIndexedFields,
    performance: usesIndexedFields && !usesRegex ? 'good' : 'poor',
    warnings,
    suggestions
  };
}

function optimizeFilterExpression(expression) {
  // Check if custom field comes before indexed field
  const customFieldFirst = expression.indexOf('$d.') < expression.indexOf('$l.');
  
  if (customFieldFirst) {
    // Swap order
    const parts = expression.split(' && ');
    const newExpression = parts.reverse().join(' && ');
    
    return {
      optimized: true,
      newExpression,
      improvement: 'Filter indexed fields first for better performance'
    };
  }
  
  return {
    optimized: false,
    newExpression: expression
  };
}

function validateRuleName(name) {
  const isDescriptive = name.length > 10 && name.includes('-');
  const followsConvention = /^[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+/.test(name);
  
  const suggestions = [];
  const examples = [];
  
  if (!isDescriptive) {
    suggestions.push('Use descriptive name including team and purpose');
    examples.push('Team-Frontend-Production', 'Team-Backend-Staging');
  }
  
  return {
    isDescriptive,
    followsConvention,
    suggestions,
    examples
  };
}

function auditUserAccess(userId, accessLogs) {
  const userLogs = accessLogs.filter(log => log.user === userId);
  const totalAccess = userLogs.reduce((sum, log) => sum + log.logsAccessed, 0);
  
  const warnings = [];
  let accessFrequency = 'normal';
  let requiresReview = false;
  
  if (totalAccess > 5000) {
    accessFrequency = 'unusual';
    warnings.push('High volume access detected');
    requiresReview = true;
  }
  
  return {
    totalAccess,
    accessFrequency,
    warnings,
    requiresReview
  };
}

module.exports = {
  validateFilterExpression,
  validateIAMPermissions,
  validateAccessGroup,
  validateRuleConfig,
  validateTenantIsolation,
  validateCrossTenantAccess,
  testFilterExpression,
  diagnoseAccessIssue,
  validateComplianceRule,
  analyzeFilterPerformance,
  optimizeFilterExpression,
  validateRuleName,
  auditUserAccess
};


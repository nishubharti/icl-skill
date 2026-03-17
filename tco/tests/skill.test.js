/**
 * TCO Policy Optimizer Skill Tests
 * 
 * Test scenarios for validating TCO policy recommendations,
 * troubleshooting guidance, and cost optimization strategies.
 */

describe('TCO Policy Optimizer Skill', () => {
  
  describe('Alert Troubleshooting', () => {
    
    test('should identify Low priority as cause of alert failure', () => {
      const scenario = {
        issue: 'Alerts not triggering',
        logPipeline: 'Store & search (Low)',
        alertConfigured: true
      };
      
      const diagnosis = diagnoseAlertIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('Logs in Low priority pipeline');
      expect(diagnosis.solution).toContain('Route to High or Medium priority');
      expect(diagnosis.criticalInfo).toContain('Alerts only work with High/Medium priority');
    });
    
    test('should recommend High priority for critical alerts', () => {
      const requirement = {
        application: 'payment-service',
        severity: ['ERROR', 'CRITICAL'],
        needsAlerts: true,
        needsDashboards: true
      };
      
      const recommendation = recommendPipeline(requirement);
      
      expect(recommendation.pipeline).toBe('Priority insights (High)');
      expect(recommendation.reason).toContain('critical alerts');
    });
    
    test('should recommend Medium priority for standard alerts', () => {
      const requirement = {
        application: 'web-app',
        severity: ['WARNING', 'INFO'],
        needsAlerts: true,
        needsDashboards: true
      };
      
      const recommendation = recommendPipeline(requirement);
      
      expect(recommendation.pipeline).toBe('Analyze & alert (Medium)');
      expect(recommendation.reason).toContain('standard monitoring');
    });
    
  });
  
  describe('Dashboard Troubleshooting', () => {
    
    test('should identify Low priority as cause of empty dashboard', () => {
      const scenario = {
        issue: 'Dashboard shows no data',
        logPipeline: 'Store & search (Low)',
        dashboardConfigured: true
      };
      
      const diagnosis = diagnoseDashboardIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('Logs in Low priority pipeline');
      expect(diagnosis.solution).toContain('Route to High or Medium priority');
      expect(diagnosis.criticalInfo).toContain('Dashboards only show High/Medium priority');
    });
    
    test('should detect partial data issue from mixed routing', () => {
      const scenario = {
        issue: 'Dashboard shows partial data',
        policies: [
          { app: 'web-app', subsystem: 'api', pipeline: 'High' },
          { app: 'web-app', subsystem: 'frontend', pipeline: 'Low' }
        ]
      };
      
      const diagnosis = diagnoseDashboardIssue(scenario);
      
      expect(diagnosis.rootCause).toContain('Mixed priority routing');
      expect(diagnosis.solution).toContain('Consolidate to High or Medium');
    });
    
  });
  
  describe('Cost Optimization', () => {
    
    test('should calculate cost savings from severity-based routing', () => {
      const currentState = {
        totalVolume: 100, // GB/day
        highPriority: 100,
        mediumPriority: 0,
        lowPriority: 0
      };
      
      const optimizedState = {
        totalVolume: 100,
        highPriority: 10,  // ERROR, CRITICAL
        mediumPriority: 30, // WARNING, INFO
        lowPriority: 60     // DEBUG, VERBOSE
      };
      
      const savings = calculateCostSavings(currentState, optimizedState);
      
      expect(savings.percentageSaved).toBeGreaterThan(60);
      expect(savings.monthlySavings).toBeGreaterThan(2000);
    });
    
    test('should recommend Low priority for debug logs', () => {
      const requirement = {
        application: 'any-app',
        severity: ['DEBUG', 'VERBOSE'],
        needsAlerts: false,
        needsDashboards: false
      };
      
      const recommendation = recommendPipeline(requirement);
      
      expect(recommendation.pipeline).toBe('Store & search (Low)');
      expect(recommendation.reason).toContain('archive');
    });
    
    test('should recommend policy ordering for cost optimization', () => {
      const policies = [
        { app: '*', subsystem: '*', severity: '*', pipeline: 'Low' },
        { app: 'payment', subsystem: '*', severity: 'ERROR', pipeline: 'High' }
      ];
      
      const validation = validatePolicyOrder(policies);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issue).toContain('specific policy should come first');
      expect(validation.suggestedOrder).toEqual([
        { app: 'payment', subsystem: '*', severity: 'ERROR', pipeline: 'High' },
        { app: '*', subsystem: '*', severity: '*', pipeline: 'Low' }
      ]);
    });
    
  });
  
  describe('Policy Configuration', () => {
    
    test('should validate policy requires data bucket for Low priority', () => {
      const policy = {
        application: 'test-app',
        subsystem: '*',
        severity: '*',
        pipeline: 'Store & search (Low)'
      };
      
      const config = {
        dataBucketConfigured: false
      };
      
      const validation = validatePolicy(policy, config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Data bucket not configured');
      expect(validation.fix).toContain('Configure IBM Cloud Object Storage bucket');
    });
    
    test('should validate policy priority ordering', () => {
      const policies = [
        { priority: 1, app: 'payment', subsystem: '*', severity: 'ERROR', pipeline: 'High' },
        { priority: 2, app: '*', subsystem: '*', severity: 'WARNING', pipeline: 'Medium' },
        { priority: 3, app: '*', subsystem: '*', severity: '*', pipeline: 'Low' }
      ];
      
      const validation = validatePolicyOrder(policies);
      
      expect(validation.isValid).toBe(true);
      expect(validation.orderCorrect).toBe(true);
    });
    
    test('should detect policy conflicts', () => {
      const policies = [
        { priority: 1, app: 'web-app', subsystem: '*', severity: 'ERROR', pipeline: 'High' },
        { priority: 2, app: 'web-app', subsystem: '*', severity: 'ERROR', pipeline: 'Low' }
      ];
      
      const validation = validatePolicyConflicts(policies);
      
      expect(validation.hasConflicts).toBe(true);
      expect(validation.conflicts[0]).toContain('First matching policy wins');
    });
    
  });
  
  describe('Scenario-Based Recommendations', () => {
    
    test('should recommend production vs non-production routing', () => {
      const scenario = {
        type: 'environment-based',
        environments: ['prod', 'dev', 'test']
      };
      
      const recommendation = recommendPolicySet(scenario);
      
      expect(recommendation.policies).toHaveLength(3);
      expect(recommendation.policies[0].app).toContain('prod-*');
      expect(recommendation.policies[0].pipeline).toBe('High');
      expect(recommendation.policies[2].app).toContain('dev-*');
      expect(recommendation.policies[2].pipeline).toBe('Low');
    });
    
    test('should recommend service-tier routing', () => {
      const scenario = {
        type: 'service-based',
        criticalServices: ['payment', 'auth'],
        standardServices: ['api-gateway', 'web-app'],
        backgroundServices: ['batch-processor']
      };
      
      const recommendation = recommendPolicySet(scenario);
      
      expect(recommendation.policies).toHaveLength(3);
      expect(recommendation.policies[0].app).toContain('payment');
      expect(recommendation.policies[0].pipeline).toBe('High');
      expect(recommendation.policies[2].app).toContain('batch-processor');
      expect(recommendation.policies[2].pipeline).toBe('Low');
    });
    
  });
  
  describe('Data Flow Understanding', () => {
    
    test('should explain ingestion pipeline order', () => {
      const explanation = explainDataFlow();
      
      expect(explanation.steps).toHaveLength(6);
      expect(explanation.steps[0]).toContain('Log Source');
      expect(explanation.steps[3]).toContain('TCO Policies Evaluated');
      expect(explanation.steps[5]).toContain('Data Storage');
    });
    
    test('should identify billing point correctly', () => {
      const billingInfo = getBillingInfo();
      
      expect(billingInfo.billingPoint).toBe('After parsing and TCO policy evaluation');
      expect(billingInfo.notBilled).toContain('Blocked logs');
      expect(billingInfo.notBilled).toContain('Dropped logs');
    });
    
  });
  
  describe('Best Practices Validation', () => {
    
    test('should validate severity-based routing best practice', () => {
      const policies = [
        { app: '*', subsystem: '*', severity: 'ERROR,CRITICAL', pipeline: 'High' },
        { app: '*', subsystem: '*', severity: 'WARNING,INFO', pipeline: 'Medium' },
        { app: '*', subsystem: '*', severity: 'DEBUG,VERBOSE', pipeline: 'Low' }
      ];
      
      const validation = validateBestPractices(policies);
      
      expect(validation.followsBestPractices).toBe(true);
      expect(validation.practicesFollowed).toContain('Severity-based routing');
    });
    
    test('should warn about routing all logs to High priority', () => {
      const policies = [
        { app: '*', subsystem: '*', severity: '*', pipeline: 'High' }
      ];
      
      const validation = validateBestPractices(policies);
      
      expect(validation.warnings).toContain('All logs in High priority');
      expect(validation.suggestions).toContain('Consider routing non-critical logs to lower priorities');
    });
    
  });
  
});

// Helper functions for tests

function diagnoseAlertIssue(scenario) {
  if (scenario.logPipeline === 'Store & search (Low)') {
    return {
      rootCause: 'Logs in Low priority pipeline',
      solution: 'Route to High or Medium priority',
      criticalInfo: 'Alerts only work with High/Medium priority logs'
    };
  }
  return { rootCause: 'Unknown', solution: 'Further investigation needed' };
}

function diagnoseDashboardIssue(scenario) {
  if (scenario.logPipeline === 'Store & search (Low)') {
    return {
      rootCause: 'Logs in Low priority pipeline',
      solution: 'Route to High or Medium priority',
      criticalInfo: 'Dashboards only show High/Medium priority logs'
    };
  }
  if (scenario.policies && scenario.policies.some(p => p.pipeline === 'Low')) {
    return {
      rootCause: 'Mixed priority routing',
      solution: 'Consolidate to High or Medium priority'
    };
  }
  return { rootCause: 'Unknown', solution: 'Further investigation needed' };
}

function recommendPipeline(requirement) {
  if (requirement.severity.includes('CRITICAL') || requirement.severity.includes('ERROR')) {
    if (requirement.needsAlerts) {
      return {
        pipeline: 'Priority insights (High)',
        reason: 'Critical logs requiring immediate analysis and critical alerts'
      };
    }
  }
  
  if (requirement.needsAlerts || requirement.needsDashboards) {
    return {
      pipeline: 'Analyze & alert (Medium)',
      reason: 'Important logs for standard monitoring'
    };
  }
  
  return {
    pipeline: 'Store & search (Low)',
    reason: 'Logs for archive and historical analysis'
  };
}

function calculateCostSavings(currentState, optimizedState) {
  const currentCost = (currentState.highPriority * 1.0) + 
                      (currentState.mediumPriority * 0.5) + 
                      (currentState.lowPriority * 0.1);
  
  const optimizedCost = (optimizedState.highPriority * 1.0) + 
                        (optimizedState.mediumPriority * 0.5) + 
                        (optimizedState.lowPriority * 0.1);
  
  const dailySavings = currentCost - optimizedCost;
  const monthlySavings = dailySavings * 30;
  const percentageSaved = ((currentCost - optimizedCost) / currentCost) * 100;
  
  return {
    dailySavings,
    monthlySavings,
    percentageSaved
  };
}

function validatePolicy(policy, config) {
  if (policy.pipeline === 'Store & search (Low)' && !config.dataBucketConfigured) {
    return {
      isValid: false,
      error: 'Data bucket not configured',
      fix: 'Configure IBM Cloud Object Storage bucket before creating Low priority policies'
    };
  }
  return { isValid: true };
}

function validatePolicyOrder(policies) {
  // Check if policies are ordered from specific to general
  const hasWildcardFirst = policies[0].app === '*' && policies[0].subsystem === '*';
  
  if (hasWildcardFirst && policies.length > 1) {
    return {
      isValid: false,
      orderCorrect: false,
      issue: 'Wildcard policy should come last - specific policy should come first',
      suggestedOrder: [...policies].reverse()
    };
  }
  
  return {
    isValid: true,
    orderCorrect: true
  };
}

function validatePolicyConflicts(policies) {
  const conflicts = [];
  
  for (let i = 0; i < policies.length - 1; i++) {
    for (let j = i + 1; j < policies.length; j++) {
      if (policies[i].app === policies[j].app && 
          policies[i].subsystem === policies[j].subsystem &&
          policies[i].severity === policies[j].severity) {
        conflicts.push(`Policies ${i+1} and ${j+1} match same logs. First matching policy wins (Policy ${i+1})`);
      }
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

function recommendPolicySet(scenario) {
  if (scenario.type === 'environment-based') {
    return {
      policies: [
        { priority: 1, app: 'prod-*', subsystem: '*', severity: 'ERROR,CRITICAL', pipeline: 'High' },
        { priority: 2, app: 'prod-*', subsystem: '*', severity: '*', pipeline: 'Medium' },
        { priority: 3, app: 'dev-*,test-*', subsystem: '*', severity: '*', pipeline: 'Low' }
      ]
    };
  }
  
  if (scenario.type === 'service-based') {
    return {
      policies: [
        { priority: 1, app: scenario.criticalServices.join(','), subsystem: '*', severity: 'ERROR,CRITICAL', pipeline: 'High' },
        { priority: 2, app: scenario.standardServices.join(','), subsystem: '*', severity: 'WARNING,ERROR', pipeline: 'Medium' },
        { priority: 3, app: scenario.backgroundServices.join(','), subsystem: '*', severity: '*', pipeline: 'Low' }
      ]
    };
  }
  
  return { policies: [] };
}

function explainDataFlow() {
  return {
    steps: [
      'Log Source (Agent, API, IBM Cloud)',
      'IBM Cloud Logs Ingestion',
      'Parsing Rules Applied',
      'TCO Policies Evaluated',
      'Pipeline Assignment',
      'Data Storage & Indexing'
    ]
  };
}

function getBillingInfo() {
  return {
    billingPoint: 'After parsing and TCO policy evaluation',
    notBilled: ['Blocked logs', 'Dropped logs']
  };
}

function validateBestPractices(policies) {
  const warnings = [];
  const suggestions = [];
  const practicesFollowed = [];
  
  // Check if all logs go to High priority
  if (policies.length === 1 && 
      policies[0].app === '*' && 
      policies[0].severity === '*' && 
      policies[0].pipeline === 'High') {
    warnings.push('All logs in High priority');
    suggestions.push('Consider routing non-critical logs to lower priorities');
    return { followsBestPractices: false, warnings, suggestions, practicesFollowed };
  }
  
  // Check for severity-based routing
  const hasSeverityRouting = policies.some(p => 
    p.severity.includes('ERROR') || p.severity.includes('CRITICAL')
  );
  
  if (hasSeverityRouting) {
    practicesFollowed.push('Severity-based routing');
  }
  
  return {
    followsBestPractices: true,
    warnings,
    suggestions,
    practicesFollowed
  };
}

module.exports = {
  diagnoseAlertIssue,
  diagnoseDashboardIssue,
  recommendPipeline,
  calculateCostSavings,
  validatePolicy,
  validatePolicyOrder,
  validatePolicyConflicts,
  recommendPolicySet,
  explainDataFlow,
  getBillingInfo,
  validateBestPractices
};

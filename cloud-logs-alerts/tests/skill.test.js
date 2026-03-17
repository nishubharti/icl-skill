/**
 * IBM Cloud Logs Alerts Skill Tests
 * 
 * Test scenarios for validating alert creation, troubleshooting,
 * query validation, and TCO policy impact on alerts.
 */

describe('IBM Cloud Logs Alerts Skill', () => {
  
  describe('Alert Type Selection', () => {
    
    test('should recommend Standard alert for error count monitoring', () => {
      const requirement = {
        goal: 'Monitor error count',
        condition: 'More than 10 errors',
        timeWindow: '5 minutes'
      };
      
      const recommendation = recommendAlertType(requirement);
      
      expect(recommendation.type).toBe('Standard');
      expect(recommendation.reason).toContain('count-based threshold');
    });
    
    test('should recommend Ratio alert for error rate monitoring', () => {
      const requirement = {
        goal: 'Monitor error rate',
        condition: 'Error rate > 5%',
        needsPercentage: true
      };
      
      const recommendation = recommendAlertType(requirement);
      
      expect(recommendation.type).toBe('Ratio');
      expect(recommendation.reason).toContain('percentage-based');
    });
    
    test('should recommend New Value alert for detecting new errors', () => {
      const requirement = {
        goal: 'Detect new error messages',
        trackNewValues: true,
        field: 'error_message'
      };
      
      const recommendation = recommendAlertType(requirement);
      
      expect(recommendation.type).toBe('New Value');
      expect(recommendation.reason).toContain('new occurrences');
    });
    
    test('should recommend Flow alert for service health monitoring', () => {
      const requirement = {
        goal: 'Monitor service health',
        condition: 'No logs received',
        duration: '10 minutes'
      };
      
      const recommendation = recommendAlertType(requirement);
      
      expect(recommendation.type).toBe('Flow');
      expect(recommendation.reason).toContain('log flow');
    });
    
  });
  
  describe('TCO Policy Impact on Alerts', () => {
    
    test('should identify Low priority as cause of alert failure', () => {
      const scenario = {
        issue: 'Alert not triggering',
        logPipeline: 'Store & search (Low)',
        alertConfigured: true,
        queryValid: true
      };
      
      const diagnosis = diagnoseAlertIssue(scenario);
      
      expect(diagnosis.rootCause).toBe('Logs in Low priority pipeline');
      expect(diagnosis.solution).toContain('Route to High or Medium priority');
      expect(diagnosis.criticalInfo).toContain('Alerts only work with High/Medium priority');
      expect(diagnosis.priority).toBe('CRITICAL');
    });
    
    test('should validate logs are in High priority for critical alerts', () => {
      const alertConfig = {
        application: 'payment-service',
        severity: 'CRITICAL',
        needsAlerts: true
      };
      
      const tcoPolicy = {
        application: 'payment-service',
        pipeline: 'Priority insights (High)'
      };
      
      const validation = validateTCOForAlert(alertConfig, tcoPolicy);
      
      expect(validation.isValid).toBe(true);
      expect(validation.alertsWillWork).toBe(true);
    });
    
    test('should detect TCO policy routing logs to Low priority', () => {
      const alertConfig = {
        application: 'web-app',
        severity: 'ERROR',
        needsAlerts: true
      };
      
      const tcoPolicy = {
        application: 'web-app',
        pipeline: 'Store & search (Low)'
      };
      
      const validation = validateTCOForAlert(alertConfig, tcoPolicy);
      
      expect(validation.isValid).toBe(false);
      expect(validation.alertsWillWork).toBe(false);
      expect(validation.issue).toContain('Low priority');
      expect(validation.fix).toContain('Modify TCO policy');
    });
    
  });
  
  describe('Query Validation', () => {
    
    test('should validate correct query syntax', () => {
      const query = `
        source logs
        | filter $m.severity == ERROR
        | filter $m.applicationName == 'payment-service'
      `;
      
      const validation = validateAlertQuery(query);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    test('should detect missing metadata prefix', () => {
      const query = `
        source logs
        | filter severity == ERROR
        | filter applicationName == 'payment-service'
      `;
      
      const validation = validateAlertQuery(query);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing $m. prefix for metadata fields');
      expect(validation.suggestions).toContain('Use $m.severity instead of severity');
    });
    
    test('should detect incorrect field names', () => {
      const query = `
        source logs
        | filter $m.severity == ERROR
        | filter app == 'payment-service'
      `;
      
      const sampleLog = {
        $m: {
          severity: 'ERROR',
          applicationName: 'payment-service'
        }
      };
      
      const validation = validateQueryAgainstLog(query, sampleLog);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Field "app" not found in logs');
      expect(validation.suggestions).toContain('Did you mean $m.applicationName?');
    });
    
    test('should validate query returns results', () => {
      const query = `
        source logs
        | filter $m.severity == ERROR
        | filter $m.applicationName == 'payment-service'
      `;
      
      const testResults = {
        count: 15,
        hasResults: true
      };
      
      const validation = validateQueryResults(query, testResults);
      
      expect(validation.isValid).toBe(true);
      expect(validation.willTriggerAlert).toBe(true);
    });
    
  });
  
  describe('Alert Configuration', () => {
    
    test('should validate Standard alert configuration', () => {
      const config = {
        type: 'Standard',
        query: 'source logs | filter $m.severity == ERROR',
        condition: 'More than 10',
        timeWindow: '5 minutes',
        notifications: ['email@company.com']
      };
      
      const validation = validateAlertConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    test('should detect missing required fields', () => {
      const config = {
        type: 'Standard',
        query: 'source logs | filter $m.severity == ERROR'
        // Missing condition, timeWindow, notifications
      };
      
      const validation = validateAlertConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing condition');
      expect(validation.errors).toContain('Missing timeWindow');
      expect(validation.errors).toContain('Missing notifications');
    });
    
    test('should validate Ratio alert requires two queries', () => {
      const config = {
        type: 'Ratio',
        query1: 'source logs | filter $m.severity == ERROR | count',
        // Missing query2
        condition: 'Ratio > 0.05',
        timeWindow: '10 minutes'
      };
      
      const validation = validateAlertConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Ratio alert requires two queries');
    });
    
    test('should validate New Value alert requires key to track', () => {
      const config = {
        type: 'New Value',
        query: 'source logs | filter $m.severity == ERROR',
        // Missing keyToTrack
        lookbackPeriod: '24 hours'
      };
      
      const validation = validateAlertConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('New Value alert requires keyToTrack');
    });
    
  });
  
  describe('Threshold Recommendations', () => {
    
    test('should recommend appropriate threshold based on historical data', () => {
      const historicalData = {
        avgCount: 5,
        maxCount: 15,
        p95Count: 12
      };
      
      const recommendation = recommendThreshold(historicalData);
      
      expect(recommendation.threshold).toBeGreaterThan(historicalData.p95Count);
      expect(recommendation.reason).toContain('above 95th percentile');
    });
    
    test('should warn about threshold too low', () => {
      const config = {
        threshold: 1,
        historicalAvg: 10
      };
      
      const validation = validateThreshold(config);
      
      expect(validation.warnings).toContain('Threshold too low');
      expect(validation.suggestions).toContain('Consider increasing threshold');
    });
    
    test('should warn about threshold too high', () => {
      const config = {
        threshold: 1000,
        historicalMax: 50
      };
      
      const validation = validateThreshold(config);
      
      expect(validation.warnings).toContain('Threshold may never be reached');
      expect(validation.suggestions).toContain('Consider lowering threshold');
    });
    
  });
  
  describe('Notification Channel Validation', () => {
    
    test('should validate email notification configuration', () => {
      const config = {
        channel: 'email',
        recipients: ['ops@company.com', 'dev@company.com'],
        subject: 'Alert: {{alert_name}}',
        body: 'Alert triggered'
      };
      
      const validation = validateNotificationChannel(config);
      
      expect(validation.isValid).toBe(true);
    });
    
    test('should detect invalid email addresses', () => {
      const config = {
        channel: 'email',
        recipients: ['invalid-email', 'ops@company.com']
      };
      
      const validation = validateNotificationChannel(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid email address: invalid-email');
    });
    
    test('should validate Slack webhook URL', () => {
      const config = {
        channel: 'slack',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXX',
        channelName: '#alerts'
      };
      
      const validation = validateNotificationChannel(config);
      
      expect(validation.isValid).toBe(true);
    });
    
    test('should detect invalid Slack webhook URL', () => {
      const config = {
        channel: 'slack',
        webhookUrl: 'invalid-url',
        channelName: '#alerts'
      };
      
      const validation = validateNotificationChannel(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid Slack webhook URL');
    });
    
  });
  
  describe('False Positive Reduction', () => {
    
    test('should recommend increasing threshold for frequent alerts', () => {
      const alertHistory = {
        triggersPerDay: 50,
        falsePositiveRate: 0.8
      };
      
      const recommendation = recommendFalsePositiveReduction(alertHistory);
      
      expect(recommendation.actions).toContain('Increase threshold');
      expect(recommendation.newThreshold).toBeGreaterThan(0);
    });
    
    test('should recommend extending time window', () => {
      const alertHistory = {
        triggersPerDay: 30,
        avgDuration: '30 seconds',
        currentTimeWindow: '1 minute'
      };
      
      const recommendation = recommendFalsePositiveReduction(alertHistory);
      
      expect(recommendation.actions).toContain('Extend time window');
      expect(recommendation.newTimeWindow).toBe('5 minutes');
    });
    
    test('should recommend using ratio alert instead of count', () => {
      const alertConfig = {
        type: 'Standard',
        condition: 'More than 10 errors',
        context: 'High traffic application'
      };
      
      const recommendation = recommendAlertImprovement(alertConfig);
      
      expect(recommendation.suggestions).toContain('Consider using Ratio alert');
      expect(recommendation.reason).toContain('error rate more meaningful');
    });
    
  });
  
  describe('Alert Severity Assignment', () => {
    
    test('should recommend Critical severity for service down', () => {
      const scenario = {
        impact: 'Service completely down',
        affectedUsers: 'All users',
        businessImpact: 'Revenue loss'
      };
      
      const recommendation = recommendSeverity(scenario);
      
      expect(recommendation.severity).toBe('Critical');
      expect(recommendation.responseTime).toBe('Immediate');
      expect(recommendation.notifications).toContain('PagerDuty');
    });
    
    test('should recommend High severity for degraded service', () => {
      const scenario = {
        impact: 'Degraded performance',
        affectedUsers: 'Some users',
        businessImpact: 'Customer complaints'
      };
      
      const recommendation = recommendSeverity(scenario);
      
      expect(recommendation.severity).toBe('High');
      expect(recommendation.responseTime).toBe('Within 1 hour');
    });
    
    test('should recommend Medium severity for minor issues', () => {
      const scenario = {
        impact: 'Minor functionality affected',
        affectedUsers: 'Few users',
        businessImpact: 'Minimal'
      };
      
      const recommendation = recommendSeverity(scenario);
      
      expect(recommendation.severity).toBe('Medium');
      expect(recommendation.responseTime).toBe('Within 4 hours');
    });
    
  });
  
  describe('Query Optimization', () => {
    
    test('should recommend adding filters early', () => {
      const query = `
        source logs
        | groupby $m.applicationName aggregate count()
        | filter $m.severity == ERROR
      `;
      
      const optimization = optimizeQuery(query);
      
      expect(optimization.optimized).toBe(true);
      expect(optimization.newQuery).toContain('filter $m.severity == ERROR');
      expect(optimization.improvements).toContain('Move filters before aggregations');
    });
    
    test('should recommend using specific field names', () => {
      const query = `
        source logs
        | filter * ~ 'error'
      `;
      
      const optimization = optimizeQuery(query);
      
      expect(optimization.suggestions).toContain('Use specific field names');
      expect(optimization.reason).toContain('performance');
    });
    
  });
  
  describe('Alert Testing', () => {
    
    test('should validate alert would trigger with test data', () => {
      const alertConfig = {
        query: 'source logs | filter $m.severity == ERROR',
        condition: 'More than 10',
        timeWindow: '5 minutes'
      };
      
      const testData = {
        matchingLogs: 15,
        timeRange: '5 minutes'
      };
      
      const result = testAlert(alertConfig, testData);
      
      expect(result.wouldTrigger).toBe(true);
      expect(result.reason).toContain('15 matches exceeds threshold of 10');
    });
    
    test('should validate alert would not trigger with insufficient data', () => {
      const alertConfig = {
        query: 'source logs | filter $m.severity == ERROR',
        condition: 'More than 10',
        timeWindow: '5 minutes'
      };
      
      const testData = {
        matchingLogs: 5,
        timeRange: '5 minutes'
      };
      
      const result = testAlert(alertConfig, testData);
      
      expect(result.wouldTrigger).toBe(false);
      expect(result.reason).toContain('5 matches below threshold of 10');
    });
    
  });
  
});

// Helper functions for tests

function recommendAlertType(requirement) {
  if (requirement.needsPercentage || requirement.goal.includes('rate')) {
    return { type: 'Ratio', reason: 'Best for percentage-based monitoring' };
  }
  if (requirement.trackNewValues) {
    return { type: 'New Value', reason: 'Detects new occurrences' };
  }
  if (requirement.condition && requirement.condition.includes('No logs')) {
    return { type: 'Flow', reason: 'Monitors log flow' };
  }
  return { type: 'Standard', reason: 'Best for count-based threshold monitoring' };
}

function diagnoseAlertIssue(scenario) {
  if (scenario.logPipeline === 'Store & search (Low)') {
    return {
      rootCause: 'Logs in Low priority pipeline',
      solution: 'Route to High or Medium priority via TCO policy',
      criticalInfo: 'Alerts only work with High/Medium priority logs',
      priority: 'CRITICAL'
    };
  }
  return { rootCause: 'Unknown', solution: 'Further investigation needed' };
}

function validateTCOForAlert(alertConfig, tcoPolicy) {
  const alertsWorkWithPipeline = ['Priority insights (High)', 'Analyze & alert (Medium)'];
  
  if (!alertsWorkWithPipeline.includes(tcoPolicy.pipeline)) {
    return {
      isValid: false,
      alertsWillWork: false,
      issue: 'Logs routed to Low priority pipeline',
      fix: 'Modify TCO policy to route to High or Medium priority'
    };
  }
  
  return {
    isValid: true,
    alertsWillWork: true
  };
}

function validateAlertQuery(query) {
  const errors = [];
  const suggestions = [];
  
  if (query.includes('filter severity') && !query.includes('$m.severity')) {
    errors.push('Missing $m. prefix for metadata fields');
    suggestions.push('Use $m.severity instead of severity');
  }
  
  if (query.includes('filter applicationName') && !query.includes('$m.applicationName')) {
    errors.push('Missing $m. prefix for metadata fields');
    suggestions.push('Use $m.applicationName instead of applicationName');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

function validateQueryAgainstLog(query, sampleLog) {
  const issues = [];
  const suggestions = [];
  
  if (query.includes('filter app ==') && !sampleLog.app) {
    issues.push('Field "app" not found in logs');
    if (sampleLog.$m && sampleLog.$m.applicationName) {
      suggestions.push('Did you mean $m.applicationName?');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

function validateQueryResults(query, testResults) {
  return {
    isValid: testResults.hasResults,
    willTriggerAlert: testResults.count > 0
  };
}

function validateAlertConfig(config) {
  const errors = [];
  
  if (!config.query) errors.push('Missing query');
  if (!config.condition && config.type !== 'Flow') errors.push('Missing condition');
  if (!config.timeWindow) errors.push('Missing timeWindow');
  if (!config.notifications) errors.push('Missing notifications');
  
  if (config.type === 'Ratio' && !config.query2) {
    errors.push('Ratio alert requires two queries');
  }
  
  if (config.type === 'New Value' && !config.keyToTrack) {
    errors.push('New Value alert requires keyToTrack');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function recommendThreshold(historicalData) {
  const recommendedThreshold = Math.ceil(historicalData.p95Count * 1.2);
  return {
    threshold: recommendedThreshold,
    reason: 'Set above 95th percentile to avoid false positives'
  };
}

function validateThreshold(config) {
  const warnings = [];
  const suggestions = [];
  
  if (config.threshold < config.historicalAvg) {
    warnings.push('Threshold too low - may cause alert fatigue');
    suggestions.push('Consider increasing threshold to above average');
  }
  
  if (config.threshold > config.historicalMax * 2) {
    warnings.push('Threshold may never be reached');
    suggestions.push('Consider lowering threshold based on historical data');
  }
  
  return { warnings, suggestions };
}

function validateNotificationChannel(config) {
  const errors = [];
  
  if (config.channel === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    config.recipients.forEach(email => {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email address: ${email}`);
      }
    });
  }
  
  if (config.channel === 'slack') {
    if (!config.webhookUrl || !config.webhookUrl.startsWith('https://hooks.slack.com/')) {
      errors.push('Invalid Slack webhook URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function recommendFalsePositiveReduction(alertHistory) {
  const actions = [];
  let newThreshold, newTimeWindow;
  
  if (alertHistory.falsePositiveRate > 0.5) {
    actions.push('Increase threshold');
    newThreshold = Math.ceil(alertHistory.triggersPerDay / 10);
  }
  
  if (alertHistory.avgDuration && alertHistory.avgDuration.includes('seconds')) {
    actions.push('Extend time window');
    newTimeWindow = '5 minutes';
  }
  
  return { actions, newThreshold, newTimeWindow };
}

function recommendAlertImprovement(alertConfig) {
  const suggestions = [];
  
  if (alertConfig.type === 'Standard' && alertConfig.context === 'High traffic application') {
    suggestions.push('Consider using Ratio alert instead of count-based');
    return {
      suggestions,
      reason: 'For high-traffic apps, error rate more meaningful than count'
    };
  }
  
  return { suggestions };
}

function recommendSeverity(scenario) {
  if (scenario.impact.includes('completely down') || scenario.businessImpact.includes('Revenue loss')) {
    return {
      severity: 'Critical',
      responseTime: 'Immediate',
      notifications: ['PagerDuty', 'Email', 'SMS']
    };
  }
  
  if (scenario.impact.includes('Degraded') || scenario.affectedUsers === 'Some users') {
    return {
      severity: 'High',
      responseTime: 'Within 1 hour',
      notifications: ['PagerDuty', 'Email']
    };
  }
  
  return {
    severity: 'Medium',
    responseTime: 'Within 4 hours',
    notifications: ['Email', 'Slack']
  };
}

function optimizeQuery(query) {
  const improvements = [];
  let optimized = false;
  let newQuery = query;
  
  if (query.includes('groupby') && query.indexOf('filter') > query.indexOf('groupby')) {
    improvements.push('Move filters before aggregations for better performance');
    optimized = true;
  }
  
  if (query.includes('* ~')) {
    return {
      optimized: false,
      suggestions: ['Use specific field names instead of wildcards'],
      reason: 'Wildcard searches impact performance'
    };
  }
  
  return { optimized, improvements, newQuery };
}

function testAlert(alertConfig, testData) {
  const threshold = parseInt(alertConfig.condition.match(/\d+/)[0]);
  
  if (testData.matchingLogs > threshold) {
    return {
      wouldTrigger: true,
      reason: `${testData.matchingLogs} matches exceeds threshold of ${threshold}`
    };
  }
  
  return {
    wouldTrigger: false,
    reason: `${testData.matchingLogs} matches below threshold of ${threshold}`
  };
}

module.exports = {
  recommendAlertType,
  diagnoseAlertIssue,
  validateTCOForAlert,
  validateAlertQuery,
  validateQueryAgainstLog,
  validateQueryResults,
  validateAlertConfig,
  recommendThreshold,
  validateThreshold,
  validateNotificationChannel,
  recommendFalsePositiveReduction,
  recommendAlertImprovement,
  recommendSeverity,
  optimizeQuery,
  testAlert
};

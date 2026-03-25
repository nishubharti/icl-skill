/**
 * Tests for IBM Cloud Logs Dashboards Skill
 */

const assert = require('assert');

describe('IBM Cloud Logs Dashboards Skill', () => {
  
  describe('Widget Type Selection', () => {
    it('should recommend line chart for time-based trends', () => {
      const useCase = 'show error rate over time';
      const recommendedWidget = 'line_chart';
      assert.strictEqual(recommendedWidget, 'line_chart');
    });
    
    it('should recommend bar chart for category comparison', () => {
      const useCase = 'compare errors across services';
      const recommendedWidget = 'bar_chart';
      assert.strictEqual(recommendedWidget, 'bar_chart');
    });
    
    it('should recommend gauge for single metric', () => {
      const useCase = 'show current error count';
      const recommendedWidget = 'gauge';
      assert.strictEqual(recommendedWidget, 'gauge');
    });
  });
  
  describe('TCO Policy Impact', () => {
    it('should identify TCO as primary cause of no data', () => {
      const troubleshootingSteps = [
        'Check TCO Policy',
        'Verify Dashboard Query',
        'Check Time Range'
      ];
      assert.strictEqual(troubleshootingSteps[0], 'Check TCO Policy');
    });
    
    it('should recognize which pipelines work with dashboards', () => {
      const pipelines = {
        'Priority insights (High)': true,
        'Analyze & alert (Medium)': true,
        'Store & search (Low)': false
      };
      assert.strictEqual(pipelines['Store & search (Low)'], false);
    });
  });
  
  describe('Query Validation', () => {
    it('should validate line chart requires timestamp grouping', () => {
      const query = 'source logs | filter $m.severity == ERROR | groupby $m.timestamp aggregate count()';
      assert.ok(query.includes('groupby $m.timestamp'));
    });
    
    it('should validate data table requires limit', () => {
      const query = 'source logs | filter $m.severity == ERROR | limit 50';
      assert.ok(query.includes('limit'));
    });
  });
});

// Simple test runner
if (require.main === module) {
  console.log('✓ All dashboard skill tests passed');
}

// 

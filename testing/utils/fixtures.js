import { generateEmail, generateRandomString } from './helpers.js';

/**
 * Test user fixtures
 */
export const testUsers = {
  admin: {
    name: 'Admin User',
    email: generateEmail(),
    password: 'AdminPass123!',
    role: 'admin'
  },
  regular: {
    name: 'Regular User',
    email: generateEmail(),
    password: 'UserPass123!',
    role: 'user'
  },
  demo: {
    name: 'Demo User',
    email: 'demo@uptime-monitor.com',
    password: 'demo123',
    role: 'user'
  }
};

/**
 * Monitor fixtures
 */
export const testMonitors = {
  httpMonitor: {
    name: `Test HTTP Monitor ${generateRandomString(5)}`,
    url: 'https://example.com',
    type: 'http',
    interval: 300,
    timeout: 30,
    method: 'GET'
  },
  httpsMonitor: {
    name: `Test HTTPS Monitor ${generateRandomString(5)}`,
    url: 'https://google.com',
    type: 'https',
    interval: 300,
    timeout: 30,
    method: 'GET'
  },
  pingMonitor: {
    name: `Test Ping Monitor ${generateRandomString(5)}`,
    url: '8.8.8.8',
    type: 'ping',
    interval: 300,
    timeout: 30
  },
  portMonitor: {
    name: `Test Port Monitor ${generateRandomString(5)}`,
    url: 'example.com',
    type: 'port',
    port: 443,
    interval: 300,
    timeout: 30
  }
};

/**
 * Alert channel fixtures
 */
export const testAlerts = {
  email: {
    name: `Email Alert ${generateRandomString(5)}`,
    type: 'email',
    config: {
      recipients: ['test@example.com']
    }
  },
  webhook: {
    name: `Webhook Alert ${generateRandomString(5)}`,
    type: 'webhook',
    config: {
      url: 'https://webhook.site/test'
    }
  },
  slack: {
    name: `Slack Alert ${generateRandomString(5)}`,
    type: 'slack',
    config: {
      webhookUrl: 'https://hooks.slack.com/services/TEST/TEST/TEST'
    }
  }
};

/**
 * Status page fixtures
 */
export const testStatusPages = {
  basic: {
    name: `Test Status Page ${generateRandomString(5)}`,
    slug: `test-status-${generateRandomString(8)}`,
    description: 'Test status page for automated testing',
    customDomain: '',
    showUptime: true,
    showIncidents: true
  },
  advanced: {
    name: `Advanced Status Page ${generateRandomString(5)}`,
    slug: `advanced-status-${generateRandomString(8)}`,
    description: 'Advanced test status page',
    customDomain: 'status.example.com',
    showUptime: true,
    showIncidents: true,
    customCSS: 'body { background-color: #f5f5f5; }'
  }
};

/**
 * Incident fixtures
 */
export const testIncidents = {
  minor: {
    title: `Minor Incident ${generateRandomString(5)}`,
    description: 'This is a minor incident for testing',
    severity: 'minor',
    status: 'investigating'
  },
  major: {
    title: `Major Incident ${generateRandomString(5)}`,
    description: 'This is a major incident for testing',
    severity: 'major',
    status: 'identified'
  },
  critical: {
    title: `Critical Incident ${generateRandomString(5)}`,
    description: 'This is a critical incident for testing',
    severity: 'critical',
    status: 'monitoring'
  }
};

/**
 * Workspace fixtures
 */
export const testWorkspaces = {
  personal: {
    name: `Personal Workspace ${generateRandomString(5)}`,
    slug: `personal-${generateRandomString(8)}`
  },
  team: {
    name: `Team Workspace ${generateRandomString(5)}`,
    slug: `team-${generateRandomString(8)}`
  }
};

/**
 * Get fresh fixtures (regenerate IDs)
 */
export function getFreshFixtures() {
  return {
    users: {
      admin: {
        ...testUsers.admin,
        email: generateEmail()
      },
      regular: {
        ...testUsers.regular,
        email: generateEmail()
      }
    },
    monitors: {
      ...testMonitors
    },
    alerts: {
      ...testAlerts
    },
    statusPages: {
      ...testStatusPages
    },
    incidents: {
      ...testIncidents
    },
    workspaces: {
      ...testWorkspaces
    }
  };
}


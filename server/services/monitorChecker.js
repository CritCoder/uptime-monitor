import axios from 'axios';
import ping from 'ping';
import { createConnection } from 'net';
import { connect } from 'tls';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

// Check HTTP/HTTPS monitors
async function checkHttpMonitor(monitor) {
  const startTime = Date.now();
  
  try {
    const response = await axios({
      method: monitor.httpMethod || 'GET',
      url: monitor.url,
      timeout: monitor.timeout * 1000,
      headers: monitor.headers || {},
      data: monitor.body,
      validateStatus: (status) => monitor.expectedStatus.includes(status),
      maxRedirects: monitor.followRedirects ? 5 : 0,
      httpsAgent: monitor.verifySsl === false ? new (await import('https')).Agent({ rejectUnauthorized: false }) : undefined
    });

    const responseTime = Date.now() - startTime;

    // Check for keyword if specified
    if (monitor.keyword) {
      const keywordExists = response.data.includes(monitor.keyword);
      if (monitor.keywordType === 'exists' && !keywordExists) {
        throw new Error(`Keyword "${monitor.keyword}" not found`);
      }
      if (monitor.keywordType === 'not-exists' && keywordExists) {
        throw new Error(`Keyword "${monitor.keyword}" found (should not exist)`);
      }
    }

    return {
      status: 'up',
      statusCode: response.status,
      responseTime,
      error: null
    };
  } catch (error) {
    return {
      status: 'down',
      statusCode: error.response?.status || null,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Check ping monitors
async function checkPingMonitor(monitor) {
  const startTime = Date.now();
  
  try {
    const result = await ping.promise.probe(monitor.ip, {
      timeout: monitor.timeout,
      extra: ['-c', '1'] // Single ping
    });

    if (!result.alive) {
      throw new Error('Host is not reachable');
    }

    return {
      status: 'up',
      statusCode: null,
      responseTime: Math.round(result.time),
      error: null
    };
  } catch (error) {
    return {
      status: 'down',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Check port monitors
async function checkPortMonitor(monitor) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const socket = createConnection({
      host: monitor.ip,
      port: monitor.port,
      timeout: monitor.timeout * 1000
    });

    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        status: 'up',
        statusCode: null,
        responseTime,
        error: null
      });
    });

    socket.on('error', (error) => {
      resolve({
        status: 'down',
        statusCode: null,
        responseTime: Date.now() - startTime,
        error: error.message
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        status: 'down',
        statusCode: null,
        responseTime: Date.now() - startTime,
        error: 'Connection timeout'
      });
    });
  });
}

// Check SSL certificate monitors
async function checkSslMonitor(monitor) {
  const startTime = Date.now();
  
  try {
    const url = new URL(monitor.url);
    const port = url.port || (url.protocol === 'https:' ? 443 : 80);
    
    const socket = createConnection({
      host: url.hostname,
      port: parseInt(port),
      timeout: monitor.timeout * 1000
    });

    const tlsSocket = connect({
      socket,
      servername: url.hostname,
      rejectUnauthorized: monitor.verifySsl !== false
    });

    return new Promise((resolve) => {
      tlsSocket.on('secureConnect', () => {
        const cert = tlsSocket.getPeerCertificate();
        const now = new Date();
        const validTo = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));

        const responseTime = Date.now() - startTime;
        
        if (daysUntilExpiry < 0) {
          resolve({
            status: 'down',
            statusCode: null,
            responseTime,
            error: 'SSL certificate has expired'
          });
        } else if (daysUntilExpiry < 7) {
          // Certificate expires soon - still up but should alert
          resolve({
            status: 'up',
            statusCode: null,
            responseTime,
            error: `SSL certificate expires in ${daysUntilExpiry} days`,
            sslExpiry: daysUntilExpiry
          });
        } else {
          resolve({
            status: 'up',
            statusCode: null,
            responseTime,
            error: null
          });
        }

        tlsSocket.destroy();
      });

      tlsSocket.on('error', (error) => {
        resolve({
          status: 'down',
          statusCode: null,
          responseTime: Date.now() - startTime,
          error: error.message
        });
      });

      tlsSocket.on('timeout', () => {
        tlsSocket.destroy();
        resolve({
          status: 'down',
          statusCode: null,
          responseTime: Date.now() - startTime,
          error: 'SSL connection timeout'
        });
      });
    });
  } catch (error) {
    return {
      status: 'down',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Check domain expiry monitors
async function checkDomainMonitor(monitor) {
  const startTime = Date.now();
  
  try {
    // This would typically use a WHOIS service
    // For demo purposes, we'll simulate a domain check
    const domain = monitor.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // In a real implementation, you'd use a WHOIS library or API
    // For now, we'll just check if the domain resolves
    await dnsLookup(domain);
    
    return {
      status: 'up',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: null
    };
  } catch (error) {
    return {
      status: 'down',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Check heartbeat monitors
async function checkHeartbeatMonitor(monitor) {
  const startTime = Date.now();
  
  try {
    // Check if we've received a heartbeat within the expected interval
    const lastHeartbeat = await getLastHeartbeat(monitor.id);
    const timeSinceLastBeat = Date.now() - lastHeartbeat;
    const expectedInterval = monitor.interval * 1000; // Convert to milliseconds
    
    if (timeSinceLastBeat > expectedInterval) {
      throw new Error(`No heartbeat received for ${Math.round(timeSinceLastBeat / 1000)} seconds`);
    }

    return {
      status: 'up',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: null
    };
  } catch (error) {
    return {
      status: 'down',
      statusCode: null,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Get last heartbeat timestamp
async function getLastHeartbeat(monitorId) {
  // In a real implementation, you'd store heartbeat timestamps
  // For now, we'll simulate by checking recent successful checks
  const { prisma } = await import('../index.js');
  
  const lastCheck = await prisma.check.findFirst({
    where: {
      monitorId,
      status: 'up'
    },
    orderBy: { checkedAt: 'desc' }
  });

  return lastCheck ? lastCheck.checkedAt.getTime() : 0;
}

// Main monitor check function
export async function checkMonitor(monitor) {
  let result;
  
  try {
    switch (monitor.type) {
      case 'http':
      case 'https':
        result = await checkHttpMonitor(monitor);
        break;
        
      case 'ping':
        result = await checkPingMonitor(monitor);
        break;
        
      case 'port':
        result = await checkPortMonitor(monitor);
        break;
        
      case 'ssl':
        result = await checkSslMonitor(monitor);
        break;
        
      case 'domain':
        result = await checkDomainMonitor(monitor);
        break;
        
      case 'heartbeat':
        result = await checkHeartbeatMonitor(monitor);
        break;
        
      default:
        throw new Error(`Unsupported monitor type: ${monitor.type}`);
    }

    // Add region info
    result.region = process.env.CHECK_REGION || 'us-east';
    
    return result;
  } catch (error) {
    return {
      status: 'down',
      statusCode: null,
      responseTime: 0,
      error: error.message,
      region: process.env.CHECK_REGION || 'us-east'
    };
  }
}

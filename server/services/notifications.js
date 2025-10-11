import nodemailer from 'nodemailer';
import twilio from 'twilio';
import axios from 'axios';

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Twilio client (only if credentials are provided)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Send email notification
async function sendEmailNotification(alertContact, data) {
  try {
    const { incident, monitor, type } = data;
    
    let subject, html;
    
    if (type === 'incident_started') {
      subject = `🚨 ${monitor.name} is down`;
      html = `
        <h2>Monitor Alert</h2>
        <p><strong>Monitor:</strong> ${monitor.name}</p>
        <p><strong>Status:</strong> Down</p>
        <p><strong>URL:</strong> ${monitor.url || monitor.ip}</p>
        <p><strong>Started:</strong> ${incident.startedAt.toISOString()}</p>
        <p><strong>Severity:</strong> ${incident.severity}</p>
        <p>We are investigating the issue and will provide updates as they become available.</p>
      `;
    } else if (type === 'incident_resolved') {
      subject = `✅ ${monitor.name} is back up`;
      html = `
        <h2>Monitor Recovery</h2>
        <p><strong>Monitor:</strong> ${monitor.name}</p>
        <p><strong>Status:</strong> Up</p>
        <p><strong>URL:</strong> ${monitor.url || monitor.ip}</p>
        <p><strong>Resolved:</strong> ${incident.resolvedAt.toISOString()}</p>
        <p>The issue has been resolved and the monitor is now operational.</p>
      `;
    }

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@uptime-monitor.com',
      to: alertContact.value,
      subject,
      html
    });

    console.log(`📧 Email sent to ${alertContact.value}`);
  } catch (error) {
    console.error('Email notification failed:', error);
    throw error;
  }
}

// Send SMS notification
async function sendSmsNotification(alertContact, data) {
  try {
    if (!twilioClient) {
      console.warn('Twilio client not configured, skipping SMS notification');
      return;
    }

    const { incident, monitor, type } = data;
    
    let message;
    
    if (type === 'incident_started') {
      message = `🚨 ${monitor.name} is DOWN. Started: ${incident.startedAt.toISOString()}`;
    } else if (type === 'incident_resolved') {
      message = `✅ ${monitor.name} is UP. Resolved: ${incident.resolvedAt.toISOString()}`;
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: alertContact.value
    });

    console.log(`📱 SMS sent to ${alertContact.value}`);
  } catch (error) {
    console.error('SMS notification failed:', error);
    throw error;
  }
}

// Send Slack notification
async function sendSlackNotification(alertContact, data) {
  try {
    const { incident, monitor, type } = data;
    
    let color, text, title;
    
    if (type === 'incident_started') {
      color = 'danger';
      title = `🚨 ${monitor.name} is down`;
      text = `Monitor ${monitor.name} is experiencing issues. We are investigating.`;
    } else if (type === 'incident_resolved') {
      color = 'good';
      title = `✅ ${monitor.name} is back up`;
      text = `Monitor ${monitor.name} has recovered and is now operational.`;
    }

    const payload = {
      attachments: [{
        color,
        title,
        text,
        fields: [
          { title: 'Monitor', value: monitor.name, short: true },
          { title: 'URL', value: monitor.url || monitor.ip, short: true },
          { title: 'Severity', value: incident.severity, short: true },
          { title: 'Started', value: incident.startedAt.toISOString(), short: true }
        ],
        footer: 'Uptime Monitor',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await axios.post(alertContact.value, payload);

    console.log(`💬 Slack notification sent`);
  } catch (error) {
    console.error('Slack notification failed:', error);
    throw error;
  }
}

// Send Discord notification
async function sendDiscordNotification(alertContact, data) {
  try {
    const { incident, monitor, type } = data;
    
    let color, title, description;
    
    if (type === 'incident_started') {
      color = 0xff0000; // Red
      title = `🚨 ${monitor.name} is down`;
      description = `Monitor ${monitor.name} is experiencing issues. We are investigating.`;
    } else if (type === 'incident_resolved') {
      color = 0x00ff00; // Green
      title = `✅ ${monitor.name} is back up`;
      description = `Monitor ${monitor.name} has recovered and is now operational.`;
    }

    const payload = {
      embeds: [{
        title,
        description,
        color,
        fields: [
          { name: 'Monitor', value: monitor.name, inline: true },
          { name: 'URL', value: monitor.url || monitor.ip, inline: true },
          { name: 'Severity', value: incident.severity, inline: true },
          { name: 'Started', value: incident.startedAt.toISOString(), inline: true }
        ],
        footer: { text: 'Uptime Monitor' },
        timestamp: incident.startedAt.toISOString()
      }]
    };

    await axios.post(alertContact.value, payload);

    console.log(`💬 Discord notification sent`);
  } catch (error) {
    console.error('Discord notification failed:', error);
    throw error;
  }
}

// Send webhook notification
async function sendWebhookNotification(alertContact, data) {
  try {
    const { incident, monitor, type } = data;
    
    const payload = {
      type,
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        ip: monitor.ip,
        type: monitor.type
      },
      incident: {
        id: incident.id,
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
        startedAt: incident.startedAt,
        resolvedAt: incident.resolvedAt
      },
      timestamp: new Date().toISOString()
    };

    await axios.post(alertContact.value, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Uptime-Monitor/1.0'
      }
    });

    console.log(`🔗 Webhook sent to ${alertContact.value}`);
  } catch (error) {
    console.error('Webhook notification failed:', error);
    throw error;
  }
}

// Send Telegram notification
async function sendTelegramNotification(alertContact, data) {
  try {
    const { incident, monitor, type } = data;
    
    let message;
    
    if (type === 'incident_started') {
      message = `🚨 *${monitor.name}* is down\n\n` +
                `Monitor: ${monitor.name}\n` +
                `URL: ${monitor.url || monitor.ip}\n` +
                `Started: ${incident.startedAt.toISOString()}\n` +
                `Severity: ${incident.severity}`;
    } else if (type === 'incident_resolved') {
      message = `✅ *${monitor.name}* is back up\n\n` +
                `Monitor: ${monitor.name}\n` +
                `URL: ${monitor.url || monitor.ip}\n` +
                `Resolved: ${incident.resolvedAt.toISOString()}`;
    }

    const payload = {
      chat_id: alertContact.value,
      text: message,
      parse_mode: 'Markdown'
    };

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, payload);

    console.log(`📱 Telegram notification sent`);
  } catch (error) {
    console.error('Telegram notification failed:', error);
    throw error;
  }
}

// Main notification sender
export async function sendNotification(type, data) {
  const { alertContact } = data;
  
  try {
    switch (alertContact.type) {
      case 'email':
        await sendEmailNotification(alertContact, data);
        break;
        
      case 'sms':
        await sendSmsNotification(alertContact, data);
        break;
        
      case 'slack':
        await sendSlackNotification(alertContact, data);
        break;
        
      case 'discord':
        await sendDiscordNotification(alertContact, data);
        break;
        
      case 'webhook':
        await sendWebhookNotification(alertContact, data);
        break;
        
      case 'telegram':
        await sendTelegramNotification(alertContact, data);
        break;
        
      default:
        console.warn(`Unknown notification type: ${alertContact.type}`);
    }
  } catch (error) {
    console.error(`Failed to send ${alertContact.type} notification:`, error);
    throw error;
  }
}

// Test notification
export async function testNotification(alertContact) {
  const testData = {
    incident: {
      id: 'test',
      title: 'Test Incident',
      status: 'investigating',
      severity: 'minor',
      startedAt: new Date(),
      resolvedAt: null
    },
    monitor: {
      id: 'test',
      name: 'Test Monitor',
      url: 'https://example.com',
      type: 'http'
    },
    type: 'incident_started'
  };

  try {
    await sendNotification('test', { alertContact, ...testData });
    return { success: true, message: 'Test notification sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Send Slack notification with webhook URL (for integrations)
export async function sendSlackWebhook(webhookUrl, title, text, color = '#36A64F', fields = []) {
  try {
    const payload = {
      attachments: [{
        color,
        title,
        text,
        fields,
        footer: 'Uptime Monitor',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await axios.post(webhookUrl, payload);
    console.log(`💬 Slack notification sent to webhook`);
  } catch (error) {
    console.error('Slack notification failed:', error);
    throw error;
  }
}

// Send notification to integration
export async function sendIntegrationNotification(integration, data) {
  try {
    const config = typeof integration.config === 'string' 
      ? JSON.parse(integration.config) 
      : integration.config;

    if (integration.type === 'slack' && config.webhookUrl) {
      const { incident, monitor, type } = data;
      let color, title, text;
      
      if (type === 'incident_started') {
        color = 'danger';
        title = `🚨 ${monitor.name} is down`;
        text = `Monitor ${monitor.name} is experiencing issues.`;
      } else if (type === 'incident_resolved') {
        color = 'good';
        title = `✅ ${monitor.name} is back up`;
        text = `Monitor ${monitor.name} has recovered.`;
      }

      const fields = [
        { title: 'Monitor', value: monitor.name, short: true },
        { title: 'URL', value: monitor.url || monitor.ip || 'N/A', short: true },
        { title: 'Severity', value: incident.severity, short: true },
        { title: 'Time', value: new Date().toLocaleString(), short: true }
      ];

      await sendSlackWebhook(config.webhookUrl, title, text, color, fields);
    }
    // Add other integration types here as needed
  } catch (error) {
    console.error(`Failed to send ${integration.type} notification:`, error);
    throw error;
  }
}

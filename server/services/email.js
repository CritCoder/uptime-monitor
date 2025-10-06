import nodemailer from 'nodemailer';

// Email transporter - use mock for development
const transporter = process.env.NODE_ENV === 'development' && 
  (process.env.SMTP_USER === 'your-email@gmail.com' || !process.env.SMTP_USER) 
  ? nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

// Email templates
const templates = {
  'email-verification': (data) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Uptime Monitor!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for signing up. Please click the link below to verify your email address:</p>
        <p><a href="${data.verificationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${data.verificationUrl}</p>
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  }),
  
  'password-reset': (data) => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${data.resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${data.resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  }),
  
  'monitor-down': (data) => ({
    subject: `🚨 ${data.monitor.name} is down`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Monitor Alert</h2>
        <p><strong>Monitor:</strong> ${data.monitor.name}</p>
        <p><strong>Status:</strong> <span style="color: #dc2626;">Down</span></p>
        <p><strong>URL:</strong> ${data.monitor.url || data.monitor.ip}</p>
        <p><strong>Started:</strong> ${new Date(data.incident.startedAt).toLocaleString()}</p>
        <p><strong>Severity:</strong> ${data.incident.severity}</p>
        <p>We are investigating the issue and will provide updates as they become available.</p>
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  }),
  
  'monitor-up': (data) => ({
    subject: `✅ ${data.monitor.name} is back up`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Monitor Recovery</h2>
        <p><strong>Monitor:</strong> ${data.monitor.name}</p>
        <p><strong>Status:</strong> <span style="color: #16a34a;">Up</span></p>
        <p><strong>URL:</strong> ${data.monitor.url || data.monitor.ip}</p>
        <p><strong>Resolved:</strong> ${new Date(data.incident.resolvedAt).toLocaleString()}</p>
        <p>The issue has been resolved and the monitor is now operational.</p>
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  }),
  
  'ssl-expiring': (data) => ({
    subject: `⚠️ SSL Certificate Expiring Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">SSL Certificate Alert</h2>
        <p><strong>Monitor:</strong> ${data.monitor.name}</p>
        <p><strong>URL:</strong> ${data.monitor.url}</p>
        <p><strong>Days until expiry:</strong> ${data.daysUntilExpiry}</p>
        <p>Please renew your SSL certificate before it expires to avoid service disruption.</p>
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  }),
  
  'weekly-report': (data) => ({
    subject: `📊 Weekly Uptime Report - ${data.workspace.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weekly Uptime Report</h2>
        <p>Here's your weekly uptime summary for ${data.workspace.name}:</p>
        
        <h3>Overall Statistics</h3>
        <ul>
          <li><strong>Average Uptime:</strong> ${data.avgUptime}%</li>
          <li><strong>Total Monitors:</strong> ${data.totalMonitors}</li>
          <li><strong>Up Monitors:</strong> ${data.upMonitors}</li>
          <li><strong>Down Monitors:</strong> ${data.downMonitors}</li>
          <li><strong>Incidents:</strong> ${data.incidents}</li>
        </ul>
        
        <h3>Monitor Status</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Monitor</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Status</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Uptime</th>
            </tr>
          </thead>
          <tbody>
            ${data.monitors.map(monitor => `
              <tr>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${monitor.name}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">
                  <span style="color: ${monitor.status === 'up' ? '#16a34a' : '#dc2626'};">
                    ${monitor.status === 'up' ? '✅ Up' : '❌ Down'}
                  </span>
                </td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${monitor.uptimePercentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p>Best regards,<br>The Uptime Monitor Team</p>
      </div>
    `
  })
};

// Send email
export async function sendEmail({ to, subject, template, data, html, text }) {
  try {
    let emailContent;
    
    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else {
      emailContent = { subject, html, text };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@uptime-monitor.com',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    // In development with mock transporter, just log the email
    if (process.env.NODE_ENV === 'development' && 
        (process.env.SMTP_USER === 'your-email@gmail.com' || !process.env.SMTP_USER)) {
      console.log(`📧 [DEV MODE] Email would be sent to ${to}:`);
      console.log(`   Subject: ${emailContent.subject}`);
      console.log(`   From: ${mailOptions.from}`);
      console.log(`   To: ${to}`);
      return { messageId: 'dev-mock-' + Date.now(), accepted: [to] };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Send bulk emails
export async function sendBulkEmails(emails) {
  try {
    const results = await Promise.allSettled(
      emails.map(email => sendEmail(email))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`📧 Bulk email: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    // In development with mock transporter, always return true
    if (process.env.NODE_ENV === 'development' && 
        (process.env.SMTP_USER === 'your-email@gmail.com' || !process.env.SMTP_USER)) {
      console.log('✅ Email configuration verified (dev mode)');
      return true;
    }
    
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error);
    return false;
  }
}

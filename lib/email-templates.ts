interface CustomerEmailData {
  firstName: string
  trackingId: string
  subject: string
  message: string
}

interface InternalEmailData {
  trackingId: string
  firstName: string
  lastName: string
  email: string
  company: string
  phone?: string
  subject: string
  message: string
  priority: string
  assignedTo: string
  followUpDate: string
}

export function getCustomerConfirmationEmail(data: CustomerEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for contacting INVOXA</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .tracking-box { background: #f1f5f9; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .message-summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; }
        .social-links { margin: 20px 0; }
        .social-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
        @media (max-width: 600px) {
          .features { grid-template-columns: 1fr; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📊 INVOXA</div>
          <h1>Thank you for reaching out!</h1>
          <p>We've received your message and will respond within 24 hours</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.firstName},</p>
          
          <p>Thank you for contacting INVOXA! We're excited to help you streamline your invoicing and business management processes.</p>
          
          <div class="tracking-box">
            <h3>📋 Your Request Details</h3>
            <p><strong>Tracking ID:</strong> ${data.trackingId}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="message-summary">
            <h4>Your Message:</h4>
            <p style="font-style: italic;">"${data.message}"</p>
          </div>
          
          <h3>🚀 While you wait, explore what INVOXA can do:</h3>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <h4>AI-Powered Invoicing</h4>
              <p>Smart invoice generation with predictive analytics</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🔗</div>
              <h4>Blockchain Security</h4>
              <p>Immutable invoice records and secure payments</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <h4>Advanced Analytics</h4>
              <p>Real-time insights and business intelligence</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🌍</div>
              <h4>Global Payments</h4>
              <p>Multi-currency support and international transactions</p>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://invoxa.com/dashboard" class="cta-button">Explore INVOXA Dashboard</a>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your inquiry within 2 hours</li>
            <li>You'll receive a personalized response within 24 hours</li>
            <li>We'll schedule a demo if you're interested in seeing INVOXA in action</li>
          </ul>
          
          <p>If you have any urgent questions, feel free to reply to this email or call us at <strong>+1 (555) 123-4567</strong>.</p>
          
          <p>Best regards,<br>
          <strong>The INVOXA Team</strong><br>
          <em>Revolutionizing Business Management</em></p>
        </div>
        
        <div class="footer">
          <p><strong>INVOXA</strong> - AI-Powered Invoice Management Platform</p>
          <div class="social-links">
            <a href="https://twitter.com/invoxa">Twitter</a> |
            <a href="https://linkedin.com/company/invoxa">LinkedIn</a> |
            <a href="https://invoxa.com/blog">Blog</a>
          </div>
          <p style="font-size: 12px; margin-top: 20px;">
            This email was sent to confirm your contact form submission.<br>
            If you didn't submit this form, please ignore this email.<br>
            <a href="https://invoxa.com/unsubscribe" style="color: #667eea;">Unsubscribe</a> | 
            <a href="https://invoxa.com/privacy" style="color: #667eea;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getInternalNotificationEmail(data: InternalEmailData): string {
  const priorityColors = {
    urgent: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
  }

  const priorityColor = priorityColors[data.priority as keyof typeof priorityColors] || "#6b7280"

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Alert - ${data.trackingId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; }
        .alert-badge { background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 10px; font-size: 14px; font-weight: bold; }
        .priority-badge { background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .content { padding: 30px; }
        .lead-info { background: #f8fafc; border-radius: 8px; padding: 25px; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea; }
        .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
        .info-value { font-size: 16px; color: #1f2937; font-weight: 600; }
        .message-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
        .btn-primary { background: #667eea; color: white; }
        .btn-secondary { background: #e5e7eb; color: #374151; }
        .sla-warning { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr; }
          .btn { display: block; margin: 10px 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-badge">🚨 NEW LEAD ALERT</div>
          <h1>High Priority Contact Submission</h1>
          <p>Tracking ID: <strong>${data.trackingId}</strong></p>
          <span class="priority-badge">${data.priority} Priority</span>
        </div>
        
        <div class="content">
          <div class="lead-info">
            <h2>👤 Lead Information</h2>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${data.firstName} ${data.lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Company</div>
                <div class="info-value">${data.company}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${data.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${data.phone || "Not provided"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Subject</div>
                <div class="info-value">${data.subject}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Assigned To</div>
                <div class="info-value">${data.assignedTo}</div>
              </div>
            </div>
          </div>
          
          <div class="message-box">
            <h3>💬 Customer Message:</h3>
            <p style="font-style: italic; font-size: 16px; line-height: 1.6;">"${data.message}"</p>
          </div>
          
          <div class="sla-warning">
            <strong>⏰ SLA Reminder:</strong> This ${data.priority} priority lead requires response within 
            ${data.priority === "urgent" ? "2 hours" : data.priority === "high" ? "24 hours" : "3 days"}
            <br>Follow-up scheduled for: <strong>${data.followUpDate}</strong>
          </div>
          
          <div class="action-buttons">
            <a href="mailto:${data.email}?subject=Re: ${data.subject} - ${data.trackingId}" class="btn btn-primary">
              📧 Reply to Lead
            </a>
            <a href="https://invoxa.com/admin/contacts" class="btn btn-secondary">
              👀 View in CRM
            </a>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #0369a1; margin-top: 0;">📊 Lead Scoring Analysis:</h4>
            <ul style="margin: 0; color: #0369a1;">
              <li><strong>Priority Level:</strong> ${data.priority.toUpperCase()} (${data.subject})</li>
              <li><strong>Lead Source:</strong> Website Contact Form</li>
              <li><strong>Company Size:</strong> To be determined during qualification</li>
              <li><strong>Recommended Action:</strong> ${data.priority === "urgent" ? "Immediate phone call" : "Email response within SLA"}</li>
            </ul>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Respond to the lead within the SLA timeframe</li>
            <li>Qualify the lead and update CRM status</li>
            <li>Schedule demo if appropriate</li>
            <li>Set follow-up reminders</li>
          </ol>
        </div>
        
        <div class="footer">
          <p><strong>INVOXA CRM System</strong> - Automated Lead Management</p>
          <p>This alert was generated automatically. Do not reply to this email.</p>
          <p>For technical issues, contact: <a href="mailto:tech@invoxa.com" style="color: #667eea;">tech@invoxa.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

# SMTP Configuration for Ghost

Ghost now supports SMTP email configuration as an alternative to Mailgun. This allows you to use your own email service provider for sending emails.

## Features Added

1. **SMTP Settings UI**: New admin interface for configuring SMTP settings
2. **Multiple SMTP Services**: Support for popular email services like Gmail, Outlook, Yahoo, etc.
3. **Custom SMTP**: Configure any SMTP server with custom host and port settings
4. **Security Options**: Support for TLS, SSL, and non-secure connections

## Configuration Options

### Via Admin Interface

1. Go to **Settings** → **Email** in your Ghost admin panel
2. You'll see a new "SMTP Configuration" section
3. Choose from:
   - **Predefined Services**: Gmail, Outlook365, Yahoo, Hotmail, iCloud, SendGrid, etc.
   - **Custom SMTP**: Manual configuration with host, port, and security settings

### Via Configuration File

You can also configure SMTP via your `config.production.json` or `config.development.json`:

```json
{
  "mail": {
    "transport": "SMTP",
    "options": {
      "service": "Gmail",
      "auth": {
        "user": "your-email@gmail.com",
        "pass": "your-app-password"
      }
    }
  }
}
```

Or for custom SMTP:

```json
{
  "mail": {
    "transport": "SMTP",
    "options": {
      "host": "smtp.example.com",
      "port": 587,
      "secure": false,
      "requireTLS": true,
      "auth": {
        "user": "your-username",
        "pass": "your-password"
      }
    }
  }
}
```

## Popular Email Service Settings

### Gmail
- **Service**: Gmail
- **Username**: your-email@gmail.com
- **Password**: Use an App Password (not your regular password)
- **Security**: TLS (port 587)

### Outlook/Hotmail
- **Service**: Outlook365
- **Username**: your-email@outlook.com
- **Password**: Your account password
- **Security**: TLS (port 587)

### Custom SMTP (e.g., cPanel hosting)
- **Host**: mail.yourdomain.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Username**: your-email@yourdomain.com
- **Password**: Your email password
- **Security**: TLS or SSL

## Security Notes

1. **App Passwords**: For Gmail and other services, use app-specific passwords instead of your main account password
2. **TLS/SSL**: Always use encrypted connections (TLS or SSL) when possible
3. **Firewall**: Ensure your server can connect to the SMTP server on the specified port

## Troubleshooting

1. **Authentication Failed**: Check your username and password
2. **Connection Timeout**: Verify the host and port settings
3. **TLS/SSL Errors**: Try different security settings (TLS vs SSL vs None)
4. **Rate Limiting**: Some providers limit the number of emails per hour

## Database Settings

The following settings are stored in the Ghost database:

- `smtp_host`: SMTP server hostname
- `smtp_port`: SMTP server port
- `smtp_user`: SMTP username
- `smtp_password`: SMTP password
- `smtp_secure`: Security type (tls, ssl, none)
- `smtp_service`: Predefined service name

## Implementation Details

- SMTP configuration takes precedence over Mailgun when configured
- Settings are stored securely in the Ghost database
- The mailer automatically detects SMTP configuration and uses it
- Metrics are tracked for SMTP email sending
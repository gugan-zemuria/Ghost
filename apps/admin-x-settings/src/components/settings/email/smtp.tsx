import React from 'react';
import TopLevelGroup from '../../top-level-group';
import useSettingGroup from '../../../hooks/use-setting-group';
import {Select, SettingGroupContent, TextField, withErrorBoundary} from '@tryghost/admin-x-design-system';
import {getSettingValues} from '@tryghost/admin-x-framework/api/settings';

const SMTP: React.FC<{keywords: string[]}> = ({keywords}) => {
    const {
        localSettings,
        isEditing,
        saveState,
        handleSave,
        handleCancel,
        updateSetting,
        handleEditingChange
    } = useSettingGroup();

    // Get current SMTP settings from Ghost config
    const [smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, smtpService] = getSettingValues(localSettings, [
        'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure', 'smtp_service'
    ]) as string[];

    const smtpServiceOptions = [
        {label: 'Custom SMTP', value: ''},
        {label: 'Gmail', value: 'Gmail'},
        {label: 'Outlook365', value: 'Outlook365'},
        {label: 'Yahoo', value: 'Yahoo'},
        {label: 'Hotmail', value: 'Hotmail'},
        {label: 'iCloud', value: 'iCloud'},
        {label: 'SendGrid', value: 'SendGrid'},
        {label: 'Mailjet', value: 'Mailjet'},
        {label: 'Postmark', value: 'Postmark'},
        {label: 'SES', value: 'SES'}
    ];

    const inputs = (
        <div className="flex flex-col gap-6">
            <Select
                hint="Choose a service or select Custom SMTP for manual configuration"
                options={smtpServiceOptions}
                selectedOption={smtpServiceOptions.find(option => option.value === smtpService)}
                title="SMTP Service"
                onSelect={(option) => {
                    updateSetting('smtp_service', option?.value || '');
                    // Clear manual settings when selecting a service
                    if (option?.value) {
                        updateSetting('smtp_host', '');
                        updateSetting('smtp_port', '');
                    }
                }}
            />

            {!smtpService && (
                <>
                    <TextField
                        hint="Your SMTP server hostname (e.g., smtp.gmail.com)"
                        placeholder="smtp.example.com"
                        title="SMTP Host"
                        value={smtpHost || ''}
                        onChange={(e) => {
                            updateSetting('smtp_host', e.target.value);
                        }}
                    />

                    <TextField
                        hint="SMTP port (usually 587 for TLS, 465 for SSL, 25 for non-secure)"
                        placeholder="587"
                        title="SMTP Port"
                        type="number"
                        value={smtpPort || ''}
                        onChange={(e) => {
                            updateSetting('smtp_port', e.target.value);
                        }}
                    />
                </>
            )}

            <TextField
                hint="Your email address or SMTP username"
                placeholder="your-email@example.com"
                title="SMTP Username"
                value={smtpUser || ''}
                onChange={(e) => {
                    updateSetting('smtp_user', e.target.value);
                }}
            />

            <TextField
                hint="Your email password or app-specific password"
                placeholder="••••••••"
                title="SMTP Password"
                type="password"
                value={smtpPassword || ''}
                onChange={(e) => {
                    updateSetting('smtp_password', e.target.value);
                }}
            />

            <Select
                hint="Use TLS for port 587, SSL for port 465, or None for port 25"
                options={[
                    {label: 'TLS (recommended)', value: 'tls'},
                    {label: 'SSL', value: 'ssl'},
                    {label: 'None', value: 'none'}
                ]}
                selectedOption={{
                    label: smtpSecure === 'ssl' ? 'SSL' : smtpSecure === 'tls' ? 'TLS (recommended)' : 'None',
                    value: smtpSecure || 'tls'
                }}
                title="Security"
                onSelect={(option) => {
                    updateSetting('smtp_secure', option?.value || 'tls');
                }}
            />


        </div>
    );

    return (
        <TopLevelGroup
            description="Configure SMTP to send emails through your own email service. This is an alternative to Mailgun."
            isEditing={isEditing}
            keywords={keywords}
            navid='smtp'
            saveState={saveState}
            testId='smtp'
            title="SMTP Configuration"
            onCancel={handleCancel}
            onEditingChange={handleEditingChange}
            onSave={handleSave}
        >
            <SettingGroupContent>
                {inputs}
            </SettingGroupContent>
        </TopLevelGroup>
    );
};

export default withErrorBoundary(SMTP, 'SMTP settings');
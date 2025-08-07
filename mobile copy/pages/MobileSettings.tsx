import React from 'react';
import { Button } from '../../common/components/ui/Button';
import { Switch } from '../../common/components/ui/Switch';
import { useTheme } from '../../common/providers/ThemeProvider';
import { useSettings } from '../../features/settings/hooks/useSettings';
import { SettingsSection } from '../../features/settings/components/SettingsSection';
import { LoadingSpinner } from '../../common/components/ui/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MobileSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, isLoading, error, updateNotifications, updateSecurity } = useSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: {error?.message || 'Failed to load settings'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Profile Settings"
        description="Manage your profile information and preferences"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-user text-xl" />
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">Edit Profile</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Theme</span>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <Switch
              checked={settings.notifications.enabled}
              onCheckedChange={(checked) => {
                updateNotifications({ enabled: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Email Updates</span>
            <Switch
              checked={settings.notifications.emailUpdates}
              onCheckedChange={(checked) => {
                updateNotifications({ emailUpdates: checked });
              }}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Security">
        <div className="space-y-2">
          <Button variant="outline" className="w-full">Change Password</Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              updateSecurity({ twoFactorEnabled: !settings.security.twoFactorEnabled });
            }}
          >
            {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">Connected Devices</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="App Settings">
        <div className="space-y-2">
          <Button variant="outline" className="w-full">Currency Preferences</Button>
          <Button variant="outline" className="w-full">Language Settings</Button>
          <Button variant="outline" className="w-full">Data Export</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Account Actions">
        <div className="space-y-2">
          <Button variant="default" className="w-full">Support</Button>
          <Button variant="destructive" className="w-full">Sign Out</Button>
        </div>
      </SettingsSection>
    </div>
  );
};

export default MobileSettings; 
'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { useState, useEffect, useCallback } from 'react';
import { Building2, Clock, Camera, Save, Globe, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function CompanySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    companyName: '',
    companyCode: '',
    address: '',
    website: '',
    timezone: 'America/Los_Angeles',
    workStartTime: '09:00',
    workEndTime: '18:00',
    lunchStartTime: '12:00',
    lunchDuration: '60',
    cameraVerification: true,
    gpsTracking: false,
    randomVerification: true,
    verificationInterval: '120',
  });

  const fetchCompanySettings = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('companies')
        .select('*')
        .eq('id', user.companyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          companyName: data.name || '',
          companyCode: data.code || '',
          address: data.address || '',
          website: data.website || '',
          timezone: data.timezone || 'America/Los_Angeles',
          workStartTime: data.work_start_time || '09:00',
          workEndTime: data.work_end_time || '18:00',
          lunchStartTime: data.lunch_start_time || '12:00',
          lunchDuration: String(data.lunch_duration || 60),
          cameraVerification: data.camera_verification ?? true,
          gpsTracking: data.gps_tracking ?? false,
          randomVerification: data.random_verification ?? true,
          verificationInterval: String(data.verification_interval || 120),
        });
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, toast]);

  useEffect(() => {
    fetchCompanySettings();
  }, [fetchCompanySettings]);

  const handleSave = async () => {
    if (!settings.id) {
      toast({
        title: 'Error',
        description: 'No company found to update.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('companies')
        .update({ name: settings.companyName })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Your company settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedLayout>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Company Settings</h1>
            <p className="text-muted-foreground">Manage your company configuration</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic information about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code</Label>
                <div className="relative">
                  <Input
                    id="companyCode"
                    value={settings.companyCode}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      navigator.clipboard.writeText(settings.companyCode);
                      toast({ title: 'Copied!', description: 'Company code copied to clipboard.' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this code with employees to join</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    <SelectItem value="Europe/London">UK (GMT/BST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Work Hours Policy
            </CardTitle>
            <CardDescription>Configure standard work hours and breaks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStartTime">Work Start Time</Label>
                <Input
                  id="workStartTime"
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEndTime">Work End Time</Label>
                <Input
                  id="workEndTime"
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lunchStartTime">Lunch Start Time</Label>
                <Input
                  id="lunchStartTime"
                  type="time"
                  value={settings.lunchStartTime}
                  onChange={(e) => setSettings({ ...settings, lunchStartTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunchDuration">Lunch Duration (minutes)</Label>
                <Select
                  value={settings.lunchDuration}
                  onValueChange={(value) => setSettings({ ...settings, lunchDuration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Verification Settings
            </CardTitle>
            <CardDescription>Configure attendance verification features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Camera Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require photo verification for clock-in/out
                </p>
              </div>
              <Switch
                checked={settings.cameraVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, cameraVerification: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GPS Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Record location during clock-in/out
                </p>
              </div>
              <Switch
                checked={settings.gpsTracking}
                onCheckedChange={(checked) => setSettings({ ...settings, gpsTracking: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Random Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Send random verification requests during work hours
                </p>
              </div>
              <Switch
                checked={settings.randomVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, randomVerification: checked })}
              />
            </div>
            {settings.randomVerification && (
              <div className="space-y-2 pl-4 border-l-2 border-primary">
                <Label htmlFor="verificationInterval">Verification Interval (minutes)</Label>
                <Select
                  value={settings.verificationInterval}
                  onValueChange={(value) => setSettings({ ...settings, verificationInterval: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">Every 60 minutes</SelectItem>
                    <SelectItem value="90">Every 90 minutes</SelectItem>
                    <SelectItem value="120">Every 120 minutes</SelectItem>
                    <SelectItem value="180">Every 180 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </ProtectedLayout>
  );
}

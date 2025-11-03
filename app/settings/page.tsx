'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Integrations {
  resendApiKey: string | null;
  resendFromEmail: string | null;
  linearApiKey: string | null;
  hasResendKey: boolean;
  hasLinearKey: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState('');
  const [linearApiKey, setLinearApiKey] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/user/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
        setResendFromEmail(data.resendFromEmail || '');
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegrations = async () => {
    setSaving(true);
    try {
      const updates: {
        resendApiKey?: string;
        resendFromEmail?: string;
        linearApiKey?: string;
      } = {};

      if (resendApiKey) updates.resendApiKey = resendApiKey;
      if (resendFromEmail) updates.resendFromEmail = resendFromEmail;
      if (linearApiKey) updates.linearApiKey = linearApiKey;

      const response = await fetch('/api/user/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadIntegrations();
        setResendApiKey('');
        setLinearApiKey('');
        alert('Integrations saved successfully');
      } else {
        alert('Failed to save integrations');
      }
    } catch (error) {
      console.error('Failed to save integrations:', error);
      alert('Failed to save integrations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your integrations and API keys</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resend (Email)</CardTitle>
          <CardDescription>
            Configure your Resend API key to send emails from workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resendApiKey">API Key</Label>
            <Input
              id="resendApiKey"
              type="password"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder={
                integrations?.hasResendKey ? 'API key is configured' : 'Enter your Resend API key'
              }
            />
            <p className="text-muted-foreground text-sm">
              Get your API key from{' '}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                resend.com/api-keys
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resendFromEmail">From Email</Label>
            <Input
              id="resendFromEmail"
              type="email"
              value={resendFromEmail}
              onChange={(e) => setResendFromEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
            <p className="text-muted-foreground text-sm">
              The email address that will appear as the sender
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linear</CardTitle>
          <CardDescription>
            Configure your Linear API key to create and manage tickets from workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linearApiKey">API Key</Label>
            <Input
              id="linearApiKey"
              type="password"
              value={linearApiKey}
              onChange={(e) => setLinearApiKey(e.target.value)}
              placeholder={
                integrations?.hasLinearKey ? 'API key is configured' : 'Enter your Linear API key'
              }
            />
            <p className="text-muted-foreground text-sm">
              Get your API key from{' '}
              <a
                href="https://linear.app/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                linear.app/settings/api
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={saveIntegrations} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

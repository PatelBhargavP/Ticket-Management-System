'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApiKeyListItem {
  keyId: string;
  name?: string;
  createdAt: Date | string;
  expiresAt?: Date | string;
  lastUsedAt?: Date | string;
  isActive: boolean;
}

interface CreateApiKeyResult {
  apiKey: string;
  keyId: string;
  name?: string;
  createdAt: Date | string;
  expiresAt?: Date | string;
}

interface ApiKeysPageClientProps {
  apiKeysPromise?: Promise<ApiKeyListItem[]>;
}

export default function ApiKeysPageClient({ apiKeysPromise }: ApiKeysPageClientProps) {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [keyName, setKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('0.5');

  // Fetch API keys from API endpoint
  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/mcp-auth/api-key', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setLoading(false);
    }
  };

  // Initial load - use promise if provided, otherwise fetch from API
  useEffect(() => {
    if (apiKeysPromise) {
      apiKeysPromise
        .then((keys) => {
          setApiKeys(keys);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading API keys:', error);
          // Fallback to API fetch
          fetchApiKeys();
        });
    } else {
      fetchApiKeys();
    }
  }, [apiKeysPromise]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    // Handle empty or 0 as no expiration
    const daysValue = expiresInDays.trim() === '' || parseFloat(expiresInDays) === 0
      ? undefined
      : parseFloat(expiresInDays);

    if (daysValue !== undefined) {
      if (isNaN(daysValue) || daysValue <= 0 || daysValue > 365) {
        alert('Expiry days must be greater than 0 and not more than 365');
        return;
      }
    }

    setCreating(true);
    try {
      const response = await fetch('/api/mcp-auth/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: keyName || undefined,
          expiresInDays: daysValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const result: CreateApiKeyResult = await response.json();
      
      // Verify we received the plain text API key (not hash)
      if (!result.apiKey || !result.apiKey.startsWith('tms_')) {
        alert('Error: Invalid API key format received. Please try again.');
        return;
      }
      
      // Set the plain text key to display (this is the only time it's available)
      setNewKey(result.apiKey);
      setShowCreateDialog(false);
      setShowKeyDialog(true);
      setKeyName('');
      setExpiresInDays('0.5');

      // Refresh the list
      await fetchApiKeys();
      router.refresh();
    } catch (error) {
      console.error('Error creating API key:', error);
      alert(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? It will no longer work.')) {
      return;
    }

    setRevoking(keyId);
    try {
      const response = await fetch(`/api/mcp-auth/api-key/${keyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to revoke API key');
      }

      // Refresh the list
      await fetchApiKeys();
      router.refresh();
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert(error instanceof Error ? error.message : 'Failed to revoke API key');
    } finally {
      setRevoking(null);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(keyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const isExpired = (expiresAt: Date | string | undefined): boolean => {
    if (!expiresAt) return false;
    const d = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    return d < new Date();
  };

  if (loading) {
    return <div className="text-center py-8">Loading API keys...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Your API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Use these keys to authenticate with the MCP chat client
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              You don't have any API keys yet. Create one to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.keyId}>
                    <TableCell className="font-medium">
                      {key.name || 'Unnamed Key'}
                    </TableCell>
                    <TableCell>
                      {isExpired(key.expiresAt) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : !key.isActive ? (
                        <Badge variant="secondary">Revoked</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>
                      {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.keyId, key.keyId)}
                          title="Copy Key ID"
                        >
                          {copied === key.keyId ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {key.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(key.keyId)}
                            disabled={revoking === key.keyId}
                            className="text-red-600 hover:text-red-700"
                            title="Revoke Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for MCP client authentication. The key will only be shown once.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKey}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name (Optional)</Label>
                <Input
                  id="key-name"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., MCP Chat Client"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires-days">
                  Expires In (Days)
                </Label>
                <Input
                  id="expires-days"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="365"
                  value={expiresInDays}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty, 0, or valid range
                    if (val === '' || val === '0' || (parseFloat(val) >= 0.1 && parseFloat(val) <= 365)) {
                      setExpiresInDays(val);
                    }
                  }}
                  placeholder="0.5"
                />
                <p className="text-xs text-muted-foreground">
                  Default: 0.5 days (12 hours). Maximum: 365 days. Set to 0 or leave empty for no expiration.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setKeyName('');
                  setExpiresInDays('0.5');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Key'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show New API Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy this key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> This is the only time you'll see this key. Make sure to copy it now.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={newKey || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => newKey && copyToClipboard(newKey, 'new-key')}
                >
                  {copied === 'new-key' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowKeyDialog(false);
              setNewKey(null);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/shared/ThemeToggle";
import {
  Bell,
  Mail,
  Smartphone,
  Shield,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChangePinForm from "@/components/auth/ChangePinForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Settings = () => {
  const [showPinDialog, setShowPinDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Settings" />

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Currency</Label>
                <p className="text-sm text-muted-foreground">
                  Set your preferred currency
                </p>
              </div>
              <Select defaultValue="usd">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Biometric Login</Label>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face ID
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Wallet PIN</Label>
                <p className="text-sm text-muted-foreground">
                  Update your wallet PIN
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPinDialog(true)}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Change PIN
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Balance</Label>
                <p className="text-sm text-muted-foreground">
                  Display account balance
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're online
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Wallet PIN</DialogTitle>
          </DialogHeader>
          <ChangePinForm onClose={() => setShowPinDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;

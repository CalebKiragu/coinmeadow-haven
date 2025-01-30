import { useState } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  FileText,
  MessageSquare,
  Trash2,
  Upload,
  UserCog,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Account = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  });

  const handleProfileUpdate = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Account" />
      
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Card className="glass-effect">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0">
                  <div className="p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <CardTitle className="text-2xl font-bold">
                {profileData.firstName} {profileData.lastName}
              </CardTitle>
              <CardDescription>@{profileData.username}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  placeholder="Username"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                />
                <Input
                  placeholder="First Name"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, firstName: e.target.value })
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="w-full" onClick={handleProfileUpdate}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Date Joined</p>
                <p className="font-medium">January 15, 2024</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="font-medium">47</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Trades</p>
                <p className="font-medium">23</p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Export Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() =>
                  toast({
                    variant: "destructive",
                    title: "Warning",
                    description:
                      "This action cannot be undone. Please contact support.",
                  })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disable Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
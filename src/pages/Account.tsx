import { useAppSelector } from "@/lib/redux/hooks";
import GlassCard from "@/components/ui/GlassCard";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import IdentityDisplay from "@/components/web3/IdentityDisplay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Account = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-dark via-coffee-dark to-black/40 p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            User Not Found
          </h2>
          <p className="text-white/70">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4">
      <NavigationHeader title="Account" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <GlassCard className="p-4 border border-white/10">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.profileImg || "/placeholder.svg"}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="text-xl">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-400">{user.phone}</p>
              )}
            </div>

            <Card className="w-full max-w-fit bg-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Connected Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <IdentityDisplay showDisconnect={true} compact={false} />
              </CardContent>
            </Card>
          </div>
        </GlassCard>

        {/* Account Details */}
        <GlassCard className="p-4 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Account ID</span>
              <span>{user.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Account Status</span>
              <span className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    user.verified ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></span>
                {user.verified ? "Verified" : "Pending Verification"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Account Type</span>
              <span>Personal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Joined</span>
              <span>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Account;

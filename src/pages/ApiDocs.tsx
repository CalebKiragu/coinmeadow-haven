
import { useState } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

const codeExamples = {
  javascript: {
    authentication: `// Using fetch
const response = await fetch('https://api.coinduka.com/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  },
  body: JSON.stringify({
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret'
  })
});`,
    sendTransaction: `// Send a transaction
const response = await fetch('https://api.coinduka.com/v1/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  },
  body: JSON.stringify({
    amount: 1000,
    recipient: '+254700000000',
    currency: 'KES',
    description: 'Test payment'
  })
});`,
    queryTransaction: `// Query a transaction
const response = await fetch('https://api.coinduka.com/v1/transactions/tx_123', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});`,
  },
  typescript: {
    authentication: `// Using axios with TypeScript
interface AuthResponse {
  token: string;
  expiresIn: number;
}

const response = await axios.post<AuthResponse>('https://api.coinduka.com/v1/auth', {
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
}, {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});`,
    sendTransaction: `// Send a transaction
interface Transaction {
  amount: number;
  recipient: string;
  currency: string;
  description?: string;
}

const response = await axios.post<Transaction>('https://api.coinduka.com/v1/transactions', {
  amount: 1000,
  recipient: '+254700000000',
  currency: 'KES',
  description: 'Test payment'
}, {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});`,
    queryTransaction: `// Query a transaction
interface TransactionDetails {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  recipient: string;
}

const response = await axios.get<TransactionDetails>(
  'https://api.coinduka.com/v1/transactions/tx_123',
  {
    headers: {
      'X-API-Key': 'your_api_key_here'
    }
  }
);`,
  },
  python: {
    authentication: `# Using requests
import requests

response = requests.post(
    'https://api.coinduka.com/v1/auth',
    json={
        'client_id': 'your_client_id',
        'client_secret': 'your_client_secret'
    },
    headers={
        'X-API-Key': 'your_api_key_here'
    }
)`,
    sendTransaction: `# Send a transaction
response = requests.post(
    'https://api.coinduka.com/v1/transactions',
    json={
        'amount': 1000,
        'recipient': '+254700000000',
        'currency': 'KES',
        'description': 'Test payment'
    },
    headers={
        'X-API-Key': 'your_api_key_here'
    }
)`,
    queryTransaction: `# Query a transaction
response = requests.get(
    'https://api.coinduka.com/v1/transactions/tx_123',
    headers={
        'X-API-Key': 'your_api_key_here'
    }
)`,
  },
};

const ApiDocs = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const { toast } = useToast();

  const handleRegenerateKey = () => {
    toast({
      title: "API Key Regenerated",
      description: "Your new API key has been generated and copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <NavigationHeader title="API Documentation" />

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              API Keys
              <Button
                variant="outline"
                onClick={handleRegenerateKey}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Key
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              sk_test_51ABC123...
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Keep your API keys secure and never share them in public repositories
              or client-side code.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="javascript" onValueChange={setSelectedLanguage}>
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <div className="space-y-8 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].authentication}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Send a Transaction</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].sendTransaction}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Query a Transaction</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].queryTransaction}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The API is rate limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-muted-foreground">
              <li>100 requests per minute for authentication endpoints</li>
              <li>1000 requests per minute for transaction queries</li>
              <li>50 requests per minute for transaction creation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;

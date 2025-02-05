
import { useState } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, PlayCircle } from "lucide-react";

const codeExamples = {
  javascript: {
    authentication: {
      description: "Authenticate with CoinDuka API using your client credentials to receive an access token.",
      code: `// Using fetch
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
});`
    },
    sendTransaction: {
      description: "Send money to another user using their phone number or email. The recipient will receive an SMS/email notification.",
      code: `// Send a transaction
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
});`
    },
    queryTransaction: {
      description: "Query the status and details of a specific transaction using its ID.",
      code: `// Query a transaction
const response = await fetch('https://api.coinduka.com/v1/transactions/tx_123', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});`
    }
  },
  typescript: {
    authentication: {
      description: "Type-safe authentication with full TypeScript support.",
      code: `// Using axios with TypeScript
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
});`
    },
    sendTransaction: {
      description: "Send transactions with type safety and better error handling.",
      code: `// Send a transaction
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
});`
    },
    queryTransaction: {
      description: "Query transactions with proper TypeScript interfaces.",
      code: `// Query a transaction
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
);`
    }
  },
  python: {
    authentication: {
      description: "Simple authentication using the requests library in Python.",
      code: `# Using requests
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
)`
    },
    sendTransaction: {
      description: "Send transactions easily with Python's requests library.",
      code: `# Send a transaction
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
)`
    },
    queryTransaction: {
      description: "Query transaction details with a simple GET request.",
      code: `# Query a transaction
response = requests.get(
    'https://api.coinduka.com/v1/transactions/tx_123',
    headers={
        'X-API-Key': 'your_api_key_here'
    }
)`
    }
  }
};

const ApiDocs = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [apiResponse, setApiResponse] = useState<{ code: number; data: any } | null>(null);
  const { toast } = useToast();

  const handleRegenerateKey = () => {
    toast({
      title: "API Key Regenerated",
      description: "Your new API key has been generated and copied to clipboard.",
    });
  };

  const handleTryRequest = async (endpoint: string) => {
    try {
      // Simulate API call with random response codes
      const codes = [200, 400, 401, 403, 404, 500];
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      
      const mockResponses = {
        200: { status: "success", data: { message: "Request successful" } },
        400: { status: "error", message: "Bad request" },
        401: { status: "error", message: "Unauthorized" },
        403: { status: "error", message: "Forbidden" },
        404: { status: "error", message: "Not found" },
        500: { status: "error", message: "Internal server error" }
      };

      setApiResponse({ code: randomCode, data: mockResponses[randomCode as keyof typeof mockResponses] });
    } catch (error) {
      setApiResponse({ code: 500, data: { status: "error", message: "Request failed" } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#221F26] via-[#403E43] to-[#0EA5E9] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <NavigationHeader title="API Documentation" />

        <Card className="bg-[#221F26]/80 border-[#0EA5E9]/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              API Keys
              <Button
                variant="outline"
                onClick={handleRegenerateKey}
                className="flex items-center gap-2 bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 border-[#0EA5E9]/30"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Key
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#403E43] p-4 rounded-lg font-mono text-sm text-white/90">
              sk_test_51ABC123...
            </div>
            <p className="text-sm text-white/70 mt-2">
              Keep your API keys secure and never share them in public repositories
              or client-side code.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#221F26]/80 border-[#0EA5E9]/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="javascript" onValueChange={setSelectedLanguage}>
              <TabsList className="bg-[#403E43]">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <div className="space-y-8 mt-6">
                {Object.entries(codeExamples[selectedLanguage as keyof typeof codeExamples]).map(([key, { description, code }]) => (
                  <div key={key} className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 capitalize">{key}</h3>
                        <p className="text-white/70 text-sm mb-4">{description}</p>
                      </div>
                      <Button
                        onClick={() => handleTryRequest(key)}
                        className="flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0EA5E9]/80"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Try Now
                      </Button>
                    </div>
                    <pre className="bg-[#403E43] p-4 rounded-lg overflow-x-auto text-white/90">
                      <code>{code}</code>
                    </pre>
                    {apiResponse && (
                      <Alert className={`mt-4 ${
                        apiResponse.code === 200 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
                      }`}>
                        <AlertDescription>
                          <div className="font-mono">
                            <span className="font-bold">Status: {apiResponse.code}</span>
                            <pre className="mt-2 text-sm">
                              {JSON.stringify(apiResponse.data, null, 2)}
                            </pre>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-[#221F26]/80 border-[#0EA5E9]/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-sm">
              The API is rate limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-white/70">
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

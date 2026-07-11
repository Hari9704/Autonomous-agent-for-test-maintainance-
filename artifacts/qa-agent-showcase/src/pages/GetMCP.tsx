import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePurchaseAccess, useClassifySample } from '@workspace/api-client-react';
import { Loader2, Key, Terminal, Code, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function GetMCP() {
  const [email, setEmail] = useState('');
  
  const purchaseMutation = usePurchaseAccess();
  
  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    purchaseMutation.mutate({ data: { email } });
  };

  const [sampleError, setSampleError] = useState('TimeoutException: element not visible in time');
  const classifyMutation = useClassifySample({
    request: {
      headers: {
        'x-api-key': purchaseMutation.data?.apiKey ?? ''
      }
    }
  });

  const handleClassify = () => {
    if (!purchaseMutation.data?.apiKey || !sampleError) return;
    classifyMutation.mutate({
      data: { errorMessage: sampleError }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-mono tracking-tight mb-4">API / MCP Access</h1>
        <p className="text-lg text-muted-foreground">
          Get a personal API key to unlock the underlying agent. Exposes an MCP server for your favorite agentic client, or a raw REST endpoint for direct integrations.
        </p>
      </div>

      {!purchaseMutation.isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto border border-border bg-card rounded-xl p-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-bold font-mono mb-2">Sandbox Access</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This is a <strong>simulated one-time $5 checkout</strong> for demo purposes. No real payment processor is involved, and no card will be charged. This unlocks full access to the classification tier and MCP endpoints.
          </p>

          <form onSubmit={handlePurchase} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium font-mono">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
            
            {purchaseMutation.isError && (
              <div className="text-sm text-destructive flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertTriangle className="w-4 h-4" />
                <span>{(purchaseMutation.error as any)?.message || 'Something went wrong.'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={purchaseMutation.isPending || !email}
              className="w-full inline-flex items-center justify-center h-10 px-4 py-2 font-mono font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md disabled:opacity-50"
            >
              {purchaseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                'Get Instant Access — $5'
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="border border-primary/30 bg-primary/5 rounded-xl p-8 text-center relative overflow-hidden">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-mono mb-2">You're in.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your API key has been provisioned. You now have access to the agentic classification endpoints and the Model Context Protocol (MCP) server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                <Key className="w-5 h-5 text-primary" />
                Your API Key
              </h3>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-sm overflow-x-auto text-primary">
                  {purchaseMutation.data?.apiKey}
                </pre>
                <button 
                  onClick={() => copyToClipboard(purchaseMutation.data?.apiKey || '')}
                  className="absolute top-2 right-2 p-2 bg-card border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                >
                  <Terminal className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2 mt-8">
                <Terminal className="w-5 h-5 text-primary" />
                MCP Client Config
              </h3>
              <p className="text-sm text-muted-foreground">Add this to your Claude Desktop or Cursor MCP configuration to use the agent natively. Both support remote Streamable HTTP servers with custom headers.</p>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-xs overflow-x-auto text-foreground/80">
{`{
  "mcpServers": {
    "qa-agent": {
      "url": "${baseUrl}/api/mcp",
      "headers": {
        "x-api-key": "${purchaseMutation.data?.apiKey}"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                <Code className="w-5 h-5 text-primary" />
                Raw REST Access
              </h3>
              <p className="text-sm text-muted-foreground">Call the endpoint directly without an MCP client.</p>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-xs overflow-x-auto text-foreground/80">
{`curl -X POST ${baseUrl}/api/access/classify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${purchaseMutation.data?.apiKey}" \\
  -d '{"errorMessage": "TimeoutException: element not visible in time"}'`}
                </pre>
              </div>

              <div className="mt-8 border border-border bg-card rounded-lg p-6">
                <h4 className="font-mono font-bold mb-4 flex items-center gap-2">Live Test Widget</h4>
                <div className="space-y-3">
                  <textarea
                    value={sampleError}
                    onChange={(e) => setSampleError(e.target.value)}
                    className="w-full h-24 p-3 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:border-primary"
                    placeholder="Enter an error message to classify..."
                  />
                  <button
                    onClick={handleClassify}
                    disabled={classifyMutation.isPending || !sampleError}
                    className="w-full inline-flex items-center justify-center h-8 px-4 font-mono text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md disabled:opacity-50"
                  >
                    {classifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Run Classification
                  </button>

                  {classifyMutation.isError && (
                    <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono mt-2">
                      Error: {(classifyMutation.error as any)?.message || 'Request failed'}
                    </div>
                  )}

                  {classifyMutation.data && (
                    <div className="mt-4 p-4 bg-[#0d1117] border border-border rounded-md overflow-x-auto">
                      <pre className="text-xs font-mono text-emerald-400">
                        {JSON.stringify(classifyMutation.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
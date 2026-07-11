import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePurchaseAccess, useClassifySample } from '@workspace/api-client-react';
import { Loader2, Key, Terminal, Code, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';

function useCopyToClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };
  return { copied, copy };
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      onClick={() => copy(text)}
      aria-label={copied ? 'Copied!' : `Copy ${label} to clipboard`}
      className="absolute top-2 right-2 p-2 bg-card border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted flex items-center gap-1 text-xs font-mono"
    >
      {copied
        ? <><Check className="w-3 h-3 text-primary" /> Copied</>
        : <><Copy className="w-4 h-4" /></>}
    </button>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Something went wrong.';
}

export default function GetMCP() {
  const [email, setEmail] = useState('');

  const purchaseMutation = usePurchaseAccess();

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    purchaseMutation.mutate({ data: { email } });
  };

  const [sampleError, setSampleError] = useState('TimeoutException: element not visible in time');
  const classifyMutation = useClassifySample({
    request: {
      headers: {
        'x-api-key': purchaseMutation.data?.apiKey ?? '',
      },
    },
  });

  const handleClassify = () => {
    if (!purchaseMutation.data?.apiKey || !sampleError.trim()) return;
    classifyMutation.mutate({ data: { errorMessage: sampleError } });
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apiKey = purchaseMutation.data?.apiKey ?? '';

  const mcpConfig = JSON.stringify(
    { mcpServers: { 'qa-agent': { url: `${baseUrl}/api/mcp`, headers: { 'x-api-key': apiKey } } } },
    null, 2
  );

  const curlCmd = `curl -X POST ${baseUrl}/api/access/classify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"errorMessage": "TimeoutException: element not visible in time"}'`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-mono tracking-tight mb-4">API / MCP Access</h1>
        <p className="text-lg text-muted-foreground">
          Get a personal API key to unlock the underlying agent. Exposes an MCP server for your
          favorite agentic client, or a raw REST endpoint for direct integrations.
        </p>
      </div>

      {!purchaseMutation.isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto border border-border bg-card rounded-xl p-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none" aria-hidden>
            <ShieldCheck className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-bold font-mono mb-2">Sandbox Access</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This is a <strong>simulated one-time $5 checkout</strong> for demo purposes. No real
            payment processor is involved, and no card will be charged. This unlocks full access
            to the classification tier and MCP endpoints.
          </p>

          <form onSubmit={handlePurchase} className="space-y-4 relative z-10" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium font-mono">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>

            {purchaseMutation.isError && (
              <div
                role="alert"
                className="text-sm text-destructive flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
                <span>{errorMessage(purchaseMutation.error)}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={purchaseMutation.isPending || !email.trim()}
              className="w-full inline-flex items-center justify-center h-10 px-4 py-2 font-mono font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {purchaseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden /> Processing…</>
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
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden />
            <h2 className="text-2xl font-bold font-mono mb-2">You're in.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your API key has been provisioned. You now have access to the agentic classification
              endpoints and the Model Context Protocol (MCP) server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                <Key className="w-5 h-5 text-primary" aria-hidden />
                Your API Key
              </h3>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-sm overflow-x-auto text-primary select-all">
                  {apiKey}
                </pre>
                <CopyButton text={apiKey} label="API key" />
              </div>

              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2 mt-8">
                <Terminal className="w-5 h-5 text-primary" aria-hidden />
                MCP Client Config
              </h3>
              <p className="text-sm text-muted-foreground">
                Add this to your Claude Desktop or Cursor config. Both support remote Streamable
                HTTP servers with custom headers natively.
              </p>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-xs overflow-x-auto text-foreground/80">
                  {mcpConfig}
                </pre>
                <CopyButton text={mcpConfig} label="MCP config" />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
                <Code className="w-5 h-5 text-primary" aria-hidden />
                Raw REST Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Call the endpoint directly without an MCP client.
              </p>
              <div className="relative group">
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-xs overflow-x-auto text-foreground/80">
                  {curlCmd}
                </pre>
                <CopyButton text={curlCmd} label="curl command" />
              </div>

              <div className="mt-8 border border-border bg-card rounded-lg p-6">
                <h4 className="font-mono font-bold mb-4 flex items-center gap-2">
                  <span aria-hidden>⚡</span> Live Test Widget
                </h4>
                <div className="space-y-3">
                  <label htmlFor="error-input" className="text-xs font-mono text-muted-foreground sr-only">
                    Error message to classify
                  </label>
                  <textarea
                    id="error-input"
                    value={sampleError}
                    onChange={(e) => setSampleError(e.target.value)}
                    className="w-full h-24 p-3 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="Enter an error message to classify…"
                    aria-label="Error message to classify"
                  />
                  <button
                    onClick={handleClassify}
                    disabled={classifyMutation.isPending || !sampleError.trim()}
                    className="w-full inline-flex items-center justify-center h-9 px-4 font-mono text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-live="polite"
                  >
                    {classifyMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden /> Classifying…</>
                      : 'Run Classification'}
                  </button>

                  {classifyMutation.isError && (
                    <div
                      role="alert"
                      className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono"
                    >
                      Error: {errorMessage(classifyMutation.error)}
                    </div>
                  )}

                  {classifyMutation.data && (
                    <div className="mt-2 p-4 bg-[#0d1117] border border-border rounded-md overflow-x-auto">
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

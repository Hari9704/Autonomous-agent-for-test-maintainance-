import { Route, Switch, Router as WouterRouter, Link, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/Home';
import Flow from '@/pages/Flow';
import Learn from '@/pages/Learn';
import Metrics from '@/pages/Metrics';
import GetMCP from '@/pages/GetMCP';
import Resume from '@/pages/Resume';
import Contact from '@/pages/Contact';

const queryClient = new QueryClient();

function Navigation() {
  const [location] = useLocation();

  const navGroups = [
    {
      title: "Product",
      items: [
        { path: '/flow', label: 'Flow' },
        { path: '/learn', label: 'Architecture' },
        { path: '/metrics', label: 'Metrics' }
      ]
    },
    {
      title: "Access",
      items: [
        { path: '/get-mcp', label: 'Get API/MCP' }
      ]
    },
    {
      title: "Builder",
      items: [
        { path: '/resume', label: 'Resume' },
        { path: '/contact', label: 'Contact' }
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-3 group">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-shadow">
              <span className="font-mono text-primary-foreground font-bold text-sm">QA</span>
            </div>
            <span className="hidden font-bold sm:inline-block font-mono tracking-tight text-foreground text-lg">
              AUTONOMOUS_QA
            </span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
            {navGroups.map((group) => (
              <div key={group.title} className="flex items-center space-x-4">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`transition-colors hover:text-primary font-mono ${
                      location === item.path ? 'text-primary' : 'text-foreground/70'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center">
          <Link href="/get-mcp" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-mono font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Get Access
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="font-mono text-primary font-bold text-[10px]">QA</span>
          </div>
          <span className="font-bold font-mono tracking-tight text-foreground text-sm">
            AUTONOMOUS_QA
          </span>
        </div>
        
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono text-muted-foreground">
          <Link href="/flow" className="hover:text-primary transition-colors">Flow</Link>
          <Link href="/learn" className="hover:text-primary transition-colors">Architecture</Link>
          <Link href="/metrics" className="hover:text-primary transition-colors">Metrics</Link>
          <Link href="/get-mcp" className="hover:text-primary transition-colors">API/MCP</Link>
          <Link href="/resume" className="hover:text-primary transition-colors">Resume</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>
        
        <div className="text-sm font-mono text-muted-foreground text-center md:text-right">
          Built by <span className="text-foreground">Nunnagoppala Hari Prasad</span>
        </div>
      </div>
    </footer>
  );
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-screen-2xl">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/flow" component={Flow} />
          <Route path="/learn" component={Learn} />
          <Route path="/metrics" component={Metrics} />
          <Route path="/get-mcp" component={GetMCP} />
          <Route path="/resume" component={Resume} />
          <Route path="/contact" component={Contact} />
          <Route>
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground font-mono text-xl">
              404 | NOT_FOUND
            </div>
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
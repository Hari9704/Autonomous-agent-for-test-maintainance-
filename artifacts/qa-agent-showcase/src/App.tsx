import { Route, Switch, Router as WouterRouter, Link, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Home from '@/pages/Home';
import Flow from '@/pages/Flow';
import Learn from '@/pages/Learn';
import Metrics from '@/pages/Metrics';
import GetMCP from '@/pages/GetMCP';
import Resume from '@/pages/Resume';
import Contact from '@/pages/Contact';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

const navLinks = [
  { path: '/flow', label: 'Flow' },
  { path: '/learn', label: 'Architecture' },
  { path: '/metrics', label: 'Metrics' },
  { path: '/get-mcp', label: 'Get API/MCP', highlight: true },
  { path: '/resume', label: 'Resume' },
  { path: '/contact', label: 'Contact' },
];

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-xl items-center mx-auto px-4 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-shadow">
            <span className="font-mono text-primary-foreground font-bold text-sm">QA</span>
          </div>
          <span className="hidden font-bold sm:inline-block font-mono tracking-tight text-foreground text-lg">
            AUTONOMOUS_QA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`transition-colors font-mono whitespace-nowrap ${
                item.highlight
                  ? location === item.path
                    ? 'text-primary font-bold'
                    : 'text-primary/80 hover:text-primary font-semibold'
                  : location === item.path
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center">
          <Link
            href="/get-mcp"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-mono font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get Access
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-md text-foreground/70 hover:text-primary hover:bg-muted/40 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-border/40 bg-background/98 px-4 py-4 flex flex-col gap-3"
          aria-label="Mobile navigation"
        >
          {navLinks.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`font-mono text-sm py-2 px-3 rounded-md transition-colors ${
                location === item.path
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground/70 hover:text-primary hover:bg-muted/40'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/get-mcp"
            className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-mono font-semibold text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Access
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-screen-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="font-mono text-primary font-bold text-[10px]">QA</span>
          </div>
          <span className="font-bold font-mono tracking-tight text-foreground text-sm">
            AUTONOMOUS_QA
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono text-muted-foreground" aria-label="Footer navigation">
          {navLinks.map((item) => (
            <Link key={item.path} href={item.path} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm font-mono text-muted-foreground text-center md:text-right">
          Built by <span className="text-foreground">Nunnagoppala Hari Prasad</span>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-6">
      <div className="font-mono text-primary text-6xl font-bold opacity-30">404</div>
      <div>
        <p className="font-mono text-xl font-bold text-foreground mb-2">NOT_FOUND</p>
        <p className="text-muted-foreground text-sm">This route doesn't exist in the pipeline.</p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-mono font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          → Home
        </Link>
        <Link
          href="/flow"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-mono text-foreground/70 hover:text-primary hover:border-primary/50 transition-colors"
        >
          View Pipeline
        </Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-screen-xl">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/flow" component={Flow} />
          <Route path="/learn" component={Learn} />
          <Route path="/metrics" component={Metrics} />
          <Route path="/get-mcp" component={GetMCP} />
          <Route path="/resume" component={Resume} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
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
          <AppRoutes />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

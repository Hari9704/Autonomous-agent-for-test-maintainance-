import { Route, Switch, Router as WouterRouter, Link, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import Flow from '@/pages/Flow';
import Learn from '@/pages/Learn';
import Metrics from '@/pages/Metrics';

const queryClient = new QueryClient();

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Flow' },
    { path: '/learn', label: 'Learn' },
    { path: '/metrics', label: 'Metrics' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-8 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
              <span className="font-mono text-primary-foreground font-bold text-xs">QA</span>
            </div>
            <span className="hidden font-bold sm:inline-block font-mono tracking-tight text-foreground">
              AUTONOMOUS_QA
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors hover:text-primary font-mono ${
                  location === item.path ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-2xl">
        <Switch>
          <Route path="/" component={Flow} />
          <Route path="/learn" component={Learn} />
          <Route path="/metrics" component={Metrics} />
          <Route>
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground font-mono">
              404 | NOT_FOUND
            </div>
          </Route>
        </Switch>
      </main>
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

import { useState, useEffect } from 'react';

type RouteListener = (path: string) => void;

class Router {
  private listeners: Set<RouteListener> = new Set();
  private currentPath: string = '/';

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentPath = window.location.pathname || '/';
      window.addEventListener('popstate', () => {
        this.currentPath = window.location.pathname || '/';
        this.notify();
      });
    }
  }

  public getPath(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return this.currentPath;
  }

  public navigate(path: string, options?: { replace?: boolean }) {
    if (typeof window === 'undefined') return;

    if (options?.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }

    this.currentPath = path;
    this.notify();
    window.scrollTo(0, 0);
  }

  public subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    listener(this.getPath());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentPath);
    }
  }
}

export const router = new Router();

export function useCurrentRoute(): [string, (path: string, options?: { replace?: boolean }) => void] {
  const [route, setRoute] = useState<string>(router.getPath());

  useEffect(() => {
    const unsub = router.subscribe(path => {
      setRoute(path);
    });
    return unsub;
  }, []);

  return [route, (path, opts) => router.navigate(path, opts)];
}

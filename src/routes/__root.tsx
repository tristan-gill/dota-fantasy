import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Lads Fantasy',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

// TODO update styling so that the header is fixed top and the content takes the remaining space, 
// also force scroll on the content portion for overflows
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className='dark'>
      <head>
        <HeadContent />
      </head>
      <body className="h-screen flex flex-col">
        <Header />
        {children}
        {process.env.NODE_ENV !== "production" && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

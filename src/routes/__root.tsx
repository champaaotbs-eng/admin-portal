import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider } from 'react-i18next'
import { AppHeader } from 'components/shared/app-header'
import { FileProvider } from '@/shared/contexts/files-context'
import i18n from '#/i18n'
import { NotFound } from './-not-found'
import appCss from '../styles.css?url'
import { ValidationProvider } from 'shared/contexts/validation-context'
import QueryProvider from './-query-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Admin Portal' },
      {
        name: 'description',
        content: 'Admin Portal',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <I18nextProvider i18n={i18n}>
        <ValidationProvider>
          <FileProvider>
            <html lang="en">
              <head>
                <HeadContent />
              </head>
              <body suppressHydrationWarning className="min-h-screen bg-background text-foreground">
                <AppHeader />
                {children}
                <TanStackDevtools
                  config={{ position: 'bottom-right' }}
                  plugins={[
                    {
                      name: 'Tanstack Router',
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
                <Scripts />
              </body>
            </html>
          </FileProvider>
        </ValidationProvider>
      </I18nextProvider>
    </QueryProvider>
  )
}

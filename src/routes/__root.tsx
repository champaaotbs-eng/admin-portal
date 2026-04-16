import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'
import { AppHeader } from 'components/shared/app-header'
import { FileProvider } from '@/shared/contexts/files-context'
import i18n from '#/i18n'
import { NotFound } from './-not-found'
import { ValidationProvider } from 'shared/contexts/validation-context'
import QueryProvider from './-query-provider'

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryProvider>
      <I18nextProvider i18n={i18n}>
        <ValidationProvider>
          <FileProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AppHeader />
              <RootOutlet />
              <Toaster position="top-right" richColors />
              <TanStackDevtools
                config={{ position: 'bottom-right' }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            </div>
          </FileProvider>
        </ValidationProvider>
      </I18nextProvider>
    </QueryProvider>
  )
}

import { Outlet as RootOutlet } from '@tanstack/react-router'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import { initializeAuthAsync } from './store/auth.store'
import './main.css'

async function main() {
    // Initialize auth before rendering the app
    await initializeAuthAsync()

    const router = getRouter()

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>,
    )
}

main()

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "@/App"
import { AppProvider } from "@/app/providers/app-provider"
import "@/index.css"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error(
    "The application root element could not be found.",
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
import { RouterProvider } from "react-router-dom"

import { appRouter } from "@/app/router/app-router"

function App() {
  return <RouterProvider router={appRouter} />
}

export default App
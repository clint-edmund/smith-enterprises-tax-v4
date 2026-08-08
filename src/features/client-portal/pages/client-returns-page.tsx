import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { ClientReturnCard } from "../components/client-return-card"
import { useClientReturns } from "../hooks/use-client-returns"

export function ClientReturnsPage() {
  const navigate = useNavigate()

  const {
    returns,
    loading,
    error,
    refresh,
  } = useClientReturns()

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          My Tax Returns
        </h1>

        <p className="text-muted-foreground">
          Loading your tax returns...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          My Tax Returns
        </h1>

        <p className="text-red-600">
          {error}
        </p>

        <Button
          onClick={() => void refresh()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (returns.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          My Tax Returns
        </h1>

        <p className="text-muted-foreground">
          You don't have any tax returns yet.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          My Tax Returns
        </h1>

        <p className="text-muted-foreground">
          View the status of your returns,
          payments, and documents.
        </p>
      </div>

      <div className="space-y-6">
        {returns.map((taxReturn) => (
          <ClientReturnCard
            key={taxReturn.returnId}
            taxReturn={taxReturn}
            onViewDetails={(id) =>
              navigate(`/portal/returns/${id}`)
            }
          />
        ))}
      </div>
    </section>
  )
}
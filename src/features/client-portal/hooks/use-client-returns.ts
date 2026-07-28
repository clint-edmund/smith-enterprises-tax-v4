import { useEffect, useState } from "react"

import { getClientReturns } from "../services/client-return-service"

import type { ClientReturnSummary } from "../types/client-return.types"

export function useClientReturns() {
  const [returns, setReturns] =
    useState<ClientReturnSummary[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  async function loadReturns() {
    setLoading(true)

    setError(null)

    try {
      setReturns(
        await getClientReturns()
      )
    } catch (err) {
      console.error(err)

      setError(
        "Unable to load your tax returns."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReturns()
  }, [])

  return {
    returns,
    loading,
    error,
    refresh: loadReturns,
  }
}
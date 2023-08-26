import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

export function useUrlParam() {
  const { replace } = useRouter()
  const pathname = usePathname()

  const [isPending, startTransition] = useTransition()

  const setUrlParam = (param: string, value: string) => {
    const params = new URLSearchParams(location.search)

    const paramData = params.get(param)
    value && paramData !== value
      ? params.set(param, value)
      : params.delete(param)

    startTransition(() => replace(`${pathname}?${params.toString()}`))
  }

  return { setUrlParam, isPending }
}

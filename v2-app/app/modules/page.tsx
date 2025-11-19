// app/modules/page.tsx
import { Suspense } from 'react'
import ModulesClientPage from './ModulesClientPage'

function ModulesPageFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#B08D57]"></div>
        </div>
    )
}

export default function ModulesPage() {
  return (
    <Suspense fallback={<ModulesPageFallback />}>
      <ModulesClientPage />
    </Suspense>
  )
}

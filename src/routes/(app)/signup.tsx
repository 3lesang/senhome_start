import { SignupPage } from '@/pages/signup'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/signup')({
  component: SignupPage,
})

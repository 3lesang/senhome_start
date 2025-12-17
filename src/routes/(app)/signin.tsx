import { SigninPage } from '@/pages/signin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/signin')({
  component: SigninPage,
})

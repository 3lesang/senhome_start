import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(blank)/(auth)/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/signin"!</div>
}

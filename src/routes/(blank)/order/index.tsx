import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(blank)/order/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(blank)/order/"!</div>
}

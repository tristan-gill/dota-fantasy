import { getUserSession } from '@/services/auth';
import { getProfileByUserId } from '@/services/profiles';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/predictions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/predictions"!</div>
}

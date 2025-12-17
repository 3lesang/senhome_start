import { createFileRoute } from '@tanstack/react-router'
import { PostListPage } from '@/pages/post/list'
import { getPostsQueryOptions } from '@/queries/post'

export const Route = createFileRoute('/(app)/posts/')({
  component: PostListPage,
  loader({ context }) {
    return context.queryClient.ensureQueryData(getPostsQueryOptions({ page: 1, limit: 10 }))
  },
})

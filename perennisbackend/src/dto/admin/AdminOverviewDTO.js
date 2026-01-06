export function toAdminOverviewDTO(raw) {
  return {
    publishedPosts: Number(raw.publishedPosts ?? 0),
    draftsPending: Number(raw.draftsPending ?? 0),
    commentsToday: Number(raw.commentsToday ?? 0),
    newUsersThisWeek: Number(raw.newUsersThisWeek ?? 0),
    viewsLast7Days: Number(raw.viewsLast7Days ?? 0),
  };
}

export type ContentApprovalStatus = 'PendingApproval' | 'Approved' | 'Rejected' | 'Removed';

export type AiReviewStatus =
  | 'NotQueued'
  | 'Queued'
  | 'InProgress'
  | 'RecommendedApprove'
  | 'RecommendedReject'
  | 'NeedsHumanReview'
  | 'Failed';

export function getCreatorStatusLabel(
  approvalStatus?: ContentApprovalStatus | string | null,
  aiReviewStatus?: AiReviewStatus | string | null
) {
  if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'InProgress') {
    return 'Under AI review';
  }
  if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'NeedsHumanReview') {
    return 'Needs review';
  }

  switch (approvalStatus) {
    case 'PendingApproval':
      return 'Pending approval';
    case 'Approved':
      return 'Approved';
    case 'Rejected':
      return 'Rejected';
    case 'Removed':
      return 'Removed';
    default:
      return 'Pending approval';
  }
}

export function getSubmittedForApprovalCopy(contentType: 'album' | 'blog' | 'reel') {
  const label = contentType.charAt(0).toUpperCase() + contentType.slice(1);
  return `${label} submitted for approval. Your content was created and is waiting for review.`;
}

import { describe, expect, it } from 'vitest';
import { getCreatorStatusLabel, getSubmittedForApprovalCopy } from '../contentModeration';

describe('content moderation helpers', () => {
  it.each([
    ['PendingApproval', 'Queued', 'Pending approval'],
    ['PendingApproval', 'InProgress', 'Under AI review'],
    ['PendingApproval', 'NeedsHumanReview', 'Needs review'],
    ['Approved', 'RecommendedApprove', 'Approved'],
    ['Rejected', 'RecommendedReject', 'Rejected'],
    ['Removed', 'Failed', 'Removed'],
  ])('maps %s/%s to %s', (approvalStatus, aiReviewStatus, expected) => {
    expect(getCreatorStatusLabel(approvalStatus, aiReviewStatus)).toBe(expected);
  });

  it('uses safe pending copy for unknown statuses', () => {
    expect(getCreatorStatusLabel('InternalOnly', 'TraceLeaking')).toBe('Pending approval');
  });

  it.each([
    ['album', 'Album submitted for approval. Your content was created and is waiting for review.'],
    ['blog', 'Blog submitted for approval. Your content was created and is waiting for review.'],
    ['reel', 'Reel submitted for approval. Your content was created and is waiting for review.'],
  ] as const)('builds submitted copy for %s', (contentType, expected) => {
    expect(getSubmittedForApprovalCopy(contentType)).toBe(expected);
  });
});

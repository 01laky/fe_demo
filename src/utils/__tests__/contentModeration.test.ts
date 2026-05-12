import { describe, expect, it } from 'vitest';
import {
  getCreatorSafeReason,
  getCreatorStatusLabel,
  getSubmittedForApprovalCopy,
  shouldShowCreatorStatusBadge,
} from '../contentModeration';

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

  it('shows creator badges only for non-approved moderated content', () => {
    expect(shouldShowCreatorStatusBadge('PendingApproval')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Rejected')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Removed')).toBe(true);
    expect(shouldShowCreatorStatusBadge('Approved')).toBe(false);
    expect(shouldShowCreatorStatusBadge(undefined)).toBe(false);
  });

  it('builds safe short creator reasons without internal detail fallback', () => {
    expect(getCreatorSafeReason(' Please update this post. ', 'Internal moderation note')).toBe(
      'Please update this post.'
    );
    expect(getCreatorSafeReason(null, 'Human reason')).toBe('Human reason');
    expect(getCreatorSafeReason(null, null)).toBeNull();
    expect(getCreatorSafeReason('x'.repeat(300))).toHaveLength(243);
  });
});

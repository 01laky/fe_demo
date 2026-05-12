import {
  getCreatorSafeReason,
  getCreatorStatusLabel,
  shouldShowCreatorStatusBadge,
  type AiReviewStatus,
  type ContentApprovalStatus,
} from '../../utils/contentModeration';
import './CreatorModerationBadge.scss';

interface CreatorModerationBadgeProps {
  approvalStatus?: ContentApprovalStatus | string | null;
  aiReviewStatus?: AiReviewStatus | string | null;
  aiReviewUserMessage?: string | null;
  humanDecisionReason?: string | null;
}

export function CreatorModerationBadge({
  approvalStatus,
  aiReviewStatus,
  aiReviewUserMessage,
  humanDecisionReason,
}: CreatorModerationBadgeProps) {
  if (!shouldShowCreatorStatusBadge(approvalStatus)) return null;

  const label = getCreatorStatusLabel(approvalStatus, aiReviewStatus);
  const reason = getCreatorSafeReason(aiReviewUserMessage, humanDecisionReason);

  return (
    <span className="creator-moderation-badge" title={reason ?? label}>
      {label}
    </span>
  );
}

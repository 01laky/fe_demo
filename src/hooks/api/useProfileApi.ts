import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import * as profileApi from '../../api/profile/profileApi';

const profileKey = (faceId?: number | null) => (faceId != null ? ['profile', faceId] : ['profile']);

/**
 * Resolved avatar: local (face) if set, else global, else null.
 */
export function useProfile() {
  const { token, isAuthenticated } = useAuth();
  const { selectedFace } = useFaceConfig();
  const queryClient = useQueryClient();
  const faceId = selectedFace?.id ?? null;

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: profileKey(faceId),
    queryFn: () => profileApi.getProfile(token, faceId),
    enabled: Boolean(isAuthenticated && token),
  });

  const resolvedAvatarUrl = profile?.faceAvatarUrl ?? profile?.globalAvatarUrl ?? null;

  const updateMutation = useMutation({
    mutationFn: (data: { firstName?: string | null; lastName?: string | null }) =>
      profileApi.updateProfile(token, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey() }),
  });

  const uploadGlobalMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadGlobalAvatar(token, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey() }),
  });

  const uploadFaceMutation = useMutation({
    mutationFn: ({ faceId: fId, file }: { faceId: number; file: File }) =>
      profileApi.uploadFaceAvatar(token, fId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey(faceId) }),
  });

  return {
    profile: profile ?? null,
    isLoading,
    error,
    refetch,
    resolvedAvatarUrl,
    updateProfile: updateMutation.mutateAsync,
    updateProfileLoading: updateMutation.isPending,
    uploadGlobalAvatar: uploadGlobalMutation.mutateAsync,
    uploadGlobalLoading: uploadGlobalMutation.isPending,
    uploadFaceAvatar: (file: File) =>
      faceId != null
        ? uploadFaceMutation.mutateAsync({ faceId, file })
        : Promise.reject(new Error('No face')),
    uploadFaceLoading: uploadFaceMutation.isPending,
  };
}

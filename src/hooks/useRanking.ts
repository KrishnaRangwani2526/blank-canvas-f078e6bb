import { useMutation } from '@tanstack/react-query';
import { rankingApi } from '@/lib/api';
import type { JobRankRequest, JobRankResponse } from '@/lib/api';

export function useJobRanking() {
  return useMutation<JobRankResponse, Error, JobRankRequest>({
    mutationFn: rankingApi.rankJob,
  });
}
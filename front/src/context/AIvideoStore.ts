// 📁 context/AIvideoStore.ts

import { create } from 'zustand';
import {
    createVideoRequest,
    fetchVideoStatus,
} from '../services/AIvideoService';
interface AIvideoState {
    jobId: string | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | null;
    resultUrl: string | null;
    finalUrl: string | null; // ✅ 추가
    error: string | null;
    pollInterval: NodeJS.Timeout | null;
    startGeneration: (
        prompt: string,
        duration: number,
        imageFile: { uri: string; name: string; type: string }
    ) => Promise<void>;
    pollStatus: (intervalMs?: number) => void;
    setFinalUrl: (url: string) => void;
    stopPolling: () => void;
    reset: () => void;

}

export const useAIvideoStore = create<AIvideoState>((set, get) => ({
    jobId: null,
    status: null,
    resultUrl: null,
    finalUrl: null,
    error: null,
    pollInterval: null,  // 초기값 추가


    setFinalUrl: (url) => set({ finalUrl: url }),


    // 1) 생성 요청 → jobId 저장
    startGeneration: async (prompt, duration, imageFile) => {

        // 이전 상태 초기화
        get().reset();

        set({ status: 'PENDING', resultUrl: null, error: null, finalUrl: null });
        try {
            const { jobId } = await createVideoRequest(prompt, duration, imageFile);
            set({ jobId, status: 'PENDING' });
            // 바로 폴링 시작
            get().pollStatus();
        } catch (e: any) {
            set({ status: 'FAILED', error: e.message });
        }
    },

    // 2) 일정 간격으로 상태 체크
    pollStatus: (intervalMs = 5000, maxAttempts = 100) => { // 최대 100회 시도
        const { jobId, pollInterval } = get();
        if (!jobId) {
            set({ error: 'jobId가 없습니다. 요청을 다시 시도해주세요.' });
            return;
        }

        // 기존 폴링이 있다면 중지
        if (pollInterval) {
            clearInterval(Number(pollInterval));
        }

        let attempts = 0;

        const interval = setInterval(async () => {
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                set({
                    status: 'FAILED',
                    error: '시간 초과: 동영상 생성에 실패했습니다.',
                    pollInterval: null,
                });
                return;
            }

            try {
                const data = await fetchVideoStatus(jobId);
                set({ status: data.status, resultUrl: data.resultUrl });

                if (data.status === 'COMPLETED' && data.resultUrl) {
                    clearInterval(interval);
                    set({
                        finalUrl: data.resultUrl,
                        pollInterval: null,
                        status: 'COMPLETED',
                    });
                    return;
                }

                if (data.status === 'FAILED') {
                    clearInterval(interval);
                    set({
                        status: 'FAILED',
                        error: data.errorMessage || '동영상 생성에 실패했습니다.',
                        pollInterval: null,
                    });
                    return;
                }

                attempts++;
            } catch (e: any) {
                clearInterval(interval);
                set({
                    status: 'FAILED',
                    error: e.message || '상태 조회 중 오류가 발생했습니다.',
                    pollInterval: null,
                });
            }
        }, intervalMs);

        set({ pollInterval: interval });
    },

    stopPolling: () => {
        const { pollInterval } = get();
        if (pollInterval) {
            clearInterval(Number(pollInterval));
            set({ pollInterval: null });
        }
    },

    reset: () => {
        get().stopPolling();
        set({
            jobId: null,
            status: null,
            resultUrl: null,
            finalUrl: null,
            error: null,
            pollInterval: null,
        });
    },
}));


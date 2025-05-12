// 📁 context/AIvideoStore.ts

import { create } from 'zustand';
import { requestAIVideo, fetchVideoStatus } from '../services/AIvideoService';

type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface AIvideoState {
    jobId: string | null;
    status: VideoStatus | null;
    resultUrl: string | null;
    errorMessage: string | null;
    requestVideo: (prompt: string, duration: string, imageFile: File) => Promise<void>;
    pollVideoStatus: () => Promise<void>;
}

const AIvideoStore = create<AIvideoState>((set, get) => ({
    jobId: null,
    status: null,
    resultUrl: null,
    errorMessage: null,

    /** ✅ 생성 요청 및 jobId 저장 */
    requestVideo: async (prompt, duration, imageFile) => {
        try {
            const data = await requestAIVideo(prompt, duration, imageFile);
            set({ jobId: data.jobId, status: 'PENDING', resultUrl: null, errorMessage: null });
        } catch (error: any) {
            set({ errorMessage: error.message });
        }
    },

    /** ✅ 폴링으로 상태 확인 */
    pollVideoStatus: async () => {
        const jobId = get().jobId;
        if (!jobId) { return; }

        const poll = async () => {
            try {
                const statusRes = await fetchVideoStatus(jobId);
                if (statusRes.status === 'COMPLETED') {
                    set({ status: 'COMPLETED', resultUrl: statusRes.resultUrl });
                } else if (statusRes.status === 'FAILED') {
                    set({ status: 'FAILED', errorMessage: statusRes.errorMessage });
                } else {
                    setTimeout(poll, 5000); // 5초마다 재시도
                }
            } catch (error: any) {
                set({ status: 'FAILED', errorMessage: error.message });
            }
        };

        await poll(); // 폴링 시작
    },
}));

export default AIvideoStore;

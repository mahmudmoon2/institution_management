const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

export const getImageUrl = (path) => {
    if (!path) return 'https://picsum.photos/id/20/800/600'; // ফলব্যাক ইমেজ
    if (path.startsWith('http')) return path; // যদি ইতিমধ্যে সম্পূর্ণ ইউআরএল হয়
    return `${MEDIA_BASE_URL}${path}`; // `/media/...` এর আগে বেস ইউআরএল যোগ
};
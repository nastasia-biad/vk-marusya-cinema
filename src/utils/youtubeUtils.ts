export const convertToEmbedUrl = (url: string | null): string => {
  if (!url) return '';
  
  if (url.includes('youtube.com/embed')) {
    return `${url}?autoplay=1&rel=0&modestbranding=1`;
  }
  
  let videoId = '';
  
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    // https://youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    // https://www.youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    // https://www.youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  if (!videoId) {
    console.warn('Could not extract YouTube video ID from URL:', url);
    return url;
  }
  
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    showinfo: '0',
    controls: '1',
    fs: '1',
    iv_load_policy: '3',
    disablekb: '1',
    enablejsapi: '0'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};


export const isYouTubeUrl = (url: string): boolean => {
  const youtubePatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /youtube\.com\/embed/,
    /youtube\.com\/v\//
  ];
  
  return youtubePatterns.some(pattern => pattern.test(url));
};
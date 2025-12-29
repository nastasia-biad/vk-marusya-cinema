export const FALLBACK_IMAGE = '/assets/images/placeholder.jpg';


export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  target.src = FALLBACK_IMAGE;
  target.style.backgroundColor = '#393B3C';
  target.style.objectFit = 'contain';
  target.style.padding = '20px';
};


export const getImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return FALLBACK_IMAGE;
  
  if (url.startsWith('/')) {
    return url;
  }
  
  if (width || height) {
  }
  
  return url;
};


export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
  });
  
  return Promise.all(promises);
};


export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
          }
          
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};
import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { closeTrailerModal } from '../../../store/slices/uiSlice';
import { convertToEmbedUrl } from '../../../utils/youtubeUtils';
import './TrailerModal.scss';

const TrailerModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTrailerUrl, isTrailerModalOpen } = useAppSelector((state) => state.ui);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleClose = () => {
    dispatch(closeTrailerModal());
  };

  useEffect(() => {
    if (!isTrailerModalOpen && iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = iframe.src; 
    }
  }, [isTrailerModalOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const embedUrl = currentTrailerUrl ? convertToEmbedUrl(currentTrailerUrl) : '';

  if (!isTrailerModalOpen || !embedUrl) {
    return null;
  }

  return (
    <div className="trailer-modal" onClick={handleOverlayClick}>
      <div className="trailer-modal__overlay"></div>
      <div className="trailer-modal__content">
        <button className="trailer-modal__close" onClick={handleClose}>
          <img src="/assets/icons/close.svg" alt="Закрыть" className="trailer-modal__close-icon" />
        </button>
        <div className="trailer-modal__video">
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={embedUrl}
            title="Трейлер фильма"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
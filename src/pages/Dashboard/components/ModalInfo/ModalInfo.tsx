import Modal from '@/components/Modal/Modal';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import imageInfo1 from '../../../../../public/image_info-1.jpg';
import imageInfo2 from '../../../../../public/image_info-2.jpg';

const COOKIE_NAME = 'hideInfoModal';

const ModalInfo = () => {
  const [isOpen, setOpen] = useState(false);
  const needOpenModal = Cookies.get(COOKIE_NAME);
  useEffect(() => {
    const isServiceWorkerSupported = () => {
      return 'serviceWorker' in navigator;
    };

    const isManifestLoaded = () => {
      return document.querySelector('link[rel="manifest"]') !== null;
    };

    if (!needOpenModal && isServiceWorkerSupported() && isManifestLoaded()) {
      setOpen(true);
    }
  }, [needOpenModal]);

  const handleSubmit = useCallback(() => {
    setOpen(false);
    return Cookies.set(COOKIE_NAME, 'true', {
      expires: 7,
      path: '',
    });
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSubmit}
      title={'Информация'}
      buttonText="Готово"
      onClick={handleSubmit}
    >
      <div className="w-[100%] flex flex-col">
        <div className="mb-2">Удобнее будет, если вы сделаете PWA</div>
        <div>Вот пример установки PWA на ваш телефон (IOS)</div>
        <div className="mb-2">
          <img
            src={imageInfo2}
            alt={`Изображение 1`}
            className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div>
          <img
            src={imageInfo1}
            alt={`Изображение 2`}
            className="w-full h-[320px] object-cover object-bottom transition-transform duration-300"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalInfo;

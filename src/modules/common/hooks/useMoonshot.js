import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export function useMoonshotAsset(shareURI, shouldFetch) {
  const [isReady, setReady] = useState(false);
  const [sharableLinks, setLinks] = useState({});
  const mountRef = useRef(null);

  function blobImage(imageSrc) {
    return new Promise((resolve) => {
      const image = new Image();
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');

      image.src = imageSrc;
      image.crossOrigin = '';
      image.onload = () => {
        c.width = image.naturalWidth;
        c.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        c.toBlob((blob) => {
          const blobURI = URL.createObjectURL(blob);
          resolve(blobURI);
        }, 'image/jpeg', 1);
      };
    });
  }

  const initiateLinks = useCallback(async () => {
    // Simple GET request, need to omit extra headers
    const resp = await fetch(shareURI);
    const respJson = await resp.json();
    const { links } = respJson;

    const directLink = await blobImage(links.directLink);

    if (mountRef.current === 'unmounted') {
      // Blocks flow if component is unmounted
      // Prevents memory leaks & side effects
      return;
    }

    setLinks({
      ...links,
      directLink,
    });
    setReady(true);
  }, [shareURI]);

  useEffect(() => {
    if (shouldFetch) {
      initiateLinks();
      mountRef.current = 'mounted';
    }

    // eslint-disable-next-line consistent-return
    return () => {
      mountRef.current = 'unmounted';
    };
  }, [initiateLinks, shouldFetch]);

  return [isReady, sharableLinks];
}

export function useSocialClick(socialData) {
  const socialClick = useCallback((event) => {
    const targetName = event.target.name;
    const socialLink = event.target.getAttribute('data-link');
    const shareLink = socialData[targetName].url({ url: socialLink });

    if (!shareLink) {
      return;
    }

    if (window.navigator.share) {
      try {
        window.navigator.share({
          url: shareLink,
        });
      } catch (error) {
        // do nothing
      }
    } else {
      window.open(shareLink);
    }
  }, [socialData]);


  return socialClick;
}

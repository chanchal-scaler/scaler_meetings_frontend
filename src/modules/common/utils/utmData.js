export default function getUtmData() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const utmSource = urlSearchParams?.get('utm_source') || 'NA';
  const utmCampaign = urlSearchParams?.get('utm_campaign') || 'NA';

  return {
    utmSource,
    utmCampaign,
  };
}

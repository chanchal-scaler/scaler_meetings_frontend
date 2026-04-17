import Select from './select';
import { apiRequest } from '@common/api/utils';

const AUTO_DETECT_OPTION_VALUE = 'auto_detect';

function initializePreferredLocation() {
  const preferredLocationSelectId = 'preferred-location';
  const preferredLocationSelectEl = document.getElementById(
    preferredLocationSelectId,
  );

  if (preferredLocationSelectEl) {
    const preferredLocationSelect = new Select(
      preferredLocationSelectId, { searchable: false },
    );
    let previousLocation = preferredLocationSelect.selectedValue;
    const handleLocationChange = async (newLocation) => {
      if (previousLocation !== newLocation) {
        const json = await apiRequest(
          'POST',
          '/cookies/preferred-location',
          {
            preferred_location: newLocation === AUTO_DETECT_OPTION_VALUE
              ? '' : newLocation,
          },
        );
        if (json.success) {
          window.location.href = '/';
        }
      }
      previousLocation = newLocation;
    };

    preferredLocationSelect.addEventListener('change', handleLocationChange);
  }
}

export default {
  initialize: initializePreferredLocation,
};

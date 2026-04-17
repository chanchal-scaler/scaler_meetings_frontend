import { apiRequest } from '@common/api/utils';
import { Select } from '@common/vanilla_ui/general';

function initializeUniversity(id) {
  return new Select(id, {
    isAsync: true,
    isCreatable: true,
    loadOptions: async (keyword) => {
      const json = await apiRequest(
        'GET',
        '/get-universities',
        null,
        { params: { q: keyword } },
      );
      return json.items.map(item => ({ label: item.text, value: item.id }));
    },
  });
}

export default {
  initialize: initializeUniversity,
};

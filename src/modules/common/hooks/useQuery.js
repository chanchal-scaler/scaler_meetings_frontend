import qs from 'query-string';

function useQuery() {
  // TODO Make this reactive
  const { search } = window.location;
  return qs.parse(search);
}

export default useQuery;

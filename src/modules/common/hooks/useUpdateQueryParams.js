import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useUpdateQueryParams() {
  const navigate = useNavigate();

  const updateQueryParams = useCallback(
    (search) => {
      const oldSearch = window.location.search;

      navigate(
        { search: search ?? oldSearch },
        { replace: true },
      );
    }, [navigate],
  );

  return updateQueryParams;
}

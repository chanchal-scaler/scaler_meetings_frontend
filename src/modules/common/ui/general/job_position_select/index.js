import Select from './JobPositionSelect';
import CreatableSelect from './JobPositionCreatableSelect';
// Select fetches all the data and user can
// search only within the fetched data from the
// search bar
// In Creatable Select User can fetch the data from
// backend as per the query or create new record if
// the searched query is not present
const JobPositionSelect = {
  Select,
  CreatableSelect,
};

export default JobPositionSelect;

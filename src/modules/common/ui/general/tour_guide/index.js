import Slide from './Slide';
import TourGuide from './TourGuide';
import utils from './utils';

TourGuide.Slide = Slide;

// This makes sure that we can call the methods to start/end tour guide the
// following way using its name
//
// To start tour guide
// ```
// TourGuide.start('beginners-guide', { initialSlide: 2 });
// ```
//
// To end tour guide before it is completed
// ```
// TourGuide.end('beginners-guide');
// ```
Object.assign(TourGuide, utils);

export default TourGuide;

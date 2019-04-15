const bindAll = require('lodash.bindall');
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;
const MediaQuery = require('react-responsive').default;
const PropTypes = require('prop-types');
const React = require('react');

// Featured Banner Components
require('./splash.scss');

// Splash page
class SplashPresentation extends React.Component { // eslint-disable-line react/no-multi-comp
  constructor(props) {
    super(props);
    bindAll(this, [
    ]);
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }

  render() {    
    return (
      <div className="splash">
        <div
          className="inner mod-splash"
          key="inner">
        </div>
      </div>
    );
  }
}

SplashPresentation.propTypes = {
  activity: PropTypes.arrayOf(PropTypes.object),
  adminPanelOpen: PropTypes.bool,
  emailConfirmationModalOpen: PropTypes.bool.isRequired,
  featuredGlobal: PropTypes.shape({
    community_featured_projects: PropTypes.array,
    community_featured_studios: PropTypes.array,
    curator_top_projects: PropTypes.array,
    scratch_design_studio: PropTypes.array,
    community_most_remixed_projects: PropTypes.array,
    community_most_loved_projects: PropTypes.array
  }),
  inStudiosFollowing: PropTypes.arrayOf(PropTypes.object),
  intl: intlShape,
  isAdmin: PropTypes.bool.isRequired,
  isEducator: PropTypes.bool.isRequired,
  lovedByFollowing: PropTypes.arrayOf(PropTypes.object),
  onCloseAdminPanel: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onHideEmailConfirmationModal: PropTypes.func.isRequired,
  onOpenAdminPanel: PropTypes.func.isRequired,
  onRefreshHomepageCache: PropTypes.func.isRequired,
  onShowEmailConfirmationModal: PropTypes.func.isRequired,
  refreshCacheStatus: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  sessionStatus: PropTypes.string.isRequired,
  sharedByFollowing: PropTypes.arrayOf(PropTypes.object),
  shouldShowEmailConfirmation: PropTypes.bool.isRequired,
  shouldShowWelcome: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

SplashPresentation.defaultProps = {
  activity: [], // recent social actions taken by users someone is following
  featuredGlobal: {}, // global homepage rows, such as "Featured Projects"
  inStudiosFollowing: [], // "Projects in Studios I'm Following"
  lovedByFollowing: [], // "Projects Loved by Scratchers I'm Following"
  sharedByFollowing: [] // "Projects by Scratchers I'm Following"
};

module.exports = injectIntl(SplashPresentation);

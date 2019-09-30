const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const connect = require('react-redux').connect;
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;
const PropTypes = require('prop-types');
const React = require('react');

const navigationActions = require('../../../redux/navigation.js');
const sessionActions = require('../../../redux/session.js');

const LoginDropdown = require('../../login/login-dropdown.jsx');
const CanceledDeletionModal = require('../../login/canceled-deletion-modal.jsx');
const NavigationBox = require('../base/navigation.jsx');
const AccountNav = require('./accountnav.jsx');

require('./navigation.scss');

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    bindAll(this, [
      'getProfileUrl',
      'handleSearchSubmit'
    ]);
  }
  componentDidMount() {
  }
  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.props.closeAccountMenus();
    }
  }
  componentWillUnmount() {
  }
  getProfileUrl() {
    if (!this.props.user) return;
    return `/users/${this.props.user.username}/`;
  }
  handleSearchSubmit(formData) {
    window.location.href = `/search/projects?q=${encodeURIComponent(formData.q)}`;
  }

  render() {
    const createLink = this.props.user ? '/projects/editor/' : '/projects/editor/?tutorial=getStarted';
    return (
      <NavigationBox className={classNames({ '': true })}>
        <ul>
          <li className="logo">
            <a
              aria-label="Scratch"
              href="/"
            />
          </li>

          <li className="link create">
            <a href={createLink}>
              开始创作
            </a>
          </li>
          {/* <li className="link explore">
            <a href="/explore/projects/all">
              发现作品
            </a>
          </li> */}
          {/* <li className="link about">
            <a href="/about">
              关于我们
            </a>
          </li> */}

          <li className="search">
            {/* <Form onSubmit={this.handleSearchSubmit}>
              <Button
                className="btn-search"
                type="submit"
              />
              <Input
                aria-label='搜索'
                name="q"
                placeholder='搜索'
                type="text"
                value={this.props.searchTerm}
              />
            </Form> */}
          </li>
          {this.props.session.status === sessionActions.Status.FETCHED ? (
            this.props.user ? [
              <li
                className="link right mystuff"
                key="mystuff"
              >
                <a
                  href="/mystuff/"
                  title='我的作品'
                >
                  我的作品
                </a>
              </li>,
              <li
                className="link right account-nav"
                key="account-nav"
              >
                <AccountNav
                  classroomId={this.props.user.classroomId}
                  isEducator={this.props.permissions.educator}
                  isOpen={this.props.accountNavOpen}
                  isStudent={this.props.permissions.student}
                  profileUrl={this.getProfileUrl()}
                  thumbnailUrl={this.props.user.thumbnailUrl}
                  username={this.props.user.username}
                  onClick={this.props.handleToggleAccountNav}
                  onClickLogout={this.props.handleLogOut}
                  onClose={this.props.handleCloseAccountNav}
                />
              </li>
            ] : [
                <li
                  className="link right login-item"
                  key="login"
                >
                  <a
                    className="ignore-react-onclickoutside"
                    href="#"
                    key="login-link"
                    onClick={this.props.handleToggleLoginOpen}
                  >
                    <FormattedMessage id="general.signIn" />
                  </a>
                  <LoginDropdown
                    key="login-dropdown"
                  />
                </li>
              ]) : []}
        </ul>
        <CanceledDeletionModal />
      </NavigationBox>
    );
  }
}

Navigation.propTypes = {
  accountNavOpen: PropTypes.bool,
  closeAccountMenus: PropTypes.func,
  handleCloseAccountNav: PropTypes.func,
  handleLogOut: PropTypes.func,
  handleOpenRegistration: PropTypes.func,
  handleToggleAccountNav: PropTypes.func,
  handleToggleLoginOpen: PropTypes.func,
  intl: intlShape,
  permissions: PropTypes.shape({
    admin: PropTypes.bool,
    social: PropTypes.bool,
    educator: PropTypes.bool,
    educator_invitee: PropTypes.bool,
    student: PropTypes.bool
  }),
  searchTerm: PropTypes.string,
  session: PropTypes.shape({
    status: PropTypes.string
  }),
  user: PropTypes.shape({
    classroomId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
  })
};

Navigation.defaultProps = {
  session: {},
  searchTerm: ''
};

const mapStateToProps = state => ({
  accountNavOpen: state.navigation && state.navigation.accountNavOpen,
  session: state.session,
  permissions: state.permissions,
  searchTerm: state.navigation.searchTerm,
  user: state.session && state.session.session && state.session.session.user
});

const mapDispatchToProps = dispatch => ({
  closeAccountMenus: () => {
    dispatch(navigationActions.closeAccountMenus());
  },
  handleToggleAccountNav: event => {
    event.preventDefault();
    dispatch(navigationActions.handleToggleAccountNav());
  },
  handleCloseAccountNav: () => {
    dispatch(navigationActions.setAccountNavOpen(false));
  },
  handleOpenRegistration: event => {
    event.preventDefault();
    dispatch(navigationActions.setRegistrationOpen(true));
  },
  handleLogOut: event => {
    event.preventDefault();
    dispatch(navigationActions.handleLogOut());
  },
  handleToggleLoginOpen: event => {
    event.preventDefault();
    dispatch(navigationActions.toggleLoginOpen());
  }
});

const ConnectedNavigation = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

module.exports = injectIntl(ConnectedNavigation);

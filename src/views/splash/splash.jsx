const bindAll = require('lodash.bindall');
const connect = require('react-redux').connect;
const PropTypes = require('prop-types');
const React = require('react');

const api = require('../../lib/api');
const log = require('../../lib/log');
const render = require('../../lib/render.jsx');
const sessionActions = require('../../redux/session.js');
const splashActions = require('../../redux/splash.js');

const Page = require('../../components/page/www/page.jsx');
const SplashPresentation = require('./presentation.jsx');

class Splash extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
        ]);
        this.state = {
        };
    }
    componentDidMount () {
    }
    componentDidUpdate (prevProps) {
    }

    
    render () {
        return (
            <SplashPresentation
            />
        );
    }
}

Splash.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number,
        banned: PropTypes.bool,
        username: PropTypes.string,
        token: PropTypes.string,
        thumbnailUrl: PropTypes.string,
        dateJoined: PropTypes.string,
        email: PropTypes.string,
        classroomId: PropTypes.string
    })
};

Splash.defaultProps = {
    user: {}
};

const mapStateToProps = state => ({
    user: state.session.session.user
});

const mapDispatchToProps = dispatch => ({
});

const ConnectedSplash = connect(
    mapStateToProps,
    mapDispatchToProps
)(Splash);

render(
    <Page><ConnectedSplash /></Page>,
    document.getElementById('app'),
    {splash: splashActions.splashReducer}
);

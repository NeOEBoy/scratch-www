const classNames = require('classnames');
const omit = require('lodash.omit');
const PropTypes = require('prop-types');
const React = require('react');

const Avatar = props => (
    <img
        className={classNames('avatar', props.className)}
        {...omit(props, ['className'])}
    />
);

Avatar.propTypes = {
    className: PropTypes.string,
    src: PropTypes.string
};

Avatar.defaultProps = {
    src: '/images/default_avator_fox.png'
};

module.exports = Avatar;

const classNames = require('./node_modules/classnames');
const PropTypes = require('./node_modules/prop-types');
const React = require('./node_modules/react');

require('./card.scss');

const Card = props => (
    <div className={classNames(['card', props.className])}>
        {props.children}
    </div>
);

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

module.exports = Card;

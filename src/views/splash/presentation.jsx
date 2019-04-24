const bindAll = require('lodash.bindall');
const injectIntl = require('react-intl').injectIntl;
const connect = require('react-redux').connect;
const React = require('react');
const api = require('../../lib/api');
import { converDateBy } from '../../lib/date-utils'

import { List, Card, Button, Tabs, Icon } from 'antd';
const TabPane = Tabs.TabPane;
import QueueAnim from 'rc-queue-anim';
// Featured Banner Components
require('./splash.scss');

const KSize = 12;

// Splash page
class SplashPresentation extends React.Component { // eslint-disable-line react/no-multi-comp
  constructor(props) {
    super(props);

    this.state = {
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: true,
      activeKey: 'modified'
    }

    bindAll(this, [
      '_initFirstPage',
      'handleLoadMore',
      'handleTabChange',
      '_reloadPage'
    ]);
  }

  componentDidMount() {
    this._reloadPage();
    window.addEventListener('hashchange', this._reloadPage)
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this._reloadPage)
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate start')

    // update完毕后，如果user有变化则初始化页面，第一次进来页面也会走？
    if (this.props.user.username !== prevProps.user.username) {
      this._initFirstPage(this.state.activeKey);
    }
  }

  _reloadPage() {
    let sortKey = 'modified';
    if (window.location.hash.indexOf('#') !== -1) {
      sortKey = window.location.hash.replace('#', '');
    }
    this.setState({
      activeKey: sortKey
    })
    this._initFirstPage(sortKey);
  }

  _initFirstPage(key) {
    // console.log('_initFirstPage start')
    if (this.state.initLoading) {
      return;
    }

    this._initState(() => {
      if (key === 'mystuff') {
        this._SearchArea = 'mystuff'
        this._SortKey = 'modified';
      } else {
        this._SearchArea = 'allstuff'
        this._SortKey = key ? key : 'modified'
      }

      this.setState({
        initLoading: true,
      });
      this._getNextPage((res) => {
        // console.log('MyStuff componentDidMount complete');

        this.setState({
          initLoading: false,
          list4Next: res && res.data || [],
          list4source: res && res.data || [],
        });
      });
    })
  }

  _initState(stateChanged) {
    this.setState({
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: true,
    }, stateChanged);
  }

  _getNextPage(callback) {
    const { currentPage } = this.state;
    api({
      uri: '/allstuff/page',
      params: {
        page: currentPage,
        size: KSize,
        sortArea: this._SearchArea,
        sortKey: this._SortKey
      },
      withCredentials: true,
    }, (err, res) => {
      if (err || !res) {
        this.setState({
          alreadyShowAll: true
        });
        callback({});
        return;
      }

      callback(res);

      if (res && res.data.length > 0) {
        this.setState({
          currentPage: this.state.currentPage + 1,
          alreadyShowAll: this.state.list4source.length >= res.totalCount
        });
      } else {
        this.setState({
          alreadyShowAll: true
        });
      }
    });
  }

  handleLoadMore() {
    this.setState({
      nextLoading: true,
      list4source: this.state.list4Next.concat([...new Array(KSize)].map(() => ({ loading: true, title: {} }))),
    });
    this._getNextPage((res) => {
      const list4Next = this.state.list4Next.concat(res.data);
      this.setState({
        list4Next,
        list4source: list4Next,
        nextLoading: false,
      }, () => {
        // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
        // In real scene, you can using public method of react-virtualized:
        // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        // window.dispatchEvent(new Event('resize'));
      });
    });
  }

  handleTabChange(key) {
    window.location.hash = '#' + key;
    this.setState({
      activeKey: key
    })
    // this._initFirstPage(key);
  }

  render() {
    const { initLoading, nextLoading, list4source, alreadyShowAll, activeKey } = this.state;
    const loadMore = !initLoading && !nextLoading && !alreadyShowAll ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={this.handleLoadMore}>载入更多内容</Button>
      </div>
    ) : null;

    const listTemplate = (
      <List
        rowKey={record => record._id}
        loading={initLoading}
        loadMore={loadMore}
        grid={{
          gutter: 12, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4,
        }}
        dataSource={list4source}
        renderItem={(item, index) => (
          <List.Item>
            <QueueAnim type={['scale']} duration='800'>
              <div
                key={index}
                className='list-item-div'
                onClick={() => { window.location.href = '/projects/' + item.projectId }}>
                <div key='image' className='list-item-imgdiv'>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '99.9%' }} />
                </div>

                <div className='list-item-title'>{item.title}</div>
                <div className='list-item-name'>{item.author && item.author.name}</div>
                <div className='list-item-modified'>
                  <Icon type='like' />
                  <span> {item.loves}&nbsp;&nbsp;</span>
                  <Icon type='eye' />
                  <span> {item.views}&nbsp;&nbsp;</span>
                  <Icon type='clock-circle' />
                  <span> {converDateBy(item.modified)}</span>
                </div>
              </div>
            </QueueAnim>
          </List.Item>
        )}
      />);

    return (
      <div className="splash">
        <div
          className="inner mod-splash"
          key="inner">
          <Tabs type='card' onChange={this.handleTabChange}
            activeKey={activeKey}>
            <TabPane tab={<span><Icon type='clock-circle' />最新榜</span>} key="modified">
              {listTemplate}
            </TabPane>
            <TabPane tab={<span><Icon type="like" />点赞榜</span>} key="loves">
              {listTemplate}
            </TabPane>
            <TabPane tab={<span><Icon type="smile" />我的宝宝</span>} key="mystuff">
              {listTemplate}
            </TabPane>
            {/* <TabPane tab={<span><Icon type="eye" />观看榜</span>} key="views">
              {listTemplate}
            </TabPane> */}
          </Tabs>
          {/* <QueueAnim>
            <div key='0'>haha</div>
            <div key='1'>haha</div>
            <div key='2'>haha</div>
          </QueueAnim> */}
          {/* <Card
            title="全部作品"
            bordered={false}
            headStyle={{ padding: '12' }}
            bodyStyle={{ padding: 12 }}
          >
            <List
              rowKey={record => record._id}
              loading={initLoading}
              loadMore={loadMore}
              grid={{
                gutter: 12, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4,
              }}
              dataSource={list4source}
              renderItem={(item, index) => (
                <List.Item>
                  <QueueAnim type={['scale']} duration='800'>
                    <div
                      key={index}
                      className='list-item-div'
                      onClick={() => { window.location.href = '/projects/' + item.projectId }}>
                      <div key='image' className='list-item-imgdiv'>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '99.9%' }} />
                      </div>

                      <div className='list-item-title'>{item.title}</div>
                      <div className='list-item-name'>{item.author && item.author.name}</div>
                      <div className='list-item-modified'>{converDateBy(item.modified)}</div>
                    </div>
                  </QueueAnim>
                </List.Item>
              )}
            />
          </Card> */}
        </div>
      </div>
    );
  }
}

SplashPresentation.propTypes = {

};

SplashPresentation.defaultProps = {
  user: {}
};

const mapStateToProps = state => ({
  user: state.session.session.user
});

const mapDispatchToProps = dispatch => ({
});

const ConnectedSplashPresentation = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashPresentation);

module.exports = injectIntl(ConnectedSplashPresentation);

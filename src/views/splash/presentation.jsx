const connect = require('react-redux').connect;
const React = require('react');
const api = require('../../lib/api');

import { converDateBy } from '../../lib/date-utils'
import { List, Button, Tabs, Icon } from 'antd';
const TabPane = Tabs.TabPane;
import QueueAnim from 'rc-queue-anim';
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

    let currentUserName = this.props.user.username;
    let preUserName = prevProps.user.username;
    /// 登录成功后，并且在我的作品的tab页面才重新刷新页面
    if (currentUserName !== preUserName && this.state.activeKey === 'mystuff') {
      this._reloadPage();
    }
  }

  _reloadPage = () => {
    let sortKey = 'modified';
    if (window.location.hash.indexOf('#') !== -1) {
      sortKey = window.location.hash.replace('#', '');
    } else if (this.state.activeKey) {
      sortKey = this.state.activeKey;
    }
    this.setState({
      activeKey: sortKey
    })
    this._initFirstPage(sortKey);
  }

  _initFirstPage = (key) => {
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

  _handleLoadMore = () => {
    this.setState({
      nextLoading: true,
      list4source: this.state.list4Next.concat([...new Array(KSize)].map(() => ({}))),
    }, () => {
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
    });
  }

  _handleTabChange = (key) => {
    // 触发hash事件从而刷新页面
    window.location.hash = '#' + key;
    this.setState({
      activeKey: key
    })
  }

  render() {
    const { initLoading, nextLoading, list4source, alreadyShowAll, activeKey } = this.state;
    const loadMore = !initLoading && !nextLoading && !alreadyShowAll ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={this._handleLoadMore}>载入更多内容</Button>
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
        renderItem={(item, index) => {
          // 如果是学员，把extra信息显示一下
          let authorArea = '';
          if (item.author) {
            authorArea = item.author.name;
            if (item.author.role === 'trainee' && item.author.extra) {
              const age = item.author.extra.age;
              const grade = item.author.extra.grade;
              if (age) {
                authorArea = authorArea + '/' + age + '岁';
              }
              if (grade) {
                authorArea = authorArea + '/' + grade;
              }
            }
          }

          return (
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
                  <div className='list-item-author'>{authorArea}</div>
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
          )
        }}
      />);

    return (
      <div
        className="inner"
        key="inner">
        <Tabs type='card' onChange={this._handleTabChange}
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
        </Tabs>
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

module.exports = ConnectedSplashPresentation;

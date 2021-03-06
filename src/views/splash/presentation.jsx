const connect = require('react-redux').connect;
const React = require('react');
const api = require('../../lib/api');

import { makeDateFormat, converDateBy } from '../../lib/date-utils'
import {
  List, Button, Tabs,
  Icon, BackTop, Typography
} from 'antd';
const { Text } = Typography;

const TabPane = Tabs.TabPane;
import QueueAnim from 'rc-queue-anim';
require('./splash.scss');

const KSize = 12;

// 标题组件，用于显示我的孩子的用户名
class TitleSpan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '------'
    };
  }

  // 加载完毕后根据userId获取用户名并显示
  componentDidMount() {
    api({
      uri: '/accounts/profile',
      params: {
        userId: this.props.userId
      },
      withCredentials: true,
    }, (err, res) => {
      if (!err && res) {
        this.setState({
          title: res.name
        })
      }
    });
  }

  render() {
    return (
      <span>{this.state.title}</span>
    )
  }
}
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
      activeKey: 'modified',
      activeKey4Children: '-1',
      alreadyGetConsumeInfo: false,
      total: -1,
      prepaid: -1,
      consume: -1,
      lastConsumeTime: '------'
    }
  }

  componentDidMount() {
    // console.log('componentDidMount')

    setTimeout(() => {
      this._reloadPage();
    }, 300);
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

  _reloadTraineeInfo = () => {
    this.setState({
      alreadyGetConsumeInfo: false,
      total: -1,
      prepaid: -1,
      consume: -1,
      lastConsumeTime: '------'
    }, () => {
      api({
        uri: '/allstuff/traineeInfo',
        params: {
          userId: this._UserId
        },
        withCredentials: true,
      }, (err, res) => {
        if (!err && res) {
          this.setState({
            alreadyGetConsumeInfo: true,
            total: res.total,
            prepaid: res.prepaid,
            consume: res.consume,
            lastConsumeTime: res.lastConsumeTime
          })
        }
      });
    })
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
        this._UserId = this.state.activeKey4Children;

        // 有小孩信息，则更新下课时信息
        if (this._UserId !== '-1') {
          this._reloadTraineeInfo();
        }
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
    // console.log('this.props.user.childrens = ' + this.props.user.childrens)
    // 如果未初始化，初始化未第一个小孩
    let defautlActiveKey4Children = this.state.activeKey4Children;
    if (defautlActiveKey4Children === '-1' &&
      this.props.user.childrens &&
      this.props.user.childrens.length > 0) {
      defautlActiveKey4Children = this.props.user.childrens[0].toString();
    }

    this.setState({
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: true,
      activeKey4Children: defautlActiveKey4Children
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
        sortKey: this._SortKey,
        userId: this._UserId
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
    if (!key) return;

    // 触发hash事件从而刷新页面
    window.location.hash = '#' + key;
    this.setState({
      activeKey: key
    })
  }

  _handleChildrenTabChange = (key) => {
    if (!key) return;

    this.setState({
      activeKey4Children: key.toString()
    }, () => {
      this._reloadPage();
    });
  }

  render() {
    const {
      initLoading,
      nextLoading,
      list4source,
      alreadyShowAll,
      activeKey,
      activeKey4Children,
      alreadyGetConsumeInfo,
      total,
      prepaid,
      consume,
      lastConsumeTime
    } = this.state;
    const loadMore = !initLoading && !nextLoading && !alreadyShowAll ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={this._handleLoadMore}>查看更多作品</Button>
      </div>
    ) : null;

    const listTemplate = (
      <List
        rowKey={record => record._id}
        loading={initLoading}
        loadMore={loadMore}
        locale={{ emptyText: '没有作品，快开始创作一个作品吧！！！' }}
        grid={{
          gutter: 12, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4,
        }}
        dataSource={list4source}
        renderItem={(item, index) => {
          // 如果是学员，把extra信息显示一下
          let authorArea = '';
          let authorAvatar = 'https://scratch.ruyue.xyz/images/avatars/lv0_boy.png';
          if (item.author) {
            authorArea = item.author.name;
            if (item.author.role === 'trainee' && item.author.extra) {
              {/* const age = item.author.extra.age; */}
              const grade = item.author.extra.grade;
              {/* if (age) {
                authorArea = authorArea + '/' + age + '岁';
              } */}
              if (grade) {
                authorArea = authorArea + '/' + grade;
              }
            }

            if(item.author.sex === 1) {
              authorAvatar = 'https://scratch.ruyue.xyz/images/avatars/lv1_boy.png';
            } else if(item.author.sex === 2) {
              authorAvatar = 'https://scratch.ruyue.xyz/images/avatars/lv1_girl.png';
            }
          }

          let imageSrc = process.env.API_HOST + '/images/' + item.projectId;
          return (
            <List.Item>
              <QueueAnim type={['scale']} duration='800'>
                <div
                  key={index}
                  className='list-item-div'
                  onClick={() => { window.location.href = '/projects/' + item.projectId }}>
                  <div key='image' className='list-item-imgdiv'>
                    <img
                      src={imageSrc}
                      alt={item.title}
                      style={{ width: '99.9%' }} />
                  </div>

                  <div className='list-item-title'>{item.title}</div>
                  <div className='list-item-modified'>{converDateBy(item.modified)}</div>

                  <div style={{position: 'absolute', marginLeft: 0, marginTop: 4}}>
                    <img src={authorAvatar} style={{ width: 44, height: 44, borderRadius: '22px', border:'1px solid' }}/>
                  </div>

                  <div className='list-item-author'>{authorArea}</div>
                  <div className='list-item-status'>
                    <img src='https://scratch.ruyue.xyz/svgs/project/eye-1.svg' 
                      style={{ width: 24, height: 24}}/>
                    <span> {item.views}&nbsp;&nbsp;</span>
                    <img src={item.loves ? 'https://scratch.ruyue.xyz/svgs/project/like-2.svg' :
                      'https://scratch.ruyue.xyz/svgs/project/like-1.svg'}
                    style={{ width: 24, height: 24}}/>
                    <span> {item.loves}&nbsp;&nbsp;</span>
                  </div>
                </div>
              </QueueAnim>
            </List.Item>
          )
        }}
      />);

    let myChildenCom;
    if (this.props.user.username) {
      let theChildren = this.props.user.childrens;
      if (!theChildren || theChildren <= 0) {
        myChildenCom = <Text type='warning'>您的账户还未关联孩子，无法展示您的孩子的作品，请联系儒越编程管理人员关联账户。</Text>
      } else {
        // console.log('theChildren = ' + theChildren.length)
        myChildenCom =
          <Tabs type='line' animated={false} onChange={this._handleChildrenTabChange} activeKey={activeKey4Children}
            style={{ marginTop: -16 }}>
            {theChildren.map((userId) =>
              <TabPane tab={<TitleSpan userId={userId} />}
                key={userId.toString()}>

                {
                  alreadyGetConsumeInfo ? (<ul style={{ display: 'inline-block', marginTop: -16 }}>
                    <li>
                      <Text type='danger'>{`已上: ${consume}节课`}</Text>
                    </li>
                    <li>
                      <Text type='warning'>{`剩余: ${prepaid - consume}节课`}</Text>
                    </li>
                    <li>
                      <Text type='secondary'>{`预购: ${prepaid}节课`}</Text>
                    </li>
                    <li>
                      <Text type='secondary'>{`总共: ${total}节课`}</Text>
                    </li>
                    <li>
                      <Text>
                        上次签到:<span>  </span>
                        {
                          (lastConsumeTime && lastConsumeTime !== '------') ? makeDateFormat(new Date(lastConsumeTime), "yyyy-MM-dd hh:mm") +
                            '(' + converDateBy(lastConsumeTime) + ')' : '------'
                        }
                      </Text>
                    </li>
                  </ul>) : null
                }

                <div>
                  {listTemplate}
                </div>
              </TabPane>
            )}
          </Tabs>
      }
    } else {
      myChildenCom = <Text type='danger'>您还未登录，请点击右上角登录。</Text>;
    }

    return (
      <div
        className="inner"
        key="inner">
        <BackTop visibilityHeight={0} />

        <div className='goLearning'>
          {/* <a href='http://123.207.119.232:3200/'> */}
          <a href='http://landing.ruyue.xyz/'>
            <img src='/images/goLearning.png'></img>
          </a>
        </div>

        <Tabs type='card' onChange={this._handleTabChange} activeKey={activeKey}>
          <TabPane tab={<span><Icon type='clock-circle' />最新榜</span>} key="modified">
            {listTemplate}
          </TabPane>
          <TabPane tab={<span><Icon type="like" />点赞榜</span>} key="loves">
            {listTemplate}
          </TabPane>
          <TabPane tab={<span><Icon type="smile" />我的孩子</span>} key="mystuff">
            {myChildenCom}
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

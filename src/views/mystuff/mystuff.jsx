

const React = require('react');
const render = require('../../lib/render.jsx');
const connect = require('react-redux').connect;
const Page = require('../../components/page/www/page.jsx');
const bindAll = require('lodash.bindall');
const api = require('../../lib/api');

require('./mystuff.scss');

// 引入antd
import { Card, List, Avatar, Tabs, Button, Skeleton, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { converDateBy } from '../../lib/date-utils'
const TabPane = Tabs.TabPane;

const KSize = 16;

class MyStuff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: true
    }

    bindAll(this, [
      '_initFirstPage',
      'handleLoadMore',
      'handleTabChange'
    ]);
  }

  componentDidMount() {
    // console.log('MyStuff componentDidMount');
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate start')

    // update完毕后，如果user有变化则初始化页面，第一次进来页面也会走？
    if (this.props.user.username !== prevProps.user.username) {
      this._initFirstPage();
    }
  }

  _initState(stateChanged) {
    this.setState({
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: true
    }, stateChanged);
  }

  _initFirstPage(key) {
    // console.log('_initFirstPage start')
    if (this.state.initLoading) {
      return;
    }

    this._tabKey = key ? key : 'visible';
    console.log('this._tabKey = ' + this._tabKey);

    this._initState(() => {
      this.setState({
        initLoading: true
      });

      const handle = (res) => {
        // console.log('MyStuff componentDidMount complete');

        this.setState({
          initLoading: false,
          list4Next: res && res.data || [],
          list4source: res && res.data || [],
        }, () => {
          if (res && res.data && res.data.length > 0) {
            let filterItems = res.data.filter((item) => item.visibility === this._tabKey);
            if (filterItems && filterItems.length === 0) {
              setTimeout(() => {
                this.handleLoadMore()
              }, 0);
            }
          }
        });
      };
      this._getNextPage(handle);
    });
  }

  _getNextPage(callback) {
    api({
      uri: '/mystuff/page',
      params: { page: this.state.currentPage, size: KSize },
      withCredentials: true,
    }, (err, res) => {
      if (err || !res) {
        this.setState({
          alreadyShowAll: true
        });
        callback({});
        return;
      }

      res.data.forEach(element => {
        element.imageData = '/images/logo_sm.png';
      });
      callback(res);

      if (res && res.data && res.data.length > 0) {
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
      list4source: this.state.list4Next.concat([...new Array(3)].map(() => ({ loading: true, title: {} }))),
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
        if (res && res.data && res.data.length > 0) {
          let filterItems = res.data.filter((item) => item.visibility === this._tabKey);
          if (filterItems && filterItems.length === 0) {
            setTimeout(() => {
              this.handleLoadMore()
            }, 0);
          }
        }
      });
    });
  }
  handlePutToTrash(item) {
    this._changeVisibility(item, 'trshbyusr');
  }
  handleRecoveFromTrash(item) {
    this._changeVisibility(item, 'visible');
  }
  _changeVisibility(item, visibility) {
    api({
      uri: `/projects/${item.projectId}`,
      method: 'put',
      formData: { visibility: visibility },
      withCredentials: true,
    }, (err, res) => {
      if (!err) {
        item.visibility = visibility;
        this.forceUpdate();
      }
    });
  }
  handleTabChange(key) {
    this._initFirstPage(key);
  }
  handleEmptyTrash() {
    // console.log('handleEmptyTrash')

    api({
      uri: `/mystuff/emptytrash`,
      method: 'post',
      withCredentials: true,
    }, (err, res) => {
      if (!err) {
        // console.log('已经清空');
        this._initState();
      }
    });
  }

  render() {
    const { initLoading, nextLoading, list4source, alreadyShowAll } = this.state;
    const loadMore = !initLoading && !nextLoading && !alreadyShowAll ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={this.handleLoadMore}>载入更多内容</Button>
      </div>
    ) : null;

    let noData = null;
    if (list4source.length > 0) {
      const theFilterSource = list4source.filter((element) => element.visibility === this._tabKey);
      const showNoData = !initLoading && !nextLoading && theFilterSource.length === 0
      noData = showNoData ? (
        <div style={{ textAlign: "center" }}>空空如也</div>
      ) : null;
    }
    return (
      <div className='inner mystuff'>
        <Tabs
          defaultActiveKey="visible"
          tabPosition='left'
          onChange={this.handleTabChange}
        >
          <TabPane tab="我的作品" key="visible" disabled={initLoading || nextLoading}>
            <Card
              title="我的作品"
              bordered={false}
              headStyle={{ padding: 0 }}
              bodyStyle={{ padding: 0 }}
            >
              <List
                rowKey={record => record._id}
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={list4source}
                locale={{ emptyText: '空空如也' }}
                renderItem={item => (
                  item.visibility === 'visible' ?
                    (
                      <QueueAnim duration='800'>
                        <List.Item
                          key={item._id}
                          actions={
                            [
                              <a href={'/projects/' + item.projectId}>查看</a>,
                              <a href={'/projects/' + item.projectId + '#editor'}>编辑</a>,
                              <a onClick={() => this.handlePutToTrash(item)}>删除</a>
                            ]
                          }>
                          <Skeleton avatar title={false} loading={item.loading} active>
                            <List.Item.Meta
                              avatar=
                              {
                                <div style={{ width: 122, height: 92, border: '1px dotted' }}>
                                  <img
                                    src={item.visibility === 'visible' ? item.image : ''}
                                    alt={item.title}
                                    style={{ width: 120, height: 90 }}>
                                  </img>
                                </div>
                              }
                              title={item.title}
                              description={converDateBy(item.modified)}
                            />
                            <div></div>
                          </Skeleton>
                        </List.Item>
                      </QueueAnim>
                    ) : <QueueAnim></QueueAnim>)}
              />
              {noData}
            </Card>
          </TabPane>

          <TabPane tab="回收桶" key="trshbyusr" disabled={initLoading || nextLoading}>
            <Card
              title="回收桶"
              bordered={false}
              headStyle={{ padding: 0 }}
              bodyStyle={{ padding: 0 }}
              extra=
              {
                <Popconfirm placement="topLeft" title='确定要删除回收桶里所有的作品吗？' onConfirm={() => this.handleEmptyTrash()} okText="清空" cancelText="取消">
                  <a href="#">清空回收桶</a>
                </Popconfirm>
              }
            >
              <List
                rowKey={record => record._id}
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={list4source}
                locale={{ emptyText: '空空如也' }}
                renderItem={item => (
                  item.visibility === 'trshbyusr' ?
                    (
                      <QueueAnim>
                        <List.Item
                          key={item._id}
                          actions={
                            [
                              <a onClick={() => this.handleRecoveFromTrash(item)}>放回去</a>
                            ]
                          }>
                          <Skeleton avatar title={false} loading={item.loading} active>
                            <List.Item.Meta
                              avatar=
                              {
                                <div style={{ width: 122, height: 92, border: '1px dotted' }}>
                                  <img
                                    src={item.visibility === 'trshbyusr' ? item.image : ''}
                                    alt={item.title}
                                    style={{ width: 120, height: 90 }}>
                                  </img>
                                </div>
                              }
                              title={item.title}
                              description={converDateBy(item.modified)}
                            />
                            <div></div>
                          </Skeleton>
                        </List.Item>
                      </QueueAnim>
                    ) : <QueueAnim></QueueAnim>)}
              />
              {noData}
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

MyStuff.defaultProps = {
  user: {}
};

const mapStateToProps = state => ({
  user: state.session.session.user
});

const mapDispatchToProps = dispatch => ({
});

const ConnectedMyStuff = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyStuff);

render(<Page><ConnectedMyStuff /></Page>, document.getElementById('app'));

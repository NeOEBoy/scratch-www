

const React = require('react');
const render = require('../../lib/render.jsx');
const connect = require('react-redux').connect;
const Page = require('../../components/page/www/page.jsx');
const bindAll = require('lodash.bindall');
const api = require('../../lib/api');

require('./mystuff.scss');

// 引入antd
import { Card, List, Avatar, Button, Skeleton } from 'antd';
import { makeDateFormat } from '../../lib/date-utils'

const KSize = 8;

class MyStuff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initLoading: false,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: false
    }

    bindAll(this, [
      '_initFirstPage',
      'handleLoadMore'
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

  _initFirstPage() {
    console.log('_initFirstPage start')
    if(this.state.initLoading) {
      return;
    }

    this.setState({
      initLoading: true
    });
    this._getNextPage((res) => {
      console.log('MyStuff componentDidMount complete');

      this.setState({
        initLoading: false,
        list4Next: res && res.data || [],
        list4source: res && res.data || [],
      });
    });
  }


  _getNextPage(callback) {    
    api({
      uri: '/mystuff/page',
      params: { page: this.state.currentPage, size: KSize },
      withCredentials: true,
    }, (err, res) => {
      if(err || !res) {
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
        window.dispatchEvent(new Event('resize'));
      });
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

    return (
      <div className='inner mystuff'>
        <Card
          title="我的作品"
        >

          <List
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={list4source}
            renderItem={item => (
              <List.Item actions={
                [
                  <a href={'/projects/' + item.projectId}>查看</a>,
                  <a href={'/projects/' + item.projectId + '#editor'}>编辑</a>,
                ]
              }>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar=
                    {
                      <Avatar
                        onLoad={() => {
                          api({
                            host: '',
                            uri: item.image,
                            method: 'GET',
                            withCredentials: true,
                          }, (err, body, res) => {
                            if (err || res.statusCode !== 200 || !body) {
                              return;
                            }

                            let newImageData = 'data:image/png;base64,' + body;
                            item.imageData = newImageData;
                            // 强制刷新下
                            this.forceUpdate();
                          });
                        }}
                        src={item.imageData}
                        style={{ width: 120, height: 90 }}
                        shape='square'>
                      </Avatar>
                    }
                    title={item.title}
                    description={'最后更新: ' + makeDateFormat(new Date(item.modified), "yyyy-MM-dd hh:mm:ss")}
                  />
                  <div></div>
                </Skeleton>
              </List.Item>
            )}
          />
        </Card>
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

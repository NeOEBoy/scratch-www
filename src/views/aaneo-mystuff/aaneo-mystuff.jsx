

const React = require('react');
const render = require('../../lib/render.jsx');
const Page = require('../../components/page/www/page.jsx');
const bindAll = require('lodash.bindall');

require('./aaneo-mystuff.scss');

// 引入antd
import { Card, List, Avatar, Button, Skeleton } from 'antd';
import 'antd/dist/antd.css';
import reqwest from 'reqwest';
import { makeFullUrlWithParams } from './http-utils'
import { makeDateFormat } from './date-utils'

const KSize = 2;
const KDataUrl = 'http://localhost:3001/scratch-api/mystuff/page';

class MyStuff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initLoading: true,
      nextLoading: false,
      list4Next: [],
      list4source: [],
      currentPage: 1,
      alreadyShowAll: false
    }

    bindAll(this, [
      'handleLoadMore'
    ]);
  }

  componentDidMount() {
    this.getNextPage((res) => {
      this.setState({
        initLoading: false,
        list4Next: res.data,
        list4source: res.data,
      });
    });
  }

  getNextPage(callback) {
    let url = makeFullUrlWithParams(KDataUrl, { page: this.state.currentPage, size: KSize });

    reqwest({
      url: url,
      type: 'json',
      method: 'get',
      contentType: 'application/json',
      withCredentials: true,
      success: (res) => {
        callback(res);

        if (res && res.data.length > 0) {
          this.setState({
            currentPage: this.state.currentPage + 1,
            alreadyShowAll: this.state.list4source.length >= res.totalCount
          });
        }
      },
      error: () => {
        callback(null);
      }
    });
  }

  handleLoadMore() {
    this.setState({
      nextLoading: true,
      list4source: this.state.list4Next.concat([...new Array(KSize)].map(() => ({ loading: true, title: {} }))),
    });
    this.getNextPage((res) => {
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
          extra={<a href="#">排序</a>}
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
                  <a>删除</a>]
              }>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar=
                    {
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                        style={{ width: 94, height: 72 }} />
                    }
                    title={<h3>{item.title}</h3>}
                    description={<div>{'最后更新时间: ' + makeDateFormat(new Date(item.modified), "yyyy-MM-dd hh:mm:ss")}</div>}
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

// const MyStuff = () => (

// );

render(<Page><MyStuff /></Page>, document.getElementById('app'));

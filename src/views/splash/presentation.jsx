const bindAll = require('lodash.bindall');
const injectIntl = require('react-intl').injectIntl;
const React = require('react');
const api = require('../../lib/api');

import { List, Card, Button } from 'antd';

// Featured Banner Components
require('./splash.scss');

const KSize = 16;

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
      alreadyShowAll: false
    }

    bindAll(this, [
      '_initFirstPage',
      'handleLoadMore'
    ]);
  }

  componentDidMount() {
    this._initFirstPage();
  }

  componentWillUnmount() {
  }

  _initFirstPage() {
    console.log('_initFirstPage start')
    if (this.state.initLoading) {
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
      uri: '/allstuff/page',
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
        element.aliTitle = element.title;
        element.imageRefreshed = false;
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
      <div className="splash">
        <div
          className="inner mod-splash"
          key="inner">
          <Card
            title="全部作品"
          >
            <List
              rowKey={record => record._id}
              loading={initLoading}
              loadMore={loadMore}
              grid={{
                gutter: 12, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4,
              }}
              dataSource={list4source}
              renderItem={item => (
                <List.Item>
                  <div
                    className='list-item-div'
                    onClick={() => { window.location.href = '/projects/' + item.projectId }}>
                    <div className='list-item-imgdiv'>
                      <img
                        onLoad={() => {
                          if (item.imageRefreshed) {
                            console.log('on load item.imageRefreshed');
                            return;
                          }
                          item.imageRefreshed = true;

                          api({
                            host: '',
                            uri: item.image,
                            method: 'GET',
                            withCredentials: true,
                          }, (err, body, res) => {
                            if (err || res.statusCode !== 200 || !body) {
                              console.log('body = ' + body);
                              return;
                            }

                            let newImageData = 'data:image/png;base64,' + body;
                            item.imageData = newImageData;
                            // 强制刷新下
                            this.forceUpdate();
                          });
                        }}
                        src={item.imageData}
                        style={{ width: '99.9%' }}/>
                    </div>

                    <div>{item.aliTitle}</div>
                    <div>{item.author}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    );
  }
}

SplashPresentation.propTypes = {

};

SplashPresentation.defaultProps = {
};

module.exports = injectIntl(SplashPresentation);

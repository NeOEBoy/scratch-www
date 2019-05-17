const injectIntl = require('react-intl').injectIntl;
const PropTypes = require('prop-types');
const intlShape = require('react-intl').intlShape;
const FormattedMessage = require('react-intl').FormattedMessage;

const MediaQuery = require('react-responsive').default;
const React = require('react');
const Formsy = require('formsy-react').default;
const classNames = require('classnames');

const GUI = require('scratch-gui').default;
const IntlGUI = injectIntl(GUI);

const AdminPanel = require('../../components/adminpanel/adminpanel.jsx');
const decorateText = require('../../lib/decorate-text.jsx');
const FlexRow = require('../../components/flex-row/flex-row.jsx');
const Button = require('../../components/forms/button.jsx');
const Avatar = require('../../components/avatar/avatar.jsx');
const Banner = require('./banner.jsx');
const CensoredMessage = require('./censored-message.jsx');
const ModInfo = require('./mod-info.jsx');
const RemixCredit = require('./remix-credit.jsx');
const RemixList = require('./remix-list.jsx');
const Stats = require('./stats.jsx');
const StudioList = require('./studio-list.jsx');
const Subactions = require('./subactions.jsx');
const InplaceInput = require('../../components/forms/inplace-input.jsx');
const ToggleSlider = require('../../components/forms/toggle-slider.jsx');
const TopLevelComment = require('./comment/top-level-comment.jsx');
const ComposeComment = require('./comment/compose-comment.jsx');
const ExtensionChip = require('./extension-chip.jsx');
const thumbnailUrl = require('../../lib/user-thumbnail');
const FormsyProjectUpdater = require('./formsy-project-updater.jsx');

const projectShape = require('./projectshape.jsx').projectShape;
require('./preview.scss');

const frameless = require('../../lib/frameless');

const bindAll = require('lodash.bindall');

// disable enter key submission on formsy input fields; otherwise formsy thinks
// we meant to trigger the "See inside" button. Instead, treat these keypresses
// as a blur, which will trigger a save.
const onKeyPress = e => {
  if (e.target.type === 'text' && e.which === 13 /* Enter */) {
    e.preventDefault();
    e.target.blur();
  }
};

class PreviewPresentation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stageDim: { width: 0, height: 0 }
    };
    bindAll(this, [
      'updateStageSize',
      'handleOrientationChange'
    ]);
  }
  // --根据宽度动态适配大小begin -neo
  updateStageSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const controlTitleHeight = 46;
    let theWidth = 0; let theHeight = 0;
    const { isFullScreen } = this.props;
    if (isFullScreen) {
      if (windowWidth < windowHeight) {
        theWidth = parseInt(windowWidth) - 10;
        theHeight = parseInt(theWidth * 3 / 4) + controlTitleHeight;
      } else {
        theHeight = parseInt(windowHeight) - 10;
        theWidth = parseInt((theHeight - controlTitleHeight) * 4 / 3);
      }
    } else {
      if (innerWidth > frameless.tabletPortrait) {
        theWidth = 482;
      } else if (innerWidth > frameless.mobile) {
        theWidth = parseInt(windowWidth) - 30;
      } else {
        theWidth = parseInt(windowWidth) - 10;
      }
      theHeight = parseInt(theWidth * 3 / 4) + controlTitleHeight;
    }

    if (this.state.stageDim.width !== theWidth ||
      this.state.stageDim.height !== theHeight) {

      setTimeout(() => {
        this.setState({
          stageDim: { width: theWidth, height: theHeight }
        });
      }, 0);
    }
  }
  handleOrientationChange() {
    // 屏幕旋转时延迟下设置大小，否则屏幕错乱 -neo
    this._delayUpdateSizeTimer && clearTimeout(this._delayUpdateSizeTimer);
    this._delayUpdateSizeTimer = setTimeout(() => {
      this._delayUpdateSizeTimer = null;
      this.updateStageSize();
    }, 100);
  }
  componentDidMount() {
    // console.log('presentation componentDidMount')

    window.addEventListener('resize', this.updateStageSize);
    window.addEventListener('orientationchange', this.handleOrientationChange);

    this.updateStageSize();
  }
  componentWillUnmount() {
    // console.log('presentation componentWillUnmount')

    window.removeEventListener('resize', this.updateStageSize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    this._delayUpdateSizeTimer && clearTimeout(this._delayUpdateSizeTimer);
  }
  // --根据宽度动态适配大小end -neo

  render() {
    // console.log('presentation render')

    const {
      addToStudioOpen,
      adminModalOpen,
      adminPanelOpen,
      assetHost,
      authorUsername,
      backpackHost,
      canAddToStudio,
      canRemix,
      canReport,
      canSave,
      canShare,
      canUseBackpack,
      cloudHost,
      editable,
      extensions,
      faved,
      favoriteCount,
      intl,
      isAdmin,
      isFullScreen,
      isLoggedIn,
      isNewScratcher,
      isProjectLoaded,
      isRemixing,
      isScratcher,
      isShared,
      justRemixed,
      justShared,
      loveCount,
      loved,
      modInfo,
      onAddToStudioClicked,
      onAddToStudioClosed,
      onCloseAdminPanel,
      onCopyProjectLink,
      onFavoriteClicked,
      onGreenFlag,
      onLoveClicked,
      onOpenAdminPanel,
      onProjectLoaded,
      onRemix,
      onRemixing,
      onReportClicked,
      onReportClose,
      onReportSubmit,
      onSeeInside,
      onSetProjectThumbnailer,
      onShare,
      onToggleStudio,
      onUpdateProjectId,
      onUpdateProjectThumbnail,
      originalInfo,
      parentInfo,
      showCloudDataAlert,
      showUsernameBlockAlert,
      projectHost,
      projectId,
      projectInfo,
      projectStudios,
      remixes,
      replies,
      reportOpen,
      showAdminPanel,
      showModInfo,
      singleCommentId,
      userOwnsProject,
      visibilityInfo
    } = this.props;
    const shareDate = ((projectInfo.history && projectInfo.history.shared)) ? projectInfo.history.shared : '';
    const revisedDate = ((projectInfo.history && projectInfo.history.modified)) ? projectInfo.history.modified : '';
    const showInstructions = editable || projectInfo.instructions ||
      (!projectInfo.instructions && !projectInfo.description); // show if both are empty
    const showNotesAndCredits = editable || projectInfo.description ||
      (!projectInfo.instructions && !projectInfo.description); // show if both are empty

    let banner;
    if (visibilityInfo.deleted) { // If both censored and deleted, prioritize deleted banner
      banner = (<Banner
        className="banner-danger"
        message={<FormattedMessage id="project.deletedBanner" />}
      />);
    } else if (visibilityInfo.censored) {
      const censoredMessage = (
        <CensoredMessage
          censoredByCommunity={visibilityInfo.censoredByCommunity}
          messageHTML={visibilityInfo.message}
          reshareable={visibilityInfo.reshareable}
        />
      );
      banner = (<Banner
        className="banner-danger"
        message={censoredMessage}
      />);
    } else if (justRemixed) {
      banner = (
        <Banner
          className="banner-success"
          message={
            <FormattedMessage
              id="project.remix.justRemixed"
              values={{ title: projectInfo.title }}
            />
          }
        />
      );
    } else if (canShare) {
      if (isShared && justShared) { // if was shared a while ago, don't show any share banner
        if (isNewScratcher) {
          banner = (<Banner
            className="banner-success"
            message={<FormattedMessage id="project.share.sharedLong" />}
          />);
        } else {
          banner = (<Banner
            className="banner-success"
            message={<FormattedMessage id="project.share.sharedShort" />}
          />);
        }
      } else if (!isShared) {
        banner = (<Banner
          actionMessage={<FormattedMessage id="project.share.shareButton" />}
          message={<FormattedMessage id="project.share.notShared" />}
          onAction={onShare}
        />);
      }
    }

    const extensionChips = (
      <FlexRow className="extension-list">
        {extensions && extensions.map(extension => (
          <ExtensionChip
            action={extension.action}
            extensionL10n={extension.l10nId}
            extensionName={extension.name}
            hasStatus={extension.hasStatus}
            iconURI={extension.icon && `/svgs/project/${extension.icon}`}
            key={extension.name || extension.l10nId}
          />
        ))}
      </FlexRow>
    );

    // 全屏状态变更时同步下大小-neo
    this.updateStageSize();

    return (
      <div className="preview">
        {showAdminPanel && (
          <AdminPanel
            className={classNames('project-admin-panel', {
              'admin-panel-open': adminPanelOpen,
              'modal-open': adminModalOpen
            })}
            isOpen={adminPanelOpen}
            onClose={onCloseAdminPanel}
            onOpen={onOpenAdminPanel}
          >
            <iframe
              className={classNames('admin-iframe', {
                'modal-open': adminModalOpen
              })}
              src={`/scratch2/${projectId}/adminpanel/`}
            />
          </AdminPanel>
        )}
        {projectInfo && projectInfo.author && projectInfo.author.id && (
          <React.Fragment>
            {banner}
            <div className="inner">
              <FlexRow className="preview-row">
                <div
                  className={classNames(
                    'guiPlayer',
                    { fullscreen: isFullScreen }
                  )}
                  ref={(guiPlayerDiv) => {
                    this.guiPlayerDiv = guiPlayerDiv;
                  }}
                  style={{ width: this.state.stageDim.width, height: this.state.stageDim.height }}
                >

                  {showCloudDataAlert && (
                    <FlexRow className="project-info-alert">
                      <FormattedMessage id="project.cloudDataAlert" />
                    </FlexRow>
                  )}
                  {showUsernameBlockAlert && (
                    <FlexRow className="project-info-alert">
                      <FormattedMessage id="project.usernameBlockAlert" />
                    </FlexRow>
                  )}
                  <IntlGUI
                    theStageDimensions={this.state.stageDim}
                    isPlayerOnly
                    assetHost={assetHost}
                    backpackHost={backpackHost}
                    backpackVisible={canUseBackpack}
                    basePath="/"
                    canRemix={canRemix}
                    canSave={canSave}
                    className="guiPlayer"
                    cloudHost={cloudHost}
                    hasCloudPermission={isScratcher}
                    isFullScreen={isFullScreen}
                    previewInfoVisible="false"
                    projectHost={projectHost}
                    projectId={projectId}
                    onGreenFlag={onGreenFlag}
                    onProjectLoaded={onProjectLoaded}
                    onRemixing={onRemixing}
                    onSetProjectThumbnailer={onSetProjectThumbnailer}
                    onUpdateProjectId={onUpdateProjectId}
                    onUpdateProjectThumbnail={onUpdateProjectThumbnail}
                  />
                </div>
                <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                  <FlexRow className="preview-row force-center">
                    <div className="wrappable-item">
                      <Stats
                        faved={faved}
                        favoriteCount={favoriteCount}
                        loveCount={loveCount}
                        loved={loved}
                        projectInfo={projectInfo}
                        onFavoriteClicked={onFavoriteClicked}
                        onLoveClicked={onLoveClicked}
                      />
                    </div>
                    <div className="wrappable-item">
                      <Subactions
                        addToStudioOpen={addToStudioOpen}
                        canReport={canReport}
                        isAdmin={isAdmin}
                        projectInfo={projectInfo}
                        reportOpen={reportOpen}
                        shareDate={shareDate}
                        userOwnsProject={userOwnsProject}
                        onAddToStudioClicked={onAddToStudioClicked}
                        onAddToStudioClosed={onAddToStudioClosed}
                        onCopyProjectLink={onCopyProjectLink}
                        onReportClicked={onReportClicked}
                        onReportClose={onReportClose}
                        onReportSubmit={onReportSubmit}
                        onToggleStudio={onToggleStudio}
                      />
                    </div>
                  </FlexRow>
                </MediaQuery>
                <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                  <FlexRow className="preview-row force-row">
                    <FlexRow className="project-header">
                      {/* <a href={`/users/${projectInfo.author.username}`}> */}
                      <a href='#'>
                        <Avatar
                          alt={projectInfo.author.username}
                          //src={thumbnailUrl(projectInfo.author.id, 48)}
                        />
                      </a>
                      <div className="title">
                        {editable ?
                          <FormsyProjectUpdater
                            field="title"
                            initialValue={projectInfo.title}
                          >
                            {(value, ref, handleUpdate) => (
                              <Formsy
                                ref={ref}
                                onKeyPress={onKeyPress}
                              >
                                <InplaceInput
                                  className="project-title"
                                  handleUpdate={handleUpdate}
                                  name="title"
                                  validationErrors={{
                                    maxLength: intl.formatMessage({
                                      id: 'project.titleMaxLength'
                                    })
                                  }}
                                  validations={{
                                    maxLength: 100
                                  }}
                                  value={value}
                                />
                              </Formsy>
                            )}
                          </FormsyProjectUpdater> :
                          <React.Fragment>
                            <div
                              className="project-title no-edit"
                              title={projectInfo.title}
                            >{projectInfo.title}</div>
                            {'by '}
                            <a href={`/users/${projectInfo.author.username}`}>
                              {projectInfo.author.username}
                            </a>
                          </React.Fragment>
                        }
                      </div>
                    </FlexRow>
                    <MediaQuery minWidth={frameless.mobile}>
                      <div className="project-buttons">
                        {canRemix &&
                          <Button
                            alt={intl.formatMessage({ id: 'project.remixButton.altText' })}
                            className={classNames([
                              'remix-button',
                              {
                                disabled: isRemixing || !isProjectLoaded,
                                remixing: isRemixing
                              }
                            ])}
                            disabled={isRemixing || !isProjectLoaded}
                            title={intl.formatMessage({ id: 'project.remixButton.altText' })}
                            onClick={onRemix}
                          >
                            {isRemixing ? (
                              <FormattedMessage id="project.remixButton.remixing" />
                            ) : (
                                <FormattedMessage id="project.remixButton" />
                              )}
                          </Button>
                        }
                        <Button
                          className="button see-inside-button"
                          onClick={onSeeInside}
                        >
                          <FormattedMessage id="project.seeInsideButton" />
                        </Button>
                      </div>
                    </MediaQuery>
                  </FlexRow>
                </MediaQuery>
                <FlexRow className="project-notes">
                  <RemixCredit projectInfo={parentInfo} />
                  <RemixCredit projectInfo={originalInfo} />
                  {/*  eslint-disable max-len */}
                  <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                    {(extensions && extensions.length) ? (
                      <FlexRow className="preview-row">
                        {extensionChips}
                      </FlexRow>
                    ) : null}
                  </MediaQuery>
                  {showInstructions && (
                    <div className="description-block">
                      <div className="project-textlabel">
                        <FormattedMessage id="project.instructionsLabel" />
                      </div>
                      {editable ?
                        <FormsyProjectUpdater
                          field="instructions"
                          initialValue={projectInfo.instructions}
                        >
                          {(value, ref, handleUpdate) => (
                            <Formsy
                              className="project-description-form"
                              ref={ref}
                              onKeyPress={onKeyPress}
                            >
                              <InplaceInput
                                className={classNames(
                                  'project-description-edit',
                                  { remixes: parentInfo && parentInfo.author }
                                )}
                                handleUpdate={handleUpdate}
                                name="instructions"
                                placeholder={intl.formatMessage({
                                  id: 'project.descriptionPlaceholder'
                                })}
                                type="textarea"
                                validationErrors={{
                                  maxLength: intl.formatMessage({
                                    id: 'project.descriptionMaxLength'
                                  })
                                }}
                                validations={{
                                  maxLength: 5000
                                }}
                                value={value}
                              />
                            </Formsy>
                          )}
                        </FormsyProjectUpdater> :
                        <div className="project-description">
                          {decorateText(projectInfo.instructions, {
                            usernames: true,
                            hashtags: true,
                            scratchLinks: true
                          })}
                        </div>
                      }
                    </div>
                  )}
                  {showNotesAndCredits && (
                    <div className="description-block">
                      <div className="project-textlabel">
                        <FormattedMessage id="project.notesAndCreditsLabel" />
                      </div>
                      {editable ?
                        <FormsyProjectUpdater
                          field="description"
                          initialValue={projectInfo.description}
                        >
                          {(value, ref, handleUpdate) => (
                            <Formsy
                              className="project-description-form"
                              ref={ref}
                              onKeyPress={onKeyPress}
                            >
                              <InplaceInput
                                className={classNames(
                                  'project-description-edit',
                                  'last',
                                  { remixes: parentInfo && parentInfo.author }
                                )}
                                handleUpdate={handleUpdate}
                                name="description"
                                placeholder={intl.formatMessage({
                                  id: 'project.notesPlaceholder'
                                })}
                                type="textarea"
                                validationErrors={{
                                  maxLength: intl.formatMessage({
                                    id: 'project.descriptionMaxLength'
                                  })
                                }}
                                validations={{
                                  maxLength: 5000
                                }}
                                value={value}
                              />
                            </Formsy>
                          )}
                        </FormsyProjectUpdater> :
                        <div className="project-description last">
                          {decorateText(projectInfo.description, {
                            usernames: true,
                            hashtags: true,
                            scratchLinks: true
                          })}
                        </div>
                      }
                    </div>
                  )}
                  {/*  eslint-enable max-len */}
                </FlexRow>
              </FlexRow>
              <MediaQuery minWidth={frameless.tabletPortrait}>
                <FlexRow className="preview-row">
                  <Stats
                    faved={faved}
                    favoriteCount={favoriteCount}
                    loveCount={loveCount}
                    loved={loved}
                    projectInfo={projectInfo}
                    onFavoriteClicked={onFavoriteClicked}
                    onLoveClicked={onLoveClicked}
                  />
                  <Subactions
                    addToStudioOpen={addToStudioOpen}
                    canAddToStudio={canAddToStudio}
                    canReport={canReport}
                    isAdmin={isAdmin}
                    projectInfo={projectInfo}
                    reportOpen={reportOpen}
                    shareDate={shareDate}
                    userOwnsProject={userOwnsProject}
                    onAddToStudioClicked={onAddToStudioClicked}
                    onAddToStudioClosed={onAddToStudioClosed}
                    onCopyProjectLink={onCopyProjectLink}
                    onReportClicked={onReportClicked}
                    onReportClose={onReportClose}
                    onReportSubmit={onReportSubmit}
                    onToggleStudio={onToggleStudio}
                  />
                </FlexRow>
              </MediaQuery>
              <MediaQuery minWidth={frameless.tabletPortrait}>
                <FlexRow className="preview-row force-row">
                  <FlexRow className="project-header">
                    {/* <a href={`/users/${projectInfo.author.username}`}> */}
                    <a href='#'>
                      <Avatar
                        alt={projectInfo.author.username}
                        //src={thumbnailUrl(projectInfo.author.id, 48)}
                      />
                    </a>
                    <div className="title">
                      {editable ?
                        <FormsyProjectUpdater
                          field="title"
                          initialValue={projectInfo.title}
                        >
                          {(value, ref, handleUpdate) => (
                            <Formsy
                              ref={ref}
                              onKeyPress={onKeyPress}
                            >
                              <InplaceInput
                                className="project-title"
                                handleUpdate={handleUpdate}
                                name="title"
                                validationErrors={{
                                  maxLength: intl.formatMessage({
                                    id: 'project.titleMaxLength'
                                  })
                                }}
                                validations={{
                                  maxLength: 100
                                }}
                                value={value}
                              />
                            </Formsy>
                          )}
                        </FormsyProjectUpdater> :
                        <React.Fragment>
                          <div
                            className="project-title no-edit"
                            title={projectInfo.title}
                          >{projectInfo.title}</div>
                          {'by '}
                          <a href={`/users/${projectInfo.author.username}`}>
                            {projectInfo.author.username}
                          </a>
                        </React.Fragment>
                      }
                    </div>
                  </FlexRow>
                  <MediaQuery minWidth={frameless.mobile}>
                    <div className="project-buttons">
                      {canRemix &&
                        <Button
                          alt={intl.formatMessage({ id: 'project.remixButton.altText' })}
                          className={classNames([
                            'remix-button',
                            {
                              disabled: isRemixing || !isProjectLoaded,
                              remixing: isRemixing
                            }
                          ])}
                          disabled={isRemixing || !isProjectLoaded}
                          title={intl.formatMessage({ id: 'project.remixButton.altText' })}
                          onClick={onRemix}
                        >
                          {isRemixing ? (
                            <FormattedMessage id="project.remixButton.remixing" />
                          ) : (
                              <FormattedMessage id="project.remixButton" />
                            )}
                        </Button>
                      }
                      <Button
                        className="button see-inside-button"
                        onClick={onSeeInside}
                      >
                        <FormattedMessage id="project.seeInsideButton" />
                      </Button>
                    </div>
                  </MediaQuery>
                </FlexRow>
              </MediaQuery>
              <MediaQuery minWidth={frameless.tabletPortrait}>
                {(extensions && extensions.length) ? (
                  <FlexRow className="preview-row">
                    {extensionChips}
                  </FlexRow>
                ) : null}
              </MediaQuery>
              {showModInfo &&
                <FlexRow className="preview-row">
                  <ModInfo
                    authorUsername={authorUsername}
                    revisedDate={revisedDate}
                    scripts={modInfo.scriptCount}
                    sprites={modInfo.spriteCount}
                  />
                </FlexRow>
              }
            </div>
            <div className="project-lower-container">
              <div className="inner">
                <FlexRow className="preview-row">
                  <FlexRow className="column">
                    <RemixList
                      projectId={projectId}
                      remixes={remixes}
                    />
                    <StudioList
                      projectId={projectId}
                      studios={projectStudios}
                    />
                  </FlexRow>
                </FlexRow>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

PreviewPresentation.propTypes = {
  addToStudioOpen: PropTypes.bool,
  adminModalOpen: PropTypes.bool,
  adminPanelOpen: PropTypes.bool,
  assetHost: PropTypes.string,
  authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  backpackHost: PropTypes.string,
  canAddToStudio: PropTypes.bool,
  canRemix: PropTypes.bool,
  canReport: PropTypes.bool,
  canSave: PropTypes.bool,
  canShare: PropTypes.bool,
  canUseBackpack: PropTypes.bool,
  cloudHost: PropTypes.string,
  editable: PropTypes.bool,
  extensions: PropTypes.arrayOf(PropTypes.object),
  faved: PropTypes.bool,
  favoriteCount: PropTypes.number,
  intl: intlShape,
  isAdmin: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  isNewScratcher: PropTypes.bool,
  isProjectLoaded: PropTypes.bool,
  isRemixing: PropTypes.bool,
  isScratcher: PropTypes.bool,
  isShared: PropTypes.bool,
  justRemixed: PropTypes.bool,
  justShared: PropTypes.bool,
  loveCount: PropTypes.number,
  loved: PropTypes.bool,
  modInfo: PropTypes.shape({
    scriptCount: PropTypes.number,
    spriteCount: PropTypes.number
  }),
  onAddComment: PropTypes.func,
  onAddToStudioClicked: PropTypes.func,
  onAddToStudioClosed: PropTypes.func,
  onCloseAdminPanel: PropTypes.func,
  onCopyProjectLink: PropTypes.func,
  onDeleteComment: PropTypes.func,
  onFavoriteClicked: PropTypes.func,
  onGreenFlag: PropTypes.func,
  onLoadMore: PropTypes.func,
  onLoadMoreReplies: PropTypes.func,
  onLoveClicked: PropTypes.func,
  onOpenAdminPanel: PropTypes.func,
  onProjectLoaded: PropTypes.func,
  onRemix: PropTypes.func,
  onRemixing: PropTypes.func,
  onReportClicked: PropTypes.func.isRequired,
  onReportClose: PropTypes.func.isRequired,
  onReportComment: PropTypes.func.isRequired,
  onReportSubmit: PropTypes.func.isRequired,
  onRestoreComment: PropTypes.func,
  onSeeInside: PropTypes.func,
  onSetProjectThumbnailer: PropTypes.func,
  onShare: PropTypes.func,
  onToggleStudio: PropTypes.func,
  onUpdateProjectId: PropTypes.func,
  onUpdateProjectThumbnail: PropTypes.func,
  originalInfo: projectShape,
  parentInfo: projectShape,
  projectHost: PropTypes.string,
  projectId: PropTypes.string,
  projectInfo: projectShape,
  projectStudios: PropTypes.arrayOf(PropTypes.object),
  remixes: PropTypes.arrayOf(PropTypes.object),
  replies: PropTypes.objectOf(PropTypes.array),
  reportOpen: PropTypes.bool,
  showAdminPanel: PropTypes.bool,
  showCloudDataAlert: PropTypes.bool,
  showModInfo: PropTypes.bool,
  showUsernameBlockAlert: PropTypes.bool,
  singleCommentId: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  userOwnsProject: PropTypes.bool,
  visibilityInfo: PropTypes.shape({
    censored: PropTypes.bool,
    censoredByAdmin: PropTypes.bool,
    censoredByCommunity: PropTypes.bool,
    message: PropTypes.string,
    deleted: PropTypes.bool,
    reshareable: PropTypes.bool
  })
};

module.exports = injectIntl(PreviewPresentation);

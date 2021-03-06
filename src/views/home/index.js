import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Search, Container, Section } from 'components'
import { config, isEmpty } from 'utils'

import Banner from './c/Banner'
import NavBar from './c/NavBar'
import FreeBody from './c/FreeBody'
import FreeHeader from './c/FreeHeader'
import Live from './c/Live'
import BookBody from './c/BookBody'
import LastArea from './c/LastArea'
import styles from './style.less'

class Home extends Component {
  static propTypes = {
    banner: PropTypes.array,
    hotSearch: PropTypes.object,
    live: PropTypes.object,
    free: PropTypes.object,
    bookRadio: PropTypes.object,
    lastArea: PropTypes.array,
    dispatch: PropTypes.func,
    scrollTop: PropTypes.number,
  };

  banner = {};
  sectionHook = {};

  constructor (...props) {
    super(...props)
    this.state = {
      currentIndex: 0,
      opacity: 0,
    }
  }
  componentDidMount () {
    this.getFirstPageData()
  }

  getFirstPageData = () => {
    const { dispatch } = this.props
    dispatch({ type: 'home/getHeaderData' })
    dispatch({ type: 'home/getLiveData' })
    dispatch({ type: 'home/getFreeData' })
    dispatch({ type: 'home/getBookRadio' })
  };

  getBannerDom = dom => {
    this.banner = dom
  };
  getSectionHook = dom => {
    this.sectionHook = dom
  };
  handleScroll (top) {
    const { dispatch, lastArea, playerVisible, scrollTop, audio, isMini } = this.props
    const bHeight = this.banner.offsetHeight
    if (top < bHeight) {
      this.setState({
        ...this.state,
        opacity: Math.round(top / (bHeight - 45) * 100),
      })
    }
    if (
      top > this.sectionHook.offsetTop - window.innerHeight && !lastArea.length
    ) {
      dispatch({ type: 'home/getLastArea' })
    }
    if (isMini) {
      if (top - scrollTop > 50 && playerVisible) {
        dispatch({ type: 'player/save', payload: { visible: false } })
      } else if (top - scrollTop < -50 && !playerVisible && !isEmpty(audio)) {
        dispatch({ type: 'player/save', payload: { visible: true } })
      }
    }
  }

  handleScrollEnd (value) {
    const { dispatch } = this.props
    dispatch({ type: 'home/save', payload: { scrollTop: value } })
  }

  handleAudioToggle = (newPlay, _audio, _audioList) => {
    const { dispatch, progress } = this.props
    let nextStatus = config.PAUSE
    let nextAudio = _audio
    let nextProgress = progress
    if (newPlay) {
      nextStatus = config.PLAYING
      nextProgress = 0
    }
    dispatch({ type: 'player/save', payload: { status: nextStatus, audio: nextAudio, audioList: _audioList, progress: nextProgress } })
  }

  handleInfinitePlay = () => {
    const { dispatch, audio, audioList, free, infinitePlay, playStatus } = this.props
    const status = infinitePlay && playStatus === config.PLAYING ? config.PAUSE : config.PLAYING
    const payload = { infinite: !infinitePlay, status }
    if (isEmpty(audioList)) {
      const crtAudioList = free.list[0].audio_list
      payload.audioList = crtAudioList
      payload.audio = crtAudioList[0].id
    } else if (isEmpty(audio)) {
      payload.audio = audioList[0].id
    }
    dispatch({ type: 'player/save', payload })
  }

  render () {
    const {
      banner,
      hotSearch,
      free,
      bookRadio,
      lastArea,
      scrollTop,
      live,
      audio,
      audioList,
      playStatus,
      progress,
      infinitePlay,
    } = this.props
    const { currentIndex, opacity } = this.state
    const swipeConfig = {
      startSlide: 0,
      continuous: true,
      disableScroll: false,
      stopPropagation: true,
      auto: 5000,
      callback: i => {
        this.setState({
          ...this.state,
          currentIndex: i,
        })
      },
    }

    const currentAudio = audioList.find(a => a.id === audio)
    const freeProps = {
      Header: <FreeHeader name={free.name} status={infinitePlay && playStatus === config.PLAYING} onPlay={this.handleInfinitePlay} />,
      Body: <FreeBody list={free.list} onItemClick={this.handleAudioToggle} progress={progress} playing={{ status: playStatus, ...currentAudio }} />,
    }

    const bookRadioProps = {
      header: { name: bookRadio.title, right: '查看全部' },
      Body: <BookBody data={bookRadio.data} name={bookRadio.sub_title} />,
      Footer: (
        <div className={styles.bookFooter}>
          {bookRadio.data && bookRadio.data.adv_words}
        </div>
      ),
    }

    return (
      <Container
        scrollTop={scrollTop}
        onScroll={this.handleScroll.bind(this)}
        onScrollEnd={this.handleScrollEnd.bind(this)}
      >
        <Search data={hotSearch} opacity={opacity} />
        <Banner
          getEle={this.getBannerDom}
          list={banner}
          swipeConfig={swipeConfig}
          current={currentIndex}
        />
        <NavBar />
        <Live data={live} />
        <Section {...freeProps} />
        <Section {...bookRadioProps} getEle={this.getSectionHook} />
        <LastArea list={lastArea} />
      </Container>
    )
  }
}

function mapStateToProps ({ home, player }) {
  const { audio, audioList, status, progress, infinite, visible, mini } = player
  const {
    banner,
    hotSearch,
    live,
    free,
    bookRadio,
    lastArea,
    loading,
    scrollTop,
  } = home
  return {
    banner,
    hotSearch,
    live,
    free,
    bookRadio,
    lastArea,
    loading,
    scrollTop,
    audio,
    audioList,
    playStatus: status,
    playerVisible: visible,
    infinitePlay: infinite,
    isMini: mini,
    progress,
  }
}

export default connect(mapStateToProps)(Home)

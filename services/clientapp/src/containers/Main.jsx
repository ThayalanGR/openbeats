import React, { Component, Fragment } from "react";
import "../css/core.css";
import "../css/mainbody.css";
import { Player, TopNav, PlaylistDisplay, LeftNav, Home } from ".";
import { toastActions, coreActions } from "../actions";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Switch, Route } from "react-router";
import NowPlaying from "./NowPlaying";
import Result from "./Result";
import PlaylistManipulator from "./PlaylistManipulator";
import YourPlaylist from "./YourPlaylist";
import TopCharts from "./TopCharts";

class Main extends Component {
  componentDidMount() {
    this.initiateListeners();
  }
  initiateListeners() {
    const navCloseRef = document.getElementById("nav-close");
    const navHamburgerRef = document.getElementById("nav-hamburger");
    const navRef = document.getElementById("nav");
    const mainRef = document.getElementById("main");
    const playerWrapperRef = document.getElementById("player-wrapper");

    navHamburgerRef.onclick = function (e) {
      navRef.classList.add("nav-show");
      playerWrapperRef.classList.remove("show-player");
    };

    navCloseRef.onclick = function (e) {
      navRef.classList.remove("nav-show");
    };

    mainRef.onclick = function (e) {
      navRef.classList.remove("nav-show");
      playerWrapperRef.classList.remove("show-player");
    };

    playerWrapperRef.onclick = function (e) {
      navRef.classList.remove("nav-show");
    };
  }

  render() {
    return (
      <Fragment>
        {this.props.showAddPlaylistDialog &&
          <PlaylistManipulator />
        }
        <LeftNav />
        <main id="main">
          <TopNav />
          <section className="main-body">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/nowplaying" component={NowPlaying} />
              <Route path="/playlist/:type/:id" component={PlaylistDisplay} />
              <Route path="/yourplaylist" component={() => {
                if (this.props.isAuthenticated)
                  return <YourPlaylist />
                else {
                  this.props.notify("please login to use this feature!!!")
                  this.props.push("/auth")
                  return null
                }
              }} />
              <Route path="/search" component={Result} />
              <Route path="/topcharts" component={TopCharts} />
            </Switch>
          </section>
        </main>
        <Player />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    showAddPlaylistDialog: state.playlistManipulatorReducer.showAddPlaylistDialog,
    isAuthenticated: state.authReducer.isAuthenticated
  };
};

const mapDispatchToProps = dispatch => {
  return {
    push: path => {
      dispatch(push(path));
    },
    notify: message => {
      toastActions.showMessage(message);
    },
    featureNotify: () => {
      toastActions.featureNotify();
    },
    setCurrentAction: action => {
      dispatch(coreActions.setCurrentAction(action));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);

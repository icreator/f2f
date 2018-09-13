import React from 'react';
import {Route} from "react-router";
import {view} from 'react-easy-state';
import Loader from "./Loader";
import {i18n} from './i18n';

class P extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loadedBundles: [],
      bundles: [],
    };
    this.fontCount = 0;
    this.imagesCount = 0;
    this.bundles = {
      common: {
        images: [
          "dropdown-arrow.png",
          "facebook.png",
          "menu-dropdown-arrow.png",
          "popup-close.png",
          "swap-arrow.png",
          "swap-arrow-hover.png",
          "telegram.png",
          "twitter.png",
          "logo.png",
          "checkbox-disabled.png",
          "checkbox-enabled.png",
          "lightbox-arrow-left.png",
          "lightbox-arrow-right.png",
          "lightbox-close.png"
        ],
        fonts: [
          {
            name: 'Neo Sans Pro Bold Italic',
            src: '/fonts/hinted-NeoSansPro-BoldItalic.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "italic",
              weight: "bold"
            }
          },
          {
            name: "Neo Sans Pro Light",
            src: '/fonts/hinted-NeoSansPro-Light.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "normal",
              weight: 300
            }
          },
          {
            name: "Neo Sans Pro Light Italic",
            src: '/fonts/hinted-NeoSansPro-LightItalic.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "italic",
              weight: 300
            }
          },
          {
            name: "Neo Sans Pro Ultra",
            src: '/fonts/hinted-NeoSansPro-Ultra.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "normal",
              weight: 900
            }
          },
          {
            name: "Neo Sans Pro Bold",
            src: '/fonts/hinted-NeoSansPro-Bold.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "normal",
              weight: "bold"
            },
          },
          {
            name: "Neo Sans Pro Medium",
            src: '/fonts/hinted-NeoSansPro-Medium.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "normal",
              weight: 500
            }
          },
          {
            name: "Neo Sans Pro Italic",
            src: '/fonts/hinted-NeoSansPro-Italic.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "italic",
              weight: "normal"
            }
          },
          {
            name: "Neo Sans Pro",
            src: '/fonts/hinted-NeoSansPro-Regular.woff2',
            descriptors: {
              family: "Neo Sans Pro",
              style: "normal",
              weight: "normal"
            }
          }
        ]
      },
      currencies: {
        images: [
          "currencies/bch-dark.png",
          "currencies/bch-light.png",
          "currencies/btc-dark.png",
          "currencies/btc-light.png",
          "currencies/btg-dark.png",
          "currencies/btg-light.png",
          "currencies/compu.png",
          "currencies/dash-dark.png",
          "currencies/dash-light.png",
          "currencies/era.png",
          "currencies/era20.png",
          "currencies/eth-dark.png",
          "currencies/eth-light.png",
          "currencies/ltc-dark.png",
          "currencies/ltc-light.png"
        ]
      },
      index: {
        images: [
          "about-bg.png",
          "index-background.jpg",
          "index-logo.png",
          "rates-bg.png"
        ]
      },
      exchange: {
        images: [
          "accounts-bg.png",
          "accounts-fg.png",
          "attention.png",
          "question-mark.png"
        ]
      },
      payments: {
        images: [
          "payment-confirmed.png",
          "payment-pending.png",
          "search-active.png",
          "search-inactive.png"
        ]
      }
    };
    this.performLoad = this.performLoad.bind(this);
  }

  componentDidUpdate() {
    if (this.state.bundles.length > 0) {
      this.performLoad();
    }
  }

  componentDidMount() {
    i18n.preloadTranslation();
    const newBundles = this.props.bundles;
    const bundles = [];
    newBundles.unshift("common");
    for (let bundle of newBundles) {
      if (this.state.loadedBundles.indexOf(bundle) === -1) {
        bundles.push(bundle);
      }
    }
    this.setState({
      bundles
    });
  }

  performLoad() {
    for (let bundleName of this.state.bundles) {
      const bundle = this.bundles[bundleName];
      for (let image of bundle.images) {
        this.imagesCount += 1;
        const img = new Image();
        img.src = `/img/${image}`;
        img.onload = () => {
          this.imagesCount -= 1;
          this.check();
        }
      }
      if (document.fonts && bundle.fonts) {
        for (let font of bundle.fonts) {
          const fontFace = new FontFace(font.name, `url(${font.src})`, font.descriptors);
          document.fonts.add(fontFace);
          if (fontFace.status !== 'loaded') {
            this.fontCount += 1;
            if (fontFace.status !== 'loading') {
              fontFace.load();
            }
            fontFace.loaded.then(font => {
              this.fontCount -= 1;
              this.check();
            });
          }
        }
      } else {
        const head = document.querySelector('head');
        const fontStylesheet = document.querySelector('link[x-custom="fontFaces"]');
        if (!fontStylesheet) {
          const node = document.createElement('link');
          node.rel = "stylesheet";
          node.type = "text/css";
          node.media = "all";
          node.setAttribute("x-custom", "fontFaces");
          node.href = "/fonts.css";
          head.appendChild(node);
        }
      }
    }
    this.check();
  }

  check() {
    if (this.imagesCount === 0 && this.fontCount === 0) {
      const loadedBundles = this.state.loadedBundles;
      for (let bundle of this.state.bundles) {
        loadedBundles.push(bundle);
      }
      this.setState({
        bundles: [],
        loadedBundles,
        loaded: true
      });
    }
  }

  render() {
    if (this.state.loaded && i18n.loaded) {
      document.title = i18n.t('windowTitle');
      document.documentElement.lang = i18n.lang;
      return this.props.children;
    } else {
      return <div style={{display: "flex", width: "100vw", height: "100vh", justifyContent: "center", alignItems: "center"}}>
        <Loader/>
      </div>
    }
  }
}

const Preloader = view(P);

export default Preloader;

export class PreloaderRoute extends React.Component {
  render() {
    const { bundles, component: Component, ...rest } = this.props;
    return <Route {...rest} render={matchProps =>
      <Preloader bundles={bundles} >
        <Component {...rest} />
      </Preloader>
    }/>
  }
}

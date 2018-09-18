import {store} from 'react-easy-state';

const face2face_state = store({
  serverName: 'http://face2face.cash',
  loadCurrencies () {
    return fetch(`${face2face_state.serverName}/apipay/get_currs.json`)
      .then(r => r.json())
      .then(r => {
        face2face_state.icon_url = r.icon_url;
        face2face_state.currencies.in = r.in;
        face2face_state.currencies.out = r.out;
        return face2face_state.loadRates();
      });
  },
  loadRates() {
    return fetch(`${face2face_state.serverName}/api/rates3.json`)
      .then(r => r.json())
      .then(rates => face2face_state.rates = rates);
  },
  getRate(curr_out_key, curr_in_id) {
    const map = {
      3: 'BTC',
      4: 'LTC',
      6: 'DASH',
      9: 'ERA',
      10: 'COMPU',
    };
    let rate = 0;
    const curr_in_code = map[curr_in_id];
    for (let curr_in of face2face_state.rates[curr_out_key]) {
      if (curr_in[1] === curr_in_code) {
        rate = curr_in[0];
      }
    }
    return rate;
  },
  getAvailableAmount(curr_out_id) {
    let amount;
    for (let key in face2face_state.currencies.out) {
      let currency = face2face_state.currencies.out[key];
      if (curr_out_id === currency.id) {
        amount = currency.bal;
      }
    }
    return amount;
  },
  getMayPay(curr_in_id) {
    let amount;
    for(let key in face2face_state.currencies.in) {
      let currency = face2face_state.currencies.in[key];
      if (curr_in_id === currency.id) {
        amount = currency.may_pay;
      }
      return amount;
    }
  },
  icon_url: '',
  currencies: {
    out: {},
    in: {}
  },
  rates: {},
  calculator: {
    in: {},
    out: {},
    amountIn: 0,
    amountOut: 0,
    usdValue: 0,
    rate: 0
  }
});

export default face2face_state;

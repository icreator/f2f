import {store} from 'react-easy-state';

const face2face_state = store({
  serverName: 'http://face2face.cash',
  loadCurrencies () {
    return fetch(`${face2face_state.serverName}/apipay/get_currs.json`)
      .then(r => r.json())
      .then(r => {
        face2face_state.icon_url = r.icon_url;
        Object.entries(r.in).map(([code, item]) => {
          face2face_state.currencies.in[code] = {
            ...item,
            code
          };
          return item;
        });
        Object.entries(r.out).map(([code, item]) => {
          face2face_state.currencies.out[code] = {
            ...item,
            code
          };
          return item;
        });
        return face2face_state.loadRates();
      });
  },
  loadRates() {
    return fetch(`${face2face_state.serverName}/api/rates3.json`)
      .then(r => r.json())
      .then(rates => face2face_state.rates = rates);
  },
  getRate(curr_out_key, curr_in_code) {
    let rate = 0;
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
    }
    return amount;
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
    amountIn: '',
    amountOut: 0,
    usdValue: 0,
    rate: 0
  }
});

export default face2face_state;

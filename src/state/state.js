// @flow

import { store } from 'react-easy-state'

type GetCurrsResponse = {
  icon_url: string,
  in: { [string]: {
    id: number,
    icon: string,
    name: string,
    name2: string,
    may_pay: number
  }},
  out: { [string]: {
    id: number,
    icon: string,
    name: string,
    name2: string,
    bal: number
  }}
}

type RateTuple = [number, string]
type RateArray = Array<RateTuple>

type RatesResponse = {[string]: RateArray}

const face2faceState: {
  serverName: string,
  loadCurrencies: () => Promise<void>,
  loadRates: () => Promise<void>,
  getRate: (string, string) => number,
  getAvailableAmount: (number) => ?number,
  getMayPay: (number) => ?number,
  icon_url: string,
  currencies: {
    out: {[string]: {
      id: number,
      code: string,
      icon: string,
      name: string,
      name2: string,
      bal: number
    }},
    in: {[string]: {
      id: number,
      code: string,
      icon: string,
      name: string,
      name2: string,
      may_pay: number
    }}
  },
  rates: RatesResponse,
  calculator: {
    in: {},
    out: {},
    amountIn: number,
    amountOut: number,
    usdValue: number,
    rate: number
  }
} = store({
  serverName: 'http://face2face.cash',
  loadCurrencies () {
    return window.fetch(`${face2faceState.serverName}/apipay/get_currs.json`)
      .then(r => r.json())
      .then((r: GetCurrsResponse) => {
        face2faceState.icon_url = r.icon_url
        Object.entries(r.in).map(([code, item]) => {
          face2faceState.currencies.in[code] = {
            ...item,
            code
          }
          return item
        })
        Object.entries(r.out).map(([code, item]) => {
          face2faceState.currencies.out[code] = {
            ...item,
            code
          }
          return item
        })
        return face2faceState.loadRates()
      })
  },
  loadRates () {
    return window.fetch(`${face2faceState.serverName}/api/rates3.json`)
      .then(r => r.json())
      .then((rates: RatesResponse) => { face2faceState.rates = rates })
  },
  getRate (currOutKey, currInCode) {
    let rate = 0
    for (let currIn of face2faceState.rates[currOutKey]) {
      if (currIn[1] === currInCode) {
        rate = currIn[0]
      }
    }
    return rate
  },
  getAvailableAmount (currOutId) {
    let amount
    for (let key in face2faceState.currencies.out) {
      let currency = face2faceState.currencies.out[key]
      if (currOutId === currency.id) {
        amount = currency.bal
      }
    }
    return amount
  },
  getMayPay (currInId) {
    let amount
    for (let key in face2faceState.currencies.in) {
      let currency = face2faceState.currencies.in[key]
      if (currInId === currency.id) {
        amount = currency.may_pay
      }
    }
    return amount
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
})

export default face2faceState

// @flow
import React from 'react'
import { withRouter } from 'react-router'
import { view } from 'react-easy-state'
import { fetch } from 'whatwg-fetch'
import { i18n } from '../../state/i18n'
import Loader from '../../components/Loader'
import state from '../../state/state'
import AbortController from '../../libs/abort-controller'
import './PaymentsPage.scss'

type HistoryResponse = {
  error?: string,
  deal_acc: {
    gift_amount: number,
    gift_payed: number,
    gift_pick: number,
    curr_out_id: number
  },
  done: Array<{
    acc: string,
    created: string,
    pay_out?: {
      created_on: string,
      amount: number,
      amo_gift: number,
      amo_partner: number,
      amo_to_pay: number,
      amo_taken: number,
      vars: {
        status: "success"
      }
    },
    curr_in: {
      abbrev: string,
      id: number
    },
    curr_out: {
      abbrev: string,
      id: number
    },
    amount_in: number,
    stasus: "ok" | "added" | "wait",
    txid: string,
    status_mess: string
  }>,
  in_process: Array<{
    acc: string,
    created: string,
    curr_in: {
      abbrev: string,
      id: number
    },
    curr_out: {
      abbrev: string,
      id: number
    },
    amount_in: number,
    stasus: "ok" | "added" | "wait",
    txid: string,
    status_mess: string
  }>,
  unconfirmed: Array<[
    {
      abbrev: string,
      id: number
    },
    string,
    string,
    number,
    number,
    number,
    string,
    string
  ]>
}

type StateTypes = {
  lastSearch: string,
  search: string,
  focus: boolean,
  data: Array<{
    date: string,
    sent: number | string,
    sentCurrency: string,
    statusIn: 'pending' | 'complete' | 'none',
    received: number | string,
    receivedCurrency: string,
    statusOut: 'pending' | 'complete' | 'added' | 'none',
    inTxId: string,
    amoGift: number,
    amoToPay: number,
    amoPartner: number,
    amoTaken: number,
    rawStatus: string,
    rawStatusMess: string
  }>,
  messageData: {
    gift_amount: string,
    gift_payed: string,
    gift_pick: string,
    currency: string
  },
  error: ?string,
  loading: boolean,
  debug: boolean
}

type PropTypes = {
  match: {
    params: {
      currency?: string,
      wallet?: string
    }
  },
  history: {
    push: (string) => void
  }
}

const abortableFetch: typeof fetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController: ?typeof AbortController = ('AbortController' in window) ? window.AbortController : AbortController
function convert (n: number): string {
  const string = n.toString()
  if (!/e/.exec(string)) {
    return `${n}`
  }
  let lead: string, decimal: string, pow: string
  if (/\./.exec(string)) {
    [lead, decimal, pow] = n.toString().split(/e|\./)
  } else {
    [lead, pow] = n.toString().split(/e/)
    decimal = ''
  }
  return +pow <= 0
    ? '0.' + '0'.repeat(Math.abs(+pow) - 1) + lead + decimal
    : lead + (+pow >= decimal.length ? (decimal + '0'.repeat(+pow - decimal.length)) : (decimal.slice(0, +pow) + '.' + decimal.slice(+pow)))
}

class PaymentsPage extends React.Component<PropTypes, StateTypes> {
  state = {
    lastSearch: '',
    search: '',
    focus: false,
    data: [],
    messageData: {
      gift_amount: '0',
      gift_payed: '0',
      gift_pick: '0',
      currency: ''
    },
    error: null,
    loading: false,
    debug: false
  }

  abortController: ?AbortController = undefined

  performSearch = () => {
    this.setState({
      lastSearch: this.state.search,
      error: null,
      loading: true,
      messageData: {
        gift_amount: '0',
        gift_payed: '0',
        gift_pick: '0',
        currency: ''
      }
    })
    let signal
    if (this.abortController) {
      this.abortController.abort()
    }
    if (this.state.search === '') {
      this.setState({
        error: null,
        loading: false,
        data: []
      })
      return
    }
    if (!NewAbortController) {
      return
    }
    this.abortController = new NewAbortController()
    signal = this.abortController.signal
    abortableFetch(`${state.serverName}/apipay/history.json/${this.state.search.replace(/:/, '/').replace(/^_+/, '')}`, {
      signal
    })
      .then(result => result.json())
      .then((result: HistoryResponse) => {
        if (result.error) {
          this.setState({
            error: result.error,
            loading: false
          })
          return
        }
        const data = []
        for (let row of result.unconfirmed) {
          data.push({
            sent: row[1],
            sentCurrency: row[0].abbrev,
            statusIn: 'pending',
            received: '',
            receivedCurrency: '',
            statusOut: 'none',
            inTxId: row[2],
            date: row[6],
            amoGift: 0,
            amoToPay: 0,
            amoPartner: 0,
            amoTaken: 0,
            rawStatus: 'unconfirmed',
            rawStatusMess: ''
          })
        }
        for (let row of result.in_process) {
          data.push({
            sent: row.amount_in,
            sentCurrency: row.curr_in.abbrev,
            statusIn: ((row.stasus === 'ok' || row.stasus === 'added') ? 'complete' : 'pending'),
            received: '',
            amoGift: 0,
            amoToPay: 0,
            amoPartner: 0,
            amoTaken: 0,
            receivedCurrency: '',
            statusOut: 'none',
            inTxId: row.txid,
            date: row.created,
            rawStatus: row.stasus,
            rawStatusMess: row.status_mess
          })
        }
        for (let row of result.done) {
          data.push({
            sent: row.amount_in,
            sentCurrency: row.curr_in.abbrev,
            statusIn: ((row.stasus === 'ok' || row.stasus === 'added') ? 'complete' : 'pending'),
            received: (row.pay_out ? row.pay_out.amount : parseFloat(row.status_mess)),
            amoGift: (row.pay_out ? row.pay_out.amo_gift : 0),
            amoToPay: (row.pay_out ? row.pay_out.amo_to_pay : 0),
            amoPartner: (row.pay_out ? row.pay_out.amo_partner : 0),
            amoTaken: (row.pay_out ? row.pay_out.amo_taken : 0),
            receivedCurrency: row.curr_out.abbrev,
            statusOut: (row.pay_out ? (row.pay_out.vars.status === 'success') ? 'complete' : 'pending' : (row.stasus === 'added') ? 'added' : 'none'),
            inTxId: row.txid,
            date: row.created,
            rawStatus: row.stasus,
            rawStatusMess: row.status_mess
          })
        }
        let currency = ''
        for (let key in state.currencies.out) {
          if (state.currencies.out[key].id === result.deal_acc.curr_out_id) {
            currency = key
          }
        }
        this.setState({
          data,
          messageData: {
            gift_amount: convert(result.deal_acc.gift_amount),
            gift_payed: convert(result.deal_acc.gift_payed),
            gift_pick: convert(result.deal_acc.gift_pick),
            currency
          },
          loading: false
        })
      })
      .catch((e: { name: string, message: string }) => {
        if (e.name !== 'AbortError') {
          this.setState({
            data: [],
            loading: false,
            error: 'generalError'
          })
          console.log(e)
        }
      })
  }

  static getDerivedStateFromProps (props: PropTypes, state: StateTypes) {
    let search = ''
    let debug = false
    if (props.match.params.currency) {
      if (/^___/.test(props.match.params.currency)) {
        debug = true
      }
      if (props.match.params.currency) {
        search += `${props.match.params.currency.replace(/^___/, '')}:`
      }
    }
    if (props.match.params.wallet) {
      search += props.match.params.wallet
    }
    return {
      debug,
      search
    }
  }

  componentDidMount () {
    if (this.state.search !== '') {
      this.performSearch()
    }
  }

  componentDidUpdate () {
    if (this.state.search !== this.state.lastSearch) {
      this.performSearch()
    }
  }

  render () {
    const {
      search,
      // messageData,
      data,
      error,
      loading
    } = this.state

    let results = <span className='not-found' />

    if (loading) {
      results = <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><Loader /></div>
    } else if (error) {
      let string = error
      if (string === 'generalError') {
        string = i18n.t('payments_page.generalError')
      } else if (/wrong address/.exec(string)) {
        string = i18n.t('payments_page.wrong_address')
      } else if (/Deals not found/.exec(string) || /Use ABBREV\/ACCOUNT/.exec(string)) {
        string = i18n.t('payments_page.nothing_found')
      }
      results = <span className='not-found'>{string}</span>
    } else if (data.length === 0) {
      results = <span className='not-found'>{i18n.t('payments_page.nothing_found')}</span>
    } else {
      const rows = []
      // let message = ''
      for (let row of data) {
        let receivedString = <span>
          {row.received} {row.receivedCurrency}<br />
          {row.amoGift > 0 && ['+', i18n.t('payments_page.table.gift'), ' ', row.amoGift, ' ', row.receivedCurrency, <br key='br' />]}
          {row.amoToPay > 0 && ['+', i18n.t('payments_page.table.debt'), ' ', row.amoToPay, ' ', row.receivedCurrency, <br key='br' />]}
          {row.amoPartner > 0 && ['+', i18n.t('payments_page.table.partner'), ' ', row.amoPartner, ' ', row.receivedCurrency, <br key='br' />]}
          {(row.amoGift > 0 || row.amoToPay > 0 || row.amoPartner > 0) && ['= ', row.amoTaken, ' ', row.receivedCurrency]}
        </span>
        rows.push(<tr key={row.inTxId}>
          <td>
            {row.date}
          </td>
          <td>
            {row.sent} {row.sentCurrency}<br />
          </td>
          <td>
            {
              row.statusIn === 'pending' &&
              <img
                alt={i18n.t('payments_page.table.status.pending')}
                title={i18n.t('payments_page.table.status.pending')}
                src='/img/payment-pending.png'
              />
            }
            {
              row.statusIn === 'complete' &&
              <img
                alt={i18n.t('payments_page.table.status.complete')}
                title={i18n.t('payments_page.table.status.complete')}
                src='/img/payment-confirmed.png'
              />
            }
          </td>
          <td>
            {receivedString}
          </td>
          <td>
            {
              row.statusOut === 'pending' &&
              <img
                alt={i18n.t('payments_page.table.status.pending')}
                title={i18n.t('payments_page.table.status.pending')}
                src='/img/payment-pending.png'
              />
            }
            {
              row.statusOut === 'added' &&
              <img
                alt={i18n.t('payments_page.table.status.added')}
                title={i18n.t('payments_page.table.status.added')}
                src='/img/payment-added.png'
              />
            }
            {
              row.statusOut === 'complete' &&
              <img
                alt={i18n.t('payments_page.table.status.complete')}
                title={i18n.t('payments_page.table.status.complete')}
                src='/img/payment-confirmed.png'
              />
            }
          </td>
          {this.state.debug && <td>
            {row.rawStatus}<br />
            {row.rawStatusMess}
          </td>}
        </tr>)
      }

      /* if (parseFloat(messageData.gift_amount) > 0) {
        message = [
          <h3 key='gift_header' className='gift_info'>
            {i18n.t('payments_page.gift_info_header', {
              giftAmount: `${messageData.gift_amount}`,
              currency: messageData.currency
            })}
          </h3>,
          <p key='gift_text'>{i18n.t('payments_page.gift_info_text', {
            giftPayed: `${messageData.gift_payed}`,
            giftPick: `${messageData.gift_pick}`,
            currency: `${messageData.currency}`
          })}</p>
        ]
      } */

      results = [
        // message,
        <table key='table' className='search-table'>
          <thead>
            <tr>
              {<th>{i18n.t('payments_page.table.date')}</th>}
              <th>{i18n.t('payments_page.table.sent')}</th>
              <th />
              <th>{i18n.t('payments_page.table.received')}</th>
              <th />
              {this.state.debug && <th />}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      ]
    }

    return <div className='payments-page container-950'>
      <h1>{i18n.t('payments_page.header')}</h1>
      <div className={`search-container${this.state.focus ? ' focus' : ''}`}>
        <input
          className='search-bar'
          value={search}
          onChange={() => {}} // React shows error that field is readOnly, but I use onInput!
          onInput={(e: SyntheticEvent<HTMLInputElement>) => {
            e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9:_]/g, '')
            let string = e.currentTarget.value.replace(/\//g, ':')
            string = string.replace(/:/, '/')
            this.props.history.push(`/payments/${string}`)
          }}
          placeholder={i18n.t('payments_page.search_placeholder')}
          onFocus={() => this.setState({
            focus: true
          })}
          onBlur={() => this.setState({
            focus: false
          })}
        />
      </div>
      {results}
    </div>
  }
}

export default withRouter(view(PaymentsPage))

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
    pay_out?: {
      created_on: string,
      amount: number,
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
    stasus: "ok" | "added",
    txid: string,
    status_mess: string
  }>
}

type StateTypes = {
  lastSearch: string,
  search: string,
  focus: boolean,
  data: Array<{
    sent: number,
    sentCurrency: string,
    statusIn: 'ok' | 'added' | '',
    // rate: number,
    received: number,
    receivedCurrency: string,
    statusOut: 'pending' | 'complete' | 'none',
    inTxId: string,
  }>,
  messageData: {
    gift_amount: number,
    gift_payed: number,
    gift_pick: number,
    currency: string
  },
  error: ?string,
  loading: boolean
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

class PaymentsPage extends React.Component<PropTypes, StateTypes> {
  state = {
    lastSearch: '',
    search: '',
    focus: false,
    data: [],
    messageData: {
      gift_amount: 0,
      gift_payed: 0,
      gift_pick: 0,
      currency: ''
    },
    error: null,
    loading: false
  }

  abortController: ?AbortController = undefined

  performSearch = () => {
    this.setState({
      lastSearch: this.state.search,
      error: null,
      loading: true,
      messageData: {
        gift_amount: 0,
        gift_payed: 0,
        gift_pick: 0,
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
    abortableFetch(`${state.serverName}/apipay/history.json/${this.state.search}`, {
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
        for (let row of result.done) {
          data.push({
            sent: row.amount_in,
            sentCurrency: row.curr_in.abbrev,
            statusIn: (row.stasus === 'ok' ? 'complete' : 'pending'),
            // rate: row. // TODO: Add Rate
            received: (row.pay_out ? row.pay_out.amount : parseFloat(row.status_mess)),
            receivedCurrency: row.curr_out.abbrev,
            statusOut: (row.pay_out ? (row.pay_out.vars.status === 'success') ? 'complete' : 'pending' : 'none'),
            inTxId: row.txid
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
            gift_amount: result.deal_acc.gift_amount,
            gift_payed: result.deal_acc.gift_payed,
            gift_pick: result.deal_acc.gift_pick,
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
    if (props.match.params.currency) {
      search += `${props.match.params.currency}/`
    }
    if (props.match.params.wallet) {
      search += props.match.params.wallet
    }
    return {
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
    console.log(this.props.match)
    const { search, messageData, data, error, loading } = this.state

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
      let message = ''
      for (let row of data) {
        rows.push(<tr key={row.inTxId}>
          <td>
            {row.sent} {row.sentCurrency}<br />
            {/* <a href='' target='_blank'>{i18n.t('payments_page.table.block_explorer_link')}</a> */}
          </td>
          <td>
            {row.statusIn === 'pending' && <img alt='' src='/img/payment-pending.png' />}
            {row.statusIn === 'complete' && <img alt='' src='/img/payment-confirmed.png' />}
          </td>
          {/* <td>
            {row.rate}
          </td> */}
          <td>
            {row.received} {row.receivedCurrency}<br />
            {/* <a href='' target='_blank'>{i18n.t('payments_page.table.block_explorer_link')}</a> */}
          </td>
          <td>
            {row.statusOut === 'pending' && <img alt='' src='/img/payment-pending.png' />}
            {row.statusOut === 'complete' && <img alt='' src='/img/payment-confirmed.png' />}
          </td>
        </tr>)
      }

      if (messageData.gift_amount > 0) {
        message = <h3 className='gift_info'>
          {i18n.t('payments_page.gift_info_header', {
            giftAmount: `${messageData.gift_amount}`,
            currency: `${messageData.currency}`
          })}
        </h3>
      }

      results = [
        message,
        <table className='search-table'>
          <thead>
            <tr>
              {/* <th>{i18n.t('payments_page.table.date')}</th> */}
              <th>{i18n.t('payments_page.table.sent')}</th>
              <th />
              {/* <th>{i18n.t('payments_page.table.rate')}</th> */}
              <th>{i18n.t('payments_page.table.received')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows}
            {/* <tr>
              <td colSpan='6'>
                <button className='show-more'>{i18n.t('payments_page.table.show_more')}</button>
              </td>
            </tr> */}
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
            this.props.history.push(`/payments/${e.currentTarget.value}`)
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

export default view(withRouter(PaymentsPage))

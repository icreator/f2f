// @flow

import React from 'react'
import { view } from 'react-easy-state'
import { fetch } from 'whatwg-fetch'
import { i18n } from '../../state/i18n'
import Loader from '../../components/Loader'
import state from '../../state/state'
import AbortController from '../../libs/abort-controller'
import './PaymentsPage.scss'

type HistoryResponse = {
  error?: string,
  done: Array<{
    acc: string,
    pay_out: {
      created_on: string,
      amount: number,
      vars: {
        status: "success"
      }
    },
    curr_in: string,
    pay_in: {
      amount: number,
      stasus: "ok",
      txid: string
    },
    curr_in_id: number,
    curr_out_id: number,
    curr_out: string
  }>
}

type State = {
  search: string,
  focus: boolean,
  data: Array<{
    sent: number,
    sentCurrency: string,
    statusIn: 'pending' | 'complete',
    // rate: number,
    received: number,
    receivedCurrency: string,
    statusOut: ?('pending' | 'complete'),
    inTxId: string
  }>,
  error: ?string,
  loading: boolean
}

const abortableFetch: typeof fetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController: ?typeof AbortController = ('AbortController' in window) ? window.AbortController : AbortController

class PaymentsPage extends React.Component<{}, State> {
  state = {
    search: '',
    focus: false,
    data: [],
    error: null,
    loading: false
  }

  abortController: ?AbortController = undefined

  performSearch = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      search: event.target.value,
      error: null,
      loading: true
    })
    let signal
    if (this.abortController) {
      this.abortController.abort()
    }
    if (event.target.value === '') {
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
    abortableFetch(`${state.serverName}/apipay/history.json/${event.target.value}`, {
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
            sent: row.pay_in.amount,
            sentCurrency: row.curr_in,
            statusIn: (row.pay_in.stasus === 'ok') ? 'complete' : 'pending',
            // rate: row. // TODO: Add Rate
            received: row.pay_out.amount,
            receivedCurrency: row.curr_out,
            statusOut: (row.pay_out.vars.status === 'success') ? 'complete' : 'pending',
            inTxId: row.pay_in.txid
          })
        }
        this.setState({
          data,
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

  render () {
    const { search, data, error, loading } = this.state

    let results = <span className='not-found' />

    if (loading) {
      results = <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><Loader /></div>
    } else if (error) {
      let string = error
      if (string === 'generalError') {
        string = i18n.t('payments_page.generalError')
      } else if (/wrong address/.exec(string)) {
        string = i18n.t('payments_page.wrong_address')
      } else if (/Deals not found/.exec(string)) {
        string = i18n.t('payments_page.nothing_found')
      }
      results = <span className='not-found'>{string}</span>
    } else if (data.length > 0) {
      const rows = []
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

      results = <table className='search-table'>
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
    }

    return <div className='payments-page container-950'>
      <h1>{i18n.t('payments_page.header')}</h1>
      <div className={`search-container${this.state.focus ? ' focus' : ''}`}>
        <input
          className='search-bar'
          value={search}
          onChange={() => {}} // React shows error that field is readOnly, but I use onInput!
          onInput={this.performSearch}
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

export default view(PaymentsPage)

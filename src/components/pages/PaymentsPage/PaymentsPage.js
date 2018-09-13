import React from 'react';
import {view} from 'react-easy-state';
import {i18n} from "../../i18n";
import './PaymentsPage.scss';

class PaymentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      focus: false
    };
  }

  static generateRandomData() {
    const dateStart = new Date(1499978432000);
    const dateEnd = new Date(1546202432000);
    const date = new Date(dateStart.getTime() + Math.random() * (dateEnd.getTime() - dateStart.getTime()));
    let mm = date.getMonth();
    let ii = date.getMinutes();
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (ii < 10) {
      ii = `0${ii}`;
    }
    const rate = Math.random() / 100;
    const sent = Math.random() * 100;
    const sent_currency = (['ERA', 'BTC', 'LTC'])[Math.floor(Math.random() * 3)];
    const [status_in, status_out] = ([
      ['pending', ''],
      ['complete', 'pending'],
      ['complete', 'complete']
    ])[Math.floor(Math.random() * 3)];
    return {
      date: `${date.getDay() + 1}.${mm}.${date.getFullYear()} ${date.getHours()}:${ii}`,
      sent,
      sent_currency,
      status_in,
      rate,
      received: sent * rate,
      received_currency: 'Compu',
      status_out
    };
  }

  render() {
    let results = <span className="not-found">{i18n.t('payments_page.nothing_found')}</span>;

    if (this.state.search.length > 0) {
      const rows = [];
      for (let i=1; i <= this.state.search.length; i += 1) {
        const data = PaymentsPage.generateRandomData();
        rows.push(<tr>
          <td>{data.date}</td>
          <td>
            {data.sent} {data.sent_currency}<br/>
            <a href="" target="_blank">{i18n.t('payments_page.table.block_explorer_link')}</a>
          </td>
          <td>
            {data.status_in === "pending" && <img src="/img/payment-pending.png"/>}
            {data.status_in === "complete" && <img src="/img/payment-confirmed.png"/>}
          </td>
          <td>
            {data.rate}
          </td>
          <td>
            {data.received} {data.received_currency}<br/>
            <a href="" target="_blank">{i18n.t('payments_page.table.block_explorer_link')}</a>
          </td>
          <td>
            {data.status_out === "pending" && <img src="/img/payment-pending.png"/>}
            {data.status_out === "complete" && <img src="/img/payment-confirmed.png"/>}
          </td>
        </tr>);
      }

      results = <table className="search-table">
        <thead>
          <tr>
            <th>{i18n.t('payments_page.table.date')}</th>
            <th>{i18n.t('payments_page.table.sent')}</th>
            <th/>
            <th>{i18n.t('payments_page.table.rate')}</th>
            <th>{i18n.t('payments_page.table.received')}</th>
            <th/>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr>
            <td colSpan="6">
              <button className="show-more">{i18n.t('payments_page.table.show_more')}</button>
            </td>
          </tr>
        </tbody>
      </table>
    }

    return <div className="payments-page container-950">
      <h1>{i18n.t('payments_page.header')}</h1>
      <div className={`search-container${this.state.focus?' focus':''}`}>
        <input
          className="search-bar"
          value={this.state.search}
          onInput={event => this.setState({
            search: event.target.value
          })}
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
    </div>;
  }
}

export default view(PaymentsPage);

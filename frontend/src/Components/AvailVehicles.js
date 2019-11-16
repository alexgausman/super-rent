import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class AvailVehicles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locOptions: [],
      typeOptions: [],
      submission: null,
      result: null,
    };
    this.getSetlocOptions = this.getSetlocOptions.bind(this);
    this.getSetTypeOptions = this.getSetTypeOptions.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.getSetlocOptions()
    this.getSetTypeOptions();
    window.$('select').selectpicker();
    window.$('#fromDateTimePicker').datetimepicker({
		  //locale: 'nl',
		  useCurrent: true,
		  format: 'MM/DD/YYYY HH:mm',
		});
    window.$('#untilDateTimePicker').datetimepicker({
		  //locale: 'nl',
		  useCurrent: true,
		  format: 'MM/DD/YYYY HH:mm',
		});
  }

  componentDidUpdate(prevProps, prevState) {
    const prevlocOptions = JSON.stringify(prevState.locOptions);
    const newlocOptions = JSON.stringify(this.state.locOptions);
    if (prevlocOptions !== newlocOptions) {
      window.$('select#locSelect').selectpicker('refresh');
    }
    const prevtypeOptions = JSON.stringify(prevState.typeOptions);
    const newtypeOptions = JSON.stringify(this.state.typesList);
    if (prevtypeOptions !== newtypeOptions) {
      window.$('select#typeSelect').selectpicker('refresh');
    }
  }

  getSetlocOptions() {
    axios.get('/tables/branches')
      .then(res => {
        // TODO: fetch locations from res.data.result
        const locs = ['Vancouver', 'Calgary', 'Montreal'];
        this.setState({ locOptions: locs });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            this.setState({ typeOptions: [] });
            return;
          }
        }
        console.log(err);
      });
  }

  getSetTypeOptions() {
    axios.get('/tables/vehicletypes')
      .then(res => {
        const types = res.data.result.map(r => r.vtname);
        this.setState({ typeOptions: types });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            this.setState({ typeOptions: [] });
            return;
          }
        }
        console.log(err);
      });
  }

  refresh() {
    // TODO
  }

  onSubmit() {
    const newSubmission = {
      locations: window.$('select#locSelect').val(),
      vehicleTypes: window.$('select#typeSelect').val(),
      fromDateTime: window.$('#fromDateTimePicker').data('date'),
      toDateTime: window.$('#untilDateTimePicker').data('date'),
    };
    this.setState({ submission: newSubmission });
    axios.post('/customer-actions/find-available-vehicles', newSubmission)
      .then(res => {
        // TODO
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            // TODO
            return;
          }
        }
        console.log(err);
      });
  }



  render() {
    let html = (
      <span>TODO</span>
    );
    if (!this.state.submission) {
      html = (
        <div style={{
          width: '450px',
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '28px' }}>
            Find Available Vehicles
          </h3>

          <div className="form-group">
            <label htmlFor="locSelect">Location</label>
            <select className="selectpicker" multiple id="locSelect" title="Any">
              {this.state.locOptions.map((loc, i) => (
                <option key={i}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="typeSelect">Type</label>
            <select className="selectpicker" multiple id="typeSelect" title="Any">
              {this.state.typeOptions.map((type, i) => (
                <option key={i}>{type}</option>
              ))}
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="fromDateTimePicker">From</label>
            <input type="text" className="form-control datetimepicker-input" id="fromDateTimePicker" data-toggle="datetimepicker" data-target="#fromDateTimePicker" autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="untilDateTimePicker">Until</label>
            <input type="text" className="form-control datetimepicker-input" id="untilDateTimePicker" data-toggle="datetimepicker" data-target="#untilDateTimePicker" autoComplete="off" />
          </div>

          <button type="button" className="btn btn-primary" onClick={this.onSubmit} style={{
            marginTop: '12px',
            width: '100%',
          }}>
            Submit
          </button>
        </div>
      );
    }
    return (
      <div style={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div className="refresh-button" onClick={this.refresh}>
          <i className="fas fa-sync-alt"></i>
        </div>
        {html}
      </div>

    );
  }
}

AvailVehicles.propTypes = {
  logQuery: PropTypes.func.isRequired,
}

export default AvailVehicles;

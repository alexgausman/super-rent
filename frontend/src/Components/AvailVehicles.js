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
    this.setup = this.setup.bind(this);
    this.getSetLocOptions = this.getSetLocOptions.bind(this);
    this.getSetTypeOptions = this.getSetTypeOptions.bind(this);
    this.refresh = this.refresh.bind(this);
    this.goBack = this.goBack.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

  }

  componentDidMount() {
    this.setup();
  }

  setup() {
    this.getSetLocOptions()
    this.getSetTypeOptions();
    window.$('#fromDateTimePicker').datetimepicker({
		  useCurrent: false,
		  format: 'MM/DD/YYYY HH:mm',
      minDate: 'now',
		});
    window.$('#untilDateTimePicker').datetimepicker({
		  useCurrent: false,
		  format: 'MM/DD/YYYY HH:mm',
      minDate: 'now',
		});
  }

  getSetLocOptions() {
    axios.get('/tables/branches')
      .then(res => {
        const locations = res.data.result.map(r => r.location);
        this.setState({ locOptions: locations });
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
    if (!this.state.submission) {
      this.setup();
      window.$('#locSelect').val('any');
      window.$('#typeSelect').val('any');
      window.$('#fromDateTimePicker').val('');
      window.$('#untilDateTimePicker').val('');
    }
  }

  goBack() {
    const { submission } = this.state;
    this.setState({ submission: null }, () => {
      this.setup();
      window.$('#locSelect').val(submission.location);
      window.$('#typeSelect').val(submission.vehicleType);
      window.$('#fromDateTimePicker').val(submission.fromDateTime);
      window.$('#untilDateTimePicker').val(submission.toDateTime);
    })
  }

  onSubmit() {
    const newSubmission = {
      location: window.$('select#locSelect').val(),
      vehicleType: window.$('select#typeSelect').val(),
      fromDateTime: window.$('#fromDateTimePicker').data('date'),
      toDateTime: window.$('#untilDateTimePicker').data('date'),
    };
    console.log(newSubmission)
    this.setState({ submission: newSubmission });
    axios.post('/customer-actions/find-available-vehicles', newSubmission)
      .then(res => {
        // TODO
        console.log(res);
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
            <select className="form-control" id="locSelect">
              <option value="any">Any</option>
              <option disabled>─────────────────────────</option>
              {this.state.locOptions.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="typeSelect">Type</label>
            <select className="form-control" id="typeSelect">
              <option value="any">Any</option>
              <option disabled>─────────────────────────</option>
              {this.state.typeOptions.map((type, i) => (
                <option key={i} value={type}>{type}</option>
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
        {(this.state.submission) && (
          <div className="back-button" onClick={this.goBack}>
            <i className="far fa-arrow-alt-circle-left"></i>
          </div>
        )}

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

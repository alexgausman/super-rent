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
    this.setState({ submission: newSubmission });
    axios.post('/customer-actions/find-available-vehicles', newSubmission)
      .then(res => {
        this.props.logQuery(res.data.query);
        this.setState({ result: res.data.result });
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
    const { submission, locOptions, typeOptions, result } = this.state;
    let html;
    if (!submission) {
      html = (
        <div style={{
          width: '450px',
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '28px' }}>
            Filter Rentable Vehicles
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


          <div className="form-group" style={{ display: 'none' }}>
            <label htmlFor="fromDateTimePicker">From</label>
            <input type="text" className="form-control datetimepicker-input" id="fromDateTimePicker" data-toggle="datetimepicker" data-target="#fromDateTimePicker" autoComplete="off" />
          </div>
          <div className="form-group" style={{ display: 'none' }}>
            <label htmlFor="untilDateTimePicker">Until</label>
            <input type="text" className="form-control datetimepicker-input" id="untilDateTimePicker" data-toggle="datetimepicker" data-target="#untilDateTimePicker" autoComplete="off" />
          </div>

          <button type="button" className="btn btn-primary" onClick={this.onSubmit} style={{
            marginTop: '12px',
            width: '100%',
            marginBottom: '25px',
          }}>
            Submit
          </button>
        </div>
      );
    } else if (result) {
      const tables = [];
      locOptions.forEach((loc, i) => {
        const data = result.filter(r => r.location === loc);
        const rows = [];
        if (data.length > 0) {
          tables.push(
            <div key={i}>
              <h3 className="pb-2" style={{
                marginTop: '30px',
              }}>{loc}</h3>
              <table className="table table-responsive-lg table-hover">
                <thead>
                  <tr>
                    <th scope="col">VehicleType</th>
                    <th scope="col">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {typeOptions.forEach((type, i) => {
                    const vtData = data.find(d => d.vtname === type);
                    let numVehicles = 0;
                    if (vtData) {
                      numVehicles = vtData.numvehicles;
                    }
                    let svt = submission.vehicleType;
                    if (svt === 'any' || svt === type) {
                      rows.push(
                        <tr key={i}>
                          <td style={{ lineHeight: '1.8' }}>{type}</td>
                          <td style={{ lineHeight: '1.8' }}>{numVehicles}</td>
                        </tr>
                      );
                    }
                  })}
                  {rows}
                </tbody>
              </table>
            </div>
          );
        }
      });
      html = (
        <div style={{ width: '100%' }}>
          {tables}
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
            <i className="far fa-times-circle"></i>
          </div>
        )}
        {html}
      </div>

    );
  }
}

AvailVehicles.propTypes = {
  logQuery: PropTypes.func.isRequired,
}

export default AvailVehicles;

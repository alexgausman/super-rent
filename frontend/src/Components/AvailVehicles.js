import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class AvailVehicles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locList: [],
      typeList: [],
    };
    this.getSetLocList = this.getSetLocList.bind(this);
    this.getSetTypeList = this.getSetTypeList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.getSetLocList()
    this.getSetTypeList();
    window.$('select').selectpicker();
    window.$('#fromDateTimePicker').datetimepicker({
		  //locale: 'nl',
		  useCurrent: true,
		  format: 'MM/DD/YYYY HH:mm',
		  // sideBySide: true,
		  // date: '12/18/2019 18:30',
		});
    window.$('#untilDateTimePicker').datetimepicker({
		  //locale: 'nl',
		  useCurrent: true,
		  format: 'MM/DD/YYYY HH:mm',
		  // sideBySide: true,
		  // date: '12/18/2019 18:30',
		});
  }

  componentDidUpdate(prevProps, prevState) {
    const prevLocList = JSON.stringify(prevState.locList);
    const newLocList = JSON.stringify(this.state.locList);
    if (prevLocList !== newLocList) {
      window.$('select#locSelect').selectpicker('refresh');
    }
    const prevTypeList = JSON.stringify(prevState.typeList);
    const newTypeList = JSON.stringify(this.state.typesList);
    if (prevTypeList !== newTypeList) {
      window.$('select#typeSelect').selectpicker('refresh');
    }
  }

  getSetLocList() {
    axios.get('/tables/branches')
      .then(res => {
        // TODO: fetch locations from res.data.result
        const locs = ['Vancouver', 'Calgary', 'Montreal'];
        this.setState({ locList: locs });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            this.setState({ typeList: [] });
            return;
          }
        }
        console.log(err);
      });
  }

  getSetTypeList() {
    axios.get('/tables/vehicletypes')
      .then(res => {
        const types = res.data.result.map(r => r.vtname);
        this.setState({ typeList: types });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            this.setState({ typeList: [] });
            return;
          }
        }
        console.log(err);
      });
  }

  onSubmit() {
    // console.log(window.$('#fromDateTimePicker').data('date'));
    // console.log(window.$('#untilDateTimePicker').data('date'));
  }



  render() {
    return (
      <div style={{
        minWidth: '450px',
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '28px' }}>
          Find Available Vehicles
        </h3>

        <div className="form-group">
          <label htmlFor="locSelect">Location</label>
          <select className="selectpicker" multiple id="locSelect" title="Any">
            {this.state.locList.map((loc, i) => (
              <option key={i}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="typeSelect">Type</label>
          <select className="selectpicker" multiple id="typeSelect" title="Any">
            {this.state.typeList.map((type, i) => (
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
}

AvailVehicles.propTypes = {
  logQuery: PropTypes.func.isRequired,
}

export default AvailVehicles;

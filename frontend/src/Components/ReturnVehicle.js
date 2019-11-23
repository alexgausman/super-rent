import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class ReturnVehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rid: '',
            odometer: '',
            tankFull: 'true',
            rentedVehicleIDs: [],
            submission: null,
            result: null,
            errors: {},
        };
        this.setup = this.setup.bind(this);
        this.getSetRentedIds = this.getSetRentedIds.bind(this);
        this.handleOdometerChange = this.handleOdometerChange.bind(this);
        this.handleTankFullChange = this.handleTankFullChange.bind(this);
        this.handleRIDChange = this.handleRIDChange.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.setup();
    }

    setup() {
        this.getSetRentedIds();
        window.$('#untilDateTimePicker').datetimepicker({
            useCurrent: false,
            format: 'MM/DD/YYYY HH:mm',
            minDate: 'now',
        });
    }

    getSetRentedIds() {
        axios.get('/tables/rentals')
            .then(res => {
                const rids = res.data.result.map(r => r.rid);
                this.setState({rentedVehicleIDs: rids});
                this.props.logQuery(res.data.query);
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const {query, error_message} = err.response.data;
                    if (query && error_message) {
                        this.props.logQuery(query, error_message);
                        this.setState({rentedVehicleIDs: []});
                        return;
                    }
                }
                console.log(err);
            });
    }

    goBack() {
        const {submission} = this.state;
        this.setState({submission: null}, () => {
            this.setup();
        })
    }

    onSubmit() {
        const newSubmission = {
            rentalID: parseInt(this.state.rid),
            returnOdometer: parseInt(this.state.odometer),
            returnDateTime: window.$('#untilDateTimePicker').data('date'),
            tankFull: this.state.tankFull === "true",
        };
        this.setState({submission: newSubmission});
        axios.post('/clerk-actions/return-vehicle', newSubmission)
            .then(res => {
                this.props.logQuery(res.data.query);
                this.setState({
                  errors: {},
                  result: res.data.result,
                });
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const {
                      query,
                      error_message,
                      input_errors
                    } = err.response.data;
                    if (query) {
                      if (error_message) {
                        this.props.logQuery(query, error_message);
                      } else {
                        this.props.logQuery(query);
                      }
                    }
                    if (input_errors) {
                      this.setState({
                        submission: null,
                        errors: input_errors,
                      }, () => {
                        window.$('#untilDateTimePicker').datetimepicker({
                            useCurrent: false,
                            format: 'MM/DD/YYYY HH:mm',
                            minDate: 'now',
                            date: newSubmission.returnDateTime,
                        });
                      });
                    }
                    return;
                }
                console.log(err);
            });
    }

    handleRIDChange(event) {
        this.setState({rid: event.target.value})
    }

    handleOdometerChange(event) {
        this.setState({odometer: event.target.value})
    }

    handleTankFullChange(event) {
        this.setState({tankFull: event.target.value})
    }

    render() {
        const {submission, rentedVehicleIDs, result, errors} = this.state;
        let html;
        if (!submission) {
            const {rid, odometer, tankFull} = this.state;
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 style={{textAlign: 'center', marginBottom: '28px'}}>
                        Return a Vehicle
                    </h3>

                    <div className="form-group">
                        <label htmlFor="rid">Rental ID</label>
                        <input
                          placeholder="Rental ID"
                          type="int"
                          className={`form-control ${errors.rid ? 'is-invalid' : ''}`}
                          value={rid}
                          onChange={this.handleRIDChange}
                          id="rid"
                        />
                        {errors.rid && (
                          <div className="invalid-feedback">
                            {errors.rid}
                          </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="odometer">Return Odometer</label>
                        <input
                          placeholder="Return Odometer"
                          type="text"
                          className={`form-control ${errors.odometer ? 'is-invalid' : ''}`}
                          value={odometer}
                          onChange={this.handleOdometerChange}
                          id="odometer"
                        />
                        {errors.odometer && (
                          <div className="invalid-feedback">
                            {errors.odometer}
                          </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="tankFull">Tank Full?</label>
                        <select
                          className="form-control"
                          id="tankFull"
                          value={tankFull}
                          onChange={this.handleTankFullChange}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="untilDateTimePicker">Return Time</label>
                        <input
                          placeholder="Return Date and Time"
                          type="text"
                          className={`form-control datetimepicker-input ${errors.dateTime ? 'is-invalid' : ''}`}
                          id="untilDateTimePicker"
                          data-toggle="datetimepicker"
                          data-target="#untilDateTimePicker"
                          autoComplete="off"
                        />
                        {errors.dateTime && (
                          <div className="invalid-feedback">
                            {errors.dateTime}
                          </div>
                        )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.onSubmit}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        marginBottom: '25px',
                      }}
                    >
                      Submit
                    </button>
                </div>
            );
        } else if (result) {
            let insuranceCost = '$' + result.insuranceCost.toFixed(2).toString();
            let vehicleCost = '$' + result.vehicleCost.toFixed(2).toString();
            let totalCost = '$' + result.totalCost.toFixed(2).toString();
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 className="pb-2" style={{marginTop: '30px',}}>Rental Reciept: </h3>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Rental ID:</span>
                        <span>{result.rid}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Confirmation Number:</span>
                        <span>{result.confNo}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Insurance Cost:</span>
                        <span>{insuranceCost}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Vehicle Cost:</span>
                        <span>{vehicleCost}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Total Cost:</span>
                        <span>{totalCost}</span>
                    </div>
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

ReturnVehicle.propTypes = {
    logQuery: PropTypes.func.isRequired,
}

export default ReturnVehicle;

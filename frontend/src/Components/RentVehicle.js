import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class RentVehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locOptions: [],
            typeOptions: [],
            vidOptions: [],
            cellNumber: null,
            customerName: null,
            customerAddress: null,
            driversLicense: null,
            location: null,
            vehicleType: null,
            submission: null,
            result: null,
            errors: {},
        };
        this.setup = this.setup.bind(this);
        this.getSetLocOptions = this.getSetLocOptions.bind(this);
        this.getSetTypeOptions = this.getSetTypeOptions.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.handleVehicleTypeChange = this.handleVehicleTypeChange.bind(this);
        this.handleCellNumberChange = this.handleCellNumberChange.bind(this);
        this.handleConfNumberChange = this.handleConfNumberChange.bind(this);
        this.handleCustomerNameChange = this.handleCustomerNameChange.bind(this);
        this.handleCustomerAddressChange = this.handleCustomerAddressChange.bind(this);
        this.handleDriversLicenseChange = this.handleDriversLicenseChange.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.setup();
    }

    setup() {
        this.getSetLocOptions();
        this.getSetTypeOptions();
        window.$('#fromDatePicker').datetimepicker({
            useCurrent: false,
            format: 'MM/DD/YYYY HH:mm',
        });
        window.$('#toDatePicker').datetimepicker({
            useCurrent: false,
            format: 'MM/DD/YYYY HH:mm',
        });
    }

    getSetLocOptions() {
        axios.get('/tables/branches')
            .then(res => {
                const locations = res.data.result.map(r => r.location);
                this.setState({locOptions: locations});
                this.props.logQuery(res.data.query);
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const {query, error_message} = err.response.data;
                    if (query && error_message) {
                        this.props.logQuery(query, error_message);
                        this.setState({typeOptions: []});
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
                this.setState({typeOptions: types});
                this.props.logQuery(res.data.query);
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const {query, error_message} = err.response.data;
                    if (query && error_message) {
                        this.props.logQuery(query, error_message);
                        this.setState({typeOptions: []});
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
            confNumber: this.state.confNumber,
            cellNumber: this.state.cellNumber,
            customerName: this.state.customerName,
            customerAddress: this.state.customerAddress,
            driversLicense: this.state.driversLicense,
            location: this.state.location,
            vehicleType: this.state.vehicleType,
            fromDateTime: window.$('#fromDatePicker').data('date'),
            toDateTime: window.$('#toDatePicker').data('date'),
        };
        this.setState({submission: newSubmission});
        axios.post('/clerk-actions/rent-vehicle', newSubmission)
            .then(res => {
                this.props.logQuery(res.data.query);
                this.setState({result: res.data.result});
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const {query, error_message} = err.response.data;
                    if (query && error_message) {
                        this.props.logQuery(query, error_message);
                        // TODO
                        return;
                    }
                }
                console.log(err);
            });
    }

    handleLocationChange(event) {
        this.setState({location: event.target.value});
    }

    handleVehicleTypeChange(event) {
        this.setState({vehicleType: event.target.value});
    }

    handleConfNumberChange(event) {
        this.setState({confNumber: event.target.value})
    }

    handleCellNumberChange(event) {
        this.setState({cellNumber: event.target.value})
    }

    handleCustomerNameChange(event) {
        this.setState({customerName: event.target.value})
    }

    handleCustomerAddressChange(event) {
        this.setState({customerAddress: event.target.value})
    }

    handleDriversLicenseChange(event) {
        this.setState({driversLicense: event.target.value})
    }

    render() {
        const {submission, result, errors} = this.state;
        let html;
        if (!submission) {
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 style={{textAlign: 'center', marginBottom: '28px'}}>
                        Rent a Vehicle
                    </h3>

                    <div className="form-group">
                        <label htmlFor="confNo">Confirmation Number</label>
                        <input
                            placeholder="Reservation Confirmation Number"
                            type="text"
                            className={`form-control ${errors.confNo ? 'is-invalid' : ''}`}
                            onChange={this.handleConfNumberChange}
                            id="confNo"
                        />
                        {errors.confNo && (
                            <div className="invalid-feedback">
                                {errors.confNo}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cellNumber">Cell Number</label>
                        <input
                            placeholder="Customer Cellphone Number"
                            type="text"
                            className={`form-control ${errors.cellNumber ? 'is-invalid' : ''}`}
                            onChange={this.handleCellNumberChange}
                            id="cellNumber"
                        />
                        {errors.cellNumber && (
                            <div className="invalid-feedback">
                                {errors.cellNumber}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            placeholder="Customer Name"
                            type="text"
                            className={`form-control ${errors.customerName ? 'is-invalid' : ''}`}
                            onChange={this.handleCustomerNameChange}
                            id="customerName"
                        />
                        {errors.customerName && (
                            <div className="invalid-feedback">
                                {errors.customerName}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="customerAddress">Address</label>
                        <input
                            placeholder="Customer Address"
                            type="text"
                            className={`form-control ${errors.customerAddress ? 'is-invalid' : ''}`}
                            onChange={this.handleCustomerAddressChange}
                            id="customerAddress"
                        />
                        {errors.customerAddress && (
                            <div className="invalid-feedback">
                                {errors.customerAddress}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dlicense">Drivers License</label>
                        <input
                            placeholder="Customer Drivers License"
                            type="text"
                            className={`form-control ${errors.dlicense ? 'is-invalid' : ''}`}
                            onChange={this.handleDriversLicenseChange}
                            id="dlicense"
                        />
                        {errors.dlicense && (
                            <div className="invalid-feedback">
                                {errors.dlicense}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="locSelect">Location</label>
                        <select value={this.state.location} onChange={this.handleLocationChange}
                                className="form-control" id="locSelect">
                            {this.state.locOptions.map((loc, i) => (
                                <option key={i} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="typeSelect">Type</label>
                        <select value={this.state.vehicleType} onChange={this.handleVehicleTypeChange}
                                className="form-control" id="typeSelect">
                            <option value="any">Any</option>
                            <option disabled>─────────────────────────</option>
                            {this.state.typeOptions.map((type, i) => (
                                <option key={i} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fromDatePicker">Rental Date</label>
                        <input placeholder={"Rental Date"} type="text"
                               className="form-control datetimepicker-input" id="fromDatePicker"
                               data-toggle="datetimepicker" data-target="#fromDatePicker" autoComplete="off"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="toDatePicker">Return Date</label>
                        <input placeholder={"Return Date"} type="text"
                               className="form-control datetimepicker-input" id="toDatePicker"
                               data-toggle="datetimepicker" data-target="#toDatePicker" autoComplete="off"/>
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
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 className="pb-2" style={{marginTop: '30px',}}>Rental Details: </h3>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Rental ID:</span>
                        <span>{result.customerName}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Rental ID:</span>
                        <span>{result.customerNumber}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Rental ID:</span>
                        <span>{result.rid}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Insurance Cost:</span>
                        <span>{result.vid}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Insurance Cost:</span>
                        <span>{result.vehicleType}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Vehicle Cost:</span>
                        <span>{result.rentalDate}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Total Cost:</span>
                        <span>{result.location}</span>
                    </div>
                    <div style={{padding: '20px',}}>
                        <span style={{paddingRight: '10px', fontWeight: 'bold'}}>Total Cost:</span>
                        <span>{result.duration}</span>
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

RentVehicle.propTypes = {
    logQuery: PropTypes.func.isRequired,
}

export default RentVehicle;

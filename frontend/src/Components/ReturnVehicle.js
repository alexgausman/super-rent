import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class ReturnVehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rid: null,
            odometer: null,
            tankFull: null,
            rentedVehicleIDs: [],
            submission: null,
            result: null,
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
            odometer: parseInt(this.state.odometer),
            toDateTime: window.$('#untilDateTimePicker').data('date'),
            tankFull: this.state.tankFull === "true",
        };
        this.setState({submission: newSubmission});
        axios.post('/clerk-actions/return-vehicle', newSubmission)
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
        const {submission, rentedVehicleIDs, result} = this.state;
        let html;
        if (!submission) {
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 style={{textAlign: 'center', marginBottom: '28px'}}>
                        Return a Vehicle
                    </h3>

                    <div className="form-group">
                        <label htmlFor="rid">Rental ID</label>
                        <input placeholder={"Rental ID"} type="int" className="form-control"
                               onChange={this.handleRIDChange} id="rid"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="odometer">Return Odometer</label>
                        <input placeholder={"Return Odometer"} type="text" className="form-control"
                               onChange={this.handleOdometerChange} id="odometer"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tankFull">Tank Full?</label>
                        <select className="form-control" id="tankFull" onChange={this.handleTankFullChange}>
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="untilDateTimePicker">Return Time</label>
                        <input placeholder={"Return Date and Time"} type="text"
                               className="form-control datetimepicker-input" id="untilDateTimePicker"
                               data-toggle="datetimepicker" data-target="#untilDateTimePicker" autoComplete="off"/>
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
                    <h3 className="pb-2" style={{marginTop: '30px',}}>Rental Reciept: </h3>
                    <div>
                        <span>Rental ID:</span>
                        <span>{result.rid}</span>
                    </div>
                    <div>
                        <span>Confirmation Number:</span>
                        <span>{result.confNo}</span>
                    </div>
                    <div>
                        <span>Insurance Cost:</span>
                        <span>{result.insuranceCost}</span>
                    </div>
                    <div>
                        <span>Vehicle Cost:</span>
                        <span>{result.vehicleCost}</span>
                    </div>
                    <div>
                        <span>Total Cost:</span>
                        <span>{result.totalCost}</span>
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

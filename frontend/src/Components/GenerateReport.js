import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class GenerateReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportType: null,
            locOptions: [],
            location: 'all',
            submission: null,
            result: null,
        };
        this.setup = this.setup.bind(this);
        this.getSetLocOptions = this.getSetLocOptions.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.handleReportTypeSelection = this.handleReportTypeSelection.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.shouldShowLocationSelection = false;
    }

    componentDidMount() {
        this.setup();
    }

    setup() {
        this.getSetLocOptions();
        window.$('#reportDatePicker').datetimepicker({
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

    goBack() {
        const {submission} = this.state;
        this.setState({submission: null}, () => {
            this.setup();
        })
    }

    onSubmit() {
        const newSubmission = {
            reportType: this.state.reportType,
            location: this.state.location,
            toDateTime: window.$('#reportDatePicker').data('date'),
        };
        this.setState({submission: newSubmission});
        axios.post('/clerk-actions/generate-report', newSubmission)
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
        this.setState({location: event.target.value})
    }

    handleReportTypeSelection(event) {
        if (event.target.value === 'daily-rentals') {
            this.state.location = 'all';
            this.shouldShowLocationSelection = false;
        } else if (event.target.value === 'daily-rentals-branch') {
            this.shouldShowLocationSelection = true;
        } else if (event.target.value === 'daily-returns') {
            this.state.location = 'all';
            this.shouldShowLocationSelection = false;
        } else if (event.target.value === 'daily-returns-branch') {
            this.shouldShowLocationSelection = true;
        }
        this.setState({reportType: event.target.value})
    }

    render() {
        const {submission, result} = this.state;
        let html;
        if (!submission) {
            html = (
                <div style={{
                    width: '450px',
                }}>
                    <h3 style={{textAlign: 'center', marginBottom: '28px'}}>
                        Generate Daily Report
                    </h3>

                    <div className="form-group" style={{display: 'flex', flexDirection: 'column'}}
                         onChange={this.handleReportTypeSelection}>
                        <label htmlFor="refortTypeSelect">Report Type:</label>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <input style={{marginRight: '10px'}} type="radio" name="reportType" value="daily-rentals"/>Daily
                            Rentals
                        </div>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <input style={{marginRight: '10px'}} type="radio" name="reportType"
                                   value="daily-rentals-branch"/>Daily Rentals By Branch
                        </div>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <input style={{marginRight: '10px'}} type="radio" name="reportType" value="daily-returns"/>Daily
                            Returns
                        </div>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <input style={{marginRight: '10px'}} type="radio" name="reportType"
                                   value="daily-returns-branch"/>Daily Returns By Branch
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="locSelect">Location</label>
                        <select value={this.state.location} disabled={this.shouldShowLocationSelection === false} onChange={this.handleLocationChange} className="form-control" id="locSelect">
                            <option value="all">All</option>
                            <option disabled>─────────────────────────</option>
                            {this.state.locOptions.map((loc, i) => (
                                <option key={i} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="untilDateTimePicker">Report Date</label>
                        <input placeholder={"Report Date"} type="text"
                               className="form-control datetimepicker-input" id="reportDatePicker"
                               data-toggle="datetimepicker" data-target="#reportDatePicker" autoComplete="off"/>
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
                <div style={{width: '100%'}}>
                    Hello
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

GenerateReport.propTypes = {
    logQuery: PropTypes.func.isRequired,
}

export default GenerateReport;

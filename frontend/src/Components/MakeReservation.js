import React, { Component } from 'react';
import { Button, Select, Input, Form, DatePicker, AutoComplete, Card } from 'antd';
import moment from 'moment'
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import axios from 'axios';

const { Option } = Select;

class MakeReservation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locOptions: [],
            typeOptions: [],
            custOptions: [],
            phoneData: [],
            vehicleUnavailable: true,
            submitted: false,
            result: null,
        };
        this.getSetCustomers = this.getSetCustomers.bind(this);
        this.getSetlocOptions = this.getSetlocOptions.bind(this);
        this.getSetTypeOptions = this.getSetTypeOptions.bind(this);
        this.refresh = this.refresh.bind(this);
        this.notReady = [true, true];
    }

    componentDidMount() {
        this.getSetlocOptions();
        this.getSetTypeOptions();
        this.getSetCustomers();
    }

    getSetCustomers() {
        axios.get('/tables/customers')
            .then(res => {
                let customers = res.data.result;
                this.setState({
                    custOptions: customers,
                    phoneData: customers.map(cust => cust.cellphone)
                });
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

    getSetlocOptions() {
        axios.get('/tables/branches')
            .then(res => {
                const locs = res.data.result.map(loc => loc.location);
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

    handleSearch = (value) => {
        this.setState({
            phoneData: !value ?
                this.state.custOptions.map(cust => cust.cellphone) :
                this.state.phoneData.filter(lic => lic.includes(value))
        });
    }

    handleChange = (value) => {
        const tempCustomer = this.state.custOptions.find(cust => cust.cellphone === value);
        if (!!tempCustomer) {
            this.props.form.setFieldsValue({
                phone: tempCustomer.cellphone,
                name: tempCustomer.name,
                license: tempCustomer.dlicense,
                address: tempCustomer.address
            });
        } else {
            this.props.form.setFieldsValue({
                phone: value,
                name: "",
                license: "",
                address: ""
            });
        }
    }

    handleSelect = (value) => {
        const tempCustomer = this.state.custOptions.find(cust => cust.cellphone === value);
        this.props.form.setFieldsValue({
            phone: tempCustomer.cellphone,
            name: tempCustomer.name,
            license: tempCustomer.dlicense,
            address: tempCustomer.address
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log(err);
            }
            const unavailable = this.vehicleUnavailable(values);
            if (unavailable) {
                // TODO show error of unavailability
                console.log("Not Available");
            } else {
                const existingCustomer = this.state.custOptions.map(cust => cust.cellphone).includes(values.phone);
                if (!existingCustomer) {
                    this.addCustomer(values);
                }
                console.log('Received values of form: ', values);
                this.addReservation(values).then(res => {
                    const newConfno = res;
                    console.log(newConfno);
                    // TODO display confno ???
                    if (!!newConfno) {
                        this.setState({
                            submitted: true,
                            result: {
                                name: values.name,
                                phone: values.phone,
                                address: values.address,
                                license: values.license,
                                location: values.location,
                                confno: newConfno,
                                vtype: values.type,
                                toDate: values.until.format("MM/DD/YYYY HH:SS"),
                                fromDate: values.from.format("MM/DD/YYYY HH:SS")
                            }
                        });
                    }
                }); // TODO finsih implementing
            }
        });
    }

    addCustomer = (values) => {
        const newCustomer = {
            cellphone: values.phone,
            name: values.name,
            dlicense: values.license,
            address: values.address
        }
        axios.post('/tables/customers', newCustomer)
            .then(res => {
                this.props.logQuery(res.data.query);
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const { query, error_message } = err.response.data;
                    if (query && error_message) {
                        this.props.logQuery(query, error_message);
                        return;
                    }
                }
                console.log(err);
            });
    }

    addReservation = (values) => {
        return new Promise((resolve, reject) => {
            const fromDate = values.from.format("L");
            const fromTime = values.from.format("HH:MM");
            const untilDate = values.until.format("L");
            const untilTime = values.until.format("HH:MM");
            let confPromise = this.getConfno();
            let cityPromise = this.getCity(values.location);
            Promise.all([confPromise, cityPromise]).then(pRes => {
                const newReserv = {
                    confno: pRes[0],
                    vtname: values.type,
                    cellphone: values.phone,
                    fromdate: fromDate,
                    fromtime: fromTime,
                    todate: untilDate,
                    totime: untilTime
                }
                console.log("new res: ", newReserv);
                axios.post('/tables/reservations', newReserv)
                    .then(res => {
                        this.props.logQuery(res.data.query);
                        resolve(pRes[0]);
                    })
                    .catch(err => {
                        if (err.response && err.response.data) {
                            const { query, error_message } = err.response.data;
                            if (query && error_message) {
                                this.props.logQuery(query, error_message);
                                return;
                            }
                        }
                        console.log(err);
                        reject(err);
                    });
            })
        });
    }

    refresh() {
        this.props.form.resetFields();
    }

    vehicleUnavailable = (values) => {
        axios.get('/tables/vehicles')
            .then(res => {
                const types = res.data.result.find(v =>
                    v.location === values.location && v.vtname === values.type && v.status === "for_rent");
                this.props.logQuery(res.data.query);
                return !types;
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

    getConfno = () => {
        return new Promise((resolve, reject) => {
            axios.get('/tables/reservations')
                .then(res => {
                    let confno = 0;
                    res.data.result.forEach(r => {
                        if (confno <= r.confno) {
                            confno = r.confno + 1;
                        }
                    });
                    console.log("confno 1: ", confno);
                    this.props.logQuery(res.data.query);
                    resolve(confno);
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
                    reject(err);
                    console.log(err);
                });
        });
    }

    getCity = (location) => {
        return new Promise((resolve, reject) => {
            axios.get('/tables/branches')
                .then(res => {
                    let city = "";
                    res.data.result.every(b => {
                        if (location === b.location) {
                            city = b.city;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    this.notReady[1] = true;
                    this.props.logQuery(res.data.query);
                    resolve(city);
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
                    reject(err);
                });
        })
    }

    makeAnotherReserv = () => {
        this.setState({ submitted: false });
        this.props.form.resetFields();
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            align: "center"
        };
        const localOptions = this.state.locOptions.map(loc => <Option key={loc}>{loc}</Option>);
        const vehTypeOptions = this.state.typeOptions.map(vt => <Option key={vt}>{vt}</Option>);

        let html = (
            <div style={{
                width: '450px',
            }}>
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <h3 style={{ textAlign: 'center', marginBottom: '28px' }}>
                        Make a Reservation
                    </h3>

                    <Form.Item label="Location">
                        {getFieldDecorator('location', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input location"
                                }
                            ]
                        })(<Select style={{ width: 450, marginBottom: '14px' }}>
                            {localOptions}
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="Type">
                        {getFieldDecorator('type', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input vehicle type"
                                }
                            ]
                        })(<Select style={{ width: 450, marginBottom: '14px' }}>
                            {vehTypeOptions}
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="From">
                        {getFieldDecorator('from', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please pick a from date and time"
                                }
                            ]
                        })(<DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }} />)}
                    </Form.Item>
                    <Form.Item label="Until">
                        {getFieldDecorator('until', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input an until date and time"
                                }
                            ]
                        })(<DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }} />)}
                    </Form.Item>

                    <h3 style={{ textAlign: 'center', marginBottom: '28px' }}>
                        Customer
                    </h3>
                    <Form.Item label="Cell Phone">
                        {getFieldDecorator('phone', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input customer cellphone number"
                                }
                            ]
                        })(<AutoComplete
                            dataSource={this.state.phoneData}
                            onChange={this.handleChange}
                            onSelect={this.handleSelect}
                            onSearch={this.handleSearch}
                        />)}
                    </Form.Item>
                    <Form.Item label="Name">
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input a name"
                                }
                            ]
                        })(<Input style={{ width: 450, marginBottom: '14px' }} />)}
                    </Form.Item>
                    <Form.Item label="License">
                        {getFieldDecorator('license', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input a license number"
                                }
                            ]
                        })(<Input style={{ width: 450, marginBottom: '14px' }} />)}
                    </Form.Item>
                    <Form.Item label="Address">
                        {getFieldDecorator('address', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input an address"
                                }
                            ]
                        })(<Input style={{ width: 450, marginBottom: '14px' }} />)}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" style={{ width: 450, marginBottom: '14px' }} htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>

            </div>
        );

        if (this.state.submitted) {
            html = (
                <div style={{ background: '#ECECEC', padding: '30px', width: '550px' }}>
                    <Card title="Reservation" bordered={false} style={{ width: 500 }}>
                        <p>This reservation is for:</p>
                        <p>Name: {this.state.result.name}</p>
                        <p>Cell phone: {this.state.result.phone}</p>
                        <p>Driver's License: {this.state.result.license}</p>
                        <p>Address: {this.state.result.address}</p>
                        <p>Your confirmation number is: {this.state.result.confno}</p>
                        <p>You rented a {this.state.result.vtype} vehicle from our {this.state.result.location} location.</p>
                        <p>Your rental goes from {this.state.result.fromDate} until {this.state.result.toDate}</p>
                    </Card>
                    <Button type="primary" onClick={this.makeAnotherReserv}>Make new Reservation</Button>
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

const MakeReservationForm = Form.create({ name: 'reservation' })(MakeReservation);

MakeReservation.propTypes = {
    logQuery: PropTypes.func.isRequired,
}

export default MakeReservationForm;
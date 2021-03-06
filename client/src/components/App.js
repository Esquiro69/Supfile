import React, { Component, Fragment } from 'react';
import { Route, withRouter, Switch, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Actions
import * as Actions from '../actions/';

import HelpPage     from './Common/Help';
import AboutPage    from './Common/About';
import ContactPage  from './Common/Contact';
import IntroPage    from './IntroPage';

import LoginPage    from './Auth/LoginPage';
import RegisterPage from './Auth/RegisterPage';

import StoragePage  from './StoragePage';
import HomePage     from './HomePage';
import ProfilPage   from './Profil/Profil';

//Containers
import Header       from '../containers/Header'
//Css
import './App.css';
import { AUTH_TOKEN } from '../constants';
import Loader from '../containers/Loader';  


//mapXToProps
function mapStateToProps(store) {
    return {
        storages: store.storages,
        auth: store.auth,
        router: store.router
    };
}

function mapDispatchToProps(dispatch){
    return {
        actions : bindActionCreators(Actions, dispatch)
    }
}

/**
 * Principal component of the application
 * 
 * @class App
 * @extends {Component}
 */
class App extends Component {

    constructor(props) {
        super(props)
        if(props.auth.user === null && window.localStorage.getItem(AUTH_TOKEN)){
            props.actions.validateToken()
        } 
    }
    /**
     * Load all of the data of the connected user
     * 
     * @param {String} token 
     * @memberof App
     */
    getDataOfConnectedUser(token){
        if(this.props.storages.length === 0){
            this.props.actions.fetchAllStorages(token);
        }
    }

    /**
     * If there are some errors during the transition show a toast
     */
    componentWillMount(){
        if(this.props.location.state && this.props.location.state.errors){
            this.props.location.state.errors.forEach(error => this.notify(error))
            this.props.history.replace({state: null})

        }
    }

    /**
     * Allow to show a toast with react-toastify
     * @param {status: Number, message: String} responseJson The array of json reponse to create the toast
     */
    notify(responseJson) {
        console.log(responseJson)
        if (responseJson.status === 200){
            toast.success(responseJson.message, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }else{
            toast.error(responseJson.message, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
    };
    
    /**
     * Render the component
     * 
     * @returns 
     * @memberof App
     */
    render() {
        return (
            <Fragment>
                <Header history={this.props.history}/>
                <ToastContainer autoClose={3000} />
                {window.localStorage.getItem(AUTH_TOKEN) ? this.getUserRoute() : this.getGuestRoute()}
            </Fragment>
        );
    }
    
    /**
     * Return the Switch element with all routes for connected users
     * And load the data of the user
     * 
     * @returns JSX Element The switch element
     * @memberof App
     */
    getUserRoute(){
        this.getDataOfConnectedUser(window.localStorage.getItem(AUTH_TOKEN));
        return(
            <Switch>

                <Route exact path="/" component={HomePage} />
                <Route exact path="/profile" component={ProfilPage} />
                <Route path="/storages" component={StoragePage} />
                <Route path="/folders/:id" location={this.props.router.location} component={StoragePage} />
                {this.getCommonRoutes()}

                <Route component={HomePage}/>

            </Switch>
        )
    }
    
    /**
     * Return the Switch element with all routes for Guest users
     * 
     * @returns JSX Element The Switch element
     * @memberof App
     */
    getGuestRoute(){
        return(
            <Switch>
                <Route exact path="/" component={IntroPage} />

                {this.getCommonRoutes()}

                <Route render={() =>
                    <Redirect to={{pathname: "/", state: { from: this.props.location }}} /> 
                } />

            </Switch>
        )
    }

    /**
     * Commons routes of users
     * 
     * @memberof App
     */
    getCommonRoutes(){
        return (
            <Switch>
                <Route path="/about" component={AboutPage} />
                <Route path="/help" component={HelpPage} />
                <Route path="/contact" render={props => <ContactPage contactAction={this.props.actions.contactAction} />} />
                <Route path="/loading" component={Loader} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
            </Switch>
        )
        
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
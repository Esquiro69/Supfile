import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from "react-router-dom"
import Dropzone from 'react-dropzone';
import { Redirect, Link } from 'react-router-dom'
import { push } from 'react-router-redux';

//Toast
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Containers
import Loader from '../containers/Loader'
import FileCard from '../containers/FileCard'
import StorageCard from '../containers/StorageCard'

//Actions
import * as Actions from '../actions'
//Constants
import { AUTH_TOKEN } from '../constants';
import FileList from './FileList';

/**
 * The component where we display the dropzone
 * 
 * @class StoragePage
 * @extends {Component}
 */
class StoragePage extends React.PureComponent {

    /**
     * Creates an instance of StoragePage.
     * @param {any} props 
     * @memberof StoragePage
     */
    constructor(props){
        super(props);
        if(!window.localStorage.getItem(AUTH_TOKEN)){
            props.history.push('/');
            return;
        }
        this.dropzoneRef = React.createRef();
        this.state = {
            dropzoneActive: false,
            storage: null
        }
    }

    componentWillMount() {
        if (this.props.files) {
            this.props.files.forEach((file, index) => {
                if(file.isLoading && !file.toastId){
                    file.toastId = toast.info(file.name + " is Uploading...", {
                        position: "bottom-right",
                        autoClose: false,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                }else if (!file.isLoading && file.toastId) {
                    toast.dismiss(file.toastId)
                    if(file.error) {
                        toast.error("Une erreur est survenue lors de l'upload de " + file.name, {
                            position: "bottom-right",
                            closeOnClick: true,
                            pauseOnHover: true,
                            autoClose: 5000
                        })
                    } else {
                        toast.success("Upload terminé de " + file.name, {
                            position: "bottom-right",
                            closeOnClick: true,
                            pauseOnHover: true,
                            autoClose: 5000
                        })
                    }
                    this.props.files.splice(index, 1);
                }
            })
        }
    }

    /**
     * Retourne la page du dossier ciblé sinon retourne sur la page d'accueil et affiche une notification en bas à droite annonçant que le dossier n'a pas été trouvé
     * 
     * @returns 
     * @memberof StoragePage
     */
    render() {
        
        if(this.props.storages.isFetching === true || !this.props.storages.storages) {
            return(<Loader />)
        }
        
        this.storage = this.props.match.params.id ? this.getFolder(this.props.match.params.id) : this.getRootFolder();

        if (!this.storage) {
            return (<Redirect
                to={{
                    pathname: "/",
                    state: { errors: [{status: 404, message: "Dossier non trouvé"}] }
                }}
            />)
        }

        const { dropzoneActive } = this.state;
        const overlayStyle = {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: '2.5em 0',
          background: 'rgba(0,0,0,0.5)',
          textAlign: 'center',
          color: '#fff'
        };
        return (
            <div className="container">
                <div className="row pb-3">
                    <button className="btn btn-primary btn-lg mr-5" type="button" onClick={e => this.props.history.goBack()}>Précedent</button>
                    <button className="btn btn-info mr-5" type="button" onClick={e => this.dropzoneRef.open() }>Ajouter un fichier</button>
                    <button className="btn btn-info mr-5" onClick={this.createFolder.bind(this)}>Ajouter un dossier</button>
                </div>
                <Dropzone
                    ref={node => this.dropzoneRef = node}
                    disableClick
                    style={{position: "relative"}}
                    onDrop={this.onDrop.bind(this)}
                    onDragEnter={this.onDragEnter.bind(this)}
                    onDragLeave={this.onDragLeave.bind(this)}
                >
                    { dropzoneActive && <div style={overlayStyle}>Déposez un fichier</div> }
                    {this.props.storages.storages && this.props.storages.storages.length !== 0 && (
                        this.getStorageList()
                    )}
                </Dropzone>
            </div>
        );
    }
    
    /**
     * Handle when a file is entering with drag and drop
     * 
     * @memberof StoragePage
     */
    onDragEnter() {
        this.setState({dropzoneActive: true});
    }

    /**
     * Handle when the drag and drop leave the dropzone
     * 
     * @memberof StoragePage
     */
    onDragLeave() {
        this.setState({dropzoneActive: false});
    }

    /**
     * Handle when files are dropped in the dropzone, upload each files.
     * 
     * @param {any} files 
     * @memberof StoragePage
     */
    onDrop(files) {
        files.forEach(file => {this.props.actions.uploadFile(file, this.storage.id)});
        this.setState({dropzoneActive: false});
    }

    /**
     * Get a folder in the store with the id specified
     * 
     * @param {Integer} idFolder 
     * @returns 
     * @memberof StoragePage
     */
    getFolder(idFolder){
        if(idFolder){
            return this.props.storages.storages.find(storage => storage.id === idFolder);
        }
        return null;
    }

    /**
     * Get All childs folders of the current folder and return the JSX Element of it
     * 
     * @param {Integer} idParent 
     * @returns 
     * @memberof StoragePage
     */
    getChildFolders() {
        const childs = this.props.storages.storages.filter(storage => storage.parent === this.props.match.params.id);
        if(!childs || childs.length === 0){
            return (<p>Aucun dossier créé</p>)
        }else{
            return(
                <div className="col-12">
                    <h3>Dossiers</h3>
                    <div className="row">
                        {childs.map((folder, index) => <StorageCard key={folder.id} folder={folder} />)}
                    </div>
                </div>
            )
        }
    }

    /**
     * Get The root folder of the user
     * 
     * @returns 
     * @memberof StoragePage
     */
    getRootFolder() {
        return this.props.storages.storages.find(storage => storage.parent === null)
    }

    /**
     * Return JSX Element of all files in the folder
     * 
     * @param {any} storage 
     * @returns 
     * @memberof StoragePage
     */
    getFiles(storage){
        if(!storage || !storage.files || storage.files.length === 0){
            return (<p>Aucun fichier dans ce dossier</p>)
        }
        return(
            <FileList storage={storage} />
        )
    }

    /**
     * Get folders and files inside the current folder if the current folder is not accessible Redirect to HomePage
     * 
     * @returns 
     * @memberof StoragePage
     */
    getStorageList(){
        return(
            <Fragment>
                <div className="col-xs-12">
                    <h1>{this.storage.name}</h1>
                </div>
                {this.getChildFolders()}
                {this.getFiles(this.storage)}
            </Fragment>
        )
    }

    /**
     * Create a folder and request the API to create it too.
     * 
     * @memberof StoragePage
     */
    createFolder(){
        const name = prompt("Entrez le nom du nouveau dossier", "Nouveau Dossier")
        if(name){
            this.props.actions.newFolder(name, this.storage.id)
        }
    }

}

function mapStateToProps(store) {
    return {
        storages: store.storages,
        files : store.files,
        router: store.router
    };
}

function mapDispatchToProps(dispatch){
    return {
        actions : bindActionCreators(Actions, dispatch),
        dispatch
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StoragePage));
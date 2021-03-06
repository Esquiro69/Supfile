import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

//Icons
import folderIcon from '../assets/folder.svg'
import folderSharedIcon from '../assets/folder-shared.svg'

//Context Menu
import { ContextMenu, Item, ContextMenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

//Actions
import {renameFolder, deleteFolder } from '../actions'

/**
 * Container Storage représentant un Dossier dans lequel on a
 * 
 * @class Storage
 * @extends {Component}
 */
class StorageCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            folderName: props.folder.name
        };
    }

    render() {
        const {folder} = this.props;
        return(
            <Fragment>
                <div id={folder.id} className="col-lg-3">
                    <ContextMenuProvider id={'MENU_' + folder.id} className="card border-primary mb-3" onClick={this.openFolder.bind(this)} component='div'>
                        <div className="card-body">
                            <h4 className="card-title">
                                <img alt="icon folder" src={folder.sharedLink ? (folderSharedIcon) : (folderIcon)} height='20' width='20' style={{display: 'inline-block', marginRight: '5px'}} />
                                <span id={'span_'+ folder.id}>{this.state.folderName}</span>
                                <input id={'input_' + folder.id} 
                                    style={{display: 'none', width: '80%', textAlign: 'left', overflow:"hidden"}} 
                                    onChange={e => this.setState({folderName: e.target.value})} 
                                    onBlur={this.handleChangeName.bind(this)} 
                                    value={this.state.folderName}
                                />
                            </h4>
                        </div>
                    </ContextMenuProvider>
                </div>

                <ContextMenu id={'MENU_' + this.props.folder.id}>
                    <Item onClick={this.handleRename.bind(this)}>Renommer</Item>
                    <Item onClick={this.handleDelete.bind(this)}>Supprimer</Item>
                </ContextMenu>

            </Fragment>
        )
    }
    
    /**
     * Handle when the user leave the input when renamming the folder.
     * Replace input with span and try to requets the API to update the folder
     * 
     * @memberof StorageCard
     */
    handleChangeName(){
        document.getElementById('span_'+this.props.folder.id).style.display = "inline"
        const input = document.getElementById('input_'+this.props.folder.id)
        input.style.display = "none"
        if(this.props.folder.name !== input.value){
            renameFolder(this.props.folder.id, input.value)
        }
    }

    /**
     * Replace the span for an input to change the name of the folder
     * 
     * @memberof StorageCard
     */
    handleRename(){
        document.getElementById('span_'+this.props.folder.id).style.display = "none"
        const input = document.getElementById('input_'+this.props.folder.id)
        input.style.display = "inline"
        input.focus()   
    }

    /**
     * Confirm deleting the folder and request the api to delete it
     * 
     * @param {Event} e 
     * @memberof StorageCard
     */
    handleDelete(e) {
        const confirme = window.confirm("Etes-vous sur de vouloir supprimer le dossier ?")
        if(confirme){
            document.getElementById(this.props.folder.id).remove()
            this.props.dispatch(deleteFolder(this.props.folder.id))
        }
    }

    /**
     * Redirect to the folder selected
     * 
     * @param {Number} id 
     * @memberof StorageCard
     */
    openFolder(){
        this.props.history.push('/folders/' + this.props.folder.id);
    }
}

function mapStateToProps (store) {
    return {
        storages: store.storages,
        router: store.router
    }
}

export default withRouter(connect()(StorageCard));

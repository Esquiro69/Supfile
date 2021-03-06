import React, { Component } from 'react';
import { connect } from 'react-redux';
import FileCard from '../containers/FileCard';

function mapStateToProps(state) {
    return {
    };
}

class FileList extends Component {

    constructor (props) {
        super(props);
        this.state = {
            type: '',
            storage: ''
        }
    }

    render() {
        const {storage} = this.props
        return (
            <div className="col-xs-12">
            <h3>Fichiers</h3>
            <div className="row">
                {storage.files.map((f,i) => (<FileCard key={f.id} file={f} toogleModal={this.toogleModal.bind(this)}/>))}
            </div>
            <div id="modal" className="modal fade">
            <div className="modal-dialog modal-lg" role="document" style={{maxWidth: '80%'}}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Prévisualiser</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                    {this.getPreviewObject()}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Fermer   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
    }

    toogleModal(file, type) {
        this.setState({
            file,
            type
        });
        var b = document.createElement('button')
        b.style.display = 'none';
        b.dataset.toggle = 'modal';
        b.dataset.target = '#modal';
        document.body.appendChild(b);
        b.click();
    }

    getPreviewObject() {
        if(this.state.file) {
            switch(this.state.type.split('/')[0]) {
                case 'video':
                    return(
                        <video controls>
                            <source src={this.state.file} type={this.state.type} />
                            Prévisualiser une vidéo
                        </video>
                    )
                case 'text':
                    return (
                        <iframe src={this.state.file} type={this.state.type} width='100%' height={window.screen.height / 1.5}/>
                    )
                default:
                    return (<embed width='100%' src={this.state.file} height={window.screen.height /1.5}/>)
            }
        }
        return
    }
}

export default connect(
    mapStateToProps,
)(FileList);
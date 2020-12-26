import React from 'react';

export default class Gallery extends React.Component {
    render() {
        return (
            <div id="gallery">

            </div>
        )
    }
}

class Image extends React.Component {
    constructor(url, name) {
        super(props);
        this.state = {
            url: url,
            name: name
        };
    }

    render() {
        return (
            <div id="image">
                <img src={this.url}/>
            </div>
        )
    }
}
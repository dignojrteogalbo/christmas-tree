const database = firebase.database();
const dbRef = database.ref('trees');

const storage = firebase.storage();
const storageRef = storage.ref();

import { importObjects } from '/index.js';

const warning = document.getElementById('warning');

class Data {
    constructor(name) {
        this.name = name;
    }
}

var pushData = function(input) {
    dbRef.push(JSON.parse(JSON.stringify(input)));
    return dbRef.once('value').then(snapshot => {
        console.log(snapshot.val());
    });
}

var uploadBinary = function(file, filename) {
    //CHECK IF FILE EXISTS
    storageRef.child(`${filename}.glb`).getDownloadURL().then(url => {
        warning.innerHTML = `File with that name already exists, try a different name!`;
    },
    //UPLOAD FILE ON REJECT
    err => {
        let fileRef = storageRef.child(`${filename}.glb`);
        fileRef.put(file).then(snapshot => {
            warning.innerHTML = 'File successfully uploaded!';
        });
    });
}

var downloadBinary = function(filename) {
    storageRef.child(filename).getDownloadURL().then(url => {
        importObjects(url);
    });
}

export { Data, pushData, uploadBinary, downloadBinary };
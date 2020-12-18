const database = firebase.database();
const dbRef = database.ref('trees');

const storage = firebase.storage();
const storageRef = storage.ref();

import { importObjects } from '/index.js';

class Data {
    constructor(name) {
        this.name = name;
    }
}

var pushData = function(input) {
    console.log(input);
    dbRef.push(JSON.parse(JSON.stringify(input)));
    return dbRef.once('value').then(snapshot => {
        console.log(snapshot.val());
    });
}

var uploadBinary = function(file, filename) {
    let fileRef = storageRef.child(`${filename}.glb`);
    fileRef.put(file).then(snapshot => {
        console.log('Uploaded blob or file!');
    });
}

var downloadBinary = function(filename) {
    storageRef.child(filename).getDownloadURL().then(url => {
        importObjects(url);
    });
}

export { Data, pushData, uploadBinary, downloadBinary };
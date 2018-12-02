const firebase = require('firebase'); 
exports.deleteAll = (async ()=>{
    const docs =await firebase.firestore().collection("Jobs").get(); 
    const Promises = []; 
    docs.forEach(doc => Promises.push(firebase.firestore().collection("Jobs").doc(doc.id).delete()));
    await Promise.all(Promises); 
    console.log("all docs are deleted successfully"); 
})
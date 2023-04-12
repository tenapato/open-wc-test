import { html, css, LitElement } from 'lit';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';


export class FetchTest extends LitElement {
  static get properties() {
    return {
      forms: { type: Object },
    };
  }

  constructor() {
    super();
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyBvoG1mig-pNdDwDujXxayL0A2K-zllW-4",
        authDomain: "metricos-synchro-test.firebaseapp.com",
        databaseURL: 'https://metricos-synchro-test-default-rtdb.firebaseio.com/', // Change for realtime database url
        projectId: "metricos-synchro-test",
        storageBucket: "metricos-synchro-test.appspot.com",
        messagingSenderId: "61664377867",
        appId: "1:61664377867:web:9db3144c2d5589d24f5b0e"
      };
    firebase.initializeApp(config);
    // Set initial value of forms property
    this.forms = {};
    this.sections = {};
    this.questions = {};
    
  }
  
  // This method is called when the "Fetch Forms" button is clicked
  async fetchForms() {
    try {
      // Reference to the "form" object in Firebase
      let folioId = 'NShZTyChKJrdHFNaqtF'
      const formsRef = firebase.database().ref('orgId/form')
      const sectionsRef = firebase.database().ref('orgId/form/sections').orderByChild(folioId);
      const questionsRef  = firebase.database().ref('orgId/form/questions').orderByChild(folioId);
      // Get the data from Firebase
      const snapshot = await formsRef.once('value');
      // Set the forms property to the retrieved data
      this.forms = snapshot.val();


      const questionsSnapshot = await questionsRef.once('value');
      this.questions = questionsSnapshot.val();
      

      const sectionsSnapshot = await sectionsRef.once('value');
      this.sections = sectionsSnapshot.val();


      console.log(this.sections);
      console.log(this.questions);

     // Save the forms to indexedDB
      const dbName = 'my-forms';
      const dbVersion = 1;
      const storeName = 'forms';
      const idb = window.indexedDB;
      const request = idb.open(dbName, dbVersion);

      request.onerror = (event) => {
        console.log('IndexedDB error:', event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        let data = {sections: this.sections, questions: this.questions}
        store.add(data, folioId);
        transaction.oncomplete = () => {
          console.log('Forms saved to IndexedDB.');
        };
      };

      // console.log(this.forms);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(storeName);
      };
      
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return html`
      <button @click="${this.fetchForms}">Fetch Forms</button>
      <pre>${JSON.stringify(this.forms, null, 2)}</pre>
    `;
  }
}

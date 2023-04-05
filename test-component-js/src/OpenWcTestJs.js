import { html, css, LitElement } from 'lit';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// let firebaseDb = null;


export class OpenWcTestJs extends LitElement {
  static get properties() {
    return {
      question1: { type: String },
      question2: { type: String },
      answer1: { type: String },
      answer2: { type: String },
      databaseName: { type: String },
      objectStoreName: { type: String },
    };
  }

  constructor() {
    super();
    this.question1 = 'What is your name?';
    this.question2 = 'What is your email address?';
    this.answer1 = '';
    this.answer2 = '';
    this.databaseName = 'my-database';
    this.objectStoreName = 'answers';
    this.__handleSubmit = this.__handleSubmit.bind(this);
    this.__handleAnswer1Change = this.__handleAnswer1Change.bind(this);
    this.__handleAnswer2Change = this.__handleAnswer2Change.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.__openDatabase();
  }

  __openDatabase() {
    const request = indexedDB.open(this.databaseName);
    request.onerror = (event) => {
      console.error('Failed to open database', event);
    };
    request.onsuccess = (event) => {
      this.db = event.target.result;

      // Initialize Firebase and store a reference to the Realtime Database
      const firebaseConfig = {
        apiKey: "AIzaSyBvoG1mig-pNdDwDujXxayL0A2K-zllW-4",
        authDomain: "metricos-synchro-test.firebaseapp.com",
        databaseURL: 'https://metricos-synchro-test-default-rtdb.firebaseio.com/', // Change for realtime database url
        projectId: "metricos-synchro-test",
        storageBucket: "metricos-synchro-test.appspot.com",
        messagingSenderId: "61664377867",
        appId: "1:61664377867:web:9db3144c2d5589d24f5b0e"
      };
      
      firebase.initializeApp(firebaseConfig);
      this.firebaseDb = firebase.database();
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore(this.objectStoreName, { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('answer1', 'answer1', { unique: false });
      objectStore.createIndex('answer2', 'answer2', { unique: false });
    };
  }

  __saveToIndexedDB() {
  const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
  const objectStore = transaction.objectStore(this.objectStoreName);
  const data = { answer1: this.answer1, answer2: this.answer2 };
  const request = objectStore.add(data);
  request.onerror = (event) => {
    console.error('Failed to store data', event);
  };
  request.onsuccess = (event) => {
    console.log('Data stored successfully');
  };
  const message = `Name: ${this.answer1}\nEmail: ${this.answer2}`;
  window.alert(message);
}

__uploadToFirebase() {
  const objectStore = this.db.transaction(this.objectStoreName, 'readwrite').objectStore(this.objectStoreName);
  objectStore.getAll().onsuccess = (event) => {
    const answers = event.target.result;
    const databaseRef = firebase.database().ref('answers');
    answers.forEach((answer) => {
      databaseRef.push(answer);
      objectStore.delete(answer.id);
    });
    window.alert('Data uploaded to Firebase successfully and deleted from IndexedDB');
  };
}

  __handleSubmit(event) {
    event.preventDefault();
    const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const data = { answer1: this.answer1, answer2: this.answer2 };
    const request = objectStore.add(data);
    request.onerror = (event) => {
      console.error('Failed to store data', event);
    };
    request.onsuccess = (event) => {
      console.log('Data stored successfully');
      this.__uploadToFirebase(); // Call the __uploadToFirebase() method after storing the data
    };
    const message = `Name: ${this.answer1}\nEmail: ${this.answer2}`;
    window.alert(message);
  }

  __handleAnswer1Change(event) {
    this.answer1 = event.target.value;
  }

  __handleAnswer2Change(event) {
    this.answer2 = event.target.value;
  }

  render() {
  return html`
    <form>
      <label>
        ${this.question1}
        <input type="text" .value=${this.answer1} @input=${this.__handleAnswer1Change} />
      </label>
      <label>
        ${this.question2}
        <input type="email" .value=${this.answer2} @input=${this.__handleAnswer2Change} />
      </label>
      <button type="button" @click=${this.__saveToIndexedDB}>Save to IndexedDB</button>
      <button type="button" @click=${this.__uploadToFirebase}>Upload to Firebase</button>
    </form>
  `;
}

}


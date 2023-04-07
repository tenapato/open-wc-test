import { html, css, LitElement } from 'lit';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';

// let firebaseDb = null;


export class OpenWcTestJs extends LitElement {
  static get properties() {
    return {
      question1: { type: String },
      question2: { type: String },
      answer1: { type: String },
      answer2: { type: String },
      image: { type: Object },
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
    this.image = null;
    this.databaseName = 'my-database';
    this.objectStoreName = 'answers';
    this.__handleSubmit = this.__handleSubmit.bind(this);
    this.__handleAnswer1Change = this.__handleAnswer1Change.bind(this);
    this.__handleAnswer2Change = this.__handleAnswer2Change.bind(this);
    this.__handleImageUpload = this.__handleImageUpload.bind(this);

    
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
      objectStore.createIndex('image', 'image', { unique: false });
    };
  }

  __saveToIndexedDB() {
  const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
  const objectStore = transaction.objectStore(this.objectStoreName);
  const data = { answer1: this.answer1, answer2: this.answer2, image: this.image };
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
    const storageRef = firebase.storage().ref();
    answers.forEach((answer) => {
      // Upload the image to Firebase Storage
      let counter = 1
      const imageRef = storageRef.child(`images/${answer.id}/${counter}.jpg`);
      imageRef.put(answer.image).then(() => {
        console.log(`Image uploaded successfully for answer with id: ${answer.id}`);
        counter++;
      }).catch((error) => {
        console.error(`Error uploading image for answer with id: ${answer.id}:`, error);
      });

      // Save the answer to Firebase Realtime Database
      const databaseRef = firebase.database().ref('answers');
      databaseRef.push(answer);

      // Delete the answer from IndexedDB
      objectStore.delete(answer.id);
    });
    window.alert('Data uploaded to Firebase successfully and deleted from IndexedDB');
  };
}

  __handleSubmit(event) {
    event.preventDefault();
    const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const data = { answer1: this.answer1, answer2: this.answer2, image: this.image };
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

 __handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) {
    console.error('Please select an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imageDataUrl = reader.result;
    const blob = this.__dataUrlToBlob(imageDataUrl);
    // Assign image blob to variable 
    this.image = blob;
    console.log(blob);
  };
  reader.readAsDataURL(file);
}

__dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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
      <label>
        Upload an image
        <input type="file" accept="image/*" @change=${this.__handleImageUpload} />
      </label>
      <button type="button" @click=${this.__saveToIndexedDB}>Save to IndexedDB</button>
      <button type="button" @click=${this.__uploadToFirebase}>Upload to Firebase</button>
    </form>
  `;
}

}


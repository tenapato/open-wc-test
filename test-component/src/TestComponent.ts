import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';


export class TestComponent extends LitElement {
  @property({ type: String }) question1 = 'What is your name?';
  @property({ type: String }) question2 = 'What is your email address?';
  @property({ type: String }) answer1 = '';
  @property({ type: String }) answer2 = '';

  __handleSubmit(event: Event) {
    event.preventDefault();
    const message = `Name: ${this.answer1}\nEmail: ${this.answer2}`;
    window.alert(message);
  }

  __handleAnswer1Change(event: InputEvent) {
    this.answer1 = (event.target as HTMLInputElement).value;
  }

  __handleAnswer2Change(event: InputEvent) {
    this.answer2 = (event.target as HTMLInputElement).value;
  }

  render() {
    return html`
      <form @submit=${this.__handleSubmit}>
        <label>
          ${this.question1}
          <input type="text" .value=${this.answer1} @input=${this.__handleAnswer1Change} />
        </label>
        <label>
          ${this.question2}
          <input type="email" .value=${this.answer2} @input=${this.__handleAnswer2Change} />
        </label>
        <button type="submit">Submit</button>
      </form>
    `;
  }
}

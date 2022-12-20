import './style.css'
import { codeForm } from './codeForm';
import { players } from './players';
const apiUrl = 'http://localhost:5000';
const exampleSocket = new WebSocket("ws://localhost:3000");

exampleSocket.onmessage = (ev) => {
  console.log(ev);
};
setTimeout(() => {
  exampleSocket.send(JSON.stringify({message: 'hi'}));
}, 1000);


// fetch(apiUrl)
//   .then((response) => response.json())
//   .then((data) => {
//     console.log('Success:', data);
//   })


const {mount} = codeForm();

mount(document.querySelector<HTMLDivElement>('#app')!)


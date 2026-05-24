import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
updateDoc,
doc
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// FIREBASE
// =========================

const firebaseConfig = {

apiKey: "AIzaSyA2y91gOWQX_Or_UNuilOhWmBVPS0vmQSE",

authDomain: "quni-ba5f7.firebaseapp.com",

projectId: "quni-ba5f7",

storageBucket: "quni-ba5f7.firebasestorage.app",

messagingSenderId: "140436996650",

appId: "1:140436996650:web:044d67a93205b244f87953"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// =========================
// VARIABLES
// =========================

let jugadas = [];

let loteriasSeleccionadas = [];

// =========================
// ONLOAD
// =========================

window.onload = () => {

iniciarBotones();

iniciarEnter();

actualizarDisponibles();

mostrarFechaYHora();

setInterval(mostrarFechaYHora, 1000);

};

// =========================
// BOTONES
// =========================

function iniciarBotones(){

// individuales
const botones =
document.querySelectorAll('.loteria');

botones.forEach(btn => {

if(btn.classList.contains('todas')) return;

btn.addEventListener('click', () => {

const nombre =
btn.innerText.trim();

if(loteriasSeleccionadas.includes(nombre)){

loteriasSeleccionadas =
loteriasSeleccionadas.filter(
l => l !== nombre
);

btn.classList.remove('activa');

}else{

loteriasSeleccionadas.push(nombre);

btn.classList.add('activa');

}

});

});

// todas
const botonesTodas =
document.querySelectorAll('.todas');

botonesTodas.forEach(botonTodas => {

botonTodas.addEventListener('click', () => {

const grupo =
botonTodas.closest('.grupo-horario');

const botonesGrupo =
grupo.querySelectorAll('.loteria');

const activar =
!botonTodas.classList.contains('activa');

botonesGrupo.forEach(btn => {

if(btn.classList.contains('todas')) return;

const nombre =
btn.innerText.trim();

if(activar){

btn.classList.add('activa');

if(!loteriasSeleccionadas.includes(nombre)){

loteriasSeleccionadas.push(nombre);

}

}else{

btn.classList.remove('activa');

loteriasSeleccionadas =
loteriasSeleccionadas.filter(
l => l !== nombre
);

}

});

if(activar){

botonTodas.classList.add('activa');

}else{

botonTodas.classList.remove('activa');

}

});

});

}

// =========================
// ENTER
// =========================

function iniciarEnter(){

const numeroInput =
document.getElementById('numero');

const importeInput =
document.getElementById('importe');

numeroInput.addEventListener('keydown', (e) => {

if(e.key === 'Enter'){

e.preventDefault();

importeInput.focus();

}

});

importeInput.addEventListener('keydown', (e) => {

if(e.key === 'Enter'){

e.preventDefault();

agregarJugada();

}

});

}

// =========================
// AGREGAR JUGADA
// =========================

function agregarJugada(){

const numero =
document.getElementById('numero')
.value
.trim();

const posicion =
document.getElementById('posicion')
.value
.trim();

const importe =
document.getElementById('importe')
.value
.trim();

if(
!numero ||
!importe ||
loteriasSeleccionadas.length === 0
){

alert('Faltan datos');

return;

}

loteriasSeleccionadas.forEach(loteria => {

jugadas.push({

loteria: loteria,

numero: numero,

posicion: posicion,

importe: Number(importe)

});

});

let total = 0;

jugadas.forEach(j => {

total += Number(j.importe);

});

document.getElementById('total').innerText =
total;

document.getElementById('ticket').innerText =
jugadas.length;

document.getElementById('numero').value = '';

document.getElementById('importe').value = '';

document.getElementById('numero').focus();

}

// =========================
// IR A REVISION
// =========================

async function irARevision(){

if(jugadas.length === 0){

alert('No hay jugadas');

return;

}

try{

// contador
const contadorRef =
collection(db, "contador");

const contadorSnapshot =
await getDocs(contadorRef);

let ultimoTicket = 3000;

let contadorId = null;

if(!contadorSnapshot.empty){

ultimoTicket =
contadorSnapshot.docs[0]
.data()
.ultimo;

contadorId =
contadorSnapshot.docs[0]
.id;

}

const numeroTicket =
ultimoTicket + 1;

// guardar ticket
await addDoc(collection(db, "tickets"), {

ticket: numeroTicket,

jugadas: jugadas,

fecha: new Date()

});

// actualizar contador
if(contadorId){

await updateDoc(
doc(db, "contador", contadorId),
{
ultimo: numeroTicket
}
);

}else{

await addDoc(
collection(db, "contador"),
{
ultimo: numeroTicket
}
);

}

// local
localStorage.setItem(
'jugadas',
JSON.stringify(jugadas)
);

localStorage.setItem(
'numeroTicket',
numeroTicket
);

// ir
window.location = 'revisar.html';

}catch(error){

console.error(error);

alert('Error al guardar online');

}

}

// =========================
// BLOQUEAR HORARIOS
// =========================

function actualizarDisponibles(){

const ahora = new Date();

const horaActual =
ahora.getHours();

const minutosActual =
ahora.getMinutes();

const grupos =
document.querySelectorAll('.grupo-horario');

grupos.forEach(grupo => {

const titulo =
grupo.querySelector('h2').innerText;

let limiteHora = 0;

let limiteMin = 0;

if(titulo === 'PREVIA'){

limiteHora = 10;
limiteMin = 15;

}

if(titulo === 'MAÑANA'){

limiteHora = 12;
limiteMin = 0;

}

if(titulo === 'MATUTI'){

limiteHora = 15;
limiteMin = 0;

}

if(titulo === 'VESPERT'){

limiteHora = 18;
limiteMin = 0;

}

if(titulo === 'NOCHE'){

limiteHora = 21;
limiteMin = 0;

}

const botones =
grupo.querySelectorAll('.loteria');

const bloqueado =
horaActual > limiteHora ||
(
horaActual === limiteHora &&
minutosActual > limiteMin
);

if(bloqueado){

botones.forEach(btn => {

btn.disabled = true;

btn.style.opacity = "0.3";

btn.style.pointerEvents = "none";

});

}

});

}

// =========================
// FECHA Y HORA
// =========================

function mostrarFechaYHora(){

const ahora = new Date();

const fecha =
ahora.toLocaleDateString('es-AR');

const hora =
ahora.toLocaleTimeString('es-AR');

const contenedor =
document.getElementById('fechaHoy');

if(contenedor){

contenedor.innerText =
`Fecha: ${fecha} ||| Hora: ${hora}`;

}

}

// =========================
// GLOBALES
// =========================

window.agregarJugada = agregarJugada;

window.irARevision = irARevision;
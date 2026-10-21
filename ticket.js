// =========================
// TICKET 58 mm
// Armado e impresión compartidos por
// revisar.html (enviar) y enviadas.html (reimprimir)
// =========================

// Caracteres que entran por renglón en el papel de 58 mm.
// Si ves que algún renglón se parte en dos, bajá este número.
export const ANCHO = 27;

const ORDEN = ['NAC','PRO','SFE','COR','RIO','CTE','MZA','ORO'];

// Abreviaturas que se imprimen (NAC17 -> N17, etc.)
const ABREV = {
NAC:'N',
PRO:'P',
SFE:'S',
COR:'C',
RIO:'R',
CTE:'T',
MZA:'M',
ORO:'O'
};

// =========================
// AUXILIARES
// =========================

function partirLoteria(nombre){

const limpio = String(nombre).trim();

return {
codigo: limpio.slice(0,3),
hora: limpio.slice(3)
};

}

function posicionEnOrden(codigo){

const i = ORDEN.indexOf(codigo);

return i === -1 ? ORDEN.length : i;

}

function importeTexto(valor){

return Number(valor).toLocaleString('es-AR', {
minimumFractionDigits: 2,
maximumFractionDigits: 2
});

}

function rayas(){

return '-'.repeat(ANCHO);

}

function centrar(texto){

const espacios =
Math.max(0, Math.floor((ANCHO - texto.length) / 2));

return ' '.repeat(espacios) + texto;

}

// Parte una lista de palabras en renglones de hasta ANCHO caracteres
function envolver(palabras){

const lineas = [];

let actual = '';

palabras.forEach(p => {

if(!actual){

actual = p;

}else if((actual + ' ' + p).length <= ANCHO){

actual += ' ' + p;

}else{

lineas.push(actual);

actual = p;

}

});

if(actual) lineas.push(actual);

return lineas;

}

function fechaTexto(fecha){

return fecha.toLocaleDateString('es-AR', {
day: '2-digit',
month: '2-digit',
year: '2-digit'
});

}

function horaTexto(fecha){

return fecha.toLocaleTimeString('es-AR', {
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
hourCycle: 'h23'
});

}

// =========================
// BLOQUES
// Un bloque = un horario + un grupo de loterías.
// Dentro del bloque, cada número aparece una sola vez.
// =========================

function armarBloques(jugadas){

// horario -> (numero|pos|importe) -> loterías donde se juega
const porHorario = {};

jugadas.forEach(j => {

const { codigo, hora } = partirLoteria(j.loteria);

if(!porHorario[hora]) porHorario[hora] = {};

const numero = String(j.numero).trim();

const posicion = String(j.posicion).trim();

const clave =
numero + '|' + posicion + '|' + String(j.importe).trim();

if(!porHorario[hora][clave]){

porHorario[hora][clave] = {

numero: numero,
posicion: posicion,
importe: Number(j.importe),
codigos: new Set()

};

}

porHorario[hora][clave].codigos.add(codigo);

});

const bloques = [];

Object.keys(porHorario)
.sort((a,b) => Number(a) - Number(b))
.forEach(hora => {

// dentro del horario, los números que se juegan
// en las mismas loterías comparten encabezado
const porConjunto = {};

Object.values(porHorario[hora]).forEach(item => {

const codigos =
[...item.codigos].sort(
(a,b) => posicionEnOrden(a) - posicionEnOrden(b)
);

const claveConjunto = codigos.join(',');

if(!porConjunto[claveConjunto]){

porConjunto[claveConjunto] = {
hora: hora,
codigos: codigos,
items: []
};

}

porConjunto[claveConjunto].items.push(item);

});

bloques.push(...Object.values(porConjunto));

});

return bloques;

}

// =========================
// ARMAR TICKET (texto plano)
// =========================

export function armarTicket(jugadas, { numeroTicket, fecha, reimpresion = false }){

const lineas = [];

if(reimpresion){
lineas.push(centrar('REIMPRESION'));
}

lineas.push(centrar('TICKET: ' + numeroTicket));

lineas.push(
centrar(fechaTexto(fecha) + '  ' + horaTexto(fecha))
);

armarBloques(jugadas).forEach(bloque => {

lineas.push(rayas());

const nombres =
bloque.codigos.map(c => (ABREV[c] || c) + bloque.hora);

lineas.push(...envolver(nombres));

lineas.push(rayas());

bloque.items.forEach(item => {

const numero = item.numero.padStart(4, '*');

const posicion = item.posicion.padStart(2, '0');

lineas.push(
numero.padEnd(8, ' ') +
posicion.padEnd(6, ' ') +
importeTexto(item.importe)
);

});

});

let total = 0;

jugadas.forEach(j => {
total += Number(j.importe);
});

lineas.push(rayas());

lineas.push(centrar('TOTAL: ' + importeTexto(total)));

return lineas.join('\n');

}

// =========================
// IMPRIMIR
// =========================

export function imprimirTicket(texto){

const seguro =
texto
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;');

const ventana =
window.open('', '', 'width=350,height=700');

if(!ventana){

alert('El navegador bloqueó la ventana de impresión');

return;

}

ventana.document.write(`

<html>

<head>

<title>Ticket</title>

<style>

@page{
size:58mm auto;
margin:0;
}

html,body{

width:58mm;
margin:0;
padding:0;
overflow:hidden;

font-family:"Courier New", monospace;

font-size:15px;

font-weight:normal;

}

pre{

margin:0;
padding:2px;

white-space:pre-wrap;

line-height:1.05;

}

</style>

</head>

<body>

<pre>${seguro}</pre>

</body>

</html>

`);

ventana.document.close();

ventana.focus();

ventana.print();

}

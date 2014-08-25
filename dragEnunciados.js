/**
 * Created by Adib Abud Jaso (http://adib.awardspace.com) on 23/08/14.
 * Pendiente:
 * 1: scroll hacia calificación cuando termina
 * 2: reprogramar reinicio
 * 3: hacer las opciones aleatorias
 */

var oDragTargets = [];//Posiciones de los destinos ("DropTarget")
var oDragTarget = null;
var oDragItem = null;
var iClickOffsetX = 0;
var iClickOffsetY = 0;

var buenas = 0;
var contestadas = 0;
var total = 4;

window.onload = function(){
    //console.log("cargó la página");
    OnLoad();
    window.onresize = function(){
        //console.log("cambió tamaño");
        ajustarDestinos();
    };
};

function OnLoad(){
    SetupDragDrop();
}
function SetupDragDrop(){
    ajustarDestinos();
    var botones = document.getElementsByClassName("Dragable");
    for(var i = 0; i<botones.length; i++){
        MakeDragable(botones[i]);
        botones[i].padreOriginal = botones[i].parentNode;
        botones[i].intentos = 0;
        //console.log(i+" - "+botones[i].parentNode + " - " + botones[i].padreOriginal);
    }
}
function ajustarDestinos(){
    oDragTargets = [];
    var destinos = document.getElementsByClassName("DropTarget");
    for(var i = 0; i<destinos.length; i++){
        oDragTargets.push(GetObjPos(destinos[i]));
    }
}

function MakeDragable(oBox){
    //if (navigator.platform=="iPad" || navigator.platform =="iPhone"){
    if (is_touch_device()){
        oBox.ontouchstart= function(e){TouchStart(e)};
        oBox.ontouchmove=function(e){TouchMove(e)};
        oBox.ontouchend=function(e){TouchEnd(e)};
    }else{
        oBox.onmousemove= function(e){DragMove(oBox,e)};
        oBox.onmouseup=function(e){DragStop(oBox,e)};
        oBox.onmousedown=function(e){DragStart(oBox,e);return false};
    }
}
//Extra para deshabilitar
function UnmakeDragable(oBox){
    if (is_touch_device()){
        oBox.ontouchstart = null;
        oBox.ontouchmove = null;
        oBox.ontouchend = null;
    }else{
        oBox.onmousemove = null;
        oBox.onmouseup = null;
        oBox.onmousedown = null;
    }
    oBox.style.cursor = "auto";
}

function is_touch_device() {
    return 'ontouchstart' in window; // works on most browsers
    //|| 'onmsgesturechange' in window; // funciona en ie10, no en 11
}


function TouchStart(e){
    var oPos = GetObjPos(e.target);
    iClickOffsetX = e.targetTouches[0].pageX - oPos.x;
    iClickOffsetY = e.targetTouches[0].pageY - oPos.y;
}

function DragStart(o,e){
    if(!e) var e = window.event;
    oDragItem = o;

    if (e.offsetX){
        iClickOffsetX = e.offsetX;
        iClickOffsetY = e.offsetY;
    }else{
        var oPos = GetObjPos(o);
        iClickOffsetX = e.clientX - oPos.x;
        iClickOffsetY = e.clientY - oPos.y;
    }

    if (o.setCapture){
        o.setCapture();
    }else{
        window.addEventListener ("mousemove", DragMove2, true);
        window.addEventListener ("mouseup",   DragStop2, true);
    }
}

function DragMove2(e){
    DragMove(oDragItem,e);
}

function DragStop2(e){
    DragStop(oDragItem,e);
}

function DragMove(o,e){
    if (oDragItem==null) return;

    if(!e) var e = window.event;
    var x = e.clientX + window.pageXOffset - document.body.clientLeft - iClickOffsetX;
    var y = e.clientY + window.pageYOffset - document.body.clientTop - iClickOffsetY;
    //console.log(o.offsetWidth, o.offsetHeight);
    HandleDragMove(x,y, e.clientX - o.offsetWidth, e.clientY - o.offsetHeight);
}

function HandleDragMove(x,y, botonX, botonY){
    with(oDragItem.style){
        zIndex = 1000;
        /*position="absolute";*/
        position="fixed";
        left=botonX+"px";
        top=botonY+"px";
    }

    for (var i=0; i< oDragTargets.length; i++){
        var oTarget = oDragTargets[i];
        if (oTarget.x < x && oTarget.y < y && (oTarget.x + oTarget.w) > x && (oTarget.y + oTarget.h) > y){
            if (oDragTarget!=null && oDragTarget != oTarget.o) OnTargetOut();
            oDragTarget = oTarget.o;
            OnTargetOver();
            return;
        }
    }

    if (oDragTarget){
        OnTargetOut();
        oDragTarget = null;
    }
}

function TouchMove(e){
    e.preventDefault();
    var x = e.targetTouches[0].pageX + window.pageXOffset - document.body.clientLeft - iClickOffsetX;
    var y = e.targetTouches[0].pageY + window.pageYOffset - document.body.clientTop - iClickOffsetY;
    oDragItem = e.targetTouches[0].target;
    //HandleDragMove(x,y);
    //mensajear("x: "+e.targetTouches[0].clientX+", y: "+e.targetTouches[0].clientY);
    //console.log("e.targetTouches[0]: ", e.targetTouches[0]);
    HandleDragMove(x,y, e.targetTouches[0].clientX - oDragItem.offsetWidth, e.targetTouches[0].clientY - oDragItem.offsetHeight);
}

function DragStop(o,e){
    if (o.releaseCapture){
        o.releaseCapture();
    }else if (oDragItem){
        window.removeEventListener ("mousemove", DragMove2, true);
        window.removeEventListener ("mouseup",   DragStop2, true);
    }

    HandleDragStop();
}

function HandleDragStop(){
    //console.log("oDragTargets: ", oDragTargets);
    if (oDragItem==null) {
        return;
    }
    if (oDragTarget){
        //mensajear("oDragTarget true: "+ oDragItem.getAttribute("data-tipo") + " - " + oDragTarget.getAttribute("data-destino"));
        if(oDragItem.getAttribute("data-tipo") == oDragTarget.getAttribute("data-destino")){
            oDragTarget.appendChild(oDragItem);
            oDragTarget.getElementsByClassName('palomita').item(0).style.display = "";
            //mensajear("padre: "+ oDragTarget.getElementsByClassName('palomita').item(0));
            OnTargetOut();
            OnTargetDrop();
            oDragTarget = null;
            contestadas++;
            buenas++;
            revisar();
        } else {
            oDragItem.padreOriginal.appendChild(oDragItem);
            oDragItem.style.position="";
            oDragItem.intentos++;
            //mensajear("intentos: "+oDragItem.intentos);
            if(oDragItem.intentos >= 2){
                UnmakeDragable(oDragItem);
                oDragItem.getElementsByClassName('tache').item(0).style.display = "";
                //mensajear("intentos sobrepasados: ");
                contestadas++;
                revisar();
            }
        }
    } else {
        //Agregado para que regrese si no se coloca en una caja
        //mensajear("oDragTarget es falso, padre"+oDragItem.parentNode + " - original: " + oDragItem.padreOriginal);
        oDragItem.padreOriginal.appendChild(oDragItem);
        oDragItem.style.position="";
    }

    oDragItem.style.zIndex = 1;
    oDragItem = null;
}
function revisar(){
    if(contestadas == total){
        //mensajear("Terminó todo");
        retroalimentar('Obtuviste '+ buenas + " de " + total +'.<br /><input type="button" value="Otra vez" onClick="window.location.reload()">');
    }
}

function TouchEnd(e){
    //e.target.innerHTML = "TouchEnd";
    HandleDragStop();
}

function $(s){
    return document.getElementById(s);
}

function GetObjPos(obj){
    var x = 0;
    var y = 0;
    var o = obj;

    var w = obj.offsetWidth;
    var h = obj.offsetHeight;
    if (obj.offsetParent) {
        x = obj.offsetLeft;
        y = obj.offsetTop;
        while (obj = obj.offsetParent){
            x += obj.offsetLeft;
            y += obj.offsetTop;
        }
    }
    return {x:x, y:y, w:w, h:h, o:o};
}

//Drag and Drop Events
function OnTargetOver(){
    oDragTarget.style.border = "2px solid #4673d7";
}

function OnTargetOut(){
    oDragTarget.style.border = "";
}

function OnTargetDrop(){
    oDragItem.style.position="";
    //oDragTarget.appendChild(oDragItem);
    //if (navigator.platform=="iPad") MakeDragable(oDragItem);
    if (is_touch_device()) MakeDragable(oDragItem);
}

function mensajear(cadena){
    //document.getElementById("mensajes").innerHTML = cadena;
}
function retroalimentar(texto){
    document.getElementById("retroalimentacion").innerHTML = texto;
}
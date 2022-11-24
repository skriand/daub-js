document.addEventListener('DOMContentLoaded', setup)

function setup() {
    dragElement(document.getElementById("brushesheader"));
    dragElement(document.getElementById("colorsheader"));
    dragElement(document.getElementById("toolsheader"));
    isFold();
    drawOn();
    window.addEventListener('resize', () =>{
        isFold();
    });
}

function drawOn(){
    const canvas = document.getElementById('canvas');
    const colors = document.getElementById('colors');
    const brushes = document.getElementById('brushes');
    const ctx = canvas.getContext('2d');

    let canvasOffsetX = canvas.offsetLeft;
    let canvasOffsetY = canvas.offsetTop;

    canvas.width = window.innerWidth - canvasOffsetX*2;
    canvas.height = window.innerHeight - canvasOffsetY*2;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    let isPainting = false;
    let lineWidth = 5;
    let startX;
    let startY;

    /*toolbar.addEventListener('click', e => {
        if (e.target.id === 'clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });*/

    colors.addEventListener('change', e => {
        if(e.target.id === 'stroke') {
            ctx.strokeStyle = e.target.value;
        }

        /*if(e.target.id === 'lineWidth') {
            lineWidth = e.target.value;
        }*/
        
    });

    brushes.addEventListener('change', e => {
        if(e.target.id === 'lineWidth') {
            lineWidth = e.target.value;
        }
    });

    const draw = (e) => {
        if(!isPainting) {
            return;
        }

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        ctx.lineTo(e.clientX - canvasOffsetX, e.clientY - canvasOffsetY);
        ctx.stroke();
    }

    canvas.addEventListener('pointerdown', (e) => {
        canvasOffsetX = canvas.offsetLeft;
        canvasOffsetY = canvas.offsetTop;
        
        isPainting = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener('pointermove', draw);

    canvas.addEventListener('pointerup', e => {
        isPainting = false;
        ctx.stroke();
        ctx.beginPath();
    });
}

function dragElement(child) {
    let parent = child.parentNode;
    let currentDroppable = null;

    child.onpointerdown = function(event) {
        let screens = window.visualViewport.segments;
        let left = document.createElement('div');
        let right = document.createElement('div');

        let shiftX = event.clientX - parent.getBoundingClientRect().left;
        let shiftY = event.clientY - parent.getBoundingClientRect().top;
    
        const tempLeft = parent.style.left;
        const tempTop = parent.style.top;

        parent.style.position = 'absolute';
        parent.style.zIndex = 1000;
        child.style.background = 'rgb(65, 65, 65, 0.2)';
        
        //for tools
        if(screens && screens.length > 1) {
            document.body.style.position = 'fixed';
            parent.style.transform = 'scale(.95)';
            parent.classList.add('border');
        

            //let left = document.createElement('div');
            left.style.width = "env(viewport-segment-right 0 0)";
            left.className = "highlight";
            parent.after(left);

            //let right = document.createElement('div');
            right.className = "highlight";
            if (screens[1].x != 0){
                right.style.width = "calc(100vw - env(viewport-segment-left 1 0))";
                right.style.left = "env(viewport-segment-left 1 0)";
            } else {
                right.style.top = 'env(viewport-segment-top 0 1)';
                right.style.width = "env(viewport-segment-right 0 0)";
                right.style.height = 'env(viewport-segment-height 0 1)';
            }
            
            parent.after(right);
        }
    
        let droppableBelow = null;

        moveAt(event.pageX, event.pageY);
    
        // moves the ball at (pageX, pageY) coordinates
        // taking initial shifts into account
        function moveAt(pageX, pageY) {
            parent.style.left = pageX - shiftX + 'px';
            parent.style.top = pageY - shiftY + 'px';
        }
    
        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);

            parent.hidden = true;
            let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            parent.hidden = false;

            if (!elemBelow) return;

            droppableBelow = elemBelow.closest('.highlight');
            if (currentDroppable != droppableBelow) {
                if (currentDroppable) { // null when we were not over a droppable before this event
                    leaveDroppable(currentDroppable);
                }
                currentDroppable = droppableBelow;
                if (currentDroppable) { // null if we're not coming over a droppable now
                    // (maybe just left the droppable)
                    enterDroppable(currentDroppable);
                }
            }
        }
    
        // move the ball on mousemove
        document.addEventListener('pointermove', onMouseMove);
    
        // drop the ball, remove unneeded handlers
        child.onpointerup = function() {
            document.removeEventListener('pointermove', onMouseMove);
            if(screens && screens.length > 1) {
                if (droppableBelow == left){
                    parent.style.top = 0;
                }
                else{
                    if(screens[1].x == 0){
                        parent.style.top = 'env(viewport-segment-top 0 1)';
                    }else{
                        parent.style.top = 0;
                    }
                }
            
                if(droppableBelow){
                    parent.style.width = droppableBelow.style.width;
                    parent.style.left = droppableBelow.style.left;
                    parent.style.height = droppableBelow.style.height;
                } else {
                    parent.style.left = tempLeft;
                    parent.style.top = tempTop;
                }
            
                parent.classList.remove('border');
                parent.style.transform = 'none';
                document.body.style.position = 'static';
            }
            child.onpointerup = null;
            child.style.background = 'none';
            parent.style.zIndex = 0;
            left.remove();
            right.remove();
        };
    
    };
    
    function enterDroppable(elem) {
        elem.style.background = 'rgb(235, 235, 235, 0.65)';
      }
  
    function leaveDroppable(elem) {
        elem.style.background = 'rgb(65, 65, 65, 0.65)';
     }

    child.ondragstart = function() {
        return false;
    };
}

function isFold() {
    let screens = window.visualViewport.segments;
    if (screens){
        
        console.log(screens);

        if(screens.length > 1) {
            let parent = document.querySelector('.dinamic');
            let menuItem = parent.querySelectorAll('.box');

            for(let i = 0; i < menuItem.length; i++) {
                menuItem[i].classList.remove('surface');
                menuItem[i].classList.remove('border');
                menuItem[i].style.position = 'relative';
                menuItem[i].style.top = 0;
                menuItem[i].style.left = 0;
            }
            document.querySelector('#tools').classList.add('surface');
            document.querySelector('#tools').style.position = 'absolute';
            if(document.querySelector('#tools').style.top == "env(viewport-segment-top 0 1)"){
                document.querySelector('#tools').style.top = 0;
                document.querySelector('#tools').style.height = 'env(viewport-segment-height 0 0)';
            }
            if(document.querySelector('#tools').style.width == "calc(100vw - env(viewport-segment-left 1 0))"){
                document.querySelector('#tools').style.top = 0;
                document.querySelector('#tools').style.width = 'env(viewport-segment-right 0 0)';
            }
        }
    }
    else{
        let parent = document.querySelector('.dinamic');
        let menuItem = parent.querySelectorAll('.box');

        for(let i = 0; i < menuItem.length; i++) {
            menuItem[i].classList.add('surface');
            menuItem[i].classList.add('border');
            menuItem[i].style.position = 'absolute';
        }
        document.querySelector('#tools').classList.remove('surface');
        document.querySelector('#tools').style.position = 'fixed';
    }
}


//document.addEventListener('DOMContentLoaded',setup)

/*function setup() {
    document.getElementById('demoButton').onclick = addSomething;
}

function addSomething(){
    const someDummyDiv = document.createElement('div');
    someDummyDiv.classList.add('generated');
    const count = document.getElementsByClassName('generated').length;
    someDummyDiv.innerHTML = `I was created by JS! There are already ${count} of my friends!`;
    const container = document.getElementById('container');
    container.appendChild(someDummyDiv);
}*/

/*dragElement(document.getElementById(("brushes")));
dragElement(document.getElementById(("colors")));

function dragElement(elmnt) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onpointerdown = dragPointerDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onpointerdown = dragPointerDown;
    }

    elmnt.ondragstart = () => false;
  
    function dragPointerDown(e) {
        e = e || window.event;
        e.preventDefault();
        elmnt.setPointerCapture(e.pointerId);
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.getElementById(elmnt.id + "header").style.background = 'rgb(65, 65, 65, 0.2)';
        document.onpointerup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onpointermove = elementDrag;
    }
  
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        let winW = document.documentElement.clientWidth || document.body.clientWidth,
            winH = document.documentElement.clientHeight || document.body.clientHeight;
        let maxX = winW - elmnt.offsetWidth - 1,
            maxY = winH - elmnt.offsetHeight - 1;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        //console.log((elmnt.offsetLeft - pos1), maxY, (elmnt.offsetLeft - pos1), maxX);
        if ((elmnt.offsetTop - pos2) <= maxY && (elmnt.offsetTop - pos2) >= 0) {
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        }
        if ((elmnt.offsetLeft - pos1) <= maxX && (elmnt.offsetLeft - pos1) >= 0) {
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
    }
  
    function closeDragElement() {
        // stop moving when mouse button is released:
        document.getElementById(elmnt.id + "header").style.background = 'none';
        document.onpointerup = null;
        document.onpointermove = null;
    }
  }*/
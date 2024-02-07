let itemList = document.querySelector(".items")
let board = document.querySelector(".board")
let itemHolder = document.querySelector(".item")

let itemElement = itemHolder.cloneNode(true)
itemHolder.remove()

let dragging 
let initialMouseX, initialMouseY, initialDivX, initialDivY;

let found = [];

function addItem(item) {
  let newItem = itemElement.cloneNode(true)
  newItem.textContent = item.Name
  itemList.append(newItem)
 
  newItem.addEventListener('mousedown', (event) => {
    let draggableNode = newItem.cloneNode(true)
    draggableNode.classList.add("draggable")
    board.append(draggableNode)
    
    const requestAnimationFrame = (
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame
    );
    const cancelAnimationFrame = (
      window.cancelAnimationFrame ||
      window.mozCancelAnimationFrame
    );
  
    let isDragging = false;
    let frameID = 0;
    let lastX = 0;
    let lastY = 0;
    let dragX = 0;
    let dragY = 0;
  
    const handleMove = (e) => {
      if (!isDragging) {
        return;
      }
  
      const deltaX = lastX - e.pageX;
      const deltaY = lastY - e.pageY;
      lastX = e.pageX;
      lastY = e.pageY;
      dragX -= deltaX;
      dragY -= deltaY;
  
      cancelAnimationFrame(frameID);
      frameID = requestAnimationFrame(() => {
        draggableNode.style.transform = `translate3d(${dragX}px, ${dragY}px, 0)`;
      });
    };
  
    const handleMouseDown = (e) => {
      lastX = e.pageX;
      lastY = e.pageY;
      isDragging = true;
      draggableNode.style.cursor = 'grabbing';
    };
  
    const handleMouseUp = () => {
      isDragging = false;
      draggableNode.style.cursor = 'grab';
    };
  
    draggableNode.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMouseUp);
    
  });
}

function foundItem(item) {
  found.push(item)
  string = JSON.stringify(found)
  localStorage.setItem('found', string)
}

function load() {
  const foundString = localStorage.getItem('found');
  if (foundString) {
    found = JSON.parse(foundString);
    found.forEach(item => {
      addItem(item)
    })
  }
}

function updatePosition(event) {
  if (dragging) {
      const deltaX = event.clientX - initialMouseX;
      const deltaY = event.clientY - initialMouseY;
      dragging.style.left = initialDivX + deltaX + 'px';
      dragging.style.top = initialDivY + deltaY + 'px';
      console.log("ayo")
      requestAnimationFrame(() => updatePosition(event));
  }
}
document.addEventListener('mouseup', () => {
  dragging = null
});

load()
addItem(items[0])

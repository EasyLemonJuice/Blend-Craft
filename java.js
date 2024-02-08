let itemList = document.querySelector(".items");
let board = document.querySelector(".board");
let itemHolder = document.querySelector(".item");

const first = new Audio('new.mp3');
const fail = new Audio('fail.mp3');
const deleting = new Audio('delete.mp3');
const connect = new Audio('connect.mp3');

let audioContext;

function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playAudio(source) {
  initializeAudioContext()
  if (audioContext) {
      const audioSource = audioContext.createMediaElementSource(source);
      audioSource.connect(audioContext.destination);
      source.play();
  }
}

let itemElement = itemHolder.cloneNode(true);
itemHolder.remove();

let offsetX, offsetY;
let isDragging;

let found = [];

function isTouching(element1, element2) {
  let rect1 = element1.getBoundingClientRect();
  let rect2 = element2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function findRecipe(element1, element2) {
  let text1 = element1.getAttribute("data-type");
  let text2 = element2.getAttribute("data-type");
  for (let item of items) {
    for (let ingredients of item.Recipe) {
      let one = false;
      let two = false;

      for (let ingredient of ingredients) {
        let exp = new RegExp("\\s* " + ingredient);
        if (text1.match(exp)) {
          if (one && text2.match(exp)) {
            two = true;
          }
          one = true;
        } else if (text2.match(exp)) {
          two = true;
        }
        if (one && two) {
          return item;
        }
      }
    }
  }
  return false;
}

function getTouching(element) {
  let children = Array.from(board.children);
  for (let child of children) {
    if (child !== element && isTouching(element, child)) {
      return child;
    }
  }
}

function addItem(item) {
  let newItem = itemElement.cloneNode(true);
  newItem.textContent = item.Name;
  newItem.setAttribute("data-type", item.Name)
  itemList.append(newItem);

  newItem.addEventListener('mousedown', (event) => {
    let targetRect = newItem.getBoundingClientRect();
    let targetTop = targetRect.top + window.scrollY;
    let targetLeft = targetRect.left + window.scrollX;

    let node = newNode(item, targetLeft, targetTop, event)
    node.classList.add("appear")
    setTimeout(() => {
      node.classList.remove("appear")
    })
  });


}

function newNode(item, left, top, triggered) {
  let newItem = itemElement.cloneNode(true);
  newItem.textContent = item.Name;
  newItem.setAttribute("data-type", item.Name);
  newItem.classList.add("draggable");
  board.append(newItem);

  newItem.style.top = top + 'px';
  newItem.style.left = left + 'px';

  playAudio(connect)

  function handleMouseDown(event) {
    if (event.button == 2) {
      event.preventDefault()
      if (newItem == isDragging) {
        isDragging = false
      }
      playAudio(deleting)
      newItem.classList.add("dissappear")
      setTimeout(() => {
        newItem.remove();
      }, 250)
    }
    if (!event.button == 0) return
    isDragging = newItem;
    newItem.classList.add("dragging");
    offsetX = event.clientX - newItem.offsetLeft;
    offsetY = event.clientY - newItem.offsetTop;
  }

  newItem.addEventListener('mousedown', handleMouseDown);

  if (triggered) {
    handleMouseDown(triggered);
  }
  return newItem;
}

function handleMouseMove(event) {
  if (isDragging) {
    let newX = event.clientX - offsetX;
    let newY = event.clientY - offsetY;

    isDragging.style.left = newX + 'px';
    isDragging.style.top = newY + 'px';
    if (isTouching(isDragging, itemList)) {
      isDragging.classList.add("deleting");
    } else {
      isDragging.classList.remove("deleting");
      let touching = getTouching(isDragging);
      if (touching) {
        touching.classList.add("connection");
      }
      for (let child of Array.from(board.children)) {
        if (child != touching) {
          child.classList.remove("connection");
        }
      }
    }
  }
}

function newShine(element) {
  let img = document.createElement('img');
  img.src = "shine.png";
  img.classList.add("shine");
  document.body.appendChild(img);

  function updateShine() {
    let rect = element.getBoundingClientRect();
    let top = rect.top + window.scrollY + (rect.height - img.height) / 2;
    let left = rect.left + window.scrollX + (rect.width - img.width) / 2;
    img.style.top = top + 'px';
    img.style.left = left + 'px';

    requestAnimationFrame(updateShine);
  }

  const observer = new MutationObserver(() => {
    if (!document.contains(element)) {
      img.remove();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    img.remove();
    observer.disconnect();
  }, 2500);

  updateShine();
}

function beenFound(item) {
  for (let finding of found) {
    if (finding.Name == item.Name) {

      return true
    }
  }
  return false
}

function handleMouseUp() {
  if (!isDragging) return;
  isDragging.classList.remove("dragging");

  if (isTouching(isDragging, itemList)) {
    playAudio(deleting)
    isDragging.classList.add("dissappear")
    let element = isDragging
    setTimeout(() => {
      element.remove();
    }, 250)

    isDragging = false;
  } else {
    let touching = getTouching(isDragging);
    if (touching) {
      let item = findRecipe(isDragging, touching);
      if (item) {
        let draggingElement = isDragging;
        let rect1 = isDragging.getBoundingClientRect();
        let top1 = rect1.top + window.scrollY;
        let left1 = rect1.left + window.scrollX;
        let rect2 = touching.getBoundingClientRect();
        let top2 = rect2.top + window.scrollY;
        let left2 = rect2.left + window.scrollX;

        isDragging.classList.add("dissappear");
        touching.classList.add("dissappear");

        let created = newNode(item, (left1 + left2) / 2, (top1 + top2) / 2);
        if (!beenFound(item)) {
          first.play()
          newShine(created)
          foundItem(item)
          addItem(item)
        }else{
          playAudio(connect)
        }

        created.classList.add("appear")
        setTimeout(() => {
          draggingElement.remove();
          touching.remove();
          created.classList.remove("appear")
        }, 250);
      }else{
        playAudio(fail)
      }
    }
  }
  for (let child of Array.from(board.children)) {
    child.classList.remove("connection");
  }
  isDragging = false;
}

function foundItem(item) {
  found.push(item);
  string = JSON.stringify(found);
  localStorage.setItem('found', string);
}

function load() {
  const foundString = localStorage.getItem('found');

  if (foundString && foundString != "") {
    found = JSON.parse(foundString);
  } else {
    for (let item of items){
      if (item.Default){
        foundItem(item)
      }
    }
  }
  found.forEach(item => {
    if (!itemList.querySelector(`#${item.Name}`)) {
      addItem(item)
    }
  });
}

load();

document.querySelector(".search").addEventListener('input', event => {
  let query = event.target.value.toUpperCase()
  for (let item of Array.from(itemList.children)) {
    let name = item.getAttribute("data-type")
    if (name.toUpperCase().includes(query)) {
      item.classList.remove("invisible")
    } else {
      item.classList.add("invisible")
    }
  }
})

document.getElementById("restart").addEventListener('click', () => {
  let restarting = confirm("Restarting will clear all data! Are you sure?")
  if (restarting) {
    found = []
    localStorage.found = ""
    itemList.innerHTML = ""
    board.innerHTML = ""
    load()
  }
})
document.getElementById("clear").addEventListener('click', () => {
  board.innerHTML = ""
})

document.addEventListener('dragstart', function (event) {
  event.preventDefault();
});

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

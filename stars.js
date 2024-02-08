const starsContainer = document.querySelector('.stars');

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = getRandomNumber(1, 3);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${getRandomNumber(0, window.innerWidth)}px`;
    star.style.top = `0`;
    return star;
}

function addStarsToContainer() {
    let numStars = 5
    for (let i = 0; i < numStars; i++) {
        const star = createStar();
        starsContainer.appendChild(star);
        setTimeout(()=>{
            star.remove()
        },9500)
    }
}

setInterval(()=>{
    addStarsToContainer()
},500)
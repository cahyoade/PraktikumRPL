const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const username = document.querySelector('#username');
const usermail = document.querySelector('#usermail');
const logoutButton = document.querySelector('#logout');
const menu = document.querySelector('.menu');
const cart = document.querySelector('.cart');
const search = document.querySelector('#search');
const total = document.querySelector('.total');
let productList;
let globalInterval;

logout.onclick = e => {
    localStorage.clear();
    isLoggedIn();
}

search.onkeyup = e => {
    const pattern = new RegExp(`${search.value}`, 'i');
    const itemList = document.querySelectorAll('.item');
    for(item of [...itemList]){
        const name = item.querySelector('.productName').innerText;
        if(!(name.match(pattern))){
            item.style.display = 'none';
        }
        else{
            item.style.display = 'flex';
        }
    }
}

isLoggedIn();
function isLoggedIn(){
if(localStorage.getItem('token')){
    init()
    return true;
}
    window.location.assign(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`)
    return false;
}

async function init(){
    let res = await fetch(apiUrl + '/tokenData', {headers : {'token' : localStorage.getItem('token')}});
    const userData = await res.json();

    username.textContent = userData.username;
    usermail.textContent = userData.email;

    res = await fetch(apiUrl + '/products');
    productList = await res.json();
    for(item of productList){
        console.log(item)
        menu.appendChild(createItem(item.name, item.price, 1));
    }
}

function createItem(name, price, quantity) {
    const el = document.createElement('div');
    el.innerHTML = `<div class="item" price="${price}">
                    <div class="info">
                        <div class="controls">
                            <button class="minus">-</button>
                            <p class="quantity">${quantity}</p>
                            <button class="plus">+</button>
                        </div>
                        <div class="productInfo">
                            <p class="productName">${name}</p>
                            <p class="productPrice">Rp. ${+quantity * +price}</p>
                        </div>
                    </div>
                    <button class="addToCart">Tambah ke keranjang</button>
                    </div>`

    el.querySelector('.minus').onmousedown = e => {
        globalInterval = setInterval(() => {
            if(e.target.nextElementSibling.innerText != '1'){
                const quantityField = e.target.nextElementSibling;
                const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
                const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
                quantityField.innerText = `${+quantityField.innerText - 1}`;
                priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
                calculateCartTotal();
            }
        }, 200)
    }

    el.querySelector('.minus').onmouseup = e => {
        clearInterval(globalInterval);
        calculateCartTotal();
    }

    el.querySelector('.minus').onclick = e => {
        clearInterval(globalInterval);
        if(e.target.nextElementSibling.innerText != '1'){
            const quantityField = e.target.nextElementSibling;
            const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
            const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
            quantityField.innerText = `${+quantityField.innerText - 1}`;
            priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
            calculateCartTotal();
        }
    }
    

    el.querySelector('.plus').onmousedown = e => {
        globalInterval = setInterval(() => {
            const quantityField = e.target.previousElementSibling;
            const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
            const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
            quantityField.innerText = `${+quantityField.innerText + 1}`;
            priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
            calculateCartTotal();
        }, 200);
    }

    el.querySelector('.plus').onmouseup = e => {
        clearInterval(globalInterval);
        calculateCartTotal();
    }

    el.querySelector('.plus').onclick = e => {
        clearInterval(globalInterval);
        const quantityField = e.target.previousElementSibling;
        const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
        const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
        quantityField.innerText = `${+quantityField.innerText + 1}`;
        priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
        calculateCartTotal()
    }

    el.querySelector('.addToCart').onclick = e => {
        const itemParent = e.target.parentElement;
        const name = itemParent.querySelector('.productName').innerText;
        const price = itemParent.attributes.price.value;
        const quantity = itemParent.querySelector('.quantity').innerText;
        cart.appendChild(createCartItem(name, price, quantity));
        itemParent.remove();
        calculateCartTotal()
    }

    return el;        
}

function createCartItem(name, price, quantity) {
    const el = document.createElement('div');
    el.innerHTML = `<div class="cartItem" price="${price}">
                    <div class="info">
                        <div class="controls">
                            <button class="minus">-</button>
                            <p class="quantity">${quantity}</p>
                            <button class="plus">+</button>
                        </div>
                        <div class="productInfo">
                            <p class="productName">${name}</p>
                            <p class="productPrice">Rp. ${+price * +quantity}</p>
                        </div>
                    </div>
                    <button class="delete">Hapus</button>
                    </div>`

    el.querySelector('.minus').onmousedown = e => {
        globalInterval = setInterval(() => {
            if(e.target.nextElementSibling.innerText != '1'){
                const quantityField = e.target.nextElementSibling;
                const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
                const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
                quantityField.innerText = `${+quantityField.innerText - 1}`;
                priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
                calculateCartTotal()
            }
        }, 200)
    }

    el.querySelector('.minus').onmouseup = e => {
        clearInterval(globalInterval);
        calculateCartTotal()
    }

    el.querySelector('.minus').onclick = e => {
        clearInterval(globalInterval);
        if(e.target.nextElementSibling.innerText != '1'){
            const quantityField = e.target.nextElementSibling;
            const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
            const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
            quantityField.innerText = `${+quantityField.innerText - 1}`;
            priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
            calculateCartTotal()
        }
    }
    

    el.querySelector('.plus').onmousedown = e => {
        globalInterval = setInterval(() => {
            const quantityField = e.target.previousElementSibling;
            const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
            const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
            quantityField.innerText = `${+quantityField.innerText + 1}`;
            priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
            calculateCartTotal();
        }, 200);
    }

    el.querySelector('.plus').onmouseup = e => {
        clearInterval(globalInterval);
        calculateCartTotal();
    }

    el.querySelector('.plus').onclick = e => {
        clearInterval(globalInterval);
        const quantityField = e.target.previousElementSibling;
        const priceField = e.target.parentElement.parentElement.querySelector('.productPrice');
        const initialPrice = e.target.parentElement.parentElement.parentElement.attributes.price.value;
        quantityField.innerText = `${+quantityField.innerText + 1}`;
        priceField.innerText = `Rp. ${+initialPrice * +quantityField.innerText}`
        calculateCartTotal()
    }

    el.querySelector('.delete').onclick = e => {
        const itemParent = e.target.parentElement;
        const name = itemParent.querySelector('.productName').innerText;
        const price = itemParent.attributes.price.value;
        const quantity = itemParent.querySelector('.quantity').innerText;
        menu.appendChild(createItem(name, price, quantity));
        itemParent.remove();
        calculateCartTotal();
    }
    

    return el;        
}


function calculateCartTotal(){
    const cartItems = cart.querySelectorAll('.cartItem');
    let price = 0;
    for(item of cartItems){
        console.log(item.querySelector('.productPrice').innerText.split(' '));
        price += (+item.querySelector('.productPrice').innerText.split(' ')[1]);
    }
    total.innerText = `TOTAL : Rp. ${price}`;
}
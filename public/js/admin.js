const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const username = document.querySelector('#username');
const usermail = document.querySelector('#usermail');
const logoutButton = document.querySelector('#logout');
const menu = document.querySelector('.menu');
const cart = document.querySelector('.cart');
const search = document.querySelector('#search');
const total = document.querySelector('.total');
const productName = document.querySelector('#editNama');
const productPrice = document.querySelector('#editHarga');
const productStock = document.querySelector('#editStock');
const modal = document.querySelector('.modal');
const saveDataButton = document.querySelector('.saveData');
const addDataButton = document.querySelector('.addProduct');

let productList;
let globalInterval;

logout.onclick = e => {
    localStorage.clear();
    isLoggedIn();
}


addDataButton.onclick = e => {
    insertMode();
    productName.value = '';
    productPrice.value = '';
    productStock.value = '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
}

function editMode(){
    productName.disabled = true;
    saveDataButton.onclick = async e => {
        const data = {name: productName.value, price : productPrice.value, stock: productStock.value, operation : 'edit'};
        const options = {
            method : 'POST',
            headers : {
                'token' : localStorage.getItem('token'),
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(data)
        };
        let res = await fetch(apiUrl + '/products', options);
        const resData = await res.json();
        location.reload();
    }
}

function insertMode(){
    productName.disabled = false;
    saveDataButton.onclick = async e => {
        const data = {name: productName.value, price : productPrice.value, stock: productStock.value, operation : 'insert'};
        const options = {
            method : 'POST',
            headers : {
                'token' : localStorage.getItem('token'),
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(data)
        };
        let res = await fetch(apiUrl + '/products', options);
        const resData = await res.json();
        location.reload();
    }
}

for (closeButton of [...document.querySelectorAll('.close')]){
    closeButton.onclick = e => {
        e.target.parentElement.parentElement.parentElement.style.display = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
    }
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
    console.log(productList);

    for(item of productList){
        menu.appendChild(createItem(item.name, item.price, item.stock));
    }
}

function createItem(name, price, stock) {
    const el = document.createElement('div');
    el.innerHTML = `<div class="item" price="${price}" stock="${stock}">
                    <div class="info">
                        <div class="productInfo">
                            <p class="productName">${name}</p>
                            <p class="productPrice">Rp. ${+price} | ${stock}</p>
                        </div>
                    </div>
                    <button class="editProduct">edit</button>
                    <button class="deleteProduct">hapus</button>
                    </div>`
    
    el.querySelector('.editProduct').onclick = e => {
        editMode();
        productName.value = e.target.parentElement.querySelector('.productName').innerText;
        productPrice.value = e.target.parentElement.attributes.price.value;
        productStock.value = e.target.parentElement.attributes.stock.value;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    }

    el.querySelector('.deleteProduct').onclick = async e =>{
        productName.value = e.target.parentElement.querySelector('.productName').innerText;
        const data = {name: productName.value, operation : 'delete'};
        const options = {
            method : 'POST',
            headers : {
                'token' : localStorage.getItem('token'),
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(data)
        };
        let res = await fetch(apiUrl + '/products', options);
        const resData = await res.json();
        location.reload();
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

    if (cartItems.length != 0){
        makeTransaction.disabled = false;
        makeTransaction.classList.remove('disabled');
    }else{
        makeTransaction.disabled = true;
        makeTransaction.classList.add('disabled');
    }

    let price = 0;
    for(item of cartItems){
        price += (+item.querySelector('.productPrice').innerText.split(' ')[1]);
    }
    total.innerText = `TOTAL : Rp. ${price}`;
}

function clearCart(){
    const cartItems = cart.querySelectorAll('.cartItem');
    for(item of cartItems){
        item.querySelector('.quantity').innerText = '1';
        item.querySelector('.productPrice').innerText = item.attributes.price.value;
        item.querySelector('.delete').click();
    }
}
const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const username = document.querySelector('#username');
const usermail = document.querySelector('#usermail');
const logoutButton = document.querySelector('#logout');
const menu = document.querySelector('.menu');
const cart = document.querySelector('.cart');
const search = document.querySelector('#search');
const total = document.querySelector('.total');
const transactions = document.querySelector('.transactions');
const editUserData = document.querySelector('#editUserData');
const makeTransaction = document.querySelector('.makeTransaction');
const editUsername = document.querySelector('#editUsername');
const editPassword = document.querySelector('#editPassword');
const editEmail = document.querySelector('#editEmail');
const editAddress = document.querySelector('#editAddress');
const saveDataButton = document.querySelector('.saveData');
const filterButtons = document.querySelectorAll('.filter button');

for (filter of filterButtons){
    filter.onclick = e => {
        e.target.classList.remove('disabled');
        e.target.parentElement.querySelector('.active').classList.add('disabled');
        e.target.parentElement.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        displayFilteredTransaction();
    }
}

let productList;
let globalInterval;
let transactionList;

logout.onclick = e => {
    localStorage.clear();
    isLoggedIn();
}

editUserData.onclick = e => {
    document.querySelector('.modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
}

document.querySelector('.close').onclick = e => {
    document.querySelector('.modal').style.display = 'none';
    document.body.style.overflow = '';
    document.body.style.height = '';
}

saveDataButton.onclick = async e => {
    const data = {username : editUsername.value, password : editPassword.value, email : editEmail.value, address : editAddress.value};
    const options = {
        method : 'POST',
        headers : {
            'token' : localStorage.getItem('token'),
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    };
    let res = await fetch(apiUrl + '/userData', options);
    const resData = await res.json();
    
    if (resData.msg == 'insert data success'){
        document.querySelector('.close').click();
        window.alert('ubah data sukses');

        res = await fetch(apiUrl + '/userData', {headers : {'token' : localStorage.getItem('token'), 'username' : editUsername.value}});
        const userData = await res.json();

        username.textContent = userData.username;
        usermail.textContent = userData.email;
        editUsername.value = userData.username;
        editEmail.value = userData.email;
        editAddress.value = userData.address;

        localStorage.clear();

        res = await fetch(apiUrl + '/login', options);
        const resData = await res.json();
        localStorage.setItem('token', resData.accessToken);
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

makeTransaction.onclick = async e => {
    const cartItems = cart.querySelectorAll('.cartItem');
    let res = await fetch(apiUrl + '/tokenData', {headers : {'token' : localStorage.getItem('token')}});
    const userData = await res.json();
    let transactions = [];

    for(item of cartItems){
        const product = item.querySelector('.productName').innerText;
        const quantity = +item.querySelector('.quantity').innerText;
        const data = {user : userData.username, product : product, quantity : quantity, operation : 'insert'} 
        
        const options = {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'token' : localStorage.getItem('token')
            },
            body : JSON.stringify(data)
        }
        
        transactions.push(fetch(apiUrl + '/userTransactions', options));
    }

    Promise.all(transactions).then(e => window.alert('pemesanan berhasil'));
    clearCart();
    location.reload();
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
    editUsername.value = userData.username;
    editEmail.value = userData.email;
    editAddress.value = userData.address;

    res = await fetch(apiUrl + '/products');
    productList = await res.json();
    for(item of productList){
        menu.appendChild(createItem(item.name, item.price, 1));
    }

    res = await fetch(apiUrl + '/userTransactions', {headers : {'token' : localStorage.getItem('token')}});
    transactionList = await res.json();
    displayFilteredTransaction();
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

function createTransactionItem(name, price, quantity, username, usermail, status, id) {
    const el = document.createElement('div');

    if(status === 1){
        el.innerHTML = `<div class="transactionItem" price="${price}" id="${id}">
        <div class="info">
            <div class="controls">
                <p class="quantity">${quantity}</p>
            </div>
            <div class="productInfo">
                <p class="productName">${name}</p>
                <p class="productPrice">Rp. ${+price * +quantity} | ${username} | ${usermail}</p>
            </div>
        </div>
        <button class="cancel">Batalkan</button>
        </div>`

        el.querySelector('.cancel').onclick = async e => {
            const id = e.target.parentElement.attributes.id.value;
            const options = {
                method: 'POST',
                headers: {
                    'token': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id : id, operation : 'edit', status : 4})
            };
            const res = await fetch(apiUrl + '/userTransactions', options);
            const data = await res.json();
            location.reload();
        }

        return el;    
    }

    if(status === 2){
        el.innerHTML = `<div class="transactionItem" price="${price}" id=${id}>
        <div class="info">
            <div class="controls">
                <p class="quantity">${quantity}</p>
            </div>
            <div class="productInfo">
                <p class="productName">${name}</p>
                <p class="productPrice">Rp. ${+price * +quantity} | ${username} | ${usermail}</p>
            </div>
        </div>
        <button class="finish">Selesaikan</button>
        </div>`

        el.querySelector('.finish').onclick = async e => {
            const id = e.target.parentElement.attributes.id.value;
            const options = {
                method: 'POST',
                headers: {
                    'token': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id : id, operation : 'edit', status : 3})
            };
            const res = await fetch(apiUrl + '/userTransactions', options);
            const data = await res.json();
            location.reload();
        }

        return el;    
    }

    if(status > 2){
        el.innerHTML = `<div class="transactionItem" price="${price}" id="${id}">
        <div class="info">
            <div class="controls">
                <p class="quantity">${quantity}</p>
            </div>
            <div class="productInfo">
                <p class="productName">${name}</p>
                <p class="productPrice">Rp. ${+price * +quantity} | ${username} | ${usermail}</p>
            </div>
        </div>
        </div>`

        return el;    
    }
    
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

function displayFilteredTransaction(){
    const filter = document.querySelector('.active').innerText;
    const status = {Baru : 1, Diproses : 2, Selesai : 3, Batal : 4}
    transactions.querySelector('.scroll').innerHTML = '';
    for (tr of transactionList){

        if(tr.status == status[filter]){
            transactions.querySelector('.scroll').appendChild(createTransactionItem(tr.name, tr.price, tr.quantity, tr.user, tr.email, tr.status, tr.id))
        }
    }
}
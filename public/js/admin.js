const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const username = document.querySelector('#username');
const usermail = document.querySelector('#usermail');
const logoutButton = document.querySelector('#logout');
const menu = document.querySelector('.menu');
const transactions = document.querySelector('.transaction');
const search = document.querySelector('#search');
const total = document.querySelector('.total');
const productName = document.querySelector('#editNama');
const productPrice = document.querySelector('#editHarga');
const productStock = document.querySelector('#editStock');
const modal = document.querySelector('.modal');
const saveDataButton = document.querySelector('.saveData');
const addDataButton = document.querySelector('.addProduct');
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
let transactionList;
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

    for(item of productList){
        menu.querySelector('.scroll').appendChild(createItem(item.name, item.price, item.stock));
    }

    res = await fetch(apiUrl + '/adminTransactions', {headers : {'token' : localStorage.getItem('token')}});
    transactionList = await res.json();
    displayFilteredTransaction();
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
        <button class="confirm">Konfirmasi</button>
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
            const res = await fetch(apiUrl + '/adminTransactions', options);
            const data = await res.json();
            location.reload();
        }

        el.querySelector('.confirm').onclick = async e => {
            const id = e.target.parentElement.attributes.id.value;
            const options = {
                method: 'POST',
                headers: {
                    'token': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id : id, operation : 'edit', status : 2})
            };
            const res = await fetch(apiUrl + '/adminTransactions', options);
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
            const res = await fetch(apiUrl + '/adminTransactions', options);
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
        <button class="delete">hapus</button>
        </div>`

        el.querySelector('.delete').onclick = async e => {
            const id = e.target.parentElement.attributes.id.value;
            const options = {
                method: 'POST',
                headers: {
                    'token': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id : id, operation : 'delete'})
            };
            const res = await fetch(apiUrl + '/adminTransactions', options);
            const data = await res.json();
            location.reload();
        }
        return el;    
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
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');
const email = document.querySelector('#email');
const address = document.querySelector('#address');
const submitButton = document.querySelector('#submit');
const messageBox = document.querySelector('#message');
const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/createUser`;
const validateEmail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

isLoggedIn();
async function isLoggedIn(){
if(localStorage.getItem('token')){
    const res = await fetch(apiUrl + '/tokenData', {headers : {'token' : localStorage.getItem('token')}});
    const resData = await res.json();
    window.location.assign(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/${resData.role}.html`)
    return true;
}
    return false;
}

confirmPassword.onkeyup = e => {
    if (password.value != confirmPassword.value){
        messageBox.innerHTML = 'Password tidak sama!';
        messageBox.style.color = 'crimson';
    }else{
        messageBox.innerHTML = '';
        messageBox.style.color = '';
    }
}

email.onkeyup = e => {
    if (!validateEmail.test(email.value)){
        messageBox.innerHTML = 'Email tidak valid!';
        messageBox.style.color = 'crimson';
    }else{
        messageBox.innerHTML = '';
        messageBox.style.color = '';
    }
}

submitButton.onclick = async event => {
    inputs = document.querySelectorAll('input');
    if([...inputs].filter(e => e.value == '').length > 0){
        messageBox.innerHTML = 'Data belum lengkap! Silahkan lengkapi data.';
        messageBox.style.color = 'crimson';
    }
    else if (password.value == confirmPassword.value && [...inputs].filter(e => e.value == '').length == 0){
        const data = {username : username.value, password : password.value, email : email.value, address : address.value};
        const options = {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(data)
        };
        const res = await fetch(apiUrl, options);
        const resData = await res.json();

        if (resData.msg == 'account created'){
            messageBox.style.color = 'limegreen';
            messageBox.innerHTML = 'Pembuatan akun berhasil! Anda akan segera dialihkan ke halaman login.';
            setTimeout(e => {window.location.assign(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`)}, 3000);
        }
        else if(resData.msg.code == 'ER_DUP_ENTRY'){
            messageBox.style.color = 'crimson';
            messageBox.innerHTML = 'Username sudah terdaftar! Silahkan gunakan username lain.';
        }
        else{
            messageBox.style.color = 'crimson';
            messageBox.innerHTML = 'Pembuatan akun gagal! Silahkan coba lagi.';
        }
    }
}
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');
const email = document.querySelector('#email');
const submitButton = document.querySelector('#submit');
const messageBox = document.querySelector('#message');
const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/createUser`;

confirmPassword.onkeyup = e => {
    if (password.value != confirmPassword.value){
        messageBox.innerHTML = 'Password tidak sama!';
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
        const data = {username : username.value, password : password.value, email : email.value};
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
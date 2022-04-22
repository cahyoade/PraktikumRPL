const username = document.querySelector('#username');
const password = document.querySelector('#password');
const submitButton = document.querySelector('#submit');
const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

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
submitButton.onclick = async event => {
    const data = {username : username.value, password : password.value};
    const options = { 
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    };
    const res = await fetch(apiUrl + '/login', options);
    const resData = await res.json();
    if(resData.accessToken){
        localStorage.setItem('token', resData.accessToken);
        window.location.assign(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/${resData.role}.html`)
    };
}

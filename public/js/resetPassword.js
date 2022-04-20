const username = document.querySelector('#username');
const password = document.querySelector('#password');
const code = document.querySelector('#code');
const sendCodeButton = document.querySelector('#sendCode');
const submitButton = document.querySelector('#submit');
const apiUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const sendCodeUrl = apiUrl + `/resetRequest`;
const changePasswordUrl = apiUrl + `/resetPassword`;

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

sendCodeButton.onclick = async event => {
    const data = {username : username.value};
    const options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    };
    const res = await fetch(sendCodeUrl, options);
    const resData = await res.json();
    console.log(resData);
}
submitButton.onclick = async event => {
    const data = {username : username.value, code : code.value, password : password.value};
    const options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    };
    const res = await fetch(changePasswordUrl, options);
    const resData = await res.json();
    console.log(resData);
}

function checkPassword(str)
{
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

function checkUserName(str){
    var re = /^[a-zA-Z0-9._-]{3,}$/;
    return re.test(str)
}

const CheckRegister = (body) => {
    var {name, mail, pwd} = body;

    if(!checkUserName(name)) return {status: 400, message: "Invalid UserName!!"}
    else if(!checkPassword(pwd)) return {status: 400, message: "Weak Password!!"}

    return {status: 200, message: "Validation Successful!!"}
}

export default CheckRegister; 
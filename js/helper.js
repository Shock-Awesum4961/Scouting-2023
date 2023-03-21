function setCookie(cName, cValue, expHours) {
    let date = new Date();
    date.setTime(date.getTime() + (expHours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }  

  function deleteCookie(cName) {
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = cName + "=" + expires + "; path=/";
  }  

  function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}
  
  function pad(num, size){     return ('000000000' + num).substr(-size); }

  function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}
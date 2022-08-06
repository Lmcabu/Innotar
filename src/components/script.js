let btnOpen=document.querySelector("#uurl_b");
let input=document.querySelector("#uurl");

btnOpen.addEventListener('click',()=>{
    const Value="https://dweb.link/ipfs/"+input.value;
    window.open(Value,'_blank');
});
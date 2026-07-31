
async function carregarDashboard(){

    const resposta=await fetch("/dashboard");

    const dados=await resposta.json();

    document.getElementById("vendas").innerHTML=dados.vendas;

    document.getElementById("valor").innerHTML=dados.faturamento+" MT";

    document.getElementById("clientes").innerHTML=dados.clientes;

    document.getElementById("disp").innerHTML=dados.dispositivos;

}

async function carregarTabela(){

    const resposta=await fetch("/vendas");

    const vendas=await resposta.json();

    let html="";

    vendas.forEach(v=>{

        html+=`
        <tr>
            <td>${v.numero}</td>
            <td>${v.mb}</td>
            <td>${v.valor} MT</td>
            <td>${v.status}</td>
        </tr>
        `;

    });

    document.getElementById("lista").innerHTML=html;

}

document.getElementById("data").innerHTML=
new Date().toLocaleString();

carregarDashboard();

carregarTabela();

setInterval(()=>{

carregarDashboard();
carregarTabela();

},5000);

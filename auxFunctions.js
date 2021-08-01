const getSenhas = () => {
    return [{
        ala: "Canarana",
        value: "canarana01"
    }, {
        ala: "Campo Dourado",
        value: "campodourado01",
    }, {
        ala: "Cidade Nova",
        value: "cidadenova01",
    }, {
        ala: "Guarany",
        value: "guarany01"
    }, {
        ala: "Monte Sinai",
        value: "montesinai01",
    }, {
        ala: "Riacho Doce",
        value: "riachodoce01",
    }, {
        ala: "Estaca Guarany",
        value: "estacag01",
    }]
}

const verificaSenhaRetornaAlaSelecionada = (senha) => {
    let senhas = getSenhas();
    for (let ala of senhas) {
        if (ala.value === senha)
            return [ala, ala.ala];
    }
    alert("Senha Inválida");
    return null;
}

const limpaDiaEFiltraAla = (respostas, ala) => {
    /* Pegas as respostas e Separa por dia e Ala */
    respostas = respostas.map(resposta => {
        let data = new Date(resposta.data)
        delete resposta._id;
        return {...resposta, data: data.getDate() + "/" + data.getMonth() + "/" + data.getFullYear()}
    })
    if (ala !==  "Estaca Guarany")
        respostas = respostas.filter(resposta => resposta.ala === ala)
    return respostas;
}

const pegaDoBancoDeDados = async () => {
    let response = await axios.post("https://us-east-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/sacramental-gjbpt/service/getAlas/incoming_webhook/getRespostas")
    return response.data;
}

const criaDicionarioDeFrequencia = (respostas) => {
    let freqDict = {}
    for (let resposta of respostas) {
        if (freqDict[resposta.data]) {
            freqDict[resposta.data].push(resposta);
        } else {
            freqDict[resposta.data] = [resposta];
        }
    }
    return freqDict;
}

const removeDuplicates = (respostas) => {
    let newArr = []
    respostas.filter((item) => {
        let i = newArr.findIndex(x => (x.quantidade === item.quantidade && x.nome === item.nome));
        if (i <= -1)
            newArr.push(item);
        return null
    });
    newArr = newArr.filter((item) => item.quantidade > 0);
    return newArr;
}

const removeAllDuplicates = (datas) => {
    datas.forEach(data => {
        data[1] = removeDuplicates(data[1])
    })
}

const createHTML = (freqArray) => {
    let htmlString = "<h1>Relatório de Frequência via Zoom das Alas da Estaca Guarany</h1>\n";
    let total = 0;
    freqArray.forEach((data) => {
        let respostas = data[1];
        htmlString += `<h2>${data[0]}</h2>`;
        htmlString += `<table>
                            <thead>
                                <td>Ala</td>
                                <td>Nome da Pessoa/Família</td>
                                <td>Quantidade Assistindo</td>
                            </thead>
                           <tbody>`;
        let total = 0;
        respostas.forEach(resposta => {
            total += +resposta.quantidade;
            htmlString += `<tr>
                                <td>${resposta.ala}</td>
                                <td>${resposta.nome}</td>
                                <td>${resposta.quantidade}</td>
                            </tr>`
        });
        htmlString += `</tbody></table>`
        htmlString += `Quantidade total de pessoas no dia: ${total}`
    });
    return htmlString;
}

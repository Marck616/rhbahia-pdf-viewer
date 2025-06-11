// Inicializa o navegador controlado
document.getElementById('initBrowser').addEventListener('click', async () => {
    try {
        const response = await fetch('/init-browser');
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Erro ao iniciar navegador: ' + error.message);
    }
});

// Controle de Zoom
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');

zoomSlider.addEventListener('input', () => {
    zoomValue.textContent = `${zoomSlider.value}px`;
    ajustarTamanhoPDFs(zoomSlider.value);
});

function ajustarTamanhoPDFs(tamanho) {
    const iframes = document.querySelectorAll('.pdf-item iframe');
    iframes.forEach(iframe => {
        iframe.style.width = `${tamanho}px`;
        iframe.style.height = `${tamanho}px`;
    });
}

// Gerar PDFs
let pdfCounter = 0;

document.getElementById('gerarPDFs').addEventListener('click', async () => {
    const matricula = document.getElementById('matricula').value;
    const anoInicio = parseInt(document.getElementById('anoInicio').value);
    const mesInicio = parseInt(document.getElementById('mesInicio').value);
    const anoFim = parseInt(document.getElementById('anoFim').value);
    const mesFim = parseInt(document.getElementById('mesFim').value);

    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = '';

    if (!matricula || isNaN(anoInicio) || isNaN(mesInicio) || isNaN(anoFim) || isNaN(mesFim)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    for (let ano = anoInicio; ano <= anoFim; ano++) {
        const mesInicioCorrigido = ano === anoInicio ? mesInicio : 1;
        const mesFimCorrigido = ano === anoFim ? mesFim : 12;

        for (let mes = mesInicioCorrigido; mes <= mesFimCorrigido; mes++) {
            await criarIframe(ano, mes, matricula);
        }
    }
});

async function criarIframe(ano, mes, matricula) {
    try {
        const response = await fetch('/get-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matricula, ano, mes }),
        });

        const data = await response.json();
        
        if (response.ok) {
            pdfCounter++;
            const pdfContainer = document.getElementById('pdfContainer');
            
            const pdfItem = document.createElement('div');
            pdfItem.className = 'pdf-item';
            
            const pdfInfo = document.createElement('div');
            pdfInfo.className = 'pdf-info';
            pdfInfo.innerText = `PDF ${pdfCounter} - ${mes}/${ano}`;
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${pdfCounter}`;
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = `checkbox-${pdfCounter}`;
            checkboxLabel.innerText = "Visto";

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);

            const iframe = document.createElement('iframe');
            iframe.src = data.url;
            iframe.title = `Contracheque ${mes}/${ano}`;

            iframe.addEventListener('mouseenter', () => {
                pdfItem.classList.add('interacted');
            });

            pdfItem.appendChild(pdfInfo);
            pdfItem.appendChild(iframe);
            pdfItem.appendChild(checkboxContainer);
            pdfContainer.appendChild(pdfItem);
        } else {
            console.error(`Erro ao carregar PDF para ${mes}/${ano}: ${data.error}`);
        }
    } catch (error) {
        console.error(`Erro ao criar iframe: ${error.message}`);
    }
}
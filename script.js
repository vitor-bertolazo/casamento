const SHEET_URL =
    'https://opensheet.elk.sh/1CmD3OJWRxAvD5wZb_z8pDgttrjM4fr2_tf_Vn-HP59M/Presentes';

let presentes = [];
let categoriaAtual = null;

const PIX_CODE =
    "00020101021126330014br.gov.bcb.pix0111219579308295204000053039865802BR5925VITOR";

async function carregarDados() {

    const response = await fetch(SHEET_URL);
    presentes = await response.json();

    criarCategorias();

    categoriaAtual =
        presentes[0].Categoria;

    renderCategoria(categoriaAtual);

    renderRanking();
}

function criarCategorias() {

    const tabs =
        document.getElementById('tabs');

    tabs.innerHTML = '';

    const categorias =
        [...new Set(
            presentes.map(x => x.Categoria)
        )];

    categorias.forEach(cat => {

        const btn =
            document.createElement('button');

        btn.className = 'tab-btn';

        btn.textContent = cat;

        btn.onclick = () => {

            categoriaAtual = cat;

            document
                .querySelectorAll('.tab-btn')
                .forEach(x =>
                    x.classList.remove('active'));

            btn.classList.add('active');

            renderCategoria(cat);
        };

        tabs.appendChild(btn);
    });

    tabs.firstChild.classList.add('active');
}

function renderCategoria(categoria) {

    const container =
        document.getElementById('presentes');

    container.innerHTML = '';

    presentes
        .filter(x =>
            x.Categoria === categoria)
        .sort((a, b) => {

            const aDoado = a.Doado === 'TRUE';
            const bDoado = b.Doado === 'TRUE';

            if (aDoado !== bDoado)
                return aDoado - bDoado;

            return Number(a.Valor) - Number(b.Valor);
        })
        .forEach(item => {

            const doado =
                item.Doado === 'TRUE';

            const div =
                document.createElement('div');

            div.className =
                doado
                    ? 'item doado'
                    : 'item';

            div.innerHTML = `
                <div class="titulo">
                    ${doado ? '✅' : '⬜'}
                    ${item.Presente}
                </div>

                <div class="valor">
                    R$ ${Number(item.Valor).toFixed(2)}
                </div>

                ${doado
                    ?
                    `<div class="doador">
                        Patrocinado por ${item.Doador}
                    </div>`
                    :
                    ''
                }
            `;

            container.appendChild(div);
        });
}

function renderRanking() {

    const ranking = {};

    presentes
        .filter(x => x.Doado === 'TRUE')
        .forEach(item => {

            if (!ranking[item.Doador])
                ranking[item.Doador] = 0;

            ranking[item.Doador] += Number(item.Valor);
        });

    const ordenado =
        Object.entries(ranking)
            .sort((a, b) => b[1] - a[1]);

    const div =
        document.getElementById('ranking-list');

    div.innerHTML = '';

    const medalhas = ['🥇', '🥈', '🥉'];

    const titulos = [
        "🍺 Mestre Cervejeiro",
        "🍷 Sommelier Honorário",
        "🌊 Rei/Rainha da Praia"
    ];

    ordenado.slice(0, 3).forEach(([nome], index) => {

        const item = document.createElement('div');

        item.className = 'ranking-item';

        item.innerHTML = `
            <div class="ranking-info">

                <div class="ranking-nome">

                    <span class="ranking-medalha">
                        ${medalhas[index]}
                    </span>

                    <span class="ranking-nome-texto">
                        ${nome}
                    </span>

                </div>

                <div class="ranking-titulo">
                    ${titulos[index]}
                </div>

            </div>
        `;

        div.appendChild(item);

    });

}

function renderTotal() {

    const total =
        presentes
            .filter(x =>
                x.Doado === 'TRUE')
            .reduce(
                (acc, x) =>
                    acc + Number(x.Valor),
                0
            );

    document
        .getElementById(
            'total-arrecadado'
        )
        .innerHTML =
        `🍺 Total patrocinado: <strong>R$ ${total.toFixed(2)}</strong>`;
}

carregarDados();

setInterval(
    carregarDados,
    30000
);

document
    .getElementById('copiar-pix')
    .addEventListener('click', async () => {

        const botao =
            document.getElementById('copiar-pix');

        try {

            await navigator.clipboard.writeText(
                PIX_CODE
            );

            botao.textContent =
                '✅ Código PIX copiado!';

            botao.classList.add(
                'copiado'
            );

            setTimeout(() => {

                botao.textContent =
                    '📋 Copiar código PIX';

                botao.classList.remove(
                    'copiado'
                );

            }, 3000);

        }
        catch {

            botao.textContent =
                '❌ Erro ao copiar';

            setTimeout(() => {

                botao.textContent =
                    '📋 Copiar código PIX';

            }, 3000);

        }

    });
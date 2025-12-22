document.addEventListener('DOMContentLoaded', () => {
    const tabelaCorpo = document.getElementById('licitacoes-corpo');
    const inputFiltro = document.getElementById('filtro-busca');
    const btnLimpar = document.getElementById('limpar-busca');
    let todasLicitacoes = [];

    if (!tabelaCorpo) return;

    // Função para mapear status para classe CSS
    const getStatusClass = (status) => {
        switch (status) {
            case 'Concluída':
                return 'status-concluida';
            case 'Em Andamento':
                return 'status-andamento';
            case 'Homologada':
                return 'status-homologada';
            default:
                return '';
        }
    };

    // Função auxiliar para retornar o path do SVG
    function getSvgPath(tipo) {
        switch (tipo.toUpperCase()) {
            case 'ATA':
                return '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>'; // Download
            case 'EDITAL':
                return '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>'; // File
            case 'RESULTADO':
                return '<path d="M9 16.17l-3.59-3.59L4 14l5 5 9-9-1.41-1.41z"/>'; // Checkmark
            default:
                return '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'; // Info
        }
    }

    // Função principal para renderizar a tabela
    const renderTable = (data) => {
        tabelaCorpo.innerHTML = ''; // Limpa a tabela
        if (data.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--gray)">Nenhuma licitação encontrada.</td></tr>`;
            return;
        }

        data.forEach(licitacao => {
            const statusClass = getStatusClass(licitacao.status);
            

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Nº da Licitação">${licitacao.numero}</td>
                <td data-label="Objeto">${licitacao.objeto}</td>
                <td data-label="Data de Publicação">${licitacao.publicacao}</td>
                <td data-label="Status" class="${statusClass}">${licitacao.status}</td>
                <td data-label="Ações">
                    <a href="${licitacao.link}" target="_blank" class="btn-download" aria-label="Baixar ${licitacao.tipo_documento} ${licitacao.numero}">
                        <svg viewBox="0 0 24 24">${getSvgPath(licitacao.tipo_documento)}</svg>
                        ${licitacao.tipo_documento}
                    </a>
                </td>
            `;
            tabelaCorpo.appendChild(row);
        });
    };
    
    // Função de Filtragem
    const aplicarFiltro = () => {
        const termo = inputFiltro.value.toLowerCase().trim();
        const resultados = todasLicitacoes.filter(licitacao => 
            licitacao.numero.toLowerCase().includes(termo) ||
            licitacao.objeto.toLowerCase().includes(termo)
        );
        renderTable(resultados);
    };

    // Event Listeners para o filtro
    inputFiltro.addEventListener('input', aplicarFiltro);
    btnLimpar.addEventListener('click', () => {
        inputFiltro.value = '';
        aplicarFiltro();
        inputFiltro.focus();
    });

    // Função para buscar os dados JSON
    fetch('assets/data/licitacoes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados de licitações.');
            }
            return response.json();
        })
        .then(licitacoes => {
    // Ordena por data (as mais recentes primeiro)
    // Assume que a data está no formato DD/MM/AAAA no JSON
    todasLicitacoes = licitacoes.sort((a, b) => {
        const dateA = new Date(a.publicacao.split('/').reverse().join('-'));
        const dateB = new Date(b.publicacao.split('/').reverse().join('-'));
        return dateB - dateA;
    });
    renderTable(todasLicitacoes);
})
        .catch(error => {
            console.error('Erro:', error);
            // Mostrar uma mensagem de erro na tabela para o usuário
            tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--red)">Não foi possível carregar as licitações. Tente novamente mais tarde.</td></tr>`;
        });
});
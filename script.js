// Elementos do DOM
const matrixInput = document.getElementById('matrix-input');
const findPathBtn = document.getElementById('find-path-btn');
const resultText = document.getElementById('result-text');
const pathVisualization = document.getElementById('path-visualization');
const matrixContainer = document.getElementById('matrix-container');

// Event Listeners
findPathBtn.addEventListener('click', processMatrix);

/**
 * Processa a matriz inserida pelo usuário e inicia a busca pelo tesouro
 */
function processMatrix() {
    // Limpa mensagens anteriores
    resultText.className = '';

    try {
        // Tenta converter a entrada do usuário em uma matriz
        const inputValue = matrixInput.value.trim();

        // Valida se o usuário inseriu algum valor
        if (!inputValue) {
            throw new Error('Por favor, insira uma matriz válida para começar a busca.');
        }

        // Converte a string em matriz JavaScript
        const matrix = JSON.parse(inputValue);

        // Valida se é uma matriz válida
        if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
            throw new Error('A entrada não parece ser uma matriz válida. Use o formato [[1,0,2,0],[1,0,1,2]]');
        }

        // Inicia a navegação pelo labirinto
        const result = findPath(matrix);
        displayResult(result, matrix);

    } catch (error) {
        // Exibe mensagem de erro amigável
        resultText.textContent = `Erro: ${error.message}`;
        resultText.className = 'error';
        pathVisualization.classList.add('hidden');
    }
}

/**
 * Encontra um caminho na matriz de comandos usando BFS (Busca em Largura)
 * @param {Array<Array<number>>} matrix - Matriz de comandos do labirinto
 * @returns {Object} Resultado da navegação com caminho percorrido
 */
function findPath(matrix) {
    // Obtém as dimensões da matriz
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Posição inicial e do tesouro
    const start = { x: 0, y: 0 };
    const end = { x: 3, y: 3 }; // Posição fixa do tesouro (3,3)

    // Define movimentos possíveis: direita, esquerda, cima, baixo
    const directions = [
        { dx: 1, dy: 0, name: 'direita' },   // Direita
        { dx: -1, dy: 0, name: 'esquerda' }, // Esquerda
        { dx: 0, dy: -1, name: 'cima' },     // Cima
        { dx: 0, dy: 1, name: 'baixo' }      // Baixo
    ];

    // Mapeia os comandos aos índices das direções
    const commandToDirection = {
        '1': 0,   // direita
        '-1': 1,  // esquerda
        '2': 2,   // cima
        '-2': 3,  // baixo
        '0': -1   // especial: tentar todas as direções
    };

    // Inicializa a fila para BFS (Busca em Largura)
    const queue = [];
    queue.push({
        position: start,
        path: [start],
        visited: new Set([`${start.x},${start.y}`])
    });

    while (queue.length > 0) {
        const { position, path, visited } = queue.shift();
        const { x, y } = position;

        // Verifica se chegamos ao destino
        if (x === end.x && y === end.y) {
            return {
                success: true,
                message: 'Você chegou ao tesouro! Parabéns, Pirata do Código! 🏆',
                path: path
            };
        }

        // Obtém o comando na posição atual
        const command = matrix[y][x].toString();
        const directionIndex = commandToDirection[command];

        // Se o comando for 0, tentamos todas as direções
        if (directionIndex === -1) {
            for (let i = 0; i < directions.length; i++) {
                tryDirection(x, y, i, path, visited);
            }
        }
        // Caso contrário, seguimos a direção específica
        else if (directionIndex !== undefined) {
            tryDirection(x, y, directionIndex, path, visited);
        }
        // Comando desconhecido
        else {
            return {
                success: false,
                message: `Comando desconhecido ${command} encontrado na posição (${x}, ${y})`,
                path: path
            };
        }
    }

    // Se a fila estiver vazia e não encontramos o destino
    return {
        success: false,
        message: 'Não foi possível encontrar um caminho até o tesouro.',
        path: [start]
    };

    // Função auxiliar para tentar mover em uma direção
    function tryDirection(x, y, directionIndex, currentPath, currentVisited) {
        const direction = directions[directionIndex];
        const newX = x + direction.dx;
        const newY = y + direction.dy;
        const newPosKey = `${newX},${newY}`;

        // Verifica se está dentro dos limites
        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
            return;
        }

        // Verifica se já visitamos esta posição
        if (currentVisited.has(newPosKey)) {
            return;
        }

        // Cria novo estado para a fila
        const newVisited = new Set(currentVisited);
        newVisited.add(newPosKey);

        const newPath = [...currentPath, { x: newX, y: newY }];

        queue.push({
            position: { x: newX, y: newY },
            path: newPath,
            visited: newVisited
        });
    }
}

/**
 * Exibe o resultado da navegação na interface
 * @param {Object} result - Resultado da navegação
 * @param {Array<Array<number>>} matrix - Matriz original
 */
function displayResult(result, matrix) {
    // Atualiza o texto do resultado
    resultText.textContent = result.message;
    resultText.className = result.success ? 'success' : 'error';

    // Mostra a visualização do caminho
    pathVisualization.classList.remove('hidden');

    // Limpa o container da matriz
    matrixContainer.innerHTML = '';

    // Cria uma representação visual da matriz e do caminho
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Conjunto para verificar rapidamente se uma posição faz parte do caminho
    const pathSet = new Set(result.path.map(pos => `${pos.x},${pos.y}`));

    // Registra o caminho como uma sequência de movimentos para debug
    console.log("Caminho percorrido:", result.path.map(pos => `(${pos.x},${pos.y})`).join(' -> '));

    // Cria células para cada posição da matriz
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = matrix[y][x];

            // Marca as células especiais
            const posKey = `${x},${y}`;

            // Marca o início (0,0)
            if (x === 0 && y === 0) {
                cell.classList.add('start');
                cell.setAttribute('title', 'Ponto de partida (0,0)');
            }
            // Marca o final (3,3) ou a posição do tesouro
            else if (x === 3 && y === 3) {
                cell.classList.add('end');
                cell.setAttribute('title', 'Tesouro (3,3)');
            }

            // Marca o caminho percorrido
            if (pathSet.has(posKey)) {
                cell.classList.add('path');

                // Adiciona o número de ordem no caminho
                const pathIndex = result.path.findIndex(pos => pos.x === x && pos.y === y);
                if (pathIndex !== -1) {
                    const badge = document.createElement('span');
                    badge.className = 'path-order';
                    badge.textContent = pathIndex + 1;
                    cell.appendChild(badge);
                }
            }

            // Adiciona a coordenada como data attribute
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);

            matrixContainer.appendChild(cell);
        }
    }

    // Adiciona CSS adicional para o número de ordem do caminho
    if (!document.getElementById('path-order-style')) {
        const style = document.createElement('style');
        style.id = 'path-order-style';
        style.textContent = `
            .path-order {
                position: absolute;
                bottom: 2px;
                right: 2px;
                font-size: 9px;
                background: rgba(49, 110, 244, 0.8);
                border-radius: 50%;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    // Scroll para o resultado
    resultText.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Preenche o textarea com o exemplo padrão se estiver vazio
window.addEventListener('DOMContentLoaded', () => {
    if (!matrixInput.value) {
        matrixInput.value = '[[1, 0, 2, 0], [1, 0, 1, 2], [0, -1, -2, 2], [0, 0, 1, 2]]';
    }
});
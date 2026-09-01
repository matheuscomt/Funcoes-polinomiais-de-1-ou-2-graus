/* ============================================
   MISSÃO MATEMÁTICA - SCRIPT PRINCIPAL
   Funções polinomiais de 1º e 2º graus
   ============================================ */

'use strict';

// ============================================
// INICIALIZAÇÃO GERAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    criarCampoEstrelado();
    inicializarNavegacao();
    inicializarContadores();
    inicializarMissoes();
    inicializarQuiz();
    inicializarScrollEffects();
    inicializarBotaoTopo();
});

// ============================================
// CAMPO ESTRELADO ANIMADO
// ============================================
function criarCampoEstrelado() {
    const starfield = document.getElementById('starfield');
    const numEstrelas = 150;

    for (let i = 0; i < numEstrelas; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'star';
        const tamanho = Math.random() * 3 + 1;
        estrela.style.width = tamanho + 'px';
        estrela.style.height = tamanho + 'px';
        estrela.style.top = Math.random() * 100 + '%';
        estrela.style.left = Math.random() * 100 + '%';
        estrela.style.animationDelay = Math.random() * 3 + 's';
        estrela.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starfield.appendChild(estrela);
    }
}

// ============================================
// NAVEGAÇÃO
// ============================================
function inicializarNavegacao() {
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    const navLinks = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        const expanded = navList.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navList.classList.remove('active');
        });
    });

    // Atualiza link ativo conforme scroll
    window.addEventListener('scroll', () => {
        const secoes = document.querySelectorAll('section[id]');
        let atual = '';
        secoes.forEach(secao => {
            const topo = secao.offsetTop - 100;
            if (window.scrollY >= topo) {
                atual = secao.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + atual) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// CONTADORES ANIMADOS
// ============================================
function inicializarContadores() {
    const contadores = document.querySelectorAll('.stat-number');
    const duracao = 2000;

    contadores.forEach(contador => {
        const alvo = parseInt(contador.dataset.target);
        let inicio = 0;
        const incremento = alvo / (duracao / 16);

        const atualizar = () => {
            inicio += incremento;
            if (inicio < alvo) {
                contador.textContent = Math.ceil(inicio);
                requestAnimationFrame(atualizar);
            } else {
                contador.textContent = alvo;
            }
        };
        atualizar();
    });
}

// ============================================
// FUNÇÕES MATEMÁTICAS UTILITÁRIAS
// ============================================
const Mat = {
    // Função do 2º grau: f(x) = ax² + bx + c
    calcularDelta(a, b, c) {
        return b * b - 4 * a * c;
    },

    raizesSegundoGrau(a, b, c) {
        if (a === 0) return null; // Não é 2º grau
        const delta = this.calcularDelta(a, b, c);
        if (delta < 0) return { tipo: 'sem_raizes', delta };
        if (delta === 0) {
            const x = -b / (2 * a);
            return { tipo: 'uma_raiz', delta, x1: x, x2: x };
        }
        const sqrtDelta = Math.sqrt(delta);
        return {
            tipo: 'duas_raizes',
            delta,
            x1: (-b + sqrtDelta) / (2 * a),
            x2: (-b - sqrtDelta) / (2 * a)
        };
    },

    verticeSegundoGrau(a, b, c) {
        if (a === 0) return null;
        const xv = -b / (2 * a);
        const delta = this.calcularDelta(a, b, c);
        const yv = -delta / (4 * a);
        return { xv, yv };
    },

    // Função do 1º grau: f(x) = ax + b
    zeroPrimeiroGrau(a, b) {
        if (a === 0) return null;
        return -b / a;
    },

    formatarNumero(n, casas = 2) {
        if (n === null || n === undefined || isNaN(n)) return 'N/A';
        return Number(n).toFixed(casas);
    },

    formatarFuncao2(a, b, c) {
        let s = 'f(t) = ';
        if (a !== 0) s += (a === 1 ? '' : a === -1 ? '-' : a) + 't²';
        if (b !== 0) {
            if (a !== 0) s += (b > 0 ? ' + ' : ' - ');
            else if (b < 0) s += '-';
            const absB = Math.abs(b);
            s += (absB === 1 ? '' : absB) + 't';
        }
        if (c !== 0) {
            if (a !== 0 || b !== 0) s += (c > 0 ? ' + ' : ' - ');
            else if (c < 0) s += '-';
            s += Math.abs(c);
        }
        return s;
    },

    formatarFuncao1(a, b) {
        let s = 'f(t) = ';
        if (a !== 0) s += (a === 1 ? '' : a === -1 ? '-' : a) + 't';
        if (b !== 0) {
            if (a !== 0) s += (b > 0 ? ' + ' : ' - ');
            else if (b < 0) s += '-';
            s += Math.abs(b);
        }
        return s;
    }
};

// ============================================
// DESENHO DE GRÁFICOS (CANVAS)
// ============================================
const Grafico = {
    prepararCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo gradiente
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a0520');
        grad.addColorStop(1, '#15103a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        return { canvas, ctx };
    },

    desenharEixos(ctx, canvas, config) {
        const { xMin, xMax, yMin, yMax } = config;
        const padding = 50;
        const w = canvas.width - 2 * padding;
        const h = canvas.height - 2 * padding;

        // Converter coordenadas
        const toX = x => padding + ((x - xMin) / (xMax - xMin)) * w;
        const toY = y => padding + ((yMax - y) / (yMax - yMin)) * h;

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const passoX = (xMax - xMin) / 10;
        const passoY = (yMax - yMin) / 8;

        for (let x = xMin; x <= xMax; x += passoX) {
            ctx.beginPath();
            ctx.moveTo(toX(x), padding);
            ctx.lineTo(toX(x), canvas.height - padding);
            ctx.stroke();
        }
        for (let y = yMin; y <= yMax; y += passoY) {
            ctx.beginPath();
            ctx.moveTo(padding, toY(y));
            ctx.lineTo(canvas.width - padding, toY(y));
            ctx.stroke();
        }

        // Eixos principais
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        // Eixo X
        if (yMin <= 0 && yMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(padding, toY(0));
            ctx.lineTo(canvas.width - padding, toY(0));
            ctx.stroke();
        }

        // Eixo Y
        if (xMin <= 0 && xMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(toX(0), padding);
            ctx.lineTo(toX(0), canvas.height - padding);
            ctx.stroke();
        }

        // Rótulos
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '11px Exo 2';
        ctx.textAlign = 'center';

        for (let x = xMin; x <= xMax; x += passoX) {
            const val = Math.round(x * 10) / 10;
            if (yMin <= 0 && yMax >= 0) {
                ctx.fillText(val, toX(x), toY(0) + 15);
            }
        }

        ctx.textAlign = 'right';
        for (let y = yMin; y <= yMax; y += passoY) {
            const val = Math.round(y * 10) / 10;
            if (xMin <= 0 && xMax >= 0) {
                ctx.fillText(val, toX(0) - 8, toY(y) + 4);
            }
        }

        return { toX, toY, padding, w, h };
    },

    desenharFuncao2(ctx, a, b, c, config, transform, cor = '#00d9ff') {
        const { xMin, xMax } = config;
        const { toX, toY } = transform;
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3;
        ctx.shadowColor = cor;
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const passos = 200;
        let primeira = true;
        for (let i = 0; i <= passos; i++) {
            const x = xMin + (xMax - xMin) * i / passos;
            const y = a * x * x + b * x + c;
            const px = toX(x);
            const py = toY(y);
            if (primeira) {
                ctx.moveTo(px, py);
                primeira = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    desenharFuncao1(ctx, a, b, config, transform, cor = '#00ff88') {
        const { xMin, xMax } = config;
        const { toX, toY } = transform;
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3;
        ctx.shadowColor = cor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(a * xMin + b));
        ctx.lineTo(toX(xMax), toY(a * xMax + b));
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    desenharPonto(ctx, x, y, transform, cor = '#ffcc00', raio = 6, label = '') {
        const { toX, toY } = transform;
        const px = toX(x);
        const py = toY(y);

        ctx.fillStyle = cor;
        ctx.shadowColor = cor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, raio, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (label) {
            ctx.fillStyle = cor;
            ctx.font = 'bold 12px Exo 2';
            ctx.textAlign = 'center';
            ctx.fillText(label, px, py - 12);
        }
    }
};

// ============================================
// INICIALIZAÇÃO DAS MISSÕES
// ============================================
function inicializarMissoes() {
    configurarMissao1();
    configurarMissao2();
    configurarMissao3();
    configurarMissao4();
    configurarMissao5();
}

// ============================================
// MISSÃO 1: FOGUETE (2º GRAU)
// ============================================
function configurarMissao1() {
    const form = document.getElementById('formMissao1');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const a = parseFloat(document.getElementById('m1-a').value);
        const b = parseFloat(document.getElementById('m1-b').value);
        const c = parseFloat(document.getElementById('m1-c').value);
        const t = parseFloat(document.getElementById('m1-t').value);

        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(t)) {
            alert('Preencha todos os campos com valores válidos!');
            return;
        }

        // Cálculos
        const delta = Mat.calcularDelta(a, b, c);
        const raizes = Mat.raizesSegundoGrau(a, b, c);
        const vertice = Mat.verticeSegundoGrau(a, b, c);
        const altura = a * t * t + b * t + c;

        // Atualizar resultados
        document.getElementById('r1-funcao').textContent = Mat.formatarFuncao2(a, b, c);
        document.getElementById('r1-delta').textContent = Mat.formatarNumero(delta);
        document.getElementById('r1-concavidade').textContent = a > 0 ? 'Para cima ∪' : 'Para baixo ∩';

        if (raizes) {
            if (raizes.tipo === 'duas_raizes') {
                document.getElementById('r1-raizes').textContent =
                    `t₁ = ${Mat.formatarNumero(raizes.x1)}s, t₂ = ${Mat.formatarNumero(raizes.x2)}s`;
            } else if (raizes.tipo === 'uma_raiz') {
                document.getElementById('r1-raizes').textContent =
                    `t = ${Mat.formatarNumero(raizes.x1)}s (raiz dupla)`;
            } else {
                document.getElementById('r1-raizes').textContent = 'Sem raízes reais';
            }
        }

        if (vertice) {
            document.getElementById('r1-vertice').textContent =
                `(${Mat.formatarNumero(vertice.xv)}s, ${Mat.formatarNumero(vertice.yv)}m)`;
        }

        document.getElementById('r1-altura').textContent =
            `h(${t}) = ${Mat.formatarNumero(altura)}m`;

        // Desenhar gráfico
        desenharGrafico1(a, b, c, t);
    });

    // Executar uma vez ao carregar
    form.dispatchEvent(new Event('submit'));
}

function desenharGrafico1(a, b, c, tDestaque) {
    const { ctx, canvas } = Grafico.prepararCanvas('canvas1');
    const vertice = Mat.verticeSegundoGrau(a, b, c);
    const raizes = Mat.raizesSegundoGrau(a, b, c);

    // Determinar intervalo
    let xMin = 0, xMax = 10;
    if (raizes && raizes.tipo === 'duas_raizes') {
        xMin = Math.min(0, raizes.x1, raizes.x2) - 1;
        xMax = Math.max(raizes.x1, raizes.x2) + 1;
    } else if (vertice) {
        xMin = vertice.xv - 5;
        xMax = vertice.xv + 5;
    }

    const yMaxCalc = vertice ? vertice.yv * 1.2 : 100;
    const yMinCalc = Math.min(0, a * xMin * xMin + b * xMin + c, a * xMax * xMax + b * xMax + c) - 10;

    const config = { xMin, xMax, yMin: yMinCalc, yMax: yMaxCalc };
    const transform = Grafico.desenharEixos(ctx, canvas, config);
    Grafico.desenharFuncao2(ctx, a, b, c, config, transform, '#00d9ff');

    // Desenhar vértice
    if (vertice) {
        Grafico.desenharPonto(ctx, vertice.xv, vertice.yv, transform, '#ff00aa', 8,
            `V(${Mat.formatarNumero(vertice.xv, 1)}, ${Mat.formatarNumero(vertice.yv, 1)})`);
    }

    // Desenhar raízes
    if (raizes && raizes.tipo === 'duas_raizes') {
        Grafico.desenharPonto(ctx, raizes.x1, 0, transform, '#ffcc00', 6,
            `t₁=${Mat.formatarNumero(raizes.x1, 1)}`);
        Grafico.desenharPonto(ctx, raizes.x2, 0, transform, '#ffcc00', 6,
            `t₂=${Mat.formatarNumero(raizes.x2, 1)}`);
    }

    // Ponto em t destacado
    const yDestaque = a * tDestaque * tDestaque + b * tDestaque + c;
    Grafico.desenharPonto(ctx, tDestaque, yDestaque, transform, '#00ff88', 7,
        `(${Mat.formatarNumero(tDestaque, 1)}, ${Mat.formatarNumero(yDestaque, 1)})`);
}

// ============================================
// MISSÃO 2: COMBUSTÍVEL (1º GRAU)
// ============================================
function configurarMissao2() {
    const form = document.getElementById('formMissao2');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const a = parseFloat(document.getElementById('m2-a').value);
        const b = parseFloat(document.getElementById('m2-b').value);
        const t = parseFloat(document.getElementById('m2-t').value);

        if (isNaN(a) || isNaN(b) || isNaN(t)) {
            alert('Preencha todos os campos!');
            return;
        }

        const volume = a * t + b;
        const zero = Mat.zeroPrimeiroGrau(a, b);
        const tipo = a > 0 ? 'Crescente ↗' : (a < 0 ? 'Decrescente ↘' : 'Constante →');

        document.getElementById('r2-funcao').textContent = Mat.formatarFuncao1(a, b);
        document.getElementById('r2-volume').textContent =
            `C(${t}) = ${Mat.formatarNumero(volume)} litros`;
        document.getElementById('r2-zero').textContent =
            zero !== null ? `${Mat.formatarNumero(zero)} horas` : 'N/A';
        document.getElementById('r2-tipo').textContent = tipo;

        desenharGrafico2(a, b, t);
    });

    form.dispatchEvent(new Event('submit'));
}

function desenharGrafico2(a, b, tDestaque) {
    const { ctx, canvas } = Grafico.prepararCanvas('canvas2');
    const zero = Mat.zeroPrimeiroGrau(a, b);

    const xMin = 0;
    const xMax = zero !== null && zero > 0 ? zero + 2 : 20;
    const yMin = -100;
    const yMax = Math.max(b * 1.2, 100);

    const config = { xMin, xMax, yMin, yMax };
    const transform = Grafico.desenharEixos(ctx, canvas, config);
    Grafico.desenharFuncao1(ctx, a, b, config, transform, '#00ff88');

    // Ponto zero
    if (zero !== null && zero >= xMin && zero <= xMax) {
        Grafico.desenharPonto(ctx, zero, 0, transform, '#ffcc00', 7,
            `(${Mat.formatarNumero(zero, 1)}, 0)`);
    }

    // Ponto inicial
    Grafico.desenharPonto(ctx, 0, b, transform, '#ff00aa', 6,
        `(0, ${Mat.formatarNumero(b, 0)})`);

    // Ponto em t destacado
    const yDestaque = a * tDestaque + b;
    Grafico.desenharPonto(ctx, tDestaque, yDestaque, transform, '#00d9ff', 7,
        `(${Mat.formatarNumero(tDestaque, 1)}, ${Mat.formatarNumero(yDestaque, 0)})`);
}

// ============================================
// MISSÃO 3: ASTEROIDE (2º GRAU)
// ============================================
function configurarMissao3() {
    const form = document.getElementById('formMissao3');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const a = parseFloat(document.getElementById('m3-a').value);
        const b = parseFloat(document.getElementById('m3-b').value);
        const c = parseFloat(document.getElementById('m3-c').value);
        const x = parseFloat(document.getElementById('m3-x').value);

        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(x)) {
            alert('Preencha todos os campos!');
            return;
        }

        const delta = Mat.calcularDelta(a, b, c);
        const raizes = Mat.raizesSegundoGrau(a, b, c);
        const vertice = Mat.verticeSegundoGrau(a, b, c);
        const y = a * x * x + b * x + c;

        document.getElementById('r3-funcao').textContent = Mat.formatarFuncao2(a, b, c);
        document.getElementById('r3-delta').textContent = Mat.formatarNumero(delta);
        document.getElementById('r3-y').textContent = `y(${x}) = ${Mat.formatarNumero(y)}`;

        if (raizes) {
            if (raizes.tipo === 'duas_raizes') {
                document.getElementById('r3-raizes').textContent =
                    `x₁ = ${Mat.formatarNumero(raizes.x1)}, x₂ = ${Mat.formatarNumero(raizes.x2)}`;
            } else if (raizes.tipo === 'uma_raiz') {
                document.getElementById('r3-raizes').textContent =
                    `x = ${Mat.formatarNumero(raizes.x1)} (raiz dupla)`;
            } else {
                document.getElementById('r3-raizes').textContent = 'Sem raízes reais';
            }
        }

        if (vertice) {
            document.getElementById('r3-vertice').textContent =
                `(${Mat.formatarNumero(vertice.xv)}, ${Mat.formatarNumero(vertice.yv)})`;
        }

        desenharGrafico3(a, b, c, x);
    });

    form.dispatchEvent(new Event('submit'));
}

function desenharGrafico3(a, b, c, xDestaque) {
    const { ctx, canvas } = Grafico.prepararCanvas('canvas3');
    const vertice = Mat.verticeSegundoGrau(a, b, c);
    const raizes = Mat.raizesSegundoGrau(a, b, c);

    let xMin = -10, xMax = 10;
    if (raizes && raizes.tipo === 'duas_raizes') {
        xMin = Math.min(raizes.x1, raizes.x2) - 2;
        xMax = Math.max(raizes.x1, raizes.x2) + 2;
    } else if (vertice) {
        xMin = vertice.xv - 8;
        xMax = vertice.xv + 8;
    }

    const yMaxCalc = vertice ? vertice.yv * 1.3 : 50;
    const yMinCalc = Math.min(-10, a * xMin * xMin + b * xMin + c, a * xMax * xMax + b * xMax + c);

    const config = { xMin, xMax, yMin: yMinCalc, yMax: yMaxCalc };
    const transform = Grafico.desenharEixos(ctx, canvas, config);
    Grafico.desenharFuncao2(ctx, a, b, c, config, transform, '#ff00aa');

    if (vertice) {
        Grafico.desenharPonto(ctx, vertice.xv, vertice.yv, transform, '#ffcc00', 8,
            `V(${Mat.formatarNumero(vertice.xv, 1)}, ${Mat.formatarNumero(vertice.yv, 1)})`);
    }

    if (raizes && raizes.tipo === 'duas_raizes') {
        Grafico.desenharPonto(ctx, raizes.x1, 0, transform, '#00d9ff', 6);
        Grafico.desenharPonto(ctx, raizes.x2, 0, transform, '#00d9ff', 6);
    }

    const yDestaque = a * xDestaque * xDestaque + b * xDestaque + c;
    Grafico.desenharPonto(ctx, xDestaque, yDestaque, transform, '#00ff88', 7,
        `(${Mat.formatarNumero(xDestaque, 1)}, ${Mat.formatarNumero(yDestaque, 1)})`);
}

// ============================================
// MISSÃO 4: SONDA (1º GRAU)
// ============================================
function configurarMissao4() {
    const form = document.getElementById('formMissao4');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const a = parseFloat(document.getElementById('m4-a').value);
        const b = parseFloat(document.getElementById('m4-b').value);
        const t = parseFloat(document.getElementById('m4-t').value);

        if (isNaN(a) || isNaN(b) || isNaN(t)) {
            alert('Preencha todos os campos!');
            return;
        }

        const distancia = a * t + b;
        document.getElementById('r4-funcao').textContent = Mat.formatarFuncao1(a, b);
        document.getElementById('r4-distancia').textContent =
            `d(${t}) = ${Mat.formatarNumero(distancia)} km`;

        desenharGrafico4(a, b, t);
    });

    // Cálculo inverso (tempo para distância alvo)
    document.getElementById('r4-dAlvo').addEventListener('input', (e) => {
        const dAlvo = parseFloat(e.target.value);
        const a = parseFloat(document.getElementById('m4-a').value);
        const b = parseFloat(document.getElementById('m4-b').value);
        if (!isNaN(dAlvo) && a !== 0) {
            const tempo = (dAlvo - b) / a;
            document.getElementById('r4-tempo').textContent =
                `t = ${Mat.formatarNumero(tempo)} h`;
        }
    });

    form.dispatchEvent(new Event('submit'));
}

function desenharGrafico4(a, b, tDestaque) {
    const { ctx, canvas } = Grafico.prepararCanvas('canvas4');
    const xMin = 0;
    const xMax = Math.max(tDestaque * 1.5, 20);
    const yMin = 0;
    const yMax = Math.max(a * xMax + b, b * 1.2) * 1.1;

    const config = { xMin, xMax, yMin, yMax };
    const transform = Grafico.desenharEixos(ctx, canvas, config);
    Grafico.desenharFuncao1(ctx, a, b, config, transform, '#ffcc00');

    Grafico.desenharPonto(ctx, 0, b, transform, '#ff00aa', 6,
        `(0, ${Mat.formatarNumero(b, 0)})`);

    const yDestaque = a * tDestaque + b;
    Grafico.desenharPonto(ctx, tDestaque, yDestaque, transform, '#00d9ff', 7,
        `(${Mat.formatarNumero(tDestaque, 1)}, ${Mat.formatarNumero(yDestaque, 0)})`);
}

// ============================================
// MISSÃO 5: ÁREA DO CAMPO (OTIMIZAÇÃO)
// ============================================
function configurarMissao5() {
    const form = document.getElementById('formMissao5');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const perimetro = parseFloat(document.getElementById('m5-perimetro').value);
        const x = parseFloat(document.getElementById('m5-x').value);

        if (isNaN(perimetro) || isNaN(x)) {
            alert('Preencha todos os campos!');
            return;
        }

        const metade = perimetro / 2;
        // A(x) = x(metade - x) = -x² + metade·x
        const a = -1;
        const b = metade;
        const c = 0;

        const vertice = Mat.verticeSegundoGrau(a, b, c);
        const raizes = Mat.raizesSegundoGrau(a, b, c);
        const areaX = a * x * x + b * x + c;

        document.getElementById('r5-funcao').textContent =
            `A(x) = -x² + ${Mat.formatarNumero(metade, 0)}x`;
        document.getElementById('r5-xopt').textContent =
            vertice ? `x = ${Mat.formatarNumero(vertice.xv)}m` : 'N/A';
        document.getElementById('r5-amax').textContent =
            vertice ? `${Mat.formatarNumero(vertice.yv)} m²` : 'N/A';
        document.getElementById('r5-ax').textContent =
            `A(${x}) = ${Mat.formatarNumero(areaX)} m²`;

        if (raizes && raizes.tipo === 'duas_raizes') {
            document.getElementById('r5-raizes').textContent =
                `x₁ = ${Mat.formatarNumero(raizes.x1)}, x₂ = ${Mat.formatarNumero(raizes.x2)}`;
        }

        desenharGrafico5(a, b, c, x);
    });

    form.dispatchEvent(new Event('submit'));
}

function desenharGrafico5(a, b, c, xDestaque) {
    const { ctx, canvas } = Grafico.prepararCanvas('canvas5');
    const vertice = Mat.verticeSegundoGrau(a, b, c);
    const raizes = Mat.raizesSegundoGrau(a, b, c);

    let xMin = 0, xMax = b * 1.2;
    if (raizes && raizes.tipo === 'duas_raizes') {
        xMin = Math.min(0, raizes.x1, raizes.x2) - 5;
        xMax = Math.max(raizes.x1, raizes.x2) + 5;
    }

    const yMaxCalc = vertice ? vertice.yv * 1.2 : 100;
    const yMinCalc = Math.min(-100, a * xMin * xMin + b * xMin + c, a * xMax * xMax + b * xMax + c);

    const config = { xMin, xMax, yMin: yMinCalc, yMax: yMaxCalc };
    const transform = Grafico.desenharEixos(ctx, canvas, config);
    Grafico.desenharFuncao2(ctx, a, b, c, config, transform, '#00ff88');

    if (vertice) {
        Grafico.desenharPonto(ctx, vertice.xv, vertice.yv, transform, '#ffcc00', 8,
            `MÁXIMO (${Mat.formatarNumero(vertice.xv, 1)}, ${Mat.formatarNumero(vertice.yv, 0)})`);
    }

    if (raizes && raizes.tipo === 'duas_raizes') {
        Grafico.desenharPonto(ctx, raizes.x1, 0, transform, '#ff00aa', 6);
        Grafico.desenharPonto(ctx, raizes.x2, 0, transform, '#ff00aa', 6);
    }

    const yDestaque = a * xDestaque * xDestaque + b * xDestaque + c;
    Grafico.desenharPonto(ctx, xDestaque, yDestaque, transform, '#00d9ff', 7,
        `(${Mat.formatarNumero(xDestaque, 1)}, ${Mat.formatarNumero(yDestaque, 0)})`);
}

// ============================================
// QUIZ / DESAFIO FINAL
// ============================================
const perguntasQuiz = [
    {
        pergunta: 'Um foguete tem altura dada por h(t) = -5t² + 40t + 20. Qual a altura máxima?',
        opcoes: ['60 m', '80 m', '100 m', '120 m'],
        correta: 2,
        explicacao: 'O vértice tem Yv = -Δ/4a. Δ = 1600+400 = 2000. Yv = -2000/(-20) = 100m.'
    },
    {
        pergunta: 'A função C(t) = -50t + 1000 representa o combustível. Quando acaba?',
        opcoes: ['10 horas', '15 horas', '20 horas', '25 horas'],
        correta: 2,
        explicacao: 'Igualando a zero: -50t + 1000 = 0 → t = 1000/50 = 20 horas.'
    },
    {
        pergunta: 'Em f(x) = -0,5x² + 4x + 10, qual o valor do Δ (delta)?',
        opcoes: ['16', '24', '36', '48'],
        correta: 2,
        explicacao: 'Δ = b² - 4ac = 16 - 4(-0,5)(10) = 16 + 20 = 36.'
    },
    {
        pergunta: 'Uma sonda segue d(t) = 20000t + 500. Qual a distância após 5h?',
        opcoes: ['100.000 km', '100.500 km', '105.000 km', '150.000 km'],
        correta: 1,
        explicacao: 'd(5) = 20000(5) + 500 = 100000 + 500 = 100.500 km.'
    },
    {
        pergunta: 'Um campo retangular de perímetro 200m tem área A(x) = -x² + 100x. Área máxima?',
        opcoes: ['2000 m²', '2500 m²', '3000 m²', '5000 m²'],
        correta: 1,
        explicacao: 'Vértice: Xv = -100/(-2) = 50. Yv = -2500+5000 = 2500 m².'
    }
];

let perguntaAtual = 0;
let pontuacao = 0;
let respostasUsuario = [];

function inicializarQuiz() {
    document.getElementById('totalQ').textContent = perguntasQuiz.length;
    renderizarPergunta();

    document.getElementById('btnNext').addEventListener('click', proximaPergunta);
    document.getElementById('btnPrev').addEventListener('click', perguntaAnterior);
    document.getElementById('btnRestart').addEventListener('click', reiniciarQuiz);
}

function renderizarPergunta() {
    const p = perguntasQuiz[perguntaAtual];
    document.getElementById('questionText').textContent = p.pergunta;
    document.getElementById('currentQ').textContent = perguntaAtual + 1;

    const opcoesDiv = document.getElementById('quizOptions');
    opcoesDiv.innerHTML = '';

    p.opcoes.forEach((opcao, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opcao;
        btn.addEventListener('click', () => selecionarOpcao(idx));

        if (respostasUsuario[perguntaAtual] === idx) {
            btn.classList.add('selected');
        }

        opcoesDiv.appendChild(btn);
    });

    // Atualizar barra de progresso
    const progresso = ((perguntaAtual + 1) / perguntasQuiz.length) * 100;
    document.getElementById('progressFill').style.width = progresso + '%';

    // Atualizar botões
    document.getElementById('btnPrev').disabled = perguntaAtual === 0;
    document.getElementById('btnNext').textContent =
        perguntaAtual === perguntasQuiz.length - 1 ? 'Finalizar 🏁' : 'Próxima →';

    // Mostrar feedback se já respondida
    mostrarFeedback();
}

function selecionarOpcao(idx) {
    respostasUsuario[perguntaAtual] = idx;
    const opcoes = document.querySelectorAll('.quiz-option');
    opcoes.forEach(o => o.classList.remove('selected'));
    opcoes[idx].classList.add('selected');
    mostrarFeedback();
}

function mostrarFeedback() {
    const feedback = document.getElementById('quizFeedback');
    const p = perguntasQuiz[perguntaAtual];
    const resp = respostasUsuario[perguntaAtual];

    if (resp === undefined) {
        feedback.innerHTML = '';
        feedback.className = 'quiz-feedback';
        return;
    }

    const opcoes = document.querySelectorAll('.quiz-option');
    opcoes.forEach((o, idx) => {
        o.classList.remove('correct', 'wrong');
        if (idx === p.correta) o.classList.add('correct');
        else if (idx === resp && idx !== p.correta) o.classList.add('wrong');
    });

    if (resp === p.correta) {
        feedback.className = 'quiz-feedback correct';
        feedback.innerHTML = `✅ <strong>Correto!</strong> ${p.explicacao}`;
    } else {
        feedback.className = 'quiz-feedback wrong';
        feedback.innerHTML = `❌ <strong>Incorreto.</strong> ${p.explicacao}`;
    }
}

function proximaPergunta() {
    if (respostasUsuario[perguntaAtual] === undefined) {
        alert('Selecione uma resposta antes de continuar!');
        return;
    }

    if (perguntaAtual < perguntasQuiz.length - 1) {
        perguntaAtual++;
        renderizarPergunta();
    } else {
        finalizarQuiz();
    }
}

function perguntaAnterior() {
    if (perguntaAtual > 0) {
        perguntaAtual--;
        renderizarPergunta();
    }
}

function finalizarQuiz() {
    pontuacao = 0;
    respostasUsuario.forEach((resp, idx) => {
        if (resp === perguntasQuiz[idx].correta) pontuacao++;
    });

    document.getElementById('quizContainer').classList.add('hidden');
    const result = document.getElementById('quizResult');
    result.classList.remove('hidden');
    document.getElementById('scoreValue').textContent = pontuacao;

    let msg = '';
    if (pontuacao === 5) msg = '🌟 Perfeito! Você é um Comandante Matemático de elite!';
    else if (pontuacao >= 4) msg = '🚀 Excelente! Quase perfeito, continue assim!';
    else if (pontuacao >= 3) msg = '✨ Bom trabalho! Revise os conceitos e tente novamente.';
    else if (pontuacao >= 2) msg = '📚 Continue estudando! A prática leva à perfeição.';
    else msg = '💪 Não desista! Revise a teoria e tente mais uma vez.';

    document.getElementById('scoreMessage').textContent = msg;
}

function reiniciarQuiz() {
    perguntaAtual = 0;
    pontuacao = 0;
    respostasUsuario = [];
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    renderizarPergunta();
}

// ============================================
// EFEITOS DE SCROLL
// ============================================
function inicializarScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.theory-card, .mission-section, .about-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================
function inicializarBotaoTopo() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// FIM DO SCRIPT
// ============================================
console.log('%c🚀 Missão Matemática carregada com sucesso!', 'color: #00d9ff; font-size: 16px; font-weight: bold;');
console.log('%cBons estudos, Comandante!', 'color: #ffcc00; font-size: 12px;');

//=============================================================================
// ControlesMobile.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Adiciona controles virtuais na tela (D-Pad + OK + Voltar/Menu) com detecção de plataforma e modo de teste.
 * @author Projeto Chronos
 *
 * @param Modo de Exibicao
 * @type select
 * @option Sempre Visivel (Modo Teste / PC + Mobile)
 * @value sempre
 * @option Automatico (Apenas Celular / Tablet)
 * @value auto
 * @option Desativado
 * @value off
 * @desc Define quando os botões virtuais devem aparecer na tela. Use "sempre" para testar no PC.
 * @default sempre
 *
 * @param Opacidade dos Botoes
 * @type number
 * @decimals 2
 * @min 0.10
 * @max 1.00
 * @desc Opacidade dos botões na tela (0.10 a 1.00). Padrão: 0.80
 * @default 0.80
 *
 * @param Adicionar Voltar nas Opcoes
 * @type boolean
 * @on Sim
 * @off Não
 * @desc Adiciona também um comando "Voltar" no final da lista do menu de Opções.
 * @default true
 *
 * @help
 * ============================================================================
 * ControlesMobile.js - Controles Virtuais para RPG Maker MV
 * ============================================================================
 * Este plugin cria um controle virtual completo sobre a tela do jogo:
 * - Setas Direcionais (Cima, Baixo, Esquerda, Direita) no canto inferior esquerdo.
 * - Botão OK (Ação / Confirmar) no canto inferior direito.
 * - Botão VOLTAR (Cancelar / Abrir e Fechar Menu) no canto inferior direito.
 * - Opção "Voltar" dentro da janela de Opções do jogo.
 *
 * COMO USAR:
 * 1. Salve este arquivo como "ControlesMobile.js" na pasta "js/plugins/".
 * 2. Ative-o no Gerenciador de Plugins do RPG Maker MV.
 * 3. Por padrão, o parâmetro "Modo de Exibicao" vem como "sempre" para que
 *    você possa testar todos os botões direto no computador (Playtest).
 * 4. Quando quiser que apareça apenas nos celulares dos alunos, mude o
 *    parâmetro "Modo de Exibicao" para "auto".
 *
 * ATALHO DE TESTE NO TECLADO:
 * - Pressione a tecla F10 durante o teste no PC para mostrar/ocultar os
 *   botões na tela a qualquer momento.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ControlesMobile');
    var modoExibicao = String(parameters['Modo de Exibicao'] || 'sempre');
    var opacidadeBase = Number(parameters['Opacidade dos Botoes'] || 0.80);
    var adicionarVoltarOpcoes = String(parameters['Adicionar Voltar nas Opcoes'] || 'true') === 'true';

    // Controle de pulsos para garantir que toques rápidos (< 1 frame) sejam lidos pelo motor
    var estadoSegurando = {};
    var pulsoPendente = {};

    function pressionarTeclaVirtual(keyName) {
        estadoSegurando[keyName] = true;
        pulsoPendente[keyName] = true;
        Input._currentState[keyName] = true;
    }

    function soltarTeclaVirtual(keyName) {
        estadoSegurando[keyName] = false;
        if (!pulsoPendente[keyName]) {
            Input._currentState[keyName] = false;
        }
    }

    var _Input_update = Input.update;
    Input.update = function() {
        _Input_update.call(this);
        for (var key in pulsoPendente) {
            if (pulsoPendente[key]) {
                pulsoPendente[key] = false;
                if (!estadoSegurando[key]) {
                    Input._currentState[key] = false;
                }
            }
        }
    };

    var _Input_clear = Input.clear;
    Input.clear = function() {
        _Input_clear.call(this);
        estadoSegurando = {};
        pulsoPendente = {};
    };

    // Detecta se é dispositivo móvel / tela sensível ao toque
    function isDispositivoMobile() {
        return Utils.isMobileDevice() ||
               (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
               ('ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }

    function deveMostrarControles() {
        if (modoExibicao === 'off') return false;
        if (modoExibicao === 'sempre') return true;
        return isDispositivoMobile();
    }

    // Inicializa os botões ao carregar o jogo
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        criarInterfaceControles();
        atualizarVisibilidadeControles();
    };

    function atualizarVisibilidadeControles() {
        var container = document.getElementById('chronos-mobile-controls');
        if (container) {
            container.style.display = deveMostrarControles() ? 'block' : 'none';
        }
    }

    function criarInterfaceControles() {
        if (document.getElementById('chronos-mobile-controls')) return;

        var container = document.createElement('div');
        container.id = 'chronos-mobile-controls';
        container.style.cssText = [
            'position: fixed',
            'inset: 0',
            'pointer-events: none',
            'z-index: 99999',
            'user-select: none',
            '-webkit-user-select: none',
            'touch-action: none'
        ].join(';');

        var estiloBase = [
            'position: absolute',
            'pointer-events: auto',
            'color: #ffffff',
            'background: rgba(18, 22, 34, ' + opacidadeBase + ')',
            'border: 2px solid rgba(170, 195, 255, 0.75)',
            'font-family: GameFont, sans-serif',
            'font-weight: bold',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'touch-action: none',
            'outline: none',
            'cursor: pointer',
            'box-shadow: 0 3px 8px rgba(0, 0, 0, 0.55)',
            'transition: transform 0.05s ease, background 0.05s ease'
        ].join(';');

        function criarBotao(rotuloHtml, cssPosicao, keyName) {
            var btn = document.createElement('div');
            btn.innerHTML = rotuloHtml;
            btn.style.cssText = estiloBase + ';' + cssPosicao;

            var ativar = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                btn.style.background = 'rgba(65, 105, 180, 0.95)';
                btn.style.transform = 'scale(0.92)';
                pressionarTeclaVirtual(keyName);
            };

            var desativar = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                btn.style.background = 'rgba(18, 22, 34, ' + opacidadeBase + ')';
                btn.style.transform = 'scale(1)';
                soltarTeclaVirtual(keyName);
            };

            var bloquearPropagacao = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            };

            // Eventos Touch (Celular/Tablet)
            btn.addEventListener('touchstart', ativar, { passive: false });
            btn.addEventListener('touchend', desativar, { passive: false });
            btn.addEventListener('touchcancel', desativar, { passive: false });
            btn.addEventListener('touchmove', bloquearPropagacao, { passive: false });

            // Eventos Mouse (Para testar clicando pelo PC)
            btn.addEventListener('mousedown', ativar);
            btn.addEventListener('mouseup', desativar);
            btn.addEventListener('mouseleave', desativar);
            btn.addEventListener('click', bloquearPropagacao);

            container.appendChild(btn);
        }

        // 1. D-PAD (Setas Direcionais no Canto Inferior Esquerdo)
        var cssDpad = 'width: 56px; height: 56px; border-radius: 12px; font-size: 24px;';
        criarBotao('&#9650;', cssDpad + 'bottom: 136px; left: 78px;', 'up');
        criarBotao('&#9660;', cssDpad + 'bottom: 24px;  left: 78px;', 'down');
        criarBotao('&#9664;', cssDpad + 'bottom: 80px;  left: 22px;', 'left');
        criarBotao('&#9654;', cssDpad + 'bottom: 80px;  left: 134px;', 'right');

        // 2. BOTÃO VOLTAR / MENU (Canto Inferior Direito - Esquerda)
        criarBotao(
            '&#8617; VOLTAR',
            'width: 104px; height: 58px; border-radius: 29px; font-size: 15px; bottom: 32px; right: 130px;',
            'escape'
        );

        // 3. BOTÃO OK / AÇÃO (Canto Inferior Direito - Direita)
        criarBotao(
            'OK',
            'width: 84px; height: 68px; border-radius: 34px; font-size: 18px; bottom: 68px; right: 26px;',
            'ok'
        );

        document.body.appendChild(container);

        // Atalho F10 no teclado para ligar/desligar os botões na tela durante testes
        window.addEventListener('keydown', function(e) {
            if (e.keyCode === 121) { // F10
                var el = document.getElementById('chronos-mobile-controls');
                if (el) {
                    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
                }
            }
        });
    }

    // =========================================================================
    // ADICIONA A OPÇÃO "VOLTAR" DENTRO DA JANELA DE OPÇÕES DO JOGO
    // =========================================================================
    if (adicionarVoltarOpcoes) {
        var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
        Window_Options.prototype.makeCommandList = function() {
            _Window_Options_makeCommandList.call(this);
            this.addCommand('Voltar', 'cancel');
        };

        var _Window_Options_drawItem = Window_Options.prototype.drawItem;
        Window_Options.prototype.drawItem = function(index) {
            if (this.commandSymbol(index) === 'cancel') {
                var rect = this.itemRectForText(index);
                this.resetTextColor();
                this.changePaintOpacity(true);
                this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
            } else {
                _Window_Options_drawItem.call(this, index);
            }
        };

        var _Window_Options_processOk = Window_Options.prototype.processOk;
        Window_Options.prototype.processOk = function() {
            if (this.commandSymbol(this.index()) === 'cancel') {
                this.processCancel();
            } else {
                _Window_Options_processOk.call(this);
            }
        };
    }
})();

//=============================================================================
// ChoiceWordWrap.js
//=============================================================================

/*:
 * @plugindesc v1.0 Quebra de linha automática nas opções de escolha (Show Choices).
 *
 * @param Max Width
 * @text Largura máxima da janela
 * @type number
 * @min 0
 * @desc Largura máxima (em pixels) da janela de escolhas.
 * 0 = automático (60% da largura da tela).
 * @default 0
 *
 * @help
 * ============================================================================
 * Como funciona
 * ============================================================================
 * Quando o texto de uma opção é mais largo que a janela de escolhas, ele é
 * quebrado em várias linhas, sempre nos espaços. A janela cresce em altura
 * para acomodar as linhas.
 *
 * Todas as opções de uma mesma escolha ficam com a mesma altura (a da opção
 * com mais linhas), para o cursor ficar uniforme.
 *
 * Para forçar uma quebra manual, escreva <br> no texto da opção:
 *   Aceitar a missão<br>(sem volta)
 *
 * Códigos de texto como \C[2], \I[1] e \V[1] continuam funcionando.
 *
 * Se você usa outros plugins que alteram a janela de escolhas, coloque este
 * plugin ABAIXO deles na lista do Gerenciador de Plugins e teste.
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ChoiceWordWrap');
    var paramMaxWidth = Number(parameters['Max Width'] || 0);

    //-------------------------------------------------------------------------
    // Quebra de texto
    //-------------------------------------------------------------------------

    // Largura máxima (em pixels) disponível para o texto de uma linha.
    Window_ChoiceList.prototype.wrapLimit = function() {
        var windowMax = paramMaxWidth > 0 ? paramMaxWidth :
                        Math.floor(Graphics.boxWidth * 0.6);
        windowMax = Math.min(windowMax, Graphics.boxWidth);
        return windowMax - this.standardPadding() * 2 - this.textPadding() * 2;
    };

    // Recebe o texto de uma opção e devolve um array de linhas.
    Window_ChoiceList.prototype.wrapChoiceText = function(text, limit) {
        var result = [];
        var paragraphs = String(text).replace(/<br>/gi, '\n').split('\n');
        for (var p = 0; p < paragraphs.length; p++) {
            var words = paragraphs[p].split(' ');
            var current = '';
            for (var i = 0; i < words.length; i++) {
                var test = current ? current + ' ' + words[i] : words[i];
                if (current && this.textWidthEx(test) > limit) {
                    result.push(current);
                    current = words[i];
                } else {
                    current = test;
                }
            }
            result.push(current);
        }
        return result;
    };

    // Calcula as opções já quebradas, o maior número de linhas e a maior largura.
    Window_ChoiceList.prototype.prepareWrappedChoices = function() {
        var choices = $gameMessage.choices();
        var limit = this.wrapLimit();
        var maxLines = 1;
        var maxWidth = 0;
        this._wrappedChoices = [];
        for (var i = 0; i < choices.length; i++) {
            var lines = this.wrapChoiceText(choices[i], limit);
            for (var j = 0; j < lines.length; j++) {
                var w = this.textWidthEx(lines[j]) + this.textPadding() * 2;
                if (w > maxWidth) maxWidth = w;
            }
            if (lines.length > maxLines) maxLines = lines.length;
            this._wrappedChoices.push(lines.join('\n'));
        }
        this._choiceLines = maxLines;
        this._wrappedMaxWidth = maxWidth;
    };

    //-------------------------------------------------------------------------
    // Window_ChoiceList
    //-------------------------------------------------------------------------

    var _start = Window_ChoiceList.prototype.start;
    Window_ChoiceList.prototype.start = function() {
        this.prepareWrappedChoices();
        _start.call(this);
    };

    var _makeCommandList = Window_ChoiceList.prototype.makeCommandList;
    Window_ChoiceList.prototype.makeCommandList = function() {
        if (!this._wrappedChoices) {
            _makeCommandList.call(this);
            return;
        }
        for (var i = 0; i < this._wrappedChoices.length; i++) {
            this.addCommand(this._wrappedChoices[i], 'choice');
        }
    };

    var _maxChoiceWidth = Window_ChoiceList.prototype.maxChoiceWidth;
    Window_ChoiceList.prototype.maxChoiceWidth = function() {
        if (this._wrappedMaxWidth === undefined) {
            return _maxChoiceWidth.call(this);
        }
        return Math.max(96, this._wrappedMaxWidth);
    };

    // Cada opção ocupa o número de linhas da opção mais longa.
    Window_ChoiceList.prototype.itemHeight = function() {
        return this.lineHeight() * (this._choiceLines || 1);
    };

    var _numVisibleRows = Window_ChoiceList.prototype.numVisibleRows;
    Window_ChoiceList.prototype.numVisibleRows = function() {
        // Sem quebra, mantém o comportamento original do MV.
        if (!this._wrappedChoices || this._choiceLines <= 1) {
            return _numVisibleRows.call(this);
        }
        var messageY = this._messageWindow.y;
        var messageHeight = this._messageWindow.height;
        // Espaço livre: acima da janela de mensagem ou abaixo dela.
        var available = (messageY >= Graphics.boxHeight / 2) ?
            messageY : Graphics.boxHeight - (messageY + messageHeight);
        var maxRows = Math.floor(
            (available - this.standardPadding() * 2) / this.itemHeight());
        maxRows = Math.max(1, maxRows);
        return Math.min(this._wrappedChoices.length, maxRows);
    };

    Window_ChoiceList.prototype.windowHeight = function() {
        if (!this._wrappedChoices || this._choiceLines <= 1) {
            return this.fittingHeight(this.numVisibleRows());
        }
        return this.numVisibleRows() * this.itemHeight() +
               this.standardPadding() * 2;
    };

})();

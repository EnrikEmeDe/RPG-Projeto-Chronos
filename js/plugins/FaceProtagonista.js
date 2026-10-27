(function() {
    var _Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
    Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
        var defaultActor = $dataActors[1];
        var leader = $gameParty.leader();
        if (defaultActor && leader && faceName === defaultActor.faceName && faceIndex === defaultActor.faceIndex) {
            faceName = leader.faceName();
            faceIndex = leader.faceIndex();
        }
        _Game_Message_setFaceImage.call(this, faceName, faceIndex);
    };
var _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function(text) {
        if (text) {
            text = text.replace(/\\G\[([^\/|\]]+)[\/|]([^\]]+)\]/gi, function(_, masc, fem) {
                var leader = $gameParty.leader();
                var isFemale = leader && (leader.actorId() === 2 || leader.actorId() === 4);
                return isFemale ? fem : masc;
            });
        }
        return _Window_Base_convertEscapeCharacters.call(this, text);
    };
Spriteset_Battle.prototype.compareEnemySprite = function(a, b) {
        return a.spriteId - b.spriteId;
    };
    Spriteset_Map.prototype.updateParallax = function() {
        if (this._parallaxName !== $gameMap.parallaxName()) {
            this._parallaxName = $gameMap.parallaxName();
            this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
        }
        if (this._parallax.bitmap) {
            var tileW = $gameMap.tileWidth();
            var tileH = $gameMap.tileHeight();
            var mapW = $gameMap.width() * tileW;
            var mapH = $gameMap.height() * tileH;

            if (this._parallax.bitmap.isReady() && $gameMap._parallaxZero) {
                mapW = Math.min(mapW, this._parallax.bitmap.width);
                mapH = Math.min(mapH, this._parallax.bitmap.height);
            }

            var screenX = -$gameMap.displayX() * tileW;
            var screenY = -$gameMap.displayY() * tileH;

            var x = $gameMap.isLoopHorizontal() ? 0 : Math.max(0, screenX);
            var y = $gameMap.isLoopVertical() ? 0 : Math.max(0, screenY);
            var w = $gameMap.isLoopHorizontal() ? Graphics.width : Math.max(0, Math.min(Graphics.width, screenX + mapW) - x);
            var h = $gameMap.isLoopVertical() ? Graphics.height : Math.max(0, Math.min(Graphics.height, screenY + mapH) - y);

            this._parallax.move(x, y, w, h);
            this._parallax.origin.x = (screenX > 0 && !$gameMap.isLoopHorizontal()) ? 0 : $gameMap.parallaxOx();
            this._parallax.origin.y = (screenY > 0 && !$gameMap.isLoopVertical()) ? 0 : $gameMap.parallaxOy();
        }
    };
})();
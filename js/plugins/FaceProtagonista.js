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
})();
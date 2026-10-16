(function() {
    var _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._idleTimer = Math.random() * 100;
    };

    var _Sprite_Enemy_updatePosition = Sprite_Enemy.prototype.updatePosition;
    Sprite_Enemy.prototype.updatePosition = function() {
        _Sprite_Enemy_updatePosition.call(this);
        if (!this._enemy || !this._enemy.isAlive()) {
            this.rotation = 0;
            this.scale.x = 1;
            this.scale.y = 1;
            return;
        }

        var note = this._enemy.enemy().note || "";
        if (note.indexOf("<Parado>") >= 0) return;

        this._idleTimer += 0.04;
        var t = this._idleTimer + (this._enemy.index() * 1.8);

        if (note.indexOf("<Pendulo>") >= 0) {
            this.y += Math.sin(t) * 4;
            this.rotation = Math.sin(t * 0.8) * 0.035;
        } else if (note.indexOf("<Flutuar>") >= 0) {
            this.y += Math.sin(t * 1.2) * 7;
            this.x += Math.cos(t * 0.6) * 2;
        } else if (note.indexOf("<Pulsar>") >= 0) {
            this.y += Math.sin(t * 0.8) * 3;
            var s = 1 + Math.sin(t * 1.5) * 0.025;
            this.scale.x = s;
            this.scale.y = s;
        } else {
            this.y += Math.sin(t) * 5;
            this.rotation = Math.sin(t * 0.7) * 0.02;
        }
    };
})();
module.exports = {
    ScoreboardEntry : class {
        constructor(id, team, nickname, numPoints) {
            this.id = id;
            this.team = team;
            this.nickname = nickname;
            this.numPoints = 0;
        }
    },
    HitEvent : class {
        constructor(shooterId, shotId) {
            this.shooterId = shooterId;
            this.shotId = shotId;
        }
    },
  };

